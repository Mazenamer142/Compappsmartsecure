// ─────────────────────────────────────────────
//  routes/payments.js
//  Maps HTTP methods + paths to PaymentsController
// ─────────────────────────────────────────────

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/PaymentsController');

router.get('/',      (req, res) => controller.getAll(req, res)); // GET  /api/payments
router.get('/:id',   (req, res) => controller.getOne(req, res)); // GET  /api/payments/:id
router.post('/',     (req, res) => controller.create(req, res)); // POST /api/payments
router.put('/:id',   (req, res) => controller.update(req, res)); // PUT  /api/payments/:id
router.delete('/:id',(req, res) => controller.remove(req, res)); // DEL  /api/payments/:id

module.exports = router;
