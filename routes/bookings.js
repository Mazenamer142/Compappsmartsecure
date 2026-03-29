// ─────────────────────────────────────────────
//  routes/bookings.js
//  Maps HTTP methods + paths to BookingsController
// ─────────────────────────────────────────────

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/BookingsController');

router.get('/',      (req, res) => controller.getAll(req, res)); // GET  /api/bookings
router.get('/:id',   (req, res) => controller.getOne(req, res)); // GET  /api/bookings/:id
router.post('/',     (req, res) => controller.create(req, res)); // POST /api/bookings
router.put('/:id',   (req, res) => controller.update(req, res)); // PUT  /api/bookings/:id
router.delete('/:id',(req, res) => controller.remove(req, res)); // DEL  /api/bookings/:id

module.exports = router;
