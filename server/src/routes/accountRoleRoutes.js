// routes/accountRoleRoutes.js

const express = require("express");
const router = express.Router();
const accountRoleController = require("../controllers/accountRoleController");

router.get("/", accountRoleController.getAllRoles); // GET /roles
router.get("/:roleID", accountRoleController.getRoleById); // GET /roles/1

module.exports = router;