// src/routes/accountRoutes.js
const express = require('express');
const router = express.Router();

const accountController = require('../controllers/accountController');

const authenticate = require('../../middleware/authMiddleware'); // create this separately

// Public routes
router.post('/login', accountController.login);

// Protected routes
router.use(authenticate);

// My Account
router.get('/me', accountController.getCurrentUser);
router.put('/me', accountController.editAccount);
router.put('/me/password', accountController.changePassword);

// Staff Management
router.get('/staff', accountController.getAllStaff);
router.post('/staff', accountController.addStaff);
router.put('/staff/:accountId', accountController.editStaff);
router.delete('/staff/:accountId', accountController.deleteStaff);
router.post('/staff/:accountId/reset-password', accountController.resetPassword);
router.delete('/staff/bulk', accountController.bulkDeleteStaff);

module.exports = router;