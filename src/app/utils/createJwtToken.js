const jwt = require("jsonwebtoken");

exports.createJwtToken = (model) =>
  jwt.sign(model, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
