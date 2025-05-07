// models/accountModel.js

const pool = require('../../db');

class Account {
  static getAllAccounts(callback) {
    pool.query("SELECT * FROM UserAccounts", (error, results) => {
      if (error) return callback(error);
      callback(null, results);
    });
  }

  static getAccountById(id, callback) {
    pool.query("SELECT * FROM UserAccounts WHERE accountID = ?", [id], (error, results) => {
      if (error) return callback(error);
      callback(null, results[0]);
    });
  }

  static createAccount(data, callback) {
    const { accountID, firstName, lastName, roleID, password } = data;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`;
    const dateCreated = new Date().toISOString().split('T')[0];

    pool.query(
      "INSERT INTO UserAccounts (accountID, firstName, lastName, roleID, email, password, dateCreated) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [accountID, firstName, lastName, roleID, email, password, dateCreated],
      (error, result) => {
        if (error) return callback(error);
        callback(null, result);
      }
    );
  }

  static updateAccount(id, data, callback) {
    const { firstName, lastName, roleID } = data;

    pool.query(
      "UPDATE UserAccounts SET firstName = ?, lastName = ?, roleID = ? WHERE accountID = ?",
      [firstName, lastName, roleID, id],
      (error, result) => {
        if (error) return callback(error);
        callback(null, result);
      }
    );
  }

  static deleteAccount(id, adminPassword, callback) {
    // Step 1: Verify admin password
    pool.query(
      "SELECT * FROM UserAccounts WHERE accountID = ? AND password = ?",
      [id, adminPassword],
      (error, results) => {
        if (error) return callback(error);

        if (!results.length) {
          return callback(new Error("Invalid admin credentials"));
        }

        // Step 2: Delete the target staff account
        pool.query("DELETE FROM UserAccounts WHERE accountID = ?", [id], (error, result) => {
          if (error) return callback(error);
          callback(null, result);
        });
      }
    );
  }

  static resetPassword(accountID, newPassword, callback) {
    pool.query(
      "UPDATE UserAccounts SET password = ? WHERE accountID = ?",
      [newPassword, accountID],
      (error, result) => {
        if (error) return callback(error);
        callback(null, result);
      }
    );
  }

  // NEW: Fetch user by ID for login
  static getUserForLogin(accountID, callback) {
    pool.query("SELECT * FROM UserAccounts WHERE accountID = ?", [accountID], (error, results) => {
      if (error) return callback(error);
      callback(null, results[0]);
    });
  }
}

module.exports = Account;