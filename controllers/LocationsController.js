// controllers/LocationsController.js
const db = require('../config/db');
class LocationsController {
  async getAll(req, res) {
    try {
      const { search, sort } = req.query;
      const allowedSort = ['location_id', 'name', 'city', 'created_at'];
      const sortCol = allowedSort.includes(sort) ? sort : 'location_id';
      let query = 'SELECT * FROM locations';
      let params = [];
      if (search) {
        query += ' WHERE name LIKE ? OR city LIKE ? OR address LIKE ?';
        params.push('%' + search + '%', '%' + search + '%', '%' + search + '%');
      }
      query += ' ORDER BY ' + sortCol + ' ASC';
      const [rows] = await db.query(query, params);
      res.status(200).json({ status: 'success', count: rows.length, data: rows });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }
  async getOne(req, res) {
    try {
      const [rows] = await db.query('SELECT * FROM locations WHERE location_id=?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ status: 'error', message: 'Location not found' });
      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }
  async create(req, res) {
    try {
      const { name, address, city, country } = req.body;
      if (!name || !address)
        return res.status(400).json({ status: 'error', message: 'name and address are required' });
      const [result] = await db.query(
        'INSERT INTO locations (name, address, city, country) VALUES (?, ?, ?, ?)',
        [name, address, city, country]
      );
      const [rows] = await db.query('SELECT * FROM locations WHERE location_id=?', [result.insertId]);
      res.status(201).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }
  async update(req, res) {
    try {
      const { name, address, city, country } = req.body;
      const [result] = await db.query(
        'UPDATE locations SET name=?, address=?, city=?, country=? WHERE location_id=?',
        [name, address, city, country, req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Location not found' });
      const [rows] = await db.query('SELECT * FROM locations WHERE location_id=?', [req.params.id]);
      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }
  async remove(req, res) {
    try {
      const [result] = await db.query('DELETE FROM locations WHERE location_id=?', [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ status: 'error', message: 'Location not found' });
      res.status(200).json({ status: 'success', message: 'Location ' + req.params.id + ' deleted' });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }
}
module.exports = new LocationsController();
