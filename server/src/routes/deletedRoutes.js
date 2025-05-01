const express = require('express');
const router = express.Router();
const {
    getAllDeleted,
    /*addProduct,
    updateProduct,
    updateProductPrice,
    deleteProduct,*/
} = require('../controllers/deletedController');

// Map endpoints to controller logic
router.get('/', getAllDeleted);
/*router.post('/', addProduct);
router.put('/:id', updateProduct);
router.put('/update-price/:productCode', updateProductPrice);
router.delete('/:id', deleteProduct);*/

module.exports = router;