const express = require('express');
const router = express.Router();
const productsRouter = express.Router();
const paymentDetailsRouter = express.Router();

const {
  getAllDeliveries,
  searchDeliveries,
  addDelivery,
  addDeliveryProducts,
  getDeliveryProducts,
  getPaymentDetails,
  updatePaymentDetails,
  deleteDelivery
} = require('../controllers/deliveryController');

// Main delivery routes
router.get('/', getAllDeliveries);
router.get('/search', searchDeliveries);
router.post('/', addDelivery);
router.delete('/:id', deleteDelivery);
router.put('/:deliveryNumber', updatePaymentDetails);

// Product-specific routes
productsRouter.get('/', getDeliveryProducts);
productsRouter.post('/', addDeliveryProducts);

// Payment details routes
paymentDetailsRouter.get('/', getPaymentDetails);

module.exports = router;
module.exports.products = productsRouter;
module.exports.paymentDetails = paymentDetailsRouter;