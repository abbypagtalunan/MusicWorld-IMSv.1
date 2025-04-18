const express = require('express');
const router = express.Router();
const {
    getAllSBCS,
    addSBCS,
    updateSBCS,
    deleteSBCS,
} = require('../controllers/supBrdCatStatusController');

// Map endpoints to controller logic
router.get('/', getAllSBCS);
router.post('/', addSBCS);
router.put('/:id', updateSBCS);
router.delete('/:id', deleteSBCS);

module.exports = router;
