const db = require('../../db');

// Get all Deleted transactions
const getAllDeleted = (callback) => {
  const query = `
    SELECT 
      r.R_returnID,
      p.P_productCode,
      r.R_returnTypeID,
      r.R_reasonOfReturn,
      p.P_productName,
      r.R_TotalPrice,
      r.R_dateOfReturn,
      s.S_supplierName AS supplier,
      b.B_brandName AS brand,
      c.C_categoryName AS category,
      r.R_returnQuantity,
      r.R_discountAmount,
      r.isTemporarilyDeleted,
      'Returns' as source
    FROM Returns r
    LEFT JOIN ReturnTypes rt ON r.R_returnTypeID = rt.RT_returnTypeID
    LEFT JOIN Products p ON r.P_productCode = p.P_productCode
    LEFT JOIN Brands b ON p.B_brandID = b.B_brandID
    LEFT JOIN Suppliers s ON p.S_supplierID = s.S_supplierID
    LEFT JOIN Categories c ON p.C_categoryID = c.C_categoryID
    WHERE r.isTemporarilyDeleted = TRUE`
  ;
    
    db.query(query, (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
};

const retrieveDeleted = (returnID, callback) => {
  const query = `UPDATE Returns SET isTemporarilyDeleted = '0' WHERE R_returnID = ?`;
    
  db.query(query, [returnID], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
}

// Delete permanently
const deletePermanently = (returnID, callback) => {
  const query = `DELETE FROM Returns WHERE R_returnID = ?`;

    db.query(query, [returnID], (err, results) => {
        if (err) return callback(err);
    
        callback(null, results);
    });
};

module.exports = {
  getAllDeleted,
  retrieveDeleted,
  deletePermanently,
};
