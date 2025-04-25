const express = require('express');
const router = express.Router();
const {
  getAllReturnTypes,
  addReturnType,
  updateReturnType,
  deleteReturnType,
} = require('../controllers/returnTypeController');

// Map endpoints to controller logic
router.get('/', getAllReturnTypes); // Fetch all return types
router.post('/', addReturnType); // Add a new return type
router.put('/:id', updateReturnType); // Update an existing return type
router.delete('/:id', deleteReturnType); // Delete a return type

module.exports = router;