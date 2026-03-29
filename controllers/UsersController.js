// controllers/UsersController.js
const db = require('../config/db');
const {
  runValidation, required, mustBeString, mustBeEmail,
  mustBePhone, mustBeOneOf,
} = require('../utils/validate');

const ROLES = ['customer', 'admin', 'technician'];

class UsersController {

  // GET /api/users  –  ?search=  ?sort=
  async getAll(req, res) {
    try {
      const { search, sort } = req.query;
      const allowedSort = ['user_id', 'name', 'email', 'created_at'];
      const sortCol = allowedSort.includes(sort) ? sort : 'user_id';

      let query  = 'SELECT user_id, name, email, phone, role, created_at FROM users';
      let params = [];
      if (search) {
        query += ' WHERE name LIKE ? OR email LIKE ?';
        params.push(`%${search}%`, `%${search}%`);
      }
      query += ` ORDER BY ${sortCol} ASC`;

      const [rows] = await db.query(query, params);
      res.status(200).json({ status: 'success', count: rows.length, data: rows });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  // GET /api/users/:id
  async getOne(req, res) {
    try {
      const [rows] = await db.query(
        'SELECT user_id, name, email, phone, role, created_at FROM users WHERE user_id = ?',
        [req.params.id]
      );
      if (rows.length === 0)
        return res.status(404).json({ status: 'error', message: 'User not found' });
      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  // POST /api/users
  // Body: { name, email, password, phone?, role? }
  async create(req, res) {
    try {
      const { name, email, password, phone, role } = req.body;

      const errors = runValidation([
        { field: 'name',     value: name,     checks: [required, mustBeString] },
        { field: 'email',    value: email,    checks: [required, mustBeEmail] },
        { field: 'password', value: password, checks: [required, mustBeString] },
        { field: 'phone',    value: phone,    checks: [mustBePhone] },
        { field: 'role',     value: role,     checks: [mustBeOneOf(ROLES)] },
      ]);
      if (errors.length)
        return res.status(400).json({ status: 'error', errors });

      const [result] = await db.query(
        'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
        [name.trim(), email.trim(), password, phone || null, role || 'customer']
      );
      const [rows] = await db.query(
        'SELECT user_id, name, email, phone, role, created_at FROM users WHERE user_id = ?',
        [result.insertId]
      );
      res.status(201).json({ status: 'success', data: rows[0] });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY')
        return res.status(409).json({ status: 'error', message: 'Email already exists' });
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  // PUT /api/users/:id
  // Body: any subset of { name, email, phone, role }
  async update(req, res) {
    try {
      const { name, email, phone, role } = req.body;

      const errors = runValidation([
        { field: 'name',  value: name,  checks: [mustBeString] },
        { field: 'email', value: email, checks: [mustBeEmail] },
        { field: 'phone', value: phone, checks: [mustBePhone] },
        { field: 'role',  value: role,  checks: [mustBeOneOf(ROLES)] },
      ]);
      if (errors.length)
        return res.status(400).json({ status: 'error', errors });

      const fields = ['name', 'email', 'phone', 'role'];
      const updates = [];
      const values  = [];
      fields.forEach(f => {
        if (req.body[f] !== undefined) {
          updates.push(`${f}=?`);
          values.push(req.body[f]);
        }
      });
      if (updates.length === 0)
        return res.status(400).json({ status: 'error', message: 'No fields provided to update' });

      values.push(req.params.id);
      const [result] = await db.query(
        `UPDATE users SET ${updates.join(', ')} WHERE user_id=?`,
        values
      );
      if (result.affectedRows === 0)
        return res.status(404).json({ status: 'error', message: 'User not found' });

      const [rows] = await db.query(
        'SELECT user_id, name, email, phone, role FROM users WHERE user_id=?',
        [req.params.id]
      );
      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  // DELETE /api/users/:id
  async remove(req, res) {
    try {
      const [result] = await db.query('DELETE FROM users WHERE user_id=?', [req.params.id]);
      if (result.affectedRows === 0)
        return res.status(404).json({ status: 'error', message: 'User not found' });
      res.status(200).json({ status: 'success', message: `User ${req.params.id} deleted` });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
}

module.exports = new UsersController();
