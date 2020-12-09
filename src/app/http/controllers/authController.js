const {
  addUser,
  findOneUser,
  findOneUserByIdAndUpdate,
} = require('../../repositories/user');
const { encryptPassword } = require('../../utils/encryptPassword');
const { createJwtToken } = require('../../utils/createJwtToken');

const randomColor = require('../../utils/randomColor');

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
      },
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
        email: 'Incorrect email or password',
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
  const { state } = req.query;
  const stateParsed = state
    ? JSON.parse(Buffer.from(state, 'base64').toString())
    : undefined;
  const returnTo =
    stateParsed && stateParsed.returnTo ? stateParsed.returnTo : undefined;
  const { email } = req.user._json;
  const name = req.user.name.givenName;

  let token = '';

  try {
    const result = await findOneUser(
      {
        email: email.toLowerCase(),
      },
      {
        password: 0,
        contacts: 0,
      },
    );
    // if user already exists
    if (result) {
      token = createJwtToken({
        email: result.email.toLowerCase(),
        _id: result._id,
      });

      // update google token on database
      await findOneUserByIdAndUpdate(result._id, {
        googleAuthToken: req.user.googleToken
          ? req.user.googleToken
          : result.googleAuthToken,
        googleRefreshToken: req.user.googleRefreshToken
          ? req.user.googleRefreshToken
          : result.googleRefreshToken,
      });

      res.cookie('jwt', token);
    } else {
      // if not exists, we will create the new user
      const newUser = await addUser({
        nickname: name,
        email,
        profileColor: randomColor(),
        googleToken: req.user.googleToken,
        googleRefreshToken: req.user.googleRefreshToken,
      });

      if (newUser) {
        token = createJwtToken({
          email: newUser.email.toLowerCase(),
          _id: newUser._id,
        });

        res.cookie('jwt', token);
      }
    }

    // if have a redirect url
    if (returnTo) {
      res.redirect(`${returnTo}${token}`);
    }

    const frontAuthCallback = `${process.env.FONT_END_URL}/social/${token}`;
    res.redirect(frontAuthCallback);
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
