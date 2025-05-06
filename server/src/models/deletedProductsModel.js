const db = require('../../db');

// Get all Deleted transactions
const getAllDeleted = (callback) => {
  const query = `
    SELECT 
      p.P_productCode,
      c.C_categoryName as category,
      p.P_SKU,
      p.P_productName,
      b.B_brandName as brand,
      s.S_supplierName as supplier,
      p.S_supplierID,
      pk.P_stockNum as stock,
      p.P_unitPrice,
      p.P_sellingPrice,
      ps.P_productStatusName as status,
      p.P_dateAdded,
      p.isDeleted,
      'Products' as source
    FROM Products p
    LEFT JOIN Categories c ON p.C_categoryID = c.C_categoryID
    LEFT JOIN Brands b ON p.B_brandID = b.B_brandID
    LEFT JOIN Suppliers s ON p.S_supplierID = s.S_supplierID
    LEFT JOIN ProductStock pk ON p.PS_StockDetailsID = pk.PS_StockDetailsID
    LEFT JOIN ProductStatus ps ON p.P_productStatusID = ps.P_productStatusID
    WHERE p.isDeleted = TRUE`
    ;
    
    db.query(query, (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
};

const retrieveDeleted = (productCode, callback) => {
  const query = `UPDATE Products SET isDeleted = '0', P_productStatusID = '1' WHERE P_productCode = ?`;
    
  db.query(query, [productCode], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
}

// Delete permanently
const deletePermanently = (productCode, callback) => {
  const query = `DELETE FROM Products WHERE P_productCode = ?`;

  db.query(query, [productCode], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });  
};

module.exports = {
  getAllDeleted,
  retrieveDeleted,
  deletePermanently,
};
