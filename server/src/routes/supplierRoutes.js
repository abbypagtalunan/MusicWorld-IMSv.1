// API http methods mapping

const express = require('express');
const router = express.Router();
const {
  getAllSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');

// Map endpoints to controller logic
router.get('/', getAllSuppliers);
router.post('/', addSupplier);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);

module.exports = router;
