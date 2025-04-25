const express = require('express');
const router = express.Router();
const {
    getAllProductStocks,
} = require('../controllers/productStockController');

// Map endpoints to controller logic
router.get('/', getAllProductStocks);

module.exports = router;