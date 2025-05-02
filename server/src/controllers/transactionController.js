const transactionModel = require('../models/transactionsModel.js');

// Route to fetch all transactions
const getAllTransactions = (req, res) => {
  transactionModel.getAllTransactions((err, results) => {
    if (err) {
      console.error('Error fetching transactions from database:', err);
      res.status(500).json({ error: 'Error fetching transactions' });
    } else {
      res.json(results);
    }
  });
};

// Route to add a new transaction
const addTransaction = (req, res) => {
  const { T_transactionDate, T_transactionType } = req.body;

  // Validate required fields
  if (!T_transactionDate || !T_transactionType) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Add the transaction
  transactionModel.addTransaction(
    { T_transactionDate, T_transactionType },
    (err, insertId) => {
      if (err) {
        console.error('Error inserting transaction:', err);
        return res.status(500).json({ message: 'Error inserting transaction' });
      }
      res.status(201).json({ message: 'Transaction added successfully', id: insertId });
    }
  );
};

// Route to update a transaction
const updateTransaction = (req, res) => {
  const transactionId = req.params.id;
  const { T_transactionDate, T_transactionType } = req.body;

  // Validate required fields
  if (!T_transactionDate || !T_transactionType) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Update the transaction
  transactionModel.updateTransaction(
    transactionId,
    { T_transactionDate, T_transactionType },
    (err, results) => {
      if (err) {
        console.error('Error updating transaction:', err);
        return res.status(500).json({ message: 'Error updating transaction' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      res.status(200).json({ message: 'Transaction updated successfully' });
    }
  );
};

// Route to delete a transaction
const deleteTransaction = (req, res) => {
  const transactionId = req.params.id;
  transactionModel.deleteTransaction(transactionId, (err, results) => {
    if (err) {
      console.error('Error deleting transaction:', err);
      return res.status(500).json({ message: 'Error deleting transaction', results });
    }
    res.status(200).json({ message: 'Transaction deleted successfully', results });
  });
};

module.exports = {
  getAllTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
};
