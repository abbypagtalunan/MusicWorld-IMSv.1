// routes/accountRoutes.js
const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/', accountController.getAllAccounts);         // GET all staff
router.get('/:id', accountController.getAccountById);       // GET one staff
router.post('/', accountController.createAccount);         // POST create staff
router.put('/:id', accountController.updateAccount);       // PUT update staff
router.delete('/:id', accountController.deleteAccount);     // DELETE staff

module.exports = router;