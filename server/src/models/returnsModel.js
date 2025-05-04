const db = require('../../db');

// Get all returns
const getAllReturns = (callback) => {
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

// Delete a return
const deleteReturn = (returnID, callback) => {
  const deleteReturnQuery = `DELETE FROM Returns WHERE R_returnID = ?`;

  db.query(deleteReturnQuery, [returnID], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Get product selling price by product code
const getProductSellingPrice = (productCode, callback) => {
  const query = `
    SELECT P_sellingPrice
    FROM Products
    WHERE P_productCode = ?;
  `;

  db.query(query, [productCode], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results[0]?.P_sellingPrice || 0); // Return 0 if no price found
    }
  });
};

module.exports = {
  getAllReturns,
  addReturn,
  updateReturn,
  deleteReturn,
  getProductSellingPrice
};