// ─────────────────────────────────────────────
//  routes/lockers.js
//  Maps HTTP methods + paths to LockersController
// ─────────────────────────────────────────────

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/LockersController');

router.get('/',      (req, res) => controller.getAll(req, res)); // GET  /api/lockers
router.get('/:id',   (req, res) => controller.getOne(req, res)); // GET  /api/lockers/:id
router.post('/',     (req, res) => controller.create(req, res)); // POST /api/lockers
router.put('/:id',   (req, res) => controller.update(req, res)); // PUT  /api/lockers/:id
router.delete('/:id',(req, res) => controller.remove(req, res)); // DEL  /api/lockers/:id

module.exports = router;
