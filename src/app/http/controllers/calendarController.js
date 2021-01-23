const { google } = require('googleapis');
const refresh = require('passport-oauth2-refresh');
const {
  findOneUser,
  findOneUserByIdAndUpdate,
} = require('../../repositories/user');
const { socketClients } = require('../../socket/socket');
const { CalendarEvents } = require('../../../config/globa.settings');

const { OAuth2 } = google.auth;

async function getUserEvents(req, res) {
  const userData = await findOneUser(
    {
      email: req.currentUser.email,
    },
    {
      password: 0,
      contacts: 0,
    },
  );

  if (!userData.googleAuthToken) {
    return res
      .status(401)
      .send({ error: true, message: 'Please, connect with google account!' });
  }

  // eslint-disable-next-line no-use-before-define
  return getCalendarData(req.currentUser, req.query.date, (result) =>
    res.status(200).json(result),
  );
}

async function getCalendarData(user, date, callback) {
  const oAuthClient = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  const userData = await findOneUser(
    {
      email: user.email,
    },
    {
      password: 0,
      contacts: 0,
    },
  );

  oAuthClient.setCredentials({
    access_token: userData.googleAuthToken,
  });

  const calendar = google.calendar({
    version: 'v3',
    auth: oAuthClient,
  });

  calendar.events.list(
    {
      calendarId: 'primary',
      timeMin: `${new Date(date).toISOString().split('T')[0]}T00:00:00.748Z`, // this is the real gambiarra
      maxResults: CalendarEvents,
      singleEvents: true,
      orderBy: 'startTime',
    },
    (err, response) => {
      if (err) {
        if (
          err.response &&
          err.response.status &&
          err.response.status === 401
        ) {
          // refresh google token
          refresh.requestNewAccessToken(
            'google',
            userData.googleRefreshToken,
            async (error, accessToken) => {
              const result = await findOneUser(
                {
                  email: user.email,
                },
                {
                  password: 0,
                  contacts: 0,
                },
              );

              // update google token on database
              // eslint-disable-next-line no-underscore-dangle
              await findOneUserByIdAndUpdate(result._id, {
                googleAuthToken: accessToken,
              });

              getCalendarData(user, callback);
            },
          );
        }
        return { error: true };
      }

      const events = response.data.items;

      if (events.length) {
        return callback({ success: true, events });
      }
      return callback({ success: true, events: [] });
    },
  );

  // if we need to remove the chaanel
  // calendar.channels.stop({
  //   requestBody: {
  //     id: `privoce-user${user._id}1`,
  //     resourceId: user.calendarResourceId,
  //   },
  // });

  // Need improve this, checking if already have a calendarResource
  // and check date
  try {
    const userEventsWatch = await calendar.events.watch({
      calendarId: 'primary',
      requestBody: {
        id: `privoce-user${user._id}1`,
        type: 'web_hook',
        address: 'https://auth.privoce.com/new-event-handle',
      },
    });

    await findOneUserByIdAndUpdate(result._id, {
      calendarResourceId: userEventsWatch.data.resourceId,
    });
  } catch (err) {
    console.log('Already have user watch');
  }
}

// When have a new event on calendar
// dispatch a socket action to client
function newEventHandle(req, res) {
  const idHeader = req.header('x-goog-channel-id');

  if (!idHeader) {
    return;
  }

  const [, userId] = idHeader.split('privoce-user');

  if (!userId) {
    return;
  }

  const socketUser = socketClients.find(
    (socketClient) =>
      socketClient.customId === userId.slice(0, userId.length - 1),
  );

  global.io
    .to(socketUser.clientId) // Slice cause i add a "1" and i need to remove
    .emit('new-event');

  res.status(204);
}

module.exports = { getUserEvents, newEventHandle };
