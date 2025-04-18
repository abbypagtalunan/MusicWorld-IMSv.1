const brandModel = require('../models/brandModel'); // Import the brand model

// Route to fetch all brands
const getAllBrands = (req, res) => {

  // Access the getAllBrands method or query
  brandModel.getAllBrands((err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

// Route to add a new brand
const addBrand = (req, res) => {
  const { B_brandID, B_brandName, B_brandStatusID } = req.body;
  if (!B_brandID || !B_brandName || !B_brandStatusID) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  brandModel.addBrand({ B_brandID, B_brandName, B_brandStatusID }, (err, brandId) => {
    if (err) {
      console.error('Error inserting supplier:', err);
      // Handle duplicate entry error from MySQL (ER_DUP_ENTRY)
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Brand ID already exists' });
      }
      return res.status(500).json({ message: 'Error inserting brand' });
    }
    res.status(201).json({ message: 'Brand added successfully', id: supplierId });
  });
};

// Route to update brand details
const updateBrand = (req, res) => {
  const brandId = req.params.id;  // Extract brand ID from the URL parameter
  const { B_brandName, B_brandStatusID } = req.body; // Get the new data from the request body

  if (!B_brandName || !B_brandStatusID) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  brandModel.updateBrand(brandId, { B_brandName, B_brandStatusID }, (err, results) => {
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
const deleteBrand = (req, res) => {
  const brandId = req.params.id;
  brandModel.deleteBrand(brandId, (err, results) => {
    if (err) {
      console.error('Error deleting brand:', err);
      res.status(500).json({ message: 'Error deleting brand', results });
    } else {
      res.status(200).json({ message: 'brand deleted successfully', results });
    }
  });
};

module.exports = {
    getAllBrands,
    addBrand,
    updateBrand,
    deleteBrand,
};
