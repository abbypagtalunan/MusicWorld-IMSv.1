// server/src/models/returnTypeModel.js

const db = require('../../db');

// Get all Return Types
const getAllReturnTypes = (callback) => {
  const query = `
    SELECT 
      RT_returnTypeID,
      RT_returnTypeDescription
    FROM ReturnTypes;
  `;
  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Add a new Return Type
const addReturnType = (returnTypeData, callback) => {
  const { RT_returnTypeDescription } = returnTypeData;

  const insertQuery = `
    INSERT INTO ReturnTypes (RT_returnTypeDescription) VALUES (?)
  `;
  db.query(insertQuery, [RT_returnTypeDescription], (err, results) => {
    if (err) return callback(err);
    callback(null, results.insertId);
  });
};

// Update an existing Return Type
const updateReturnType = (returnTypeID, returnTypeData, callback) => {
  const { RT_returnTypeDescription } = returnTypeData;

  const updateQuery = `
    UPDATE ReturnTypes
    SET RT_returnTypeDescription = ?
    WHERE RT_returnTypeID = ?;
  `;
  db.query(updateQuery, [RT_returnTypeDescription, returnTypeID], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Delete a Return Type
const deleteReturnType = (returnTypeID, callback) => {
  const deleteQuery = `DELETE FROM ReturnTypes WHERE RT_returnTypeID = ?`;
  db.query(deleteQuery, [returnTypeID], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

module.exports = {
  getAllReturnTypes,
  addReturnType,
  updateReturnType,
  deleteReturnType,
};