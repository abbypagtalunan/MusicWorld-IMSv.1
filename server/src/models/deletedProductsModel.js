const db = require('../../db');

// Get all Deleted transactions
const getAllDeleted = (callback) => {
  const query = `
    SELECT 
      p.P_productCode,
      c.C_categoryName as category,
      p.P_productName,
      b.B_brandName as brand,
      s.S_supplierName as supplier,
      p.S_supplierID,
      p.P_stockNum as stock,
      p.P_lastRestockDateTime,
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
    LEFT JOIN ProductStatus ps ON p.P_productStatusID = ps.P_productStatusID
    WHERE p.isDeleted = 1 AND p.P_productStatusID = 4`
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
  const getStockQuery = `SELECT P_stockNum FROM Products WHERE P_productCode = ?`;
  
  db.query(getStockQuery, [productCode], (err, stockResults) => {
    if (err) {
      return callback(err, null);
    }
    
    if (stockResults.length === 0) {
      return callback(new Error('Product not found'), null);
    }
    
    const stock = stockResults[0].P_stockNum;
    let newStatus;
    
    if (stock >= 10) {
      newStatus = 1;
    } else if (stock < 10) {
      newStatus = 5; 
    } else if (stock <= 0) {
      newStatus = 2;
    }
    
    const updateQuery = `UPDATE Products 
                        SET isDeleted = '0', 
                            P_productStatusID = ? 
                        WHERE P_productCode = ?`;
    
    db.query(updateQuery, [newStatus, productCode], (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  });
};

// Delete permanently
const deletePermanently = (productCode, callback) => {
  const query = `DELETE FROM Products WHERE P_productCode = ?`;

  db.query(query, [productCode], (err, results) => {
    if (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return callback({
          status: 409,
          message: 'Product is referenced in another transaction.',
        }, null);
      }
      return callback(err);
    }
    callback(null, results);
  });  
};

module.exports = {
  getAllDeleted,
  retrieveDeleted,
  deletePermanently,
};
