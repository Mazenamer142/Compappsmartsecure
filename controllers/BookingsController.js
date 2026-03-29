// controllers/BookingsController.js
const db = require("../config/db");
class BookingsController {
  async getAll(req, res) {
    try {
      const { user_id, locker_id, status, sort } = req.query;
      const allowedSort = ["booking_id", "start_time", "end_time", "status", "user_id", "locker_id"];
      const sortCol = allowedSort.includes(sort) ? sort : "booking_id";
      let query = "SELECT * FROM bookings";
      let params = [];
      let conditions = [];
      if (user_id)   { conditions.push("user_id = ?");   params.push(user_id); }
      if (locker_id) { conditions.push("locker_id = ?"); params.push(locker_id); }
      if (status)    { conditions.push("status = ?");    params.push(status); }
      if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
      query += " ORDER BY " + sortCol + " ASC";
      const [rows] = await db.query(query, params);
      res.status(200).json({ status: "success", count: rows.length, data: rows });
    } catch (err) { res.status(500).json({ status: "error", message: err.message }); }
  }
  async getOne(req, res) {
    try {
      const [rows] = await db.query("SELECT * FROM bookings WHERE booking_id=?", [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ status: "error", message: "Booking not found" });
      res.status(200).json({ status: "success", data: rows[0] });
    } catch (err) { res.status(500).json({ status: "error", message: err.message }); }
  }
  async create(req, res) {
    try {
      const { user_id, locker_id, start_time, end_time } = req.body;
      if (!user_id || !locker_id || !start_time || !end_time)
        return res.status(400).json({ status: "error", message: "user_id, locker_id, start_time, end_time are required" });
      const [result] = await db.query(
        "INSERT INTO bookings (user_id, locker_id, start_time, end_time, status) VALUES (?, ?, ?, ?, ?)",
        [user_id, locker_id, start_time, end_time, "active"]
      );
      const [rows] = await db.query("SELECT * FROM bookings WHERE booking_id=?", [result.insertId]);
      res.status(201).json({ status: "success", data: rows[0] });
    } catch (err) { res.status(500).json({ status: "error", message: err.message }); }
  }
  async update(req, res) {
    try {
      const { start_time, end_time, status } = req.body;
      const [result] = await db.query(
        "UPDATE bookings SET start_time=?, end_time=?, status=? WHERE booking_id=?",
        [start_time, end_time, status, req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ status: "error", message: "Booking not found" });
      const [rows] = await db.query("SELECT * FROM bookings WHERE booking_id=?", [req.params.id]);
      res.status(200).json({ status: "success", data: rows[0] });
    } catch (err) { res.status(500).json({ status: "error", message: err.message }); }
  }
  async remove(req, res) {
    try {
      const [result] = await db.query("DELETE FROM bookings WHERE booking_id=?", [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ status: "error", message: "Booking not found" });
      res.status(200).json({ status: 'success', message: 'Booking ' + req.params.id + ' deleted' });
    } catch (err) { res.status(500).json({ status: "error", message: err.message }); }
  }
}
module.exports = new BookingsController();
