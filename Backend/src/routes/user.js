import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/googleLogin', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ emailId: email });
    if (!user) {
      user = new User({
        emailId: email,
        firstName: name ? name.split(' ')[0] : 'User',
        lastName: name && name.split(' ').length > 1 ? name.split(' ')[1] : '',
        profileImage: picture,
        emailVerified: true,
        isPremium: false,
        tokensLeft: 10,
      });
      await user.save();
    }

    const jwtToken = jwt.sign(
      { _id: user._id, userId: user._id, email: user.emailId, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(200).json({ message: 'Login successful', user, token: jwtToken });
  } catch (error) {
    console.error('Error during Google Login:', error.message);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
});

export default router;