// ─────────────────────────────────────────────
//  controllers/LockersController.js
//  Handles all DB logic for the Lockers table
// ─────────────────────────────────────────────

const db = require('../config/db');

class LockersController {

  // GET /api/lockers
  // Optional: ?search=A1  ?sort=size  ?status=available
  async getAll(req, res) {
    try {
      const { search, sort, status } = req.query;

      const allowedSort = ['locker_id', 'locker_code', 'size', 'status', 'location_id'];
      const sortCol = allowedSort.includes(sort) ? sort : 'locker_id';

      let query  = 'SELECT * FROM lockers';
      let params = [];
      let conditions = [];

      if (search) {
        conditions.push(`locker_code LIKE ?`);
        params.push(`%${search}%`);
      }
      if (status) {
        conditions.push(`status = ?`);
        params.push(status);
      }
      if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
      query += ` ORDER BY ${sortCol} ASC`;

      const [rows] = await db.query(query, params);
      res.status(200).json({ status: 'success', count: rows.length, data: rows });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  // GET /api/lockers/:id
  async getOne(req, res) {
    try {
      const [rows] = await db.query('SELECT * FROM lockers WHERE locker_id=?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ status: 'error', message: 'Locker not found' });
      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  // POST /api/lockers
  // Body: { locker_code, size, status, location_id }
  async create(req, res) {
    try {
      const { locker_code, size, status, location_id } = req.body;
      if (!locker_code || !size) {
        return res.status(400).json({ status: 'error', message: 'locker_code and size are required' });
      }

      const [result] = await db.query(
        `INSERT INTO lockers (locker_code, size, status, location_id) VALUES (?, ?, ?, ?)`,
        [locker_code, size, status || 'available', location_id]
      );
      const [rows] = await db.query('SELECT * FROM lockers WHERE locker_id=?', [result.insertId]);
      res.status(201).json({ status: 'success', data: rows[0] });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ status: 'error', message: 'Locker code already exists' });
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  // PUT /api/lockers/:id
  async update(req, res) {
    try {
      const { locker_code, size, status, location_id } = req.body;
      const [result] = await db.query(
        `UPDATE lockers SET locker_code=?, size=?, status=?, location_id=? WHERE locker_id=?`,
        [locker_code, size, status, location_id, req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Locker not found' });
      const [rows] = await db.query('SELECT * FROM lockers WHERE locker_id=?', [req.params.id]);
      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  // DELETE /api/lockers/:id
  async remove(req, res) {
    try {
      const [result] = await db.query('DELETE FROM lockers WHERE locker_id=?', [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Locker not found' });
      res.status(200).json({ status: 'success', message: `Locker ${req.params.id} deleted` });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
}

module.exports = new LockersController();
