const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // 1. Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email } = ticket.getPayload();

    // 2. Check if user exists
    let user = await User.findOne({ email });

    const isNewUser = !user;

    // 3. If not → create user
    if (!user) {
      user = await User.create({
        name,
        email,
        password: null // no password for Google users
      });
    }

    // 4. Generate JWT (your system)
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      isNewUser,
      user
    });

  } catch (error) {
    res.status(500).json({ msg: 'Google login failed' });
  }
};