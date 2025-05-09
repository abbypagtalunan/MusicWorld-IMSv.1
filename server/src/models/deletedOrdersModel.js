const db = require('../../db');

// Get all Deleted transactions
const getAllDeleted = (callback) => {
  const query = `
    SELECT 
      o.O_orderID,
      p.P_productCode,
      o.O_receiptNumber,
      p.P_productName,
      o.T_totalAmount,
      o.T_transactionDate,
      o.O_orderPayment,
      s.S_supplierName AS supplier,
      b.B_brandName AS brand,
      c.C_categoryName AS category,
      od.OD_unitPrice,
      od.OD_quantity,
      od.OD_netSale,
      od.OD_detailID,
      od.OD_discountAmount,
      o.isTemporarilyDeleted,
      'Orders' as source
    FROM Orders o
    LEFT JOIN OrderDetails od ON o.O_orderID = od.O_orderID
    LEFT JOIN Products p ON od.P_productCode = p.P_productCode
    LEFT JOIN Brands b ON p.B_brandID = b.B_brandID
    LEFT JOIN Suppliers s ON p.S_supplierID = s.S_supplierID
    LEFT JOIN Categories c ON p.C_categoryID = c.C_categoryID
    WHERE o.isTemporarilyDeleted = TRUE`
  ;
    
    db.query(query, (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
};

const retrieveDeleted = (orderID, callback) => {
  const query = `UPDATE Orders SET isTemporarilyDeleted = '0' WHERE O_orderID = ?`;
    
  db.query(query, [orderID], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
}

// Delete permanently
const deletePermanently = (orderID, callback) => {
  const deleteOrderDetailsQuery = `DELETE FROM OrderDetails WHERE O_orderID = ?`;

  const deleteOrderQuery = `DELETE FROM Orders WHERE O_orderID = ?`; 

  db.query(deleteOrderDetailsQuery, [orderID], (err, results) => {
    if (err) return callback(err);

    db.query(deleteOrderQuery, [orderID], (err, results) => {
      if (err) return callback(err);

        callback(null, results);
      });
    });  
};

module.exports = {
  getAllDeleted,
  retrieveDeleted,
  deletePermanently,
};
