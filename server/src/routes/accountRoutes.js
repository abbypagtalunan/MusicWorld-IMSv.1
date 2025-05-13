const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");

router.post("/login", accountController.loginUser);

router.get("/", accountController.getAllAccounts);
router.get("/:id", accountController.getAccountById);
router.post("/", accountController.createAccount);
router.put("/:id", accountController.updateAccount);
router.put("/:id/reset-password", accountController.resetPassword);
router.delete("/:id", accountController.deleteAccount);

module.exports = router;