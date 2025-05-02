const db = require('../../db');

// Get all orders
const getAllOrders = (callback) => {
  const query = `
    SELECT 
      O_orderID,
      O_receiptNumber,
      T_totalAmount,
      D_wholeOrderDiscount,
      D_totalProductDiscount,
      T_transactionID
    FROM Orders
    ORDER BY O_orderID`;

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

  // Check if the receipt number already exists
  checkReceiptNumber(O_receiptNumber, (err, existingOrder) => {
    if (err) {
      return callback(err, null);
    }

    if (existingOrder.length > 0) {
      return callback(new Error("Receipt number already exists."), null);
    }

    // Insert new order if receipt number doesn't exist
    const { T_totalAmount, D_wholeOrderDiscount, D_totalProductDiscount, T_transactionID } = data;
    const query = `
      INSERT INTO Orders 
      (O_receiptNumber, T_totalAmount, D_wholeOrderDiscount, D_totalProductDiscount, T_transactionID)
      VALUES (?, ?, ?, ?, ?)`;

    db.query(query, [O_receiptNumber, T_totalAmount, D_wholeOrderDiscount, D_totalProductDiscount, T_transactionID], (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results.insertId);  // Return the inserted order's ID
      }
    });
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

// Check if the receipt number already exists
const checkReceiptNumber = (O_receiptNumber, callback) => {
  const query = `SELECT * FROM Orders WHERE O_receiptNumber = ?`;
  db.query(query, [O_receiptNumber], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results); // Returns empty array if no match is found
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
