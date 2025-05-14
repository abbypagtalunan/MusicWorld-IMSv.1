const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    addProduct,
    updateProduct,
    updateProductPrice,
    deductProductStockNumber,
    deleteProduct,
} = require('../controllers/productController');

// Map endpoints to controller logic
router.get('/', getAllProducts);
router.post('/', addProduct);
router.put('/:id', updateProduct);
router.put('/update-price/:productCode', updateProductPrice);
router.patch('/:productCode/deductStock', deductProductStockNumber);
router.delete('/:id', deleteProduct);

module.exports = router;
