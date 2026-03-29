// controllers/AccessLogsController.js
const db = require('../config/db');
class AccessLogsController {
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
  async getOne(req, res) {
    try {
      const [rows] = await db.query('SELECT * FROM access_logs WHERE log_id=?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ status: 'error', message: 'Log not found' });
      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }
  async create(req, res) {
    try {
      const { user_id, locker_id, action } = req.body;
      if (!user_id || !locker_id || !action)
        return res.status(400).json({ status: 'error', message: 'user_id, locker_id, and action are required' });
      const [result] = await db.query(
        'INSERT INTO access_logs (user_id, locker_id, action, accessed_at) VALUES (?, ?, ?, NOW())',
        [user_id, locker_id, action]
      );
      const [rows] = await db.query('SELECT * FROM access_logs WHERE log_id=?', [result.insertId]);
      res.status(201).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }
  async update(req, res) {
    try {
      const { action } = req.body;
      const [result] = await db.query('UPDATE access_logs SET action=? WHERE log_id=?', [action, req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Log not found' });
      const [rows] = await db.query('SELECT * FROM access_logs WHERE log_id=?', [req.params.id]);
      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }
  async remove(req, res) {
    try {
      const [result] = await db.query('DELETE FROM access_logs WHERE log_id=?', [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Log not found' });
      res.status(200).json({ status: 'success', message: 'Log ' + req.params.id + ' deleted' });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }
}
module.exports = new AccessLogsController();
