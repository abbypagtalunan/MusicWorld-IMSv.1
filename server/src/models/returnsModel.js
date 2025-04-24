const db = require('../../db');

// Get all Returns
const getAllReturns = (callback) => {
  const query = `
    SELECT 
      R_returnID,
      P_productCode,
      R_returnTypeID,
      R_reasonOfReturn,
      R_dateOfReturn,
      R_returnQuantity,
      R_discountAmount
    FROM Returns;
  `;

  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Add a new Return
const addReturn = (returnData, callback) => {
  const { P_productCode, R_returnTypeID, R_reasonOfReturn, R_dateOfReturn, R_returnQuantity, R_discountAmount } = returnData;

  const insertReturnQuery = `
    INSERT INTO Returns (P_productCode, R_returnTypeID, R_reasonOfReturn, R_dateOfReturn, R_returnQuantity, R_discountAmount) VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(
    insertReturnQuery,
    [ P_productCode, R_returnTypeID, R_reasonOfReturn, R_dateOfReturn, R_returnQuantity, R_discountAmount ],
    (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    }
  );
};

// Update an existing Return
const updateReturn = (returnID, returnData, callback) => {
  const { P_productCode, R_returnTypeID, R_reasonOfReturn, R_dateOfReturn, R_returnQuantity, R_discountAmount } = returnData;
  const updateReturnQuery = `
    UPDATE Returns
    SET P_productCode = ?, R_returnTypeID = ?, R_reasonOfReturn = ?, R_dateOfReturn = ?, R_returnQuantity = ?, R_discountAmount = ?
    WHERE R_returnID = ?;
  `;
  db.query(updateReturnQuery, [P_productCode, R_returnTypeID, R_reasonOfReturn, R_dateOfReturn, R_returnQuantity, R_discountAmount, returnID], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Delete a Return
const deleteReturn = (returnID, callback) => {
  const deleteReturnQuery = `DELETE FROM Returns WHERE R_returnID = ?`;

  db.query(deleteReturnQuery, [returnID], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

module.exports = {
  getAllReturns,
  addReturn,
  updateReturn,
  deleteReturn,
};
