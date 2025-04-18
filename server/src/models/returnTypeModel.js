const db = require('../../db');

// Get all return types
const getAllReturnTypes = (callback) => {
  const query = `SELECT RT_returnTypeID, RT_returnTypeDescription FROM ReturnTypes ORDER BY RT_returnTypeID`;
  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Add a new return type
const addReturnType = (data, callback) => {
  const { RT_returnTypeDescription } = data;
  const query = `INSERT INTO ReturnTypes (RT_returnTypeDescription) VALUES (?)`;
  db.query(query, [RT_returnTypeDescription], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results.insertId);
    }
  });
};

// Update an existing return type
const updateReturnType = (id, data, callback) => {
  const { RT_returnTypeDescription } = data;
  const query = `UPDATE ReturnTypes SET RT_returnTypeDescription = ? WHERE RT_returnTypeID = ?`;
  db.query(query, [RT_returnTypeDescription, id], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Delete a return type
const deleteReturnType = (id, callback) => {
  const query = `DELETE FROM ReturnTypes WHERE RT_returnTypeID = ?`;
  db.query(query, [id], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

module.exports = {
  getAllReturnTypes,
  addReturnType,
  updateReturnType,
  deleteReturnType,
};
