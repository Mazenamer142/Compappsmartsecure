// routes/auth.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ status: 'error', message: 'email and password are required' });
    const [rows] = await db.query(
      'SELECT user_id, name, email, role, password FROM users WHERE email = ?',
      [email]
    );
    if (rows.length === 0)
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    const user = rows[0];
    if (user.password !== password)
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    delete user.password;
    res.status(200).json({ status: 'success', message: 'Login successful', data: user });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
