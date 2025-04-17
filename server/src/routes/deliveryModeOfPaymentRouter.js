const express = require('express');
const router = express.Router();
const {
    getAllDeliveryModeOfPayments,
    addDeliveryModeOfPayment,
    updateDeliveryModeOfPayment,
    deleteDeliveryModeOfPayment,
} = require('../controllers/deliveryModeOfPaymentController');

// Map endpoints to controller logic
router.get('/', getAllDeliveryModeOfPayments);
router.post('/', addDeliveryModeOfPayment);
router.put('/:id', updateDeliveryModeOfPayment);
router.delete('/:id', deleteDeliveryModeOfPayment);

module.exports = router;
