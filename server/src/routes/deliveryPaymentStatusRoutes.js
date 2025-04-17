const express = require('express');
const router = express.Router();
const {
  getAllDeliveryPaymentStatuses,
  addDeliveryPaymentStatus,
  updateDeliveryPaymentStatus,
  deleteDeliveryPaymentStatus,
} = require('../controllers/deliveryPaymentStatusController');

router.get('/', getAllDeliveryPaymentStatuses);
router.post('/', addDeliveryPaymentStatus);
router.put('/:id', updateDeliveryPaymentStatus);
router.delete('/:id', deleteDeliveryPaymentStatus);

module.exports = router;
