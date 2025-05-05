const db = require('../../db');

// Get all Deleted transactions
const getAllDeleted = (callback) => {
  const query = `
    SELECT 
      d.D_deliveryNumber,
      p.P_productCode,
      p.P_productName,
      d.D_deliveryDate,
      s.S_supplierName AS supplier,
      b.B_brandName AS brand,
      c.C_categoryName AS category,
      dpd.DPD_quantity,
      d.isTemporarilyDeleted,
      'Deliveries' as source
    FROM Deliveries d
    LEFT JOIN DeliveryProductDetails dpd ON d.D_deliveryNumber = dpd.D_deliveryNumber
    LEFT JOIN Products p ON dpd.P_productCode = p.P_productCode
    LEFT JOIN Brands b ON p.B_brandID = b.B_brandID
    LEFT JOIN Suppliers s ON p.S_supplierID = s.S_supplierID
    LEFT JOIN Categories c ON p.C_categoryID = c.C_categoryID
    WHERE d.isTemporarilyDeleted = TRUE`
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
  const query = `UPDATE Deliveries SET isTemporarilyDeleted = '0' WHERE D_deliveryNumber = ?`;
    
  db.query(query, [orderID], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
}

// Delete permanently
const deletePermanently = (deliveryNumber, callback) => {
  const updateReturnsQuery = `UPDATE Returns SET D_deliveryNumber = NULL WHERE D_deliveryNumber = ?`;
  const deleteDeliveryProductDetailsQuery = `DELETE FROM DeliveryProductDetails WHERE D_deliveryNumber = ?`;
  const deleteDeliveryPaymentDetailsQuery = `DELETE FROM DeliveryPaymentDetails WHERE D_deliveryNumber = ?`;
  const deleteDeliveryQuery = `DELETE FROM Deliveries WHERE D_deliveryNumber = ?`;

    db.query(updateReturnsQuery, [deliveryNumber], (err, results) => {
      if (err) return callback(err);

      db.query(deleteDeliveryProductDetailsQuery, [deliveryNumber], (err, results) => {
        if (err) return callback(err);

        db.query(deleteDeliveryPaymentDetailsQuery, [deliveryNumber], (err, results) => {
          if (err) return callback(err);

          db.query(deleteDeliveryQuery, [deliveryNumber], (err, results) => {
            if (err) return callback(err);

            callback(null, results);
        });
      });
    });
  });
};

module.exports = {
  getAllDeleted,
  retrieveDeleted,
  deletePermanently,
};
