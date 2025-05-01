const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/", reportController.getReports);
router.delete("/:transactionID", reportController.deleteTransaction);

module.exports = router;
