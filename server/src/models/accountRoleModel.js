const pool = require('../../db');

class AccountRole {
  static getAllRoles(callback) {
    pool.query("SELECT * FROM UserRoles", (error, results) => {
      if (error) return callback(error);
      callback(null, results);
    });
  }

  static getRoleById(roleID, callback) {
    pool.query("SELECT * FROM UserRoles WHERE roleID = ?", [roleID], (error, results) => {
      if (error) return callback(error);
      callback(null, results[0]);
    });
  }
}

module.exports = AccountRole;