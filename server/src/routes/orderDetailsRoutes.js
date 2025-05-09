const express = require('express');
const router = express.Router();
const {
    getAllOrderDetails,
    fetchReportData,
    addOrderDetail,
    updateOrderDetail,
    deleteOrderDetail,
} = require('../controllers/orderDetailsController');

// Map endpoints to controller logic
router.get('/', getAllOrderDetails);
router.get('/reports', fetchReportData);
router.post('/', addOrderDetail);
router.put('/:id', updateOrderDetail);
router.delete('/:id', deleteOrderDetail);

module.exports = router;
