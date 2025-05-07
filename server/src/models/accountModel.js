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
}

module.exports = Account;