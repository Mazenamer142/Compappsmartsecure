// controllers/MaintenanceController.js
const db = require('../config/db');
class MaintenanceController {
  async getAll(req, res) {
    try {
      const { locker_id, status, sort } = req.query;
      const allowedSort = ['maintenance_id', 'locker_id', 'status', 'reported_at', 'resolved_at'];
      const sortCol = allowedSort.includes(sort) ? sort : 'reported_at';
      let query = 'SELECT * FROM maintenance';
      let params = [], conditions = [];
      if (locker_id) { conditions.push('locker_id = ?'); params.push(locker_id); }
      if (status)    { conditions.push('status = ?');    params.push(status); }
      if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
      query += ' ORDER BY ' + sortCol + ' DESC';
      const [rows] = await db.query(query, params);
      res.status(200).json({ status: 'success', count: rows.length, data: rows });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }
  async getOne(req, res) {
    try {
      const [rows] = await db.query('SELECT * FROM maintenance WHERE maintenance_id=?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ status: 'error', message: 'Maintenance record not found' });
      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }
  async create(req, res) {
    try {
      const { locker_id, description, reported_by } = req.body;
      if (!locker_id || !description)
        return res.status(400).json({ status: 'error', message: 'locker_id and description are required' });
      const [result] = await db.query(
        "INSERT INTO maintenance (locker_id, description, reported_by, status, reported_at) VALUES (?, ?, ?, 'open', NOW())",
        [locker_id, description, reported_by]
      );
      const [rows] = await db.query('SELECT * FROM maintenance WHERE maintenance_id=?', [result.insertId]);
      res.status(201).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }
  async update(req, res) {
    try {
      const { status, description, resolved_at } = req.body;
      const [result] = await db.query(
        'UPDATE maintenance SET status=?, description=?, resolved_at=? WHERE maintenance_id=?',
        [status, description, resolved_at, req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Maintenance record not found' });
      const [rows] = await db.query('SELECT * FROM maintenance WHERE maintenance_id=?', [req.params.id]);
      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }
  async remove(req, res) {
    try {
      const [result] = await db.query('DELETE FROM maintenance WHERE maintenance_id=?', [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Maintenance record not found' });
      res.status(200).json({ status: 'success', message: 'Maintenance record ' + req.params.id + ' deleted' });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }
}
module.exports = new MaintenanceController();
