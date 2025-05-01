// server/src/controllers/returnTypeController.js

const { addReturnType } = require('../models/returnTypeModel');

// Get or create a return type by description
const getOrCreateReturnTypeId = (description, callback) => {
  const query = `
    INSERT INTO ReturnTypes (RT_returnTypeDescription)
    SELECT ? AS RT_returnTypeDescription
    FROM DUAL
    WHERE NOT EXISTS (
      SELECT 1
      FROM ReturnTypes
      WHERE RT_returnTypeDescription = ?
    )
    ON DUPLICATE KEY UPDATE RT_returnTypeDescription = VALUES(RT_returnTypeDescription);
  `;

  const db = require('../../db');
  db.query(query, [description, description], (err, results) => {
    if (err) return callback(err);

    // Now select the ID
    db.query('SELECT RT_returnTypeID FROM ReturnTypes WHERE RT_returnTypeDescription = ?', [description], (err, rows) => {
      if (err) return callback(err);
      if (rows.length === 0) return callback(new Error("Could not find return type ID"));
      callback(null, rows[0].RT_returnTypeID);
    });
  });
};

module.exports = {
  getOrCreateReturnTypeId,
  
};