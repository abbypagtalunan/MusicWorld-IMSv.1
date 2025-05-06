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

// Add a new order
const addOrder = (req, res) => {
  const { O_receiptNumber, T_totalAmount, D_wholeOrderDiscount, D_totalProductDiscount, T_transactionDate, isTemporarilyDeleted, O_orderPayment } = req.body;

  // Validate receipt number
  if (!O_receiptNumber || isNaN(O_receiptNumber)) {
    return res.status(400).json({ message: 'Invalid or missing receipt number' });
  }

  // Validate total amount
  if (typeof T_totalAmount !== 'number' || T_totalAmount < 0) {
    return res.status(400).json({ message: 'Invalid total amount' });
  }

  // Check for duplicate receipt number
  db.query('SELECT COUNT(*) AS count FROM Orders WHERE O_receiptNumber = ?', [O_receiptNumber], (checkErr, results) => {
    if (checkErr) {
      console.error('Error checking receipt number:', checkErr);
      return res.status(500).json({ message: 'Error checking receipt number' });
    }

    if (results[0].count > 0) {
      return res.status(409).json({ message: 'Receipt number already exists' });
    }

    // No duplicates, insert the order
    ordersModel.addOrder({ O_receiptNumber, T_totalAmount, D_wholeOrderDiscount, D_totalProductDiscount, T_transactionDate, isTemporarilyDeleted, O_orderPayment }, (err, orderId) => {
      if (err) {
        console.error('Error inserting order:', err);
        return res.status(500).json({ message: 'Error inserting order' });
      }
      return res.status(201).json({id: orderId});
    });
  });
};

// Update an existing order
const updateOrder = (req, res) => {
  const orderId = req.params.id;
  const { O_receiptNumber, T_totalAmount, D_wholeOrderDiscount, D_totalProductDiscount, T_transactionDate, isTemporarilyDeleted, O_orderPayment } = req.body;

  // Validate receipt number
  if (!O_receiptNumber || isNaN(O_receiptNumber)) {
    return res.status(400).json({ message: 'Invalid or missing receipt number' });
  }

  // Validate total amount
  if (typeof T_totalAmount !== 'number' || T_totalAmount < 0) {
    return res.status(400).json({ message: 'Invalid total amount' });
  }

  // Update the order in the model
  ordersModel.updateOrder(orderId, { O_receiptNumber, T_totalAmount, D_wholeOrderDiscount, D_totalProductDiscount, T_transactionDate, isTemporarilyDeleted, O_orderPayment}, (err, results) => {
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

  // Delete the order in the model
  ordersModel.deleteOrder(orderId, (err, results) => {
    if (err) {
      console.error('Error deleting order:', err);
      return res.status(500).json({ message: 'Error deleting order' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
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
