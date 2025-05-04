const db = require('../../db');

// Get all Deleted transactions
const getAllDeleted = (callback) => {
  const query = `
    SELECT 
      o.O_orderID,
      o.O_receiptNumber,
      o.T_totalAmount,
      o.D_wholeOrderDiscount,
      o.D_totalProductDiscount,
      o.T_transactionDate,
      o.isTemporarilyDeleted,
      od.OD_quantity,
      od.OD_unitPrice,
      od.OD_discountAmount,
      od.OD_itemTotal,
      p.P_productCode,
      p.P_productName,
      p.P_sellingPrice,
      p.P_SKU,
      b.B_brandName AS brand,
      s.S_supplierName AS supplier,
      c.C_categoryName AS category,
      'Orders' as source
    FROM Orders o
    LEFT JOIN OrderDetails od ON o.O_orderID = od.O_orderID
    LEFT JOIN Products p ON od.P_productCode = p.P_productCode
    LEFT JOIN Brands b ON p.B_brandID = b.B_brandID
    LEFT JOIN Suppliers s ON p.S_supplierID = s.S_supplierID
    LEFT JOIN Categories c ON p.C_categoryID = c.C_categoryID
    WHERE o.isTemporarilyDeleted = TRUE`

    /*UNION ALL

    SELECT *, "Returns" as source FROM Returns WHERE isDeletedTemporarily = TRUE
    UNION ALL
    SELECT *, "Deliveries" as source FROM Deliveries WHERE isDeletedTemporarily = TRUE; 
    UNION

    SELECT 
      d.DT_deletionID,
      d.DT_deletionTime,
      r.T_transactionID,
      NULL AS O_receiptNumber,
      rd.RD_quantity AS OD_quantity,
      p.P_productCode,
      p.P_productName,
      p.P_sellingPrice,
      r.R_transactionDate AS transactionDate,
      s.S_supplierName AS supplier,
      b.B_brandName AS brand,
      c.C_categoryName AS category,
      'Returns' AS source
    FROM Returns r
    LEFT JOIN DeletedTransactions d ON r.T_transactionID = d.T_transactionID
    LEFT JOIN ReturnDetails rd ON r.R_returnID = rd.R_returnID
    LEFT JOIN Products p ON rd.P_productCode = p.P_productCode
    LEFT JOIN Brands b ON p.B_brandID = b.B_brandID
    LEFT JOIN Suppliers s ON p.S_supplierID = s.S_supplierID
    LEFT JOIN Categories c ON p.C_categoryID = c.C_categoryID
    WHERE r.isDeletedTemporarily = TRUE

    UNION

    SELECT 
      d.DT_deletionID,
      d.DT_deletionTime,
      dl.T_transactionID,
      NULL AS O_receiptNumber,
      dd.DD_quantity AS OD_quantity,
      p.P_productCode,
      p.P_productName,
      p.P_sellingPrice,
      dl.D_transactionDate AS transactionDate,
      s.S_supplierName AS supplier,
      b.B_brandName AS brand,
      c.C_categoryName AS category,
      'Deliveries' AS source
    FROM Deliveries dl
    LEFT JOIN DeletedTransactions d ON dl.T_transactionID = d.T_transactionID
    LEFT JOIN DeliveryDetails dd ON dl.D_deliveryID = dd.D_deliveryID
    LEFT JOIN Products p ON dd.P_productCode = p.P_productCode
    LEFT JOIN Brands b ON p.B_brandID = b.B_brandID
    LEFT JOIN Suppliers s ON p.S_supplierID = s.S_supplierID
    LEFT JOIN Categories c ON p.C_categoryID = c.C_categoryID
    WHERE dl.isDeletedTemporarily = TRUE */
  ;
    
    db.query(query, (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
};

// Delete permanently
const deletePermanently = (transactionID, callback) => {
  const deleteOrderDetailsQuery = `
    DELETE od FROM OrderDetails od
    JOIN Orders o ON od.O_orderID = o.O_orderID
    WHERE o.T_transactionID = ?
    `;

  const deleteOrderQuery = `DELETE FROM Orders WHERE T_transactionID = ?`; 

  const deleteDeletedQuery = 'DELETE FROM DeletedTransactions WHERE T_transactionID = ?'

  db.query(deleteOrderDetailsQuery, [transactionID], (err, results) => {
    if (err) return callback(err);

    db.query(deleteOrderQuery, [transactionID], (err, results) => {
      if (err) return callback(err);
        
      db.query(deleteDeletedQuery, [transactionID], (err, results) => {
        if (err) return callback(err);
        callback(null, results);
      });
    });
  });  
};

module.exports = {
  getAllDeleted,
  deletePermanently,
};
