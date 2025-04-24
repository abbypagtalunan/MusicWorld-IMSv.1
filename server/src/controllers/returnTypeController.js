const returnTypeModel = require('../models/returnTypeModel');

// Route to fetch all return types
const getAllReturnTypes = (req, res) => {
  returnTypeModel.getAllReturnTypes((err, results) => {
    if (err) {
      console.error('Error fetching return types:', err);
      res.status(500).json({ error: 'Error fetching return types' });
    } else {
      res.json(results);
    }
  });
};

// Route to add a new return type
const addReturnType = (req, res) => {
  const { RT_returnTypeDescription } = req.body;

  if (!RT_returnTypeDescription) {
    return res.status(400).json({ message: 'Return type description is required' });
  }

  returnTypeModel.addReturnType({ RT_returnTypeDescription }, (err, returnTypeId) => {
    if (err) {
      console.error('Error inserting return type:', err);
      res.status(500).json({ message: 'Error inserting return type' });
    } else {
      res.status(201).json({ message: 'Return type added successfully', id: returnTypeId });
    }
  });
};

// Route to update a return type
const updateReturnType = (req, res) => {
  const returnTypeID = req.params.id;
  const { RT_returnTypeDescription } = req.body;

  if (!RT_returnTypeDescription) {
    return res.status(400).json({ message: 'Return type description is required' });
  }

  returnTypeModel.updateReturnType(returnTypeID, { RT_returnTypeDescription }, (err, results) => {
    if (err) {
      console.error('Error updating return type:', err);
      return res.status(500).json({ message: 'Error updating return type' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Return type not found' });
    }
    res.status(200).json({ message: 'Return type updated successfully' });
  });
};

// Route to delete a return type
const deleteReturnType = (req, res) => {
  const returnTypeID = req.params.id;

  returnTypeModel.deleteReturnType(returnTypeID, (err, results) => {
    if (err) {
      console.error('Error deleting return type:', err);
      res.status(500).json({ message: 'Error deleting return type' });
    } else {
      res.status(200).json({ message: 'Return type deleted successfully' });
    }
  });
};

module.exports = {
  getAllReturnTypes,
  addReturnType,
  updateReturnType,
  deleteReturnType,
};