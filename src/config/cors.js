const whitelist = [
  'http://localhost:3000',
  'http://localhost',
  'https://papo.privoce.com',
  'chrome-extension://jjgljgcfbjfjlmenoibhgnkbgohilhnb',
];

const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
};

module.exports = { corsOptions, whitelist };
