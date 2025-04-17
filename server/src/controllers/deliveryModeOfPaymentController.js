const deliveryModeOfPaymentModel = require('../models/deliveryModeOfPaymentModel');

// Get all Delivery Modes of Payment
const getAllDeliveryModeOfPayments = (req, res) => {
  deliveryModeOfPaymentModel.getAllDeliveryModeOfPayments((err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

// Add a new Delivery Mode of Payment
const addDeliveryModeOfPayment = (req, res) => {
  const { D_mopName } = req.body;
  if (!D_mopName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  deliveryModeOfPaymentModel.addDeliveryModeOfPayment({ D_mopName }, (err, deliveryModeOfPaymentId) => {
    if (err) {
      console.error('Error inserting Delivery Mode of Payment:', err);
      res.status(500).json({ message: 'Error inserting Delivery Mode of Payment' });
    } else {
      res.status(201).json({ message: 'Delivery Mode of Payment added successfully', id: deliveryModeOfPaymentId });
    }
  });
};

// Update an existing Delivery Mode of Payment
const updateDeliveryModeOfPayment = (req, res) => {
  const deliveryModeOfPaymentId = req.params.id;
  const { D_mopName } = req.body;

  if (!D_mopName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  deliveryModeOfPaymentModel.updateDeliveryModeOfPayment(deliveryModeOfPaymentId, { D_mopName }, (err, results) => {
    if (err) {
      console.error('Error updating Delivery Mode of Payment:', err);
      return res.status(500).json({ message: 'Error updating Delivery Mode of Payment' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Delivery Mode of Payment not found' });
    }

    res.status(200).json({ message: 'Delivery Mode of Payment updated successfully' });
  });
};

// Delete a Delivery Mode of Payment
const deleteDeliveryModeOfPayment = (req, res) => {
  const deliveryModeOfPaymentId = req.params.id;
  deliveryModeOfPaymentModel.deleteDeliveryModeOfPayment(deliveryModeOfPaymentId, (err, results) => {
    if (err) {
      console.error('Error deleting Delivery Mode of Payment:', err);
      res.status(500).json({ message: 'Error deleting Delivery Mode of Payment', results });
    } else {
      res.status(200).json({ message: 'Delivery Mode of Payment deleted successfully', results });
    }
  });
};

module.exports = {
  getAllDeliveryModeOfPayments,
  addDeliveryModeOfPayment,
  updateDeliveryModeOfPayment,
  deleteDeliveryModeOfPayment,
};
