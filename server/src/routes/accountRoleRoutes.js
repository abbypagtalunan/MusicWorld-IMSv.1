const express = require('express');
const router = express.Router();
const accountRoleController = require('../controllers/accountRoleController');

router.get('/', accountRoleController.getAllRoles);       // GET /api/roles
router.get('/:roleID', accountRoleController.getRoleById); // GET /api/roles/1

module.exports = router;