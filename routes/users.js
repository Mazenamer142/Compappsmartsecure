// ─────────────────────────────────────────────
//  routes/users.js
//  Maps HTTP methods + paths to UsersController
// ─────────────────────────────────────────────

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/UsersController');

router.get('/',     (req, res) => controller.getAll(req, res));  // GET  /api/users
router.get('/:id',  (req, res) => controller.getOne(req, res));  // GET  /api/users/:id
router.post('/',    (req, res) => controller.create(req, res));  // POST /api/users
router.put('/:id',  (req, res) => controller.update(req, res));  // PUT  /api/users/:id
router.delete('/:id',(req, res) => controller.remove(req, res)); // DEL  /api/users/:id

module.exports = router;
