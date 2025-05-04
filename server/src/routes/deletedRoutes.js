const express = require('express');
const router = express.Router();
const {
    getAllDeleted,
    deleteDeleted,
} = require('../controllers/deletedController');

// Map endpoints to controller logic
router.get('/', getAllDeleted);
router.delete('/:id', deleteDeleted);

module.exports = router;