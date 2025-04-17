const productStatusModel = require('../models/productStatusModel');

const getAllProductStatus = (req, res) => {

  // Access the getAllProductStatus method or query
  productStatusModel.getAllProductStatus((err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

// Route to add a new productStatus
const addProductStatus = (req, res) => {
  const { P_productStatusID, P_productStatusName } = req.body;
  if (!P_productStatusID || !P_productStatusName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  productStatusModel.addProductStatus({ P_productStatusID, P_productStatusName}, (err, productStatusId) => {
    if (err) {
      console.error('Error inserting product status:', err);
      res.status(500).json({ message: 'Error inserting productStatus' });
    } else {
      res.status(201).json({ message: 'product status added successfully', id: productStatusId });
    }
  });
};

// Route to update productStatus details
const updateProductStatus = (req, res) => {
  const productStatusId = req.params.id;  // Extract productStatus ID from the URL parameter
  const {P_productStatusName} = req.body; // Get the new data from the request body

  if (!P_productStatusName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  productStatusModel.updateProductStatus(productStatusId, { P_productStatusName }, (err, results) => {
    if (err) {
      console.error('Error updating product status:', err);
      return res.status(500).json({ message: 'Error updating product status' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'product status not found' });
    }
    res.status(200).json({ message: 'product status updated successfully' });
  });
};

// Route to delete a productStatus
const deleteProductStatus = (req, res) => {
  const productStatusId = req.params.id;
  productStatusModel.deleteProductStatus(productStatusId, (err, results) => {
    if (err) {
      console.error('Error deleting product Status:', err);
      res.status(500).json({ message: 'Error deleting productStatus', results });
    } else {
      res.status(200).json({ message: 'productStatus deleted successfully', results });
    }
  });
};

module.exports = {
    getAllProductStatus,
    addProductStatus,
    updateProductStatus,
    deleteProductStatus,
};
