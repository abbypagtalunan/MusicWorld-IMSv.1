const Account = require('../models/accountModel');

exports.getAllAccounts = (req, res) => {
  Account.getAllAccounts((err, accounts) => {
    if (err) {
      console.error("Error fetching accounts:", err);
      return res.status(500).json({ message: "Error fetching accounts" });
    }
    res.json(accounts);
  });
};

exports.getAccountById = (req, res) => {
  Account.getAccountById(req.params.id, (err, account) => {
    if (err) {
      console.error("Error fetching account:", err);
      return res.status(500).json({ message: "Error fetching account" });
    }
    if (!account) return res.status(404).json({ message: "Account not found" });
    res.json(account);
  });
};