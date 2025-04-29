const db = require('../../db');

// Get all Deliveries
const getAllDeliveries = (callback) => {
  const query = `
    SELECT 
      d.D_deliveryNumber,
      d.D_deliveryDate,
      d.S_supplierID,
      s.S_supplierName as supplierName,
      SUM(dp.DPD_quantity * dp.DPD_unitPrice) as totalCost
    FROM Deliveries d
    LEFT JOIN Suppliers s ON d.S_supplierID = s.S_supplierID
    LEFT JOIN DeliveryProductDetails dp ON d.D_deliveryNumber = dp.D_deliveryNumber
    GROUP BY d.D_deliveryNumber, d.D_deliveryDate, d.S_supplierID, s.S_supplierName
    ORDER BY d.D_deliveryDate DESC;
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Search Deliveries by delivery number
const searchDeliveries = (deliveryNumber, callback) => {
  const query = `
    SELECT 
      d.D_deliveryNumber,
      d.D_deliveryDate,
      d.S_supplierID,
      s.S_supplierName as supplierName,
      SUM(dp.DPD_quantity * dp.DPD_unitPrice) as totalCost
    FROM Deliveries d
    LEFT JOIN Suppliers s ON d.S_supplierID = s.S_supplierID
    LEFT JOIN DeliveryProductDetails dp ON d.D_deliveryNumber = dp.D_deliveryNumber
    WHERE d.D_deliveryNumber LIKE ?
    GROUP BY d.D_deliveryNumber, d.D_deliveryDate, d.S_supplierID, s.S_supplierName;
  `;
  
  db.query(query, [`%${deliveryNumber}%`], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Add a new Delivery
const addDelivery = (deliveryData, callback) => {
  const { D_deliveryNumber, D_deliveryDate, S_supplierID } = deliveryData;

  // First insert the delivery header
  const insertDeliveryQuery = `
    INSERT INTO Deliveries (D_deliveryNumber, D_deliveryDate, S_supplierID) 
    VALUES (?, ?, ?)
  `;

  db.query(
    insertDeliveryQuery,
    [D_deliveryNumber, D_deliveryDate, S_supplierID],
    (err, results) => {
      if (err) return callback(err);
      callback(null, results.insertId);
    }
  );
};

// Add products to an existing delivery
const addDeliveryProducts = (deliveryProducts, callback) => {
  if (!deliveryProducts || !deliveryProducts.length) {
    return callback(null, { message: "No products to add" });
  }

  // Prepare batch insert of products
  const insertProductsQuery = `
    INSERT INTO DeliveryProductDetails (D_deliveryNumber, P_productCode, DPD_quantity, DPD_unitPrice) 
    VALUES ?
  `;

  const values = deliveryProducts.map(product => [
    product.D_deliveryNumber,
    product.P_productCode,
    product.DPD_quantity,
    product.DPD_unitPrice
  ]);

  db.query(
    insertProductsQuery,
    [values],
    (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    }
  );
};

// Get all product details for a delivery
const getDeliveryProducts = (callback) => {
  const query = `
    SELECT 
      dpd.D_deliveryNumber,
      dpd.P_productCode,
      p.P_productName as productName,
      b.B_brandName as brandName,
      s.S_supplierName as supplierName,
      dpd.DPD_quantity,
      dpd.DPD_unitPrice
    FROM DeliveryProductDetails dpd
    LEFT JOIN Products p ON dpd.P_productCode = p.P_productCode
    LEFT JOIN Brands b ON p.B_brandID = b.B_brandID
    LEFT JOIN Suppliers s ON p.S_supplierID = s.S_supplierID
    ORDER BY dpd.D_deliveryNumber;
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Get payment details for all deliveries
const getPaymentDetails = (callback) => {
  const query = `
    SELECT 
      dpd.*
    FROM DeliveryPaymentDetails dpd
    ORDER BY dpd.D_deliveryNumber;
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Update payment details for a delivery
const updatePaymentDetails = (deliveryNum, paymentData, callback) => {
  const { D_paymentTypeID, D_modeOfPaymentID, D_paymentStatusID, DPD_dateOfPaymentDue, DPD_dateOfPayment1, DPD_dateOfPayment2 } = paymentData;

  // Check if payment details exist
  const checkQuery = `SELECT D_deliveryNumber FROM DeliveryPaymentDetails WHERE D_deliveryNumber = ?`;

  db.query(checkQuery, [deliveryNum], (err, results) => {
    if (err) return callback(err);

    let query;
    let params;

    if (results.length > 0) {
      // Update existing payment details
      query = `
        UPDATE DeliveryPaymentDetails
        SET D_paymentTypeID = ?, D_modeOfPaymentID = ?, D_paymentStatusID = ?, 
            DPD_dateOfPaymentDue = ?, DPD_dateOfPayment1 = ?, DPD_dateOfPayment2 = ?
        WHERE D_deliveryNumber = ?
      `;
      params = [D_paymentTypeID, D_modeOfPaymentID, D_paymentStatusID, DPD_dateOfPaymentDue, DPD_dateOfPayment1, DPD_dateOfPayment2, deliveryNum];
    } else {
      // Insert new payment details
      query = `
        INSERT INTO DeliveryPaymentDetails 
        (D_deliveryNumber, D_paymentTypeID, D_modeOfPaymentID, D_paymentStatusID, DPD_dateOfPaymentDue, DPD_dateOfPayment1, DPD_dateOfPayment2)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      params = [deliveryNum, D_paymentTypeID, D_modeOfPaymentID, D_paymentStatusID, DPD_dateOfPaymentDue, DPD_dateOfPayment1, DPD_dateOfPayment2];
    }

    db.query(query, params, (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  });
};

// Delete a Delivery
const deleteDelivery = (deliveryNum, callback) => {
  // Start a transaction to ensure data integrity when deleting related records
  db.beginTransaction(err => {
    if (err) return callback(err);

    // First delete the payment details
    const deletePaymentDetailsQuery = `DELETE FROM DeliveryPaymentDetails WHERE D_deliveryNumber = ?`;
    db.query(deletePaymentDetailsQuery, [deliveryNum], (err) => {
      if (err) {
        return db.rollback(() => callback(err));
      }

      // Then delete the product details
      const deleteProductDetailsQuery = `DELETE FROM DeliveryProductDetails WHERE D_deliveryNumber = ?`;
      db.query(deleteProductDetailsQuery, [deliveryNum], (err) => {
        if (err) {
          return db.rollback(() => callback(err));
        }

        // Finally, delete the delivery record
        const deleteDeliveryQuery = `DELETE FROM Deliveries WHERE D_deliveryNumber = ?`;
        db.query(deleteDeliveryQuery, [deliveryNum], (err, results) => {
          if (err) {
            return db.rollback(() => callback(err));
          }

          // Commit the transaction
          db.commit(err => {
            if (err) {
              return db.rollback(() => callback(err));
            }
            callback(null, results);
          });
        });
      });
    });
  });
};

module.exports = {
  getAllDeliveries,
  searchDeliveries,
  addDelivery,
  addDeliveryProducts,
  getDeliveryProducts,
  getPaymentDetails,
  updatePaymentDetails,
  deleteDelivery
};