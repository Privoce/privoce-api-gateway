const { check } = require("express-validator");

const { findUser } = require("../../../repositories/user");

module.exports.signupValidator = () => [
  check("nickname")
    .isLength({ min: 4, max: 12 })
    .withMessage("The Nickname must have between 4 and 12 characters")
    .custom(
      (nickname) =>
        new Promise(async (resolve, reject) => {
          try {
            const user = await findUser({
              nickname: nickname.toLowerCase(),
            });

            if (user.length > 0) {
              reject();
            }

            resolve();
          } catch (e) {
            reject();
          }
        })
    )
    .withMessage("This Nickname is already taken"),
  check("password")
    .isLength({ min: 5, max: 12 })
    .withMessage("The Password must have between 5 and 12 characters"),
  check("email")
    .isLength({ min: 10, max: 22 })
    .withMessage("The Email must have between 10 and 22 characters")
    .custom(
      (email) =>
        new Promise(async (resolve, reject) => {
          try {
            const user = await findUser({
              email: email.toLowerCase(),
            });

            if (user.length > 0) {
              reject();
            }

            resolve();
          } catch (e) {
            reject();
          }
        })
    )
    .withMessage("This Nickname is already taken"),
];
