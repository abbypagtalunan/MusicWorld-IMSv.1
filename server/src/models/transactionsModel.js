const db = require('../../db');

// Get all transactions
const getAllTransactions = (callback) => {
  const query = `
    SELECT 
      T_transactionID, 
      T_transactionDate, 
      T_transactionType
    FROM Transactions
    ORDER BY T_transactionID`;

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
  const { T_transactionDate, T_transactionType } = data;

  const query = `
    INSERT INTO Transactions 
    (T_transactionDate, T_transactionType) 
    VALUES (?, ?)`;

  db.query(
    query,
    [T_transactionDate, T_transactionType],
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
  const { T_transactionDate, T_transactionType } = data;

  const query = `
    UPDATE Transactions 
    SET 
      T_transactionDate = ?, 
      T_transactionType = ?
    WHERE T_transactionID = ?`;

  db.query(
    query,
    [T_transactionDate, T_transactionType, id],
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
