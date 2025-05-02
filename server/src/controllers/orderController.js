const ordersModel = require('../models/ordersModel.js');
const db = require('../../db');

// GET all orders
const getAllOrders = (req, res) => {
  ordersModel.getAllOrders((err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ message: 'Error fetching orders' });
    }
    res.status(200).json(results);
  });
};

const addOrder = (req, res) => {
  const { O_receiptNumber } = req.body;

  // Validate receipt number
  if (!O_receiptNumber || isNaN(O_receiptNumber)) {
    return res.status(400).json({ message: 'Invalid or missing receipt number' });
  }

  // Check for duplicate receipt number
  db.query('SELECT COUNT(*) AS count FROM Orders WHERE O_receiptNumber = ?', [O_receiptNumber], (checkErr, results) => {
    if (checkErr) {
      return res.status(409).json({ message: 'Receipt number already exists' });
    }

    // If duplicate exists
    if (results[0].count > 0) {
      return res.status(409).json({ message: 'Receipt number already exists' });
    }

    // No duplicates, insert the order
    ordersModel.addOrder({ O_receiptNumber }, (err, orderId) => {
      if (err) {
        return res.status(500).json({ message: 'Error inserting order' });
      }
      return res.status(201).json({ message: 'Order added successfully', id: orderId });
    });
  });
};


// PUT update order
const updateOrder = (req, res) => {
  const orderId = req.params.id;
  const { O_receiptNumber } = req.body;

  if (!O_receiptNumber || isNaN(O_receiptNumber)) {
    return res.status(400).json({ message: 'Invalid or missing receipt number' });
  }

  ordersModel.updateOrder(orderId, { O_receiptNumber }, (err, results) => {
    if (err) {
      console.error('Error updating order:', err);
      return res.status(500).json({ message: 'Error updating order' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order updated successfully' });
  });
};

// DELETE order
const deleteOrder = (req, res) => {
  const orderId = req.params.id;

  ordersModel.deleteOrder(orderId, (err, results) => {
    if (err) {
      console.error('Error deleting order:', err);
      return res.status(500).json({ message: 'Error deleting order' });
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  });
};

module.exports = {
  getAllOrders,
  addOrder,
  updateOrder,
  deleteOrder,
};
