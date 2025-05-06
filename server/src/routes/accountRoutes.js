// src/routes/accountRoutes.js
const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/me', accountController.getCurrentUser);
router.put('/me', accountController.editAccount);
router.put('/me/password', accountController.changePassword);
router.get('/staff', accountController.getAllStaff);
router.post('/staff', accountController.addStaff);
router.put('/staff/:id', accountController.editStaff);
router.delete('/staff/:id', accountController.deleteStaff);
router.post('/staff/:id/reset-password', accountController.resetPassword);
router.delete('/staff/bulk', accountController.bulkDeleteStaff);

module.exports = router;