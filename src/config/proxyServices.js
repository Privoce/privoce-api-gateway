const httpProxy = require("express-http-proxy");

const papoProxy = httpProxy("http://localhost:8080", {
  proxyReqPathResolver: function (req) {
    const split = req.originalUrl.split("/");
    return `/${split.length > 2 ? split[2] : ""}`;
  },
});

const watchPartyProxy = httpProxy("http://localhost:3002");

module.exports = { papoProxy, watchPartyProxy };
