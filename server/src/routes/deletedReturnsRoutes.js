const express = require('express');
const router = express.Router();
const {
    getAllDeleted,
    retrieveDeleted,
    deleteDeleted,
} = require('../controllers/deletedReturnsController');

// Map endpoints to controller logic
router.get('/', getAllDeleted);
router.post('/:id', retrieveDeleted);
router.delete('/:id', deleteDeleted);

module.exports = router;