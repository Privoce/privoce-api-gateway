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

  calendar.events.watch({
    calendarId: 'prymary',
    requestBody: {
      id: 'asdqwe',
      type: 'web_hook',
      address: 'https://localhost:3030/cbe',
    },
  });
}

module.exports = { getUserEvents };
