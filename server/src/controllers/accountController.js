// controllers/accountController.js
const Account = require('../models/accountModel');

exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.getAllAccounts();
    res.json(accounts);
  } catch (err) {
    console.error("Error fetching accounts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAccountById = async (req, res) => {
  try {
    const account = await Account.getAccountById(req.params.id);
    if (!account) return res.status(404).json({ message: "Account not found" });
    res.json(account);
  } catch (err) {
    console.error("Error fetching account:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const id = await Account.createAccount(req.body);
    res.status(201).json({ message: "Account created", accountId: id });
  } catch (err) {
    console.error("Error creating account:", err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const updated = await Account.updateAccount(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Account not found" });
    res.json({ message: "Account updated" });
  } catch (err) {
    console.error("Error updating account:", err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const deleted = await Account.deleteAccount(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Account not found" });
    res.json({ message: "Account deleted" });
  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};