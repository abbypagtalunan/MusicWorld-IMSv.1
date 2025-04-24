const db = require('../db');

// Get all returns
const getAllReturns = (callback) => {
  const query = `SELECT * FROM Returns ORDER BY R_returnID DESC`;
  db.query(query, (err, results) => {
    if (err) callback(err, null);
    else callback(null, results);
  });
};

// Add a new return
const addReturn = (data, callback) => {
  const {
    P_productCode, R_returnTypeID, R_reasonOfReturn,
    R_dateOfReturn, R_returnQuantity, R_discountAmount, R_totalPrice
  } = data;

  const query = `
    INSERT INTO Returns 
    (P_productCode, R_returnTypeID, R_reasonOfReturn, R_dateOfReturn, R_returnQuantity, R_discountAmount, R_totalPrice)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [
    P_productCode, R_returnTypeID, R_reasonOfReturn,
    R_dateOfReturn, R_returnQuantity, R_discountAmount, R_totalPrice
  ], (err, results) => {
    if (err) callback(err, null);
    else callback(null, results.insertId);
  });
};

// Update return
const updateReturn = (id, data, callback) => {
  const {
    P_productCode, R_returnTypeID, R_reasonOfReturn,
    R_dateOfReturn, R_returnQuantity, R_discountAmount, R_totalPrice
  } = data;

  const query = `
    UPDATE Returns SET
    P_productCode = ?, R_returnTypeID = ?, R_reasonOfReturn = ?, R_dateOfReturn = ?,
    R_returnQuantity = ?, R_discountAmount = ?, R_totalPrice = ?
    WHERE R_returnID = ?`;

  db.query(query, [
    P_productCode, R_returnTypeID, R_reasonOfReturn, R_dateOfReturn,
    R_returnQuantity, R_discountAmount, R_totalPrice, id
  ], (err, results) => {
    if (err) callback(err, null);
    else callback(null, results);
  });
};

// Delete return
const deleteReturn = (id, callback) => {
  const query = `DELETE FROM Returns WHERE R_returnID = ?`;
  db.query(query, [id], (err, results) => {
    if (err) callback(err, null);
    else callback(null, results);
  });
};

module.exports = {
  getAllReturns,
  addReturn,
  updateReturn,
  deleteReturn
};
