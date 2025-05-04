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
  getDeliveryProductsByDeliveryNumber,
  getPaymentDetails,
  updatePaymentDetails,
  deleteDelivery
} = require('../controllers/deliveryController');

// Main delivery routes
router.get('/', getAllDeliveries);
router.get('/search', searchDeliveries);
router.post('/', addDelivery);
router.delete('/:deliveryNumber', deleteDelivery);
router.put('/:deliveryNumber', updatePaymentDetails);

// Product-specific routes
productsRouter.get('/', getDeliveryProducts);
productsRouter.get('/:deliveryNumber', getDeliveryProductsByDeliveryNumber);
productsRouter.post('/', addDeliveryProducts);

// Payment details routes
paymentDetailsRouter.get('/', getPaymentDetails);

// Export the routers
router.products = productsRouter;
router.paymentDetails = paymentDetailsRouter;

module.exports = router;