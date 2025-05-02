const db = require('../../db');

// Get all transactions
const getAllTransactions = (callback) => {
  const query = 
    `SELECT 
        T_transactionID, 
        O_orderID, 
        T_totalAmount, 
        D_wholeOrderDiscount, 
        D_totalProductDiscount, 
        T_transactionDate, 
        TT_transactionTypeID
        FROM Transactions`;
  
  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Add a new transaction
const addTransaction = (data, callback) => {
  const {
    O_orderID,
    T_totalAmount,
    D_wholeOrderDiscount,
    D_totalProductDiscount,
    T_transactionDate,
    TT_transactionTypeID,
  } = data;

  const query = `
    INSERT INTO Transactions 
    (O_orderID, T_totalAmount, D_wholeOrderDiscount, D_totalProductDiscount, T_transactionDate, TT_transactionTypeID) 
    VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(
    query,
    [
      O_orderID,
      T_totalAmount,
      D_wholeOrderDiscount,
      D_totalProductDiscount,
      T_transactionDate,
      TT_transactionTypeID,
    ],
    (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results.insertId);
      }
    }
  );
};

// Update an existing transaction
const updateTransaction = (id, data, callback) => {
  const {
    O_orderID,
    T_totalAmount,
    D_wholeOrderDiscount,
    D_totalProductDiscount,
    T_transactionDate,
    TT_transactionTypeID,
  } = data;

  const query = `
    UPDATE Transactions 
    SET 
      O_orderID = ?, 
      T_totalAmount = ?, 
      D_wholeOrderDiscount = ?, 
      D_totalProductDiscount = ?, 
      T_transactionDate = ?, 
      TT_transactionTypeID = ?
    WHERE T_transactionID = ?`;

  db.query(
    query,
    [
      O_orderID,
      T_totalAmount,
      D_wholeOrderDiscount,
      D_totalProductDiscount,
      T_transactionDate,
      TT_transactionTypeID,
      id,
    ],
    (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    }
  );
};

// Delete a transaction
const deleteTransaction = (id, callback) => {
  const query = 'DELETE FROM Transactions WHERE T_transactionID = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

module.exports = {
  getAllTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
};
