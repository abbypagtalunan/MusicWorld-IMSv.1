const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.post('/login', accountController.loginUser); // LOGIN ROUTE

router.get('/', accountController.getAllAccounts);         // GET all staff
router.get('/:id', accountController.getAccountById);       // GET one staff
router.post('/', accountController.createAccount);          // POST create staff
router.put('/:id', accountController.updateAccount);        // PUT update staff
router.put('/:id/reset-password', accountController.resetPassword); // PUT reset password
router.delete('/:id', accountController.deleteAccount);     // DELETE staff

module.exports = router;