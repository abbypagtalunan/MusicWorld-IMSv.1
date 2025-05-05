const express = require('express');
const router = express.Router();

// Import all controllers
const deliveryController = require('../controllers/deliveryController');

// Create subrouters for organization
const productsRouter = express.Router();
const paymentDetailsRouter = express.Router();
const modeOfPaymentRouter = express.Router();
const paymentStatusRouter = express.Router();
const paymentTypesRouter = express.Router();

// Main delivery routes
router.get('/', deliveryController.getAllDeliveries);
router.get('/search', deliveryController.searchDeliveries);
router.post('/', deliveryController.addDelivery);
router.delete('/:deliveryNumber', deliveryController.deleteDelivery);
router.put('/:deliveryNumber', deliveryController.updatePaymentDetails);

// Product-specific routes
productsRouter.get('/', deliveryController.getDeliveryProducts);
productsRouter.get('/:deliveryNumber', deliveryController.getDeliveryProductsByDeliveryNumber);
productsRouter.post('/', deliveryController.addDeliveryProducts);

// Payment details routes
paymentDetailsRouter.get('/', deliveryController.getPaymentDetails);

// Delivery Mode of Payment routes
modeOfPaymentRouter.get('/', deliveryController.getAllDeliveryModeOfPayments);
modeOfPaymentRouter.post('/', deliveryController.addDeliveryModeOfPayment);
modeOfPaymentRouter.put('/:id', deliveryController.updateDeliveryModeOfPayment);
modeOfPaymentRouter.delete('/:id', deliveryController.deleteDeliveryModeOfPayment);

// Delivery Payment Status routes
paymentStatusRouter.get('/', deliveryController.getAllDeliveryPaymentStatuses);
paymentStatusRouter.post('/', deliveryController.addDeliveryPaymentStatus);
paymentStatusRouter.put('/:id', deliveryController.updateDeliveryPaymentStatus);
paymentStatusRouter.delete('/:id', deliveryController.deleteDeliveryPaymentStatus);

// Delivery Payment Types routes
paymentTypesRouter.get('/', deliveryController.getAllDeliveryPaymentTypes);
paymentTypesRouter.post('/', deliveryController.addDeliveryPaymentType);
paymentTypesRouter.put('/:id', deliveryController.updateDeliveryPaymentType);
paymentTypesRouter.delete('/:id', deliveryController.deleteDeliveryPaymentType);

// Attach subrouters to main router
router.use('/products', productsRouter);
router.use('/payment-details', paymentDetailsRouter);
router.use('/mode-of-payment', modeOfPaymentRouter);
router.use('/payment-status', paymentStatusRouter);
router.use('/payment-types', paymentTypesRouter);

// Export the main router with all routes
module.exports = router;