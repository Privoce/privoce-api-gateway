const { findOneUser } = require("../../repositories/user");

const jwt = require("jsonwebtoken");

function jwtMiddleware(req, res, next) {
  const token =
    req.get("x-access-token") ||
    req.body["x-access-token"] ||
    req.query["x-access-token"] ||
    req.headers["x-access-token"] ||
    req.headers["authorization"].split(" ")[1] ||
    null;

  console.log("header", token);

  jwt.verify(token, process.env.JWT_SECRET, async (err, decodedData) => {
    if (err) {
      return res.status(401).json({
        success: false,
        errors: {},
        result: [],
      });
    }

    const { nickname } = decodedData;

    try {
      const user = await findOneUser(
        {
          nickname,
        },
        {
          password: 0,
          contacts: 0,
          conversations: 0,
        }
      );

      if (user) {
        req.currentUser = user;
        next();
      } else {
        res.status(401).json({
          success: false,
          errors: {},
          result: [],
        });
      }
    } catch (e) {
      res.status(500).json({
        success: false,
        errors: {},
        result: [],
      });
    }
  });
}

module.exports = jwtMiddleware;
