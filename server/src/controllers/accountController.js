// controllers/accountController.js
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

exports.createAccount = (req, res) => {
  const { accountID, firstName, lastName, roleID, password } = req.body;

  if (!accountID || !firstName || !lastName || !roleID || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  Account.createAccount({ accountID, firstName, lastName, roleID, password }, (err, result) => {
    if (err) {
      console.error("Error creating account:", err);
      return res.status(500).json({ message: "Error creating account" });
    }
    res.status(201).json({ message: "Account created successfully" });
  });
};

exports.updateAccount = (req, res) => {
  const { firstName, lastName, roleID } = req.body;

  if (!firstName || !lastName || !roleID) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  Account.updateAccount(req.params.id, { firstName, lastName, roleID }, (err, result) => {
    if (err) {
      console.error("Error updating account:", err);
      return res.status(500).json({ message: "Error updating account" });
    }
    res.json({ message: "Account updated successfully" });
  });
};

exports.deleteAccount = (req, res) => {
  Account.deleteAccount(req.params.id, (err, result) => {
    if (err) {
      console.error("Error deleting account:", err);
      return res.status(500).json({ message: "Error deleting account" });
    }
    res.json({ message: "Account deleted successfully" });
  });
};