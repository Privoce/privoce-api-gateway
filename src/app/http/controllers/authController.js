const { validationResult } = require("express-validator");

const { addUser, findOneUser, findUser } = require("../../repositories/user");
const { encryptPassword } = require("../../utils/encryptPassword");
const { createJwtToken } = require("../../utils/createJwtToken");
const convertErrorToFrontFormat = require("../../utils/convertErros");
const randomColor = require("../../utils/randomColor");

async function postSignUp(req, res) {
  const { body } = req;

  const erros = validationResult(req);
  const errors = convertErrorToFrontFormat(erros.mapped());

  if (!errors || errors.length === 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  try {
    const checkUser = await findOneUser({
      nickname: body.nickname,
    });

    if (checkUser && checkUser.nickname) {
      res.status(400).json({
        success: false,
        errors: {
          nickname: "This Nickname is already taken",
        },
      });
    }

    const result = await addUser({
      ...body,
      profileColor: randomColor(),
    });

    if (result) {
      const token = createJwtToken({
        nickname: result.nickname.toLowerCase(),
        _id: result._id,
      });

      const user = await findOneUser(
        {
          _id: result._id,
        },
        {
          password: 0,
          contacts: 0,
        }
      );

      return res.status(200).json({
        success: true,
        errors: {},
        token,
        user,
      });
    }

    res.status(500).json({
      success: false,
      errors: {},
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      errors: {},
    });
  }
}

async function postSignIn(req, res) {
  const { body } = req;

  const { password, nickname } = body;

  try {
    const result = await findOneUser(
      {
        password: encryptPassword(password),
        nickname: nickname.toLowerCase(),
      },
      {
        password: 0,
        contacts: 0,
      }
    );

    if (result) {
      const token = createJwtToken({
        nickname: result.nickname.toLowerCase(),
        _id: result._id,
      });

      return res.status(200).json({
        success: true,
        token,
        user: result,
        errors: {},
      });
    }
    res.status(400).json({
      success: false,
      errors: {
        nickname: "Incorrect nickname or password",
      },
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      errors: {},
    });
  }
}

async function getVerifyNickname(req, res) {
  const { nickname } = req.query;

  if (!nickname) {
    res.status(400).json({
      success: false,
      message: "Nickname not found",
    });
  }

  try {
    const result = await findUser({
      nickname: nickname.toLowerCase(),
    });

    const errors = {};

    if (result.length > 0) {
      errors.nickname = "This Nickname is already taken";
    }

    res.status(200).json({
      success: true,
      errors,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
    });
  }
}

module.exports = {
  getVerifyNickname,
  postSignIn,
  postSignUp,
};
