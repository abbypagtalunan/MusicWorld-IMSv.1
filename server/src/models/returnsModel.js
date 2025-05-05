// models/returnsModel.js

const db = require('../../db');

// Get all active returns (not temporarily deleted)
const getAllActiveReturns = (callback) => {
  const query = `
    SELECT 
      R_returnID,
      P_productCode,
      R_returnTypeID,
      R_reasonOfReturn,
      R_dateOfReturn,
      R_returnQuantity,
      R_discountAmount,
      R_TotalPrice,
      D_deliveryNumber,
      S_supplierID
    FROM Returns
    WHERE isTemporarilyDeleted = 0;
  `;

  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Add a new return
const addReturn = (returnData, callback) => {
  const {
    P_productCode,
    R_returnTypeID,
    R_reasonOfReturn,
    R_dateOfReturn,
    R_returnQuantity,
    R_discountAmount,
    R_TotalPrice,
    D_deliveryNumber,
    S_supplierID
  } = returnData;

  const insertReturnQuery = `
    INSERT INTO Returns (
      P_productCode, R_returnTypeID, R_reasonOfReturn, R_dateOfReturn,
      R_returnQuantity, R_discountAmount, R_TotalPrice, D_deliveryNumber, S_supplierID
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertReturnQuery,
    [
      P_productCode,
      R_returnTypeID,
      R_reasonOfReturn,
      R_dateOfReturn,
      R_returnQuantity,
      R_discountAmount,
      R_TotalPrice,
      D_deliveryNumber,
      S_supplierID
    ],
    (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    }
  );
};

// Update an existing return
const updateReturn = (returnID, returnData, callback) => {
  const {
    P_productCode,
    R_returnTypeID,
    R_reasonOfReturn,
    R_dateOfReturn,
    R_returnQuantity,
    R_discountAmount,
    R_TotalPrice,
    D_deliveryNumber,
    S_supplierID
  } = returnData;

  const updateReturnQuery = `
    UPDATE Returns
    SET
      P_productCode = ?,
      R_returnTypeID = ?,
      R_reasonOfReturn = ?,
      R_dateOfReturn = ?,
      R_returnQuantity = ?,
      R_discountAmount = ?,
      R_TotalPrice = ?,
      D_deliveryNumber = ?,
      S_supplierID = ?
    WHERE R_returnID = ?;
  `;

  db.query(
    updateReturnQuery,
    [
      P_productCode,
      R_returnTypeID,
      R_reasonOfReturn,
      R_dateOfReturn,
      R_returnQuantity,
      R_discountAmount,
      R_TotalPrice,
      D_deliveryNumber,
      S_supplierID,
      returnID
    ],
    (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    }
  );
};

// Soft delete a return
const softDeleteReturn = (returnID, callback) => {
  const query = `
    UPDATE Returns
    SET isTemporarilyDeleted = 1
    WHERE R_returnID = ?;
  `;

  db.query(query, [returnID], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

module.exports = {
  getAllActiveReturns,
  addReturn,
  updateReturn,
  softDeleteReturn
};