const express = require('express');
const router = express.Router();
const {
    getAllTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
} = require('../controllers/transactionController.js');

// Map endpoints to controller logic
router.get('/', getAllTransactions);
router.post('/', addTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
