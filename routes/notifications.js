// ─────────────────────────────────────────────
//  routes/notifications.js
//  Maps HTTP methods + paths to NotificationsController
// ─────────────────────────────────────────────

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/NotificationsController');

router.get('/',      (req, res) => controller.getAll(req, res)); // GET  /api/notifications
router.get('/:id',   (req, res) => controller.getOne(req, res)); // GET  /api/notifications/:id
router.post('/',     (req, res) => controller.create(req, res)); // POST /api/notifications
router.put('/:id',   (req, res) => controller.update(req, res)); // PUT  /api/notifications/:id
router.delete('/:id',(req, res) => controller.remove(req, res)); // DEL  /api/notifications/:id

module.exports = router;
