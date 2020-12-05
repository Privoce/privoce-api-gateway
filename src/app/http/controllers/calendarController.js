const { google } = require('googleapis');
const refresh = require('passport-oauth2-refresh');
const {
  findOneUser,
  findOneUserByIdAndUpdate,
} = require('../../repositories/user');

const { CalendarEvents } = require('../../../config/globa.settings');

const { OAuth2 } = google.auth;

async function getUserEvents(req, res) {
  if (!req.currentUser.googleAuthToken) {
    return res
      .status(401)
      .send({ error: true, message: 'Please, connect with google account!' });
  }

  // eslint-disable-next-line no-use-before-define
  const response = await getCalendarData(req.currentUser);

  return res.status(200).json({ ...response });
}

async function getCalendarData(user) {
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

  let allEvents = [];

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
            user.googleRefreshToken,
            async (accessToken) => {
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

              getCalendarData(calendar, user);
            },
          );
        }
        return { error: true };
      }
      allEvents = response.data.items;
    },
  );

  if (allEvents.length) {
    return { success: true, allEvents };
  }
  return { success: true, allEvents: [] };
}

async function teste(req, res) {
  const oAuthClient = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  oAuthClient.setCredentials({
    access_token: req.currentUser.googleAuthToken,
  });

  const gmail = google.gmail({
    version: 'v1',
    auth: oAuthClient,
  });

  const teste = await gmail.users.watch({
    userId: 'me',
    topicName: 'projects/privoce-295118/topics/privoce',
  });

  res.status(200).send(teste);
}

module.exports = { getUserEvents, teste };
