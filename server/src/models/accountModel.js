// models/accountModel.js
const pool = require('../db');

class Account {
  static async getAllAccounts() {
    const [rows] = await pool.query("SELECT * FROM UserAccounts");
    return rows;
  }

  static async getAccountById(id) {
    const [rows] = await pool.query("SELECT * FROM UserAccounts WHERE accountID = ?", [id]);
    return rows[0];
  }

  static async createAccount(data) {
    const { firstName, lastName, roleID, email, password } = data;

    if (!firstName || !lastName || !roleID || !email || !password) {
      throw new Error("Missing required fields");
    }

    const dateCreated = new Date();

    const [result] = await pool.query(
      "INSERT INTO UserAccounts (firstName, lastName, roleID, email, password, dateCreated) VALUES (?, ?, ?, ?, ?, ?)",
      [firstName, lastName, roleID, email, password, dateCreated]
    );

    return result.insertId;
  }

  static async updateAccount(id, data) {
    const { firstName, lastName, roleID, email, password } = data;

    if (!firstName && !lastName && !roleID && !email && !password) {
      throw new Error("No fields provided for update");
    }

    const updates = [];
    const values = [];

    if (firstName) {
      updates.push("firstName = ?");
      values.push(firstName);
    }
    if (lastName) {
      updates.push("lastName = ?");
      values.push(lastName);
    }
    if (roleID !== undefined) {
      updates.push("roleID = ?");
      values.push(roleID);
    }
    if (email) {
      updates.push("email = ?");
      values.push(email);
    }
    if (password) {
      updates.push("password = ?");
      values.push(password);
    }

    values.push(id);

    const query = `UPDATE UserAccounts SET ${updates.join(", ")} WHERE accountID = ?`;

    const [result] = await pool.query(query, values);
    return result.affectedRows > 0;
  }

  static async deleteAccount(id) {
    const [result] = await pool.query("DELETE FROM UserAccounts WHERE accountID = ?", [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Account;