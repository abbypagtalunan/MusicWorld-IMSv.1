// src/models/accountModel.js
const mysql = require('mysql2/promise');
const db = require('../../db'); // assuming you have a db.js with connection pool

module.exports = {
  // Get current user by ID
  getCurrentUser: async (accountId) => {
    const [rows] = await db.query(
      `SELECT ua.accountID, ua.firstName, ua.lastName, ur.roleName AS role, ua.email, ua.dateCreated
       FROM UserAccounts ua
       JOIN UserRoles ur ON ua.roleID = ur.roleID
       WHERE ua.accountID = ?`,
      [accountId]
    );
    return rows[0];
  },

  // Update account info
  updateAccount: async (accountId, { firstName, lastName, role }) => {
    const [roleRow] = await db.query(`SELECT roleID FROM UserRoles WHERE roleName = ?`, [role]);
    if (roleRow.length === 0) throw new Error("Invalid role");

    const roleId = roleRow[0].roleID;

    await db.query(
      `UPDATE UserAccounts SET firstName = ?, lastName = ?, roleID = ? WHERE accountID = ?`,
      [firstName, lastName, roleId, accountId]
    );
  },

  // Change password
  changePassword: async (accountId, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(`UPDATE UserAccounts SET password = ? WHERE accountID = ?`, [hashedPassword, accountId]);
  },

  // Validate old password
  validatePassword: async (accountId, oldPassword) => {
    const [rows] = await db.query(`SELECT password FROM UserAccounts WHERE accountID = ?`, [accountId]);
    const hash = rows[0]?.password;
    if (!hash) throw new Error("User not found");

    const isValid = await bcrypt.compare(oldPassword, hash);
    if (!isValid) throw new Error("Old password is incorrect");
  },

  // Get all staff members
  getAllStaff: async () => {
    const [rows] = await db.query(
      `SELECT ua.accountID, ua.firstName, ua.lastName, ur.roleName AS role, ua.email, ua.dateCreated
       FROM UserAccounts ua
       JOIN UserRoles ur ON ua.roleID = ur.roleID
       WHERE ur.roleName = 'Staff'`
    );
    return rows;
  },

  // Add new staff
  addStaff: async ({ firstName, lastName, email, role, password }) => {
    const [roleRow] = await db.query(`SELECT roleID FROM UserRoles WHERE roleName = ?`, [role]);
    if (roleRow.length === 0) throw new Error("Invalid role");

    const roleId = roleRow[0].roleID;
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO UserAccounts (firstName, lastName, email, roleID, password, dateCreated)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [firstName, lastName, email, roleId, hashedPassword]
    );
  },

  // Edit staff
  editStaff: async (accountId, { firstName, lastName, role }) => {
    const [roleRow] = await db.query(`SELECT roleID FROM UserRoles WHERE roleName = ?`, [role]);
    if (roleRow.length === 0) throw new Error("Invalid role");

    const roleId = roleRow[0].roleID;

    await db.query(
      `UPDATE UserAccounts SET firstName = ?, lastName = ?, roleID = ? WHERE accountID = ?`,
      [firstName, lastName, roleId, accountId]
    );
  },

  // Delete staff
  deleteStaff: async (accountId) => {
    await db.query(`DELETE FROM UserAccounts WHERE accountID = ?`, [accountId]);
  },

  // Reset staff password
  resetPassword: async (accountId) => {
    const defaultPassword = "1234";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    await db.query(`UPDATE UserAccounts SET password = ? WHERE accountID = ?`, [hashedPassword, accountId]);
  },

  // Bulk delete staff
  bulkDeleteStaff: async (accountIds) => {
    const placeholders = accountIds.map(() => '?').join(',');
    await db.query(`DELETE FROM UserAccounts WHERE accountID IN (${placeholders})`, accountIds);
  }
};