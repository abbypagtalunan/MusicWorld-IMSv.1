const db = require('../../db');

// Get all orders
const getAllOrders = (callback) => {
  const query = `SELECT * FROM Orders ORDER BY O_orderID`;
  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Add a new order
const addOrder = (data, callback) => {
  const { O_receiptNumber } = data;
  const query = `INSERT INTO Orders (O_receiptNumber) VALUES (?)`;
  db.query(query, [O_receiptNumber], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results.insertId);
    }
  });
};

// Update an existing order
const updateOrder = (id, data, callback) => {
  const { O_receiptNumber } = data;
  const query = `UPDATE Orders SET O_receiptNumber = ? WHERE O_orderID = ?`;
  db.query(query, [O_receiptNumber, id], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Delete an order
const deleteOrder = (id, callback) => {
  const query = `DELETE FROM Orders WHERE O_orderID = ?`;
  db.query(query, [id], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

const checkReceiptNumber = (O_receiptNumber, callback) => {
  const query = `SELECT * FROM Orders WHERE O_receiptNumber = ?`;
  db.query(query, [O_receiptNumber], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

module.exports = {
  getAllOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  checkReceiptNumber,
};