const { google } = require('googleapis');
const refresh = require('passport-oauth2-refresh');
const {
  findOneUser,
  findOneUserByIdAndUpdate,
} = require('../../repositories/user');

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

  console.log(userData);

  if (!userData.googleAuthToken) {
    return res
      .status(401)
      .send({ error: true, message: 'Please, connect with google account!' });
  }

  // eslint-disable-next-line no-use-before-define
  getCalendarData(req.currentUser, (result) => res.status(200).json(result));
}

async function getCalendarData(user, callback) {
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
      timeMin: `${new Date().toISOString().split('T')[0]}T00:00:00.748Z`, // this is the real gambiarra
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

  calendar.channels.stop({
    requestBody: {
      id: 'primary',
      resourceId: '',
    },
  });

  calendar.events.watch({
    calendarId: 'primary',
    requestBody: {
      id: `privoce-user${user._id}`,
      type: 'web_hook',
      address: 'https://auth.privoce.com/new-event-handle',
    },
  });
}

// When have a new event on calendar
// dispatch a socket action to client
function newEventHandle(req, res) {
  console.log(req.body, 'saiu assim');
  global.io.emit('FromAPI', 'Testando apenas');
}

module.exports = { getUserEvents, newEventHandle };
