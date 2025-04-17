const deliveryPaymentTypesModel = require('../models/deliveryPaymentTypesModel');

// Get all Delivery Payment Types
const getAllDeliveryPaymentTypes = (req, res) => {
  deliveryPaymentTypesModel.getAllDeliveryPaymentTypes((err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

// Add a new Delivery Payment Type
const addDeliveryPaymentType = (req, res) => {
  const { D_paymentName } = req.body;
  if (!D_paymentName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  deliveryPaymentTypesModel.addDeliveryPaymentType({ D_paymentName }, (err, deliveryPaymentTypeId) => {
    if (err) {
      console.error('Error inserting Delivery Payment Type:', err);
      res.status(500).json({ message: 'Error inserting Delivery Payment Type' });
    } else {
      res.status(201).json({ message: 'Delivery Payment Type added successfully', id: deliveryPaymentTypeId });
    }
  });
};

// Update an existing Delivery Payment Type
const updateDeliveryPaymentType = (req, res) => {
  const deliveryPaymentTypeId = req.params.id;
  const { D_paymentName } = req.body;

  if (!D_paymentName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  deliveryPaymentTypesModel.updateDeliveryPaymentType(deliveryPaymentTypeId, { D_paymentName }, (err, results) => {
    if (err) {
      console.error('Error updating Delivery Payment Type:', err);
      return res.status(500).json({ message: 'Error updating Delivery Payment Type' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Delivery Payment Type not found' });
    }

    res.status(200).json({ message: 'Delivery Payment Type updated successfully' });
  });
};

// Delete a Delivery Payment Type
const deleteDeliveryPaymentType = (req, res) => {
  const deliveryPaymentTypeId = req.params.id;
  deliveryPaymentTypesModel.deleteDeliveryPaymentType(deliveryPaymentTypeId, (err, results) => {
    if (err) {
      console.error('Error deleting Delivery Payment Type:', err);
      res.status(500).json({ message: 'Error deleting Delivery Payment Type', results });
    } else {
      res.status(200).json({ message: 'Delivery Payment Type deleted successfully', results });
    }
  });
};

module.exports = {
  getAllDeliveryPaymentTypes,
  addDeliveryPaymentType,
  updateDeliveryPaymentType,
  deleteDeliveryPaymentType,
};
