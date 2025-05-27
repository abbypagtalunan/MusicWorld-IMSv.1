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
  WHERE isTemporarilyDeleted = 0
  ORDER BY R_dateOfReturn DESC;
`;

  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Add multiple returns at once
const addReturn = (returnItems, callback) => {
  const values = returnItems.flatMap(item => [
    item.P_productCode,
    item.R_returnTypeID,
    item.R_reasonOfReturn,
    item.R_dateOfReturn,
    item.R_returnQuantity,
    item.R_discountAmount || 0,
    item.R_TotalPrice,
    item.D_deliveryNumber,
    item.S_supplierID
  ]);

  const placeholders = returnItems.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');

  const insertQuery = `
    INSERT INTO Returns (
      P_productCode,
      R_returnTypeID,
      R_reasonOfReturn,
      R_dateOfReturn,
      R_returnQuantity,
      R_discountAmount,
      R_TotalPrice,
      D_deliveryNumber,
      S_supplierID
    ) VALUES ${placeholders}
  `;

  db.query(insertQuery, values, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
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