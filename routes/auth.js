// routes/auth.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { runValidation, required, mustBeEmail, mustBeString } = require('../utils/validate');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const errors = runValidation([
      { field: 'email',    value: email,    checks: [required, mustBeEmail] },
      { field: 'password', value: password, checks: [required, mustBeString] },
    ]);
    if (errors.length)
      return res.status(400).json({ status: 'error', errors });

    const [rows] = await db.query(
      'SELECT user_id, name, email, role, password FROM users WHERE email = ?',
      [email.trim()]
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
