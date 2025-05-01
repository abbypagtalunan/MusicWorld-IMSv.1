const express = require('express');
const router = express.Router();
const {
  getAllReturns,
  addReturn,
  updateReturn,
  deleteReturn,
} = require('../controllers/returnsController'); 

// Map endpoints to controller logic for the Returns table
router.get('/', getAllReturns); // Fetch all returns
router.post('/', addReturn); // Add a new return
router.put('/:id', updateReturn); // Update an existing return
router.delete('/:id', deleteReturn); // Delete a return

module.exports = router;