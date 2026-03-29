// ─────────────────────────────────────────────
//  routes/maintenance.js
//  Maps HTTP methods + paths to MaintenanceController
// ─────────────────────────────────────────────

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/MaintenanceController');

router.get('/',      (req, res) => controller.getAll(req, res)); // GET  /api/maintenance
router.get('/:id',   (req, res) => controller.getOne(req, res)); // GET  /api/maintenance/:id
router.post('/',     (req, res) => controller.create(req, res)); // POST /api/maintenance
router.put('/:id',   (req, res) => controller.update(req, res)); // PUT  /api/maintenance/:id
router.delete('/:id',(req, res) => controller.remove(req, res)); // DEL  /api/maintenance/:id

module.exports = router;
