const httpProxy = require("express-http-proxy");

const papoProxy = httpProxy("http://localhost:3001");
const watchPartyProxy = httpProxy("http://localhost:3002");

module.exports = { papoProxy, watchPartyProxy };
