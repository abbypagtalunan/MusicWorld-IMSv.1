// Note: Controller connected to the models (database/entity)
// Where data validation comes in

const supplierModel = require('../models/supplierModel'); // Import the supplier model

// Route to fetch all suppliers
const getAllSuppliers = (req, res) => {

  // Access the getAllSuppliers method or query
  supplierModel.getAllSuppliers((err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

// Route to add a new supplier
const addSupplier = (req, res) => {
  const { S_supplierID, S_supplierName, S_supplierStatus } = req.body;
  if (!S_supplierID || !S_supplierName || !S_supplierStatus) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  supplierModel.addSupplier({ S_supplierID, S_supplierName, S_supplierStatus }, (err, supplierId) => {
    if (err) {
      console.error('Error inserting supplier:', err);
      res.status(500).json({ message: 'Error inserting supplier' });
    } else {
      res.status(201).json({ message: 'Supplier added successfully', id: supplierId });
    }
  });
};

// Route to update supplier details
const updateSupplier = (req, res) => {
  const supplierId = req.params.id;  // Extract supplier ID from the URL parameter
  const { S_supplierName, S_supplierStatus } = req.body; // Get the new data from the request body

  if (!S_supplierName || !S_supplierStatus) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  supplierModel.updateSupplier(supplierId, { S_supplierName, S_supplierStatus }, (err, results) => {
    if (err) {
      console.error('Error updating supplier:', err);
      return res.status(500).json({ message: 'Error updating supplier' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(200).json({ message: 'Supplier updated successfully' });
  });
};

// Route to delete a supplier
const deleteSupplier = (req, res) => {
  const supplierId = req.params.id;
  supplierModel.deleteSupplier(supplierId, (err, results) => {
    if (err) {
      console.error('Error deleting supplier:', err);
      res.status(500).json({ message: 'Error deleting supplier', results });
    } else {
      res.status(200).json({ message: 'Supplier deleted successfully', results });
    }
  });
};

module.exports = {
  getAllSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
};
