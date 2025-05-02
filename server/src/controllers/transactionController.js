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
  const {
    O_orderID,
    T_totalAmount,
    D_wholeOrderDiscount,
    D_totalProductDiscount,
    T_transactionDate,
    TT_transactionTypeID,
  } = req.body;

  if (
    !O_orderID ||
    T_totalAmount == null ||
    D_wholeOrderDiscount == null ||
    D_totalProductDiscount == null ||
    !T_transactionDate ||
    !TT_transactionTypeID
  ) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  transactionModel.addTransaction(
    {
      O_orderID,
      T_totalAmount,
      D_wholeOrderDiscount,
      D_totalProductDiscount,
      T_transactionDate,
      TT_transactionTypeID,
    },
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
  const {
    O_orderID,
    T_totalAmount,
    D_wholeOrderDiscount,
    D_totalProductDiscount,
    T_transactionDate,
    TT_transactionTypeID,
  } = req.body;

  if (
    !O_orderID ||
    T_totalAmount == null ||
    D_wholeOrderDiscount == null ||
    D_totalProductDiscount == null ||
    !T_transactionDate ||
    !TT_transactionTypeID
  ) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  transactionModel.updateTransaction(
    transactionId,
    {
      O_orderID,
      T_totalAmount,
      D_wholeOrderDiscount,
      D_totalProductDiscount,
      T_transactionDate,
      TT_transactionTypeID,
    },
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
      res.status(500).json({ message: 'Error deleting transaction', results });
    } else {
      res.status(200).json({ message: 'Transaction deleted successfully', results });
    }
  });
};

module.exports = {
  getAllTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
};
