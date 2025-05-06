// src/controllers/accountController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Account = require('../models/accountModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [userRows] = await db.query(
      `SELECT ua.accountID, ua.firstName, ua.lastName, ua.email, ua.password, ur.roleName
       FROM UserAccounts ua
       JOIN UserRoles ur ON ua.roleID = ur.roleID
       WHERE ua.email = ?`,
      [email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userRows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { accountID: user.accountID, email: user.email, role: user.roleName },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        accountID: user.accountID,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.roleName,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await Account.getCurrentUser(req.user.accountID);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.editAccount = async (req, res) => {
  try {
    const { firstName, lastName, role } = req.body;
    await Account.updateAccount(req.user.accountID, { firstName, lastName, role });
    res.json({ message: 'Account updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    await Account.validatePassword(req.user.accountID, oldPassword);
    await Account.changePassword(req.user.accountID, newPassword);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllStaff = async (req, res) => {
  try {
    const staffList = await Account.getAllStaff();
    res.json(staffList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addStaff = async (req, res) => {
  try {
    const { firstName, lastName, email, role, password } = req.body;
    await Account.addStaff({ firstName, lastName, email, role, password });
    res.status(201).json({ message: 'Staff added successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.editStaff = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { firstName, lastName, role } = req.body;
    await Account.editStaff(accountId, { firstName, lastName, role });
    res.json({ message: 'Staff updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const { accountId } = req.params;
    await Account.deleteStaff(accountId);
    res.json({ message: 'Staff deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { accountId } = req.params;
    await Account.resetPassword(accountId);
    res.json({ message: 'Password reset to default' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bulkDeleteStaff = async (req, res) => {
  try {
    const { codes } = req.body;
    await Account.bulkDeleteStaff(codes);
    res.json({ message: 'Selected staff deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};