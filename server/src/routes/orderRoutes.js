const express = require('express');
const router = express.Router();
const {
    getAllOrders,
    addOrder,
    updateOrder,
    // deleteOrder,
    softDeleteOrder
} = require('../controllers/orderController');

// Map endpoints to controller logic
router.get('/', getAllOrders);
router.post('/', addOrder);
router.put('/:id', updateOrder);
// router.delete('/:id', deleteOrder);
router.delete('/:id', softDeleteOrder);

module.exports = router;
