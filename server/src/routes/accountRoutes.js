const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");

router.get("/", accountController.getAllAccounts); // GET /accounts
router.get("/:id", accountController.getAccountById); // GET /accounts/123

module.exports = router;