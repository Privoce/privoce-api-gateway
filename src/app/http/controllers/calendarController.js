const { google } = require("googleapis");

const { CalendarEvents } = require("../../../config/globa.settings");

async function getUserEvents(req, res) {
  const { OAuth2 } = google.auth;

  if (!req.currentUser.googleAuthToken) {
    return res
      .status(401)
      .send({ error: true, message: "Please, connect with google account!" });
  }

  const oAuthClient = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oAuthClient.setCredentials({
    access_token: req.currentUser.googleAuthToken,
  });

  const calendar = google.calendar({
    version: "v3",
    auth: oAuthClient,
  });

  calendar.events.list(
    {
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: CalendarEvents,
      singleEvents: true,
      orderBy: "startTime",
    },
    (err, response) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ error: true });
      }
      const events = response.data.items;

      if (events.length) {
        return res.status(200).send({ status: true, events: events });
      } else {
        return res.status(204).send({ status: true, events: [] });
      }
    }
  );
}

module.exports = { getUserEvents };
