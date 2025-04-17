const express = require('express');
const router = express.Router();
const {
  getAllReturnTypes,
  addReturnType,
  updateReturnType,
  deleteReturnType,
} = require('../controllers/returnTypeController');

router.get('/', getAllReturnTypes);
router.post('/', addReturnType);
router.put('/:id', updateReturnType);
router.delete('/:id', deleteReturnType);

module.exports = router;
