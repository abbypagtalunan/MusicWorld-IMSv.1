const reportModel = require("../models/reportModel");

exports.getReports = async (req, res) => {
  try {
    const { search, from, to } = req.query;
    const reports = await reportModel.fetchReports({ search, from, to });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reports", error: err.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  const { transactionID } = req.params;
  try {
    await reportModel.deleteTransaction(transactionID);
    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete transaction", error: err.message });
  }
};
