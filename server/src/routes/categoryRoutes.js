const express = require('express');
const router = express.Router();
const {
    getAllCategories,
    addCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoryController');

// Map endpoints to controller logic
router.get('/', getAllCategories);
router.post('/', addCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
