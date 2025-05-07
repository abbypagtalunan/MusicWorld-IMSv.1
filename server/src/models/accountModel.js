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
    const dateCreated = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    pool.query(
      "INSERT INTO UserAccounts (accountID, firstName, lastName, roleID, password, dateCreated) VALUES (?, ?, ?, ?, ?, ?)",
      [accountID, firstName, lastName, roleID, password, dateCreated],
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

  static deleteAccount(id, callback) {
    pool.query("DELETE FROM UserAccounts WHERE accountID = ?", [id], (error, result) => {
      if (error) return callback(error);
      callback(null, result);
    });
  }
}

module.exports = Account;