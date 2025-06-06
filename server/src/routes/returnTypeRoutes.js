const express = require('express');
const router = express.Router();
const { getAllReturnTypes } = require('../models/returnTypeModel');

// Route to get all return types
router.get('/', (req, res) => {
  getAllReturnTypes((err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch return types' });
    }
    res.json(results);
  });
});

// Existing route to get or create a return type by description
router.post('/get-or-create', (req, res) => {
  const { returnTypeDescription } = req.body;

  if (!returnTypeDescription) {
    return res.status(400).json({ error: 'Return type description is required' });
  }

  getOrCreateReturnTypeId(returnTypeDescription, (err, RT_returnTypeID) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to process return type' });
    }
    res.json({ RT_returnTypeID });
  });
});

module.exports = router;