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
      email: body.email,
    });

    if (checkUser && checkUser.email) {
      res.status(400).json({
        success: false,
        errors: {
          email: "This email is already taken",
        },
      });
    }

    const result = await addUser({
      ...body,
      profileColor: randomColor(),
    });

    if (result) {
      const token = createJwtToken({
        email: result.email.toLowerCase(),
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

  const { password, email } = body;

  try {
    const result = await findOneUser(
      {
        password: encryptPassword(password),
        email: email.toLowerCase(),
      },
      {
        password: 0,
        contacts: 0,
      }
    );

    if (result) {
      const token = createJwtToken({
        email: result.email.toLowerCase(),
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
        email: "Incorrect email or password",
      },
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      errors: {},
    });
  }
}

async function postSignInGoogle(req, res) {
  const email = req.user._json.email;
  const displayName = req.user.displayName;
  const name = req.user.name.givenName;

  const provider = req.user.provide;

  try {
    const result = await findOneUser(
      {
        email: email.toLowerCase(),
      },
      {
        password: 0,
        contacts: 0,
      }
    );

    if (result) {
      const token = createJwtToken({
        email: result.email.toLowerCase(),
        _id: result._id,
      });

      res.cookie("jwt", token);

      const frontAuthCallback = `${process.env.FONT_END_URL}/social/${token}`;
      res.redirect(frontAuthCallback);
    }

    //if not exists, we will create the new user
    const newUser = await addUser({
      nickname: name,
      email: email,
      profileColor: randomColor(),
    });

    if (newUser) {
      const token = createJwtToken({
        email: newUser.email.toLowerCase(),
        _id: newUser._id,
      });

      res.cookie("jwt", token);

      const frontAuthCallback = `${process.env.FONT_END_URL}/social/${token}`;
      res.redirect(frontAuthCallback);
    }

    res.status(400).json({
      success: false,
      errors: {
        nickname: "error",
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      errors: {},
    });
  }
}

async function getVerifyEmail(req, res) {
  const { email } = req.query;

  if (!email) {
    res.status(400).json({
      success: false,
      message: "Email not found",
    });
  }

  try {
    const result = await findUser({
      email: email.toLowerCase(),
    });

    const errors = {};

    if (result.length > 0) {
      errors.email = "This Email is already taken";
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

async function getMe(req, res) {
  const token =
    req.get("x-access-token") ||
    req.body["x-access-token"] ||
    req.query["x-access-token"] ||
    req.headers["x-access-token"] ||
    req.headers["authorization"].split(" ")[1] ||
    null;
  return res.status(200).json({ token: token, user: req.currentUser });
}

module.exports = {
  getVerifyEmail,
  postSignIn,
  postSignUp,
  postSignInGoogle,
  getMe,
};
