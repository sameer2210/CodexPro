import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import validate from '../services/validator.js';

export const adminRegister = async (req, res) => {
  try {
    await validate(req.body);
    const { firstName, emailId, password } = req.body;

    if (!firstName || !emailId) throw new Error('Credentials Missing');

    req.body.password = await bcrypt.hash(password, 10);
    req.body.role = 'admin';
    const user = await User.create(req.body);

    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: 604800 }
    );

    res.cookie('token', token, {
      maxAge: 604800000,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(201).json({ success: true, message: 'User Registered Successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Error: ' + err.message });
  }
};

export default adminRegister;
