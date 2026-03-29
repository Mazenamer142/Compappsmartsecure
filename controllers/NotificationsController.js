// controllers/NotificationsController.js
const db = require('../config/db');
const {
  runValidation, required, mustBeString, mustBeOneOf,
  mustBePositiveInt, mustBeBinary,
} = require('../utils/validate');

const NOTIF_TYPES = ['booking', 'access', 'payment', 'maintenance'];

class NotificationsController {

  // GET /api/notifications  –  ?user_id=  ?is_read=  ?type=  ?sort=
  async getAll(req, res) {
    try {
      const { user_id, is_read, type, sort } = req.query;
      const allowedSort = ['notification_id', 'user_id', 'type', 'sent_at', 'is_read'];
      const sortCol = allowedSort.includes(sort) ? sort : 'sent_at';
      let query = 'SELECT * FROM notifications';
      let params = [], conditions = [];
      if (user_id)              { conditions.push('user_id = ?');  params.push(user_id); }
      if (is_read !== undefined) { conditions.push('is_read = ?'); params.push(is_read); }
      if (type)                 { conditions.push('type = ?');     params.push(type); }
      if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
      query += ' ORDER BY ' + sortCol + ' DESC';
      const [rows] = await db.query(query, params);
      res.status(200).json({ status: 'success', count: rows.length, data: rows });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }

  // GET /api/notifications/:id
  async getOne(req, res) {
    try {
      const [rows] = await db.query('SELECT * FROM notifications WHERE notification_id=?', [req.params.id]);
      if (rows.length === 0)
        return res.status(404).json({ status: 'error', message: 'Notification not found' });
      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }

  // POST /api/notifications
  // Body: { user_id, type, message }
  async create(req, res) {
    try {
      const { user_id, type, message } = req.body;

      const errors = runValidation([
        { field: 'user_id', value: user_id, checks: [required, mustBePositiveInt] },
        { field: 'type',    value: type,    checks: [required, mustBeOneOf(NOTIF_TYPES)] },
        { field: 'message', value: message, checks: [required, mustBeString] },
      ]);
      if (errors.length)
        return res.status(400).json({ status: 'error', errors });

      const [result] = await db.query(
        'INSERT INTO notifications (user_id, type, message, is_read, sent_at) VALUES (?, ?, ?, 0, NOW())',
        [user_id, type, message.trim()]
      );
      const [rows] = await db.query('SELECT * FROM notifications WHERE notification_id=?', [result.insertId]);
      res.status(201).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }

  // PUT /api/notifications/:id
  // Body: { is_read?, message?, type? }
  async update(req, res) {
    try {
      const { is_read, message, type } = req.body;

      const errors = runValidation([
        { field: 'is_read', value: is_read, checks: [mustBeBinary] },
        { field: 'message', value: message, checks: [mustBeString] },
        { field: 'type',    value: type,    checks: [mustBeOneOf(NOTIF_TYPES)] },
      ]);
      if (errors.length)
        return res.status(400).json({ status: 'error', errors });

      const [result] = await db.query(
        'UPDATE notifications SET is_read=?, message=?, type=? WHERE notification_id=?',
        [is_read, message, type, req.params.id]
      );
      if (result.affectedRows === 0)
        return res.status(404).json({ status: 'error', message: 'Notification not found' });
      const [rows] = await db.query('SELECT * FROM notifications WHERE notification_id=?', [req.params.id]);
      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }

  // DELETE /api/notifications/:id
  async remove(req, res) {
    try {
      const [result] = await db.query('DELETE FROM notifications WHERE notification_id=?', [req.params.id]);
      if (result.affectedRows === 0)
        return res.status(404).json({ status: 'error', message: 'Notification not found' });
      res.status(200).json({ status: 'success', message: `Notification ${req.params.id} deleted` });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }
}

module.exports = new NotificationsController();
