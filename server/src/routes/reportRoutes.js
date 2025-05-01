// reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('./reportController');

router.get('/reports', reportController.getReports);
router.delete('/transactions/:transactionID', reportController.deleteSingleTransaction);
router.delete('/transactions', reportController.deleteMultipleTransactions);

module.exports = router;