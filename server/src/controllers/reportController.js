// reportController.js
const reportModel = require('./reportModel');

exports.getReports = async (req, res) => {
  const { search, from, to } = req.query;
  try {
    const reports = await reportModel.fetchReports({ search, from, to });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSingleTransaction = async (req, res) => {
  const { transactionID } = req.params;
  const { adminPW } = req.body;
  try {
    const success = await reportModel.deleteTransaction(transactionID, adminPW);
    if (success) {
      res.json({ message: 'Transaction deleted successfully' });
    } else {
      res.status(404).json({ error: 'Transaction not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMultipleTransactions = async (req, res) => {
  const { transactionIDs } = req.body;
  const { adminPW } = req.body;
  try {
    const success = await reportModel.deleteMultipleTransactions(transactionIDs, adminPW);
    if (success) {
      res.json({ message: 'Transactions deleted successfully' });
    } else {
      res.status(404).json({ error: 'No transactions deleted' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};