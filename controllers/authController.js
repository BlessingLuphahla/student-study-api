const User = require('../models/User');

const signup = async (req, res) => {
  try {
    const { email, password,name } = req.body;

    const user = await User.create({
      email,
      passwordHash: password,
      name:name
    });

    res.status(201).json({ id: user._id, email: user.email,name:name });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Signup failed' });
  }
};

const login = async (req, res) => {
  res.json({ message: 'login not implemented yet' });
};

module.exports = { signup, login };
