const pool = require("../../db");

class Account {
  static getAllAccounts(callback) {
    pool.query("SELECT * FROM UserAccounts", (error, results) => {
      if (error) return callback(error);
      callback(null, results);
    });
  }

  static getAccountById(id, callback) {
    pool.query("SELECT * FROM UserAccounts WHERE accountID = ?", [id], (error, results) => {
      if (results.length === 0) {
        return callback(new Error(`No user found with ID ${id}`));
      }
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

    // Validate required fields (firstName and lastName)
    if (!firstName || !lastName) {
      return callback(new Error("Missing required fields"));
    }

    // Dynamically construct the SQL query based on the fields provided
    let query = "UPDATE UserAccounts SET firstName = ?";
    let values = [firstName];

    // Add lastName to the query
    query += ", lastName = ?";
    values.push(lastName);

    // Add roleID to the query if it is provided
    if (roleID) {
      query += ", roleID = ?";
      values.push(roleID);
    }

    // Add the WHERE clause
    query += " WHERE accountID = ?";
    values.push(id);

    pool.query(query, values, (error, result) => {
      if (error) return callback(error);
      callback(null, result);
    });
  }

  static deleteAccount(id, adminPassword, callback) {
    // Query to find an admin with the provided password
    pool.query(
      "SELECT * FROM UserAccounts WHERE roleID = 1 AND password = ?",
      [adminPassword],
      (error, results) => {
        if (error) return callback(error);

        if (results.length === 0) {
          return callback(new Error("Invalid admin credentials"));
        }

        // Admin verified — proceed to delete the target account
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

  static getUserForLogin(accountID, callback) {
    pool.query("SELECT * FROM UserAccounts WHERE accountID = ?", [accountID], (error, results) => {
      if (error) return callback(error);
      callback(null, results[0]);
    });
  }
}

module.exports = Account;