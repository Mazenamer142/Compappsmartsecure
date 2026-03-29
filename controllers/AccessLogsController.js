// controllers/AccessLogsController.js
const db = require('../config/db');
const {
  runValidation, required, mustBeOneOf, mustBePositiveInt,
} = require('../utils/validate');

const ACTIONS = ['opened', 'closed', 'denied'];

class AccessLogsController {

  // GET /api/access-logs  –  ?user_id=  ?locker_id=  ?action=  ?sort=
  async getAll(req, res) {
    try {
      const { user_id, locker_id, action, sort } = req.query;
      const allowedSort = ['log_id', 'user_id', 'locker_id', 'action', 'accessed_at'];
      const sortCol = allowedSort.includes(sort) ? sort : 'accessed_at';
      let query = 'SELECT * FROM access_logs';
      let params = [], conditions = [];
      if (user_id)   { conditions.push('user_id = ?');   params.push(user_id); }
      if (locker_id) { conditions.push('locker_id = ?'); params.push(locker_id); }
      if (action)    { conditions.push('action = ?');    params.push(action); }
      if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
      query += ' ORDER BY ' + sortCol + ' DESC';
      const [rows] = await db.query(query, params);
      res.status(200).json({ status: 'success', count: rows.length, data: rows });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }

  // GET /api/access-logs/:id
  async getOne(req, res) {
    try {
      const [rows] = await db.query('SELECT * FROM access_logs WHERE log_id=?', [req.params.id]);
      if (rows.length === 0)
        return res.status(404).json({ status: 'error', message: 'Log not found' });
      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }

  // POST /api/access-logs
  // Body: { user_id, locker_id, action }
  async create(req, res) {
    try {
      const { user_id, locker_id, action } = req.body;

      const errors = runValidation([
        { field: 'user_id',   value: user_id,   checks: [required, mustBePositiveInt] },
        { field: 'locker_id', value: locker_id, checks: [required, mustBePositiveInt] },
        { field: 'action',    value: action,    checks: [required, mustBeOneOf(ACTIONS)] },
      ]);
      if (errors.length)
        return res.status(400).json({ status: 'error', errors });

      const [result] = await db.query(
        'INSERT INTO access_logs (user_id, locker_id, action, accessed_at) VALUES (?, ?, ?, NOW())',
        [user_id, locker_id, action]
      );
      const [rows] = await db.query('SELECT * FROM access_logs WHERE log_id=?', [result.insertId]);
      res.status(201).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }

  // PUT /api/access-logs/:id
  // Body: { action }
  async update(req, res) {
    try {
      const { action } = req.body;

      const errors = runValidation([
        { field: 'action', value: action, checks: [required, mustBeOneOf(ACTIONS)] },
      ]);
      if (errors.length)
        return res.status(400).json({ status: 'error', errors });

      const [result] = await db.query(
        'UPDATE access_logs SET action=? WHERE log_id=?',
        [action, req.params.id]
      );
      if (result.affectedRows === 0)
        return res.status(404).json({ status: 'error', message: 'Log not found' });
      const [rows] = await db.query('SELECT * FROM access_logs WHERE log_id=?', [req.params.id]);
      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }

  // DELETE /api/access-logs/:id
  async remove(req, res) {
    try {
      const [result] = await db.query('DELETE FROM access_logs WHERE log_id=?', [req.params.id]);
      if (result.affectedRows === 0)
        return res.status(404).json({ status: 'error', message: 'Log not found' });
      res.status(200).json({ status: 'success', message: `Log ${req.params.id} deleted` });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }
}

module.exports = new AccessLogsController();
