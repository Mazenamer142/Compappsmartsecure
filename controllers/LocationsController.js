// controllers/LocationsController.js
const db = require('../config/db');
const { runValidation, required, mustBeString } = require('../utils/validate');

class LocationsController {

  // GET /api/locations  –  ?search=  ?sort=
  async getAll(req, res) {
    try {
      const { search, sort } = req.query;
      const allowedSort = ['location_id', 'name', 'city', 'created_at'];
      const sortCol = allowedSort.includes(sort) ? sort : 'location_id';
      let query = 'SELECT * FROM locations';
      let params = [];
      if (search) {
        query += ' WHERE name LIKE ? OR city LIKE ? OR address LIKE ?';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      query += ' ORDER BY ' + sortCol + ' ASC';
      const [rows] = await db.query(query, params);
      res.status(200).json({ status: 'success', count: rows.length, data: rows });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }

  // GET /api/locations/:id
  async getOne(req, res) {
    try {
      const [rows] = await db.query('SELECT * FROM locations WHERE location_id=?', [req.params.id]);
      if (rows.length === 0)
        return res.status(404).json({ status: 'error', message: 'Location not found' });
      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }

  // POST /api/locations
  // Body: { name, address, city?, country? }
  async create(req, res) {
    try {
      const { name, address, city, country } = req.body;

      const errors = runValidation([
        { field: 'name',    value: name,    checks: [required, mustBeString] },
        { field: 'address', value: address, checks: [required, mustBeString] },
        { field: 'city',    value: city,    checks: [mustBeString] },
        { field: 'country', value: country, checks: [mustBeString] },
      ]);
      if (errors.length)
        return res.status(400).json({ status: 'error', errors });

      const [result] = await db.query(
        'INSERT INTO locations (name, address, city, country) VALUES (?, ?, ?, ?)',
        [name.trim(), address.trim(), city || null, country || null]
      );
      const [rows] = await db.query('SELECT * FROM locations WHERE location_id=?', [result.insertId]);
      res.status(201).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }

  // PUT /api/locations/:id
  // Body: { name, address, city?, country? }
  async update(req, res) {
    try {
      const { name, address, city, country } = req.body;

      const errors = runValidation([
        { field: 'name',    value: name,    checks: [required, mustBeString] },
        { field: 'address', value: address, checks: [required, mustBeString] },
        { field: 'city',    value: city,    checks: [mustBeString] },
        { field: 'country', value: country, checks: [mustBeString] },
      ]);
      if (errors.length)
        return res.status(400).json({ status: 'error', errors });

      const [result] = await db.query(
        'UPDATE locations SET name=?, address=?, city=?, country=? WHERE location_id=?',
        [name.trim(), address.trim(), city || null, country || null, req.params.id]
      );
      if (result.affectedRows === 0)
        return res.status(404).json({ status: 'error', message: 'Location not found' });
      const [rows] = await db.query('SELECT * FROM locations WHERE location_id=?', [req.params.id]);
      res.status(200).json({ status: 'success', data: rows[0] });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }

  // DELETE /api/locations/:id
  async remove(req, res) {
    try {
      const [result] = await db.query('DELETE FROM locations WHERE location_id=?', [req.params.id]);
      if (result.affectedRows === 0)
        return res.status(404).json({ status: 'error', message: 'Location not found' });
      res.status(200).json({ status: 'success', message: `Location ${req.params.id} deleted` });
    } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
  }
}

module.exports = new LocationsController();
