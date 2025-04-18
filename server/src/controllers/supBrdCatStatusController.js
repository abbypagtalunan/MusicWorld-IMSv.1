const brandModel = require('../models/supBrdCatStatusModel'); 

// Route to fetch all brands
const getAllSBCS = (req, res) => {
  brandModel.getAllSBCS((err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

// Route to add a new brand
const addSBCS = (req, res) => {
  const { SupBrdCatStatusID, SupBrdCatStatusName } = req.body;
  if (!SupBrdCatStatusID || !SupBrdCatStatusName ) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  brandModel.addSBCS({ SupBrdCatStatusID, SupBrdCatStatusName }, (err, supBrdCatStatusId) => {
    if (err) {
      console.error('Error inserting brand:', err);
      res.status(500).json({ message: 'Error inserting brand' });
    } else {
      res.status(201).json({ message: 'Brand added successfully', id: supBrdCatStatusId });
    }
  });
};

// Route to update brand details
const updateSBCS = (req, res) => {
  const supBrdCatStatusId = req.params.id;  // Extract brand ID from the URL parameter
  const { SupBrdCatStatusName } = req.body; // Get the new data from the request body

  if (!SupBrdCatStatusName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  brandModel.updateSBCS(supBrdCatStatusId, { SupBrdCatStatusName }, (err, results) => {
    if (err) {
      console.error('Error updating brand:', err);
      return res.status(500).json({ message: 'Error updating brand' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.status(200).json({ message: 'Brand updated successfully' });
  });
};

// Route to delete a brand
const deleteSBCS = (req, res) => {
  const supBrdCatStatusId = req.params.id;
  brandModel.deleteSBCS(supBrdCatStatusId, (err, results) => {
    if (err) {
      console.error('Error deleting brand:', err);
      res.status(500).json({ message: 'Error deleting brand', results });
    } else {
      res.status(200).json({ message: 'brand deleted successfully', results });
    }
  });
};

module.exports = {
    getAllSBCS,
    addSBCS,
    updateSBCS,
    deleteSBCS,
};
