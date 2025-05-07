// controllers/accountController.js

const Account = require('../models/accountModel');

// Get all accounts
exports.getAllAccounts = (req, res) => {
  Account.getAllAccounts((err, accounts) => {
    if (err) {
      console.error("Error fetching accounts:", err);
      return res.status(500).json({ message: "Error fetching accounts" });
    }
    res.json(accounts);
  });
};

// Get one account by ID
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

// Create a new account
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

// Update an account
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

// Delete an account
exports.deleteAccount = (req, res) => {
  const { id } = req.params;
  const { adminPW } = req.body;

  if (!id || !adminPW) {
    return res.status(400).json({ message: "Admin password and staff ID are required." });
  }

  Account.deleteAccount(id, adminPW, (err, result) => {
    if (err) {
      console.error("Error deleting account:", err.message);
      return res.status(403).json({ message: "Deletion failed", error: err.message });
    }
    res.json({ message: "Account deleted successfully" });
  });
};

// Reset password
exports.resetPassword = (req, res) => {
  const { id } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({ message: "New password and confirmation are required" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  Account.resetPassword(id, newPassword, (err, result) => {
    if (err) {
      console.error("Error resetting password:", err);
      return res.status(500).json({ message: "Failed to reset password" });
    }
    res.json({ message: "Password reset successfully" });
  });
};

// NEW: Login user
exports.loginUser = (req, res) => {
  const { accountID, password } = req.body;

  if (!accountID || !password) {
    return res.status(400).json({ message: "Account ID and password are required" });
  }

  Account.getUserForLogin(accountID, (err, user) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare plain text password
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Return basic user info
    res.json({
      message: "Login successful",
      user: {
        accountID: user.accountID,
        firstName: user.firstName,
        lastName: user.lastName,
        roleID: user.roleID,
      },
    });
  });
};