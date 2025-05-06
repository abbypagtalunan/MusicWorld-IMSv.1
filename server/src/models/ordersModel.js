const db = require('../../db');

// Get all orders
const getAllOrders = (callback) => {
  const query = `
    SELECT 
      o.O_orderID,
      o.O_receiptNumber,
      o.T_totalAmount,
      o.D_wholeOrderDiscount,
      SUM(od.OD_discountAmount) AS D_totalProductDiscount FROM ORDER DETAILS,
      o.T_transactionDate,
      o.isTemporarilyDeleted,
      o.O_orderPayment
    FROM Orders o
    LEFT JOIN OrderDetails od ON o.O_orderID = od.O_orderID
    GROUP BY 
      o.O_orderID,
      o.O_receiptNumber,
      o.T_totalAmount,
      o.D_wholeOrderDiscount,
      o.T_transactionDate,
      o.isTemporarilyDeleted
    ORDER BY o.O_orderID;
`;

  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};


const addOrder = (data, callback) => {
  const {
    O_receiptNumber,
    T_totalAmount,
    D_wholeOrderDiscount,
    D_totalProductDiscount,
    T_transactionDate,
    isTemporarilyDeleted,
    O_orderPayment
  } = data;

  // Step 1: Check if the receipt number already exists
  checkReceiptNumber(O_receiptNumber, (err, existingOrder) => {
    if (err) return callback(err, null);

    if (existingOrder.length > 0) {
      return callback(new Error("Receipt number already exists."), null);
    }

    // Step 2: Insert new order
    const insertOrderQuery = `
      INSERT INTO Orders 
      (O_receiptNumber, T_totalAmount, D_wholeOrderDiscount, D_totalProductDiscount, T_transactionDate, isTemporarilyDeleted, O_orderPayment)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      insertOrderQuery,
      [
        O_receiptNumber,
        T_totalAmount,
        D_wholeOrderDiscount,
        D_totalProductDiscount,
        T_transactionDate,
        isTemporarilyDeleted,
        O_orderPayment
      ],
      (err, results) => {
        if (err) return callback(err, null);

        const orderId = results.insertId;
        return callback(null, { message: "Order added successfully", orderId });
      }
    );
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
