const express = require('express');
const router = express.Router();
const controller = require('../controllers/returnsController');

// Returns Routes
router.get('/returns', controller.getAllReturns);
router.post('/returns', controller.addReturn);
router.put('/returns/:id', controller.updateReturn);
router.delete('/returns/:id', controller.deleteReturn);

// Return Types Routes
router.get('/returnTypes', controller.getAllReturnTypes);
router.post('/returnTypes', controller.addReturnType);
router.put('/returnTypes/:id', controller.updateReturnType);
router.delete('/returnTypes/:id', controller.deleteReturnType);

module.exports = router;
