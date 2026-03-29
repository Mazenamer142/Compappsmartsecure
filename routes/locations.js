// ─────────────────────────────────────────────
//  routes/locations.js
//  Maps HTTP methods + paths to LocationsController
// ─────────────────────────────────────────────

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/LocationsController');

router.get('/',      (req, res) => controller.getAll(req, res)); // GET  /api/locations
router.get('/:id',   (req, res) => controller.getOne(req, res)); // GET  /api/locations/:id
router.post('/',     (req, res) => controller.create(req, res)); // POST /api/locations
router.put('/:id',   (req, res) => controller.update(req, res)); // PUT  /api/locations/:id
router.delete('/:id',(req, res) => controller.remove(req, res)); // DEL  /api/locations/:id

module.exports = router;
