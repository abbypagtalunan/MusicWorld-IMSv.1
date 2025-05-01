const db = require('../../db');

// Get all Deleted transactions
const getAllDeleted = (callback) => {
    const query = `
      SELECT 
        d.DT_deletionID,
        d.DT_deletionTime,
        d.T_transactionID,
        p.P_productCode,
        o.O_receiptNumber,
        p.P_productName,
        p.P_sellingPrice,
        t.T_transactionDate,
        s.S_supplierName AS supplier,
        b.B_brandName AS brand,
        c.C_categoryName AS category,
        od.OD_quantity
      FROM DeletedTransactions d
      LEFT JOIN Transactions t ON d.T_transactionID = t.T_transactionID
      LEFT JOIN Orders o ON t.O_orderID = o.O_orderID
      LEFT JOIN OrderDetails od ON o.O_orderID = od.O_orderID
      LEFT JOIN Products p ON od.P_productCode = p.P_productCode
      LEFT JOIN Brands b ON p.B_brandID = b.B_brandID
      LEFT JOIN Suppliers s ON p.S_supplierID = s.S_supplierID
      LEFT JOIN Categories c ON p.C_categoryID = c.C_categoryID;
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
};

module.exports = {
  getAllDeleted,
};
