const express = require('express');
const router = express.Router();
const {
  getAllProductStatus,
  addProductStatus,
  updateProductStatus,
  deleteProductStatus
} = require('../controllers/productStatusController');

// Map endpoints to controller logic
router.get('/', getAllProductStatus);
router.post('/', addProductStatus);
router.put('/:id', updateProductStatus);
router.delete('/:id', deleteProductStatus);

module.exports = router;
