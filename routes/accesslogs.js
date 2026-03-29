// ─────────────────────────────────────────────
//  routes/accesslogs.js
//  Maps HTTP methods + paths to AccessLogsController
// ─────────────────────────────────────────────

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/AccessLogsController');

router.get('/',      (req, res) => controller.getAll(req, res)); // GET  /api/access-logs
router.get('/:id',   (req, res) => controller.getOne(req, res)); // GET  /api/access-logs/:id
router.post('/',     (req, res) => controller.create(req, res)); // POST /api/access-logs
router.put('/:id',   (req, res) => controller.update(req, res)); // PUT  /api/access-logs/:id
router.delete('/:id',(req, res) => controller.remove(req, res)); // DEL  /api/access-logs/:id

module.exports = router;
