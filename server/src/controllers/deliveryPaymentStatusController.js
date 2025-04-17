const deliveryPaymentStatusModel = require('../models/deliveryPaymentStatusModel');

// Get all Delivery Payment Statuses
const getAllDeliveryPaymentStatuses = (req, res) => {
  deliveryPaymentStatusModel.getAllDeliveryPaymentStatuses((err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

// Add a new Delivery Payment Status
const addDeliveryPaymentStatus = (req, res) => {
  const { D_statusName } = req.body;
  if (!D_statusName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  deliveryPaymentStatusModel.addDeliveryPaymentStatus({ D_statusName }, (err, insertId) => {
    if (err) {
      console.error('Error inserting Delivery Payment Status:', err);
      res.status(500).json({ message: 'Error inserting Delivery Payment Status' });
    } else {
      res.status(201).json({ message: 'Delivery Payment Status added successfully', id: insertId });
    }
  });
};

// Update an existing Delivery Payment Status
const updateDeliveryPaymentStatus = (req, res) => {
  const statusId = req.params.id;
  const { D_statusName } = req.body;

  if (!D_statusName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  deliveryPaymentStatusModel.updateDeliveryPaymentStatus(statusId, { D_statusName }, (err, results) => {
    if (err) {
      console.error('Error updating Delivery Payment Status:', err);
      return res.status(500).json({ message: 'Error updating Delivery Payment Status' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Delivery Payment Status not found' });
    }

    res.status(200).json({ message: 'Delivery Payment Status updated successfully' });
  });
};

// Delete a Delivery Payment Status
const deleteDeliveryPaymentStatus = (req, res) => {
  const statusId = req.params.id;
  deliveryPaymentStatusModel.deleteDeliveryPaymentStatus(statusId, (err, results) => {
    if (err) {
      console.error('Error deleting Delivery Payment Status:', err);
      res.status(500).json({ message: 'Error deleting Delivery Payment Status', results });
    } else {
      res.status(200).json({ message: 'Delivery Payment Status deleted successfully', results });
    }
  });
};

module.exports = {
  getAllDeliveryPaymentStatuses,
  addDeliveryPaymentStatus,
  updateDeliveryPaymentStatus,
  deleteDeliveryPaymentStatus,
};
