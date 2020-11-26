const {
  addUser,
  findOneUser,
  findOneUserByIdAndUpdate,
} = require("../../repositories/user");
const { encryptPassword } = require("../../utils/encryptPassword");
const { createJwtToken } = require("../../utils/createJwtToken");

const randomColor = require("../../utils/randomColor");

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

      // update token on database
      const update = findOneUserByIdAndUpdate(result._id, {
        googleAuthToken: req.user.googleToken,
      });
      console.log("teste", update);

      res.cookie("jwt", token);

      const frontAuthCallback = `${process.env.FONT_END_URL}/social/${token}`;
      res.redirect(frontAuthCallback);
      return;
    }

    //if not exists, we will create the new user
    const newUser = await addUser({
      nickname: name,
      email: email,
      profileColor: randomColor(),
      googleToken: req.user.googleToken,
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

module.exports = {
  postSignIn,
  postSignInGoogle,
};
