const crypto = require("crypto");

exports.encryptPassword = (password) =>
  crypto
    .createHmac(process.env.CRYPTO_HASH, process.env.CRYPTO_SECRET)
    .update(password)
    .digest(process.env.CRYPTO_DIGEST);
