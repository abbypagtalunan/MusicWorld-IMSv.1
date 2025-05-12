const express = require('express');
const router = express.Router();

// Import all controllers
const deliveryController = require('../controllers/deliveryController');

// Create subrouters
const productsRouter = express.Router();
const paymentDetailsRouter = express.Router();
const modeOfPaymentRouter = express.Router();
const paymentStatusRouter = express.Router();
const paymentTypesRouter = express.Router();

// Deliveries routes
router.get('/', deliveryController.getAllDeliveries);
router.post('/', (req, res, next) => { next(); }, deliveryController.addDelivery);
router.get('/search', deliveryController.searchDeliveriesByID);
router.put('/:deliveryNumber/mark-deleted', deliveryController.markDeliveryAsDeleted);

// Delivery products routes
productsRouter.get('/', deliveryController.getDeliveryProducts);
productsRouter.get('/:deliveryNumber', deliveryController.getDeliveryProductsByID);
productsRouter.post('/', deliveryController.addDeliveryProducts);

// Payment details routes
paymentDetailsRouter.get('/', deliveryController.getPaymentDetails);
router.put('/:deliveryNumber/payment-details', deliveryController.updatePaymentDetails);

// Types/modes/status routes
modeOfPaymentRouter.get('/', deliveryController.getAllDeliveryModeOfPayments);
paymentStatusRouter.get('/', deliveryController.getAllDeliveryPaymentStatuses);
paymentTypesRouter.get('/', deliveryController.getAllDeliveryPaymentTypes);

// Attach subrouters to main router
router.use('/products', productsRouter);
router.use('/payment-details', paymentDetailsRouter);
router.use('/mode-of-payment', modeOfPaymentRouter);
router.use('/payment-status', paymentStatusRouter);
router.use('/payment-types', paymentTypesRouter);

// Export the main router with all routes
module.exports = router;