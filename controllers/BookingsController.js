// controllers/BookingsController.js
const db = require('../config/db');
const {
  runValidation, required, mustBePositiveInt, mustBeDatetime, mustBeOneOf,
} = require('../utils/validate');

const BOOKING_STATUSES = ['active', 'completed', 'cancelled'];

class BookingsController {

  // GET /api/bookings  –  ?user_id=  ?locker_id=  ?status=  ?sort=
  async getAll(req, res) {
    try {
      const { user_id, locker_id, status, sort } = req.query;
      const allowedSort = ['booking_id', 'start_time', 'end_time', 'status', 'user_id', 'locker_id'];
      const sortCol = allowedSort.includes(sort) ? sort : 'booking_id';
      let query = 'SELECT * FROM bookings';
      let params = [], conditions = [];
      if (user_id)   { conditions.push('user_id = ?');   params.push(user_id); }
      if (locker_id) { conditions.push('locker_id = ?'); params.push(locker_id); }
      if (status)    { conditions.push('status = ?');    params.push(status); }
      if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
      query += ' ORDER BY ' + sortCol + ' ASC';
      const [rows] = await db.query(query, params);
      res.status(200).json({ status: 'success', count: rows.length, data: rows });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }

  // GET /api/bookings/:id
  async getOne(req, res) {
    try {
      const [rows] = await db.query('SELECT * FROM bookings WHERE booking_id=?', [req.params.id]);
      if (rows.length === 0)
        return res.status(404).json({ status: 'error', message: 'Booking not found' });
      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }

  // POST /api/bookings
  // Body: { user_id, locker_id, start_time, end_time }
  async create(req, res) {
    try {
      const { user_id, locker_id, start_time, end_time } = req.body;

      const errors = runValidation([
        { field: 'user_id',    value: user_id,    checks: [required, mustBePositiveInt] },
        { field: 'locker_id',  value: locker_id,  checks: [required, mustBePositiveInt] },
        { field: 'start_time', value: start_time, checks: [required, mustBeDatetime] },
        { field: 'end_time',   value: end_time,   checks: [required, mustBeDatetime] },
      ]);
      if (errors.length)
        return res.status(400).json({ status: 'error', errors });

      if (new Date(end_time) <= new Date(start_time))
        return res.status(400).json({ status: 'error', errors: ['end_time must be after start_time'] });

      const [result] = await db.query(
        "INSERT INTO bookings (user_id, locker_id, start_time, end_time, status) VALUES (?, ?, ?, ?, 'active')",
        [user_id, locker_id, start_time, end_time]
      );
      const [rows] = await db.query('SELECT * FROM bookings WHERE booking_id=?', [result.insertId]);
      res.status(201).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }

  // PUT /api/bookings/:id
  // Body: { start_time?, end_time?, status? }
  async update(req, res) {
    try {
      const { start_time, end_time, status } = req.body;

      const errors = runValidation([
        { field: 'start_time', value: start_time, checks: [mustBeDatetime] },
        { field: 'end_time',   value: end_time,   checks: [mustBeDatetime] },
        { field: 'status',     value: status,     checks: [mustBeOneOf(BOOKING_STATUSES)] },
      ]);
      if (errors.length)
        return res.status(400).json({ status: 'error', errors });

      if (start_time && end_time && new Date(end_time) <= new Date(start_time))
        return res.status(400).json({ status: 'error', errors: ['end_time must be after start_time'] });

      const [result] = await db.query(
        'UPDATE bookings SET start_time=?, end_time=?, status=? WHERE booking_id=?',
        [start_time, end_time, status, req.params.id]
      );
      if (result.affectedRows === 0)
        return res.status(404).json({ status: 'error', message: 'Booking not found' });
      const [rows] = await db.query('SELECT * FROM bookings WHERE booking_id=?', [req.params.id]);
      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }

  // DELETE /api/bookings/:id
  async remove(req, res) {
    try {
      const [result] = await db.query('DELETE FROM bookings WHERE booking_id=?', [req.params.id]);
      if (result.affectedRows === 0)
        return res.status(404).json({ status: 'error', message: 'Booking not found' });
      res.status(200).json({ status: 'success', message: `Booking ${req.params.id} deleted` });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }
}

module.exports = new BookingsController();
