const express = require('express');
const router = express.Router();
const {
    getAllDiscounts,
    addDiscount,
    updateDiscount,
    deleteDiscount,
} = require('../controllers/discountController');

// Map endpoints to controller logic
router.get('/', getAllDiscounts);
router.post('/', addDiscount);
router.put('/:id', updateDiscount);
router.delete('/:id', deleteDiscount);

module.exports = router;
