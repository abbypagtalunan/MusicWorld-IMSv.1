const express = require('express');
const router = express.Router();
const {
    getAllBrands,
    addBrand,
    updateBrand,
    deleteBrand,
} = require('../controllers/brandController');

// Map endpoints to controller logic
router.get('/', getAllBrands);
router.post('/', addBrand);
router.put('/:id', updateBrand);
router.delete('/:id', deleteBrand);

module.exports = router;
