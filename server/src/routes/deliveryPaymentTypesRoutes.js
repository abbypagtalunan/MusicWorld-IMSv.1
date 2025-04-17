const express = require('express');
const router = express.Router();
const {
    getAllDeliveryPaymentTypes,
    addDeliveryPaymentType,
    updateDeliveryPaymentType,
    deleteDeliveryPaymentType,
} = require('../controllers/deliveryPaymentTypesController');

// Map endpoints to controller logic
router.get('/', getAllDeliveryPaymentTypes);
router.post('/', addDeliveryPaymentType);
router.put('/:id', updateDeliveryPaymentType);
router.delete('/:id', deleteDeliveryPaymentType);

module.exports = router;
