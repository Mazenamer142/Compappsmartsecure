// controllers/PaymentsController.js
const db = require('../config/db');
const {
  runValidation, required, mustBeOneOf, mustBePositiveInt, mustBePositiveNumber,
} = require('../utils/validate');

const METHODS  = ['card', 'cash', 'wallet'];
const STATUSES = ['pending', 'paid', 'refunded'];

class PaymentsController {

  // GET /api/payments  –  ?user_id=  ?booking_id=  ?status=  ?sort=
  async getAll(req, res) {
    try {
      const { user_id, booking_id, status, sort } = req.query;
      const allowedSort = ['payment_id', 'user_id', 'booking_id', 'amount', 'status', 'paid_at'];
      const sortCol = allowedSort.includes(sort) ? sort : 'payment_id';
      let query = 'SELECT * FROM payments';
      let params = [], conditions = [];
      if (user_id)    { conditions.push('user_id = ?');    params.push(user_id); }
      if (booking_id) { conditions.push('booking_id = ?'); params.push(booking_id); }
      if (status)     { conditions.push('status = ?');     params.push(status); }
      if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
      query += ' ORDER BY ' + sortCol + ' DESC';
      const [rows] = await db.query(query, params);
      res.status(200).json({ status: 'success', count: rows.length, data: rows });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }

  // GET /api/payments/:id
  async getOne(req, res) {
    try {
      const [rows] = await db.query('SELECT * FROM payments WHERE payment_id=?', [req.params.id]);
      if (rows.length === 0)
        return res.status(404).json({ status: 'error', message: 'Payment not found' });
      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }

  // POST /api/payments
  // Body: { user_id, booking_id, amount, method? }
  async create(req, res) {
    try {
      const { user_id, booking_id, amount, method } = req.body;

      const errors = runValidation([
        { field: 'user_id',    value: user_id,    checks: [required, mustBePositiveInt] },
        { field: 'booking_id', value: booking_id, checks: [required, mustBePositiveInt] },
        { field: 'amount',     value: amount,     checks: [required, mustBePositiveNumber] },
        { field: 'method',     value: method,     checks: [mustBeOneOf(METHODS)] },
      ]);
      if (errors.length)
        return res.status(400).json({ status: 'error', errors });

      const [result] = await db.query(
        "INSERT INTO payments (user_id, booking_id, amount, method, status, paid_at) VALUES (?, ?, ?, ?, 'pending', NOW())",
        [user_id, booking_id, amount, method || 'card']
      );
      const [rows] = await db.query('SELECT * FROM payments WHERE payment_id=?', [result.insertId]);
      res.status(201).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }

  // PUT /api/payments/:id
  // Body: { status?, method?, amount? }
  async update(req, res) {
    try {
      const { status, method, amount } = req.body;

      const errors = runValidation([
        { field: 'status', value: status, checks: [mustBeOneOf(STATUSES)] },
        { field: 'method', value: method, checks: [mustBeOneOf(METHODS)] },
        { field: 'amount', value: amount, checks: [mustBePositiveNumber] },
      ]);
      if (errors.length)
        return res.status(400).json({ status: 'error', errors });

      const [result] = await db.query(
        'UPDATE payments SET status=?, method=?, amount=? WHERE payment_id=?',
        [status, method, amount, req.params.id]
      );
      if (result.affectedRows === 0)
        return res.status(404).json({ status: 'error', message: 'Payment not found' });
      const [rows] = await db.query('SELECT * FROM payments WHERE payment_id=?', [req.params.id]);
      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }

  // DELETE /api/payments/:id
  async remove(req, res) {
    try {
      const [result] = await db.query('DELETE FROM payments WHERE payment_id=?', [req.params.id]);
      if (result.affectedRows === 0)
        return res.status(404).json({ status: 'error', message: 'Payment not found' });
      res.status(200).json({ status: 'success', message: `Payment ${req.params.id} deleted` });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }
}

module.exports = new PaymentsController();
