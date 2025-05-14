const db = require('../../db');

// ==============================================
// Deliveries functions

// Get all deliveries
const getAllDeliveries = (callback) => {
  const query = `
    SELECT 
      d.D_deliveryNumber,
      d.D_deliveryDate,
      SUM(dp.DPD_quantity * p.P_unitPrice) as totalCost
    FROM Deliveries d
    LEFT JOIN DeliveryProductDetails dp ON d.D_deliveryNumber = dp.D_deliveryNumber
    LEFT JOIN Products p ON dp.P_productCode = p.P_productCode
    WHERE d.isTemporarilyDeleted = 0
    GROUP BY d.D_deliveryNumber, d.D_deliveryDate
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

// Add a new delivery
const addDelivery = (deliveryData, products, payment, callback) => {
  const { D_deliveryNumber, D_deliveryDate } = deliveryData;
  // console.log('Adding delivery with products and payment:', { deliveryData, products, payment });

  if (!D_deliveryNumber || !D_deliveryDate) {
    return callback(new Error("Missing required delivery fields"));
  }

  // Validate products array
  if (!Array.isArray(products) || products.length === 0) {
    return callback(new Error("Products array is required and cannot be empty"));
  }

  // Validate payment details
  if (payment && (!payment.D_paymentTypeID || !payment.D_modeOfPaymentID || !payment.D_paymentStatusID)) {
    return callback(new Error("Missing required payment fields"));
  }

  // Start transaction on a dedicated connection
  db.getConnection((err, conn) => {
    if (err) return callback(err);

    conn.beginTransaction(err => {
      if (err) {
        conn.release();
        return callback(err);
      }
        
      // ← Define the SQL **before** you use it
      const insertDeliveryQuery = `
        INSERT INTO Deliveries (D_deliveryNumber, D_deliveryDate, isTemporarilyDeleted)
        VALUES (?, ?, 0)
      `;

      const insertProductsQuery = `
        INSERT INTO DeliveryProductDetails
          (DPD_quantity, D_deliveryNumber, P_productCode)
        VALUES ?
      `;

      // e.g. [[qty1, deliveryNumber, code1], [qty2, deliveryNumber, code2], …]
      const productValues = products.map(p => [
        p.DPD_quantity,
        D_deliveryNumber,
        p.P_productCode
      ]);

      // Step 1: insert into Deliveries
      conn.query(insertDeliveryQuery, [D_deliveryNumber, D_deliveryDate], (err, deliveryResult) => {
        if (err) {
          return conn.rollback(() => {
            conn.release();
            callback(err);
          });
        }

        // Step 2: insert into DeliveryProductDetails
        conn.query(insertProductsQuery, [productValues], (err, productResults) => {
          if (err) {
            return conn.rollback(() => {
              conn.release();
              callback(err);
            });
          }
          
          // Step 3: update Products stock numbers
          const updateStockQuery = `
            UPDATE Products
            SET P_stockNum = P_stockNum + ?
            WHERE P_productCode = ?
          `;
          // for each delivered product, bump its stock
          products.forEach(({ P_productCode, DPD_quantity }) => {
            conn.query(updateStockQuery, [DPD_quantity, P_productCode], (err) => {
              if (err) {
                return conn.rollback(() => {
                  conn.release();
                  callback(err);
                });
              }
            });
          });

          // Step 4: insert into DeliveryPaymentDetails (if any)
          if (payment) {
            const insertPaymentQuery = `
              INSERT INTO DeliveryPaymentDetails
                (D_deliveryNumber,
                D_paymentTypeID,
                D_modeOfPaymentID,
                D_paymentStatusID,
                DPD_dateOfPaymentDue,
                DPD_dateOfPayment1,
                D_modeOfPaymentID2,
                D_paymentStatusID2,
                DPD_dateOfPaymentDue2,
                DPD_dateOfPayment2)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            conn.query(insertPaymentQuery, [
              D_deliveryNumber,
              payment.D_paymentTypeID,
              payment.D_modeOfPaymentID,
              payment.D_paymentStatusID,
              payment.DPD_dateOfPaymentDue || null,
              payment.DPD_dateOfPayment1 || null,
              payment.D_modeOfPaymentID2 || null,
              payment.D_paymentStatusID2 || null,
              payment.DPD_dateOfPaymentDue2 || null,
              payment.DPD_dateOfPayment2 || null
            ], (err, paymentResult) => {
              if (err) {
                return conn.rollback(() => {
                  conn.release();
                  callback(err);
                });
              }
              // finally commit
              conn.commit(err => {
                if (err) {
                  return conn.rollback(() => {
                    conn.release();
                    callback(err);
                  });
                }
                conn.release();
                callback(null, {
                  delivery: deliveryResult,
                  products: productResults,
                  payment: paymentResult
                });
              });
            });
          } else {
            // no payment, just commit
            conn.commit(err => {
              if (err) {
                return conn.rollback(() => {
                  conn.release();
                  callback(err);
                });
              }
              conn.release();
              callback(null, {
                delivery: deliveryResult,
                products: productResults
              });
            });
          }
        });
      });
    });
  });
};

// Search deliveries by ID (delivery number)
const searchDeliveriesByID = (deliveryNumber, callback) => {
  const query = `
    SELECT 
      d.D_deliveryNumber,
      d.D_deliveryDate,
      SUM(dp.DPD_quantity * p.P_unitPrice) as totalCost
    FROM Deliveries d
    LEFT JOIN DeliveryProductDetails dp ON d.D_deliveryNumber = dp.D_deliveryNumber
    LEFT JOIN Products p ON dp.P_productCode = p.P_productCode
    WHERE d.D_deliveryNumber = ? AND d.isTemporarilyDeleted = 0
    GROUP BY d.D_deliveryNumber, d.D_deliveryDate;
  `;
  
  db.query(query, [deliveryNumber], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// search deliveries by date
const searchDeliveriesByDate = (date, callback) => {
  const query = `
    SELECT 
      d.D_deliveryNumber,
      d.D_deliveryDate,
      SUM(dp.DPD_quantity * p.P_unitPrice) AS totalCost
    FROM Deliveries d
    LEFT JOIN DeliveryProductDetails dp 
      ON d.D_deliveryNumber = dp.D_deliveryNumber
    LEFT JOIN Products p 
      ON dp.P_productCode = p.P_productCode
    WHERE d.isTemporarilyDeleted = 0
      AND DATE(d.D_deliveryDate) = ?
    GROUP BY d.D_deliveryNumber, d.D_deliveryDate
    ORDER BY d.D_deliveryDate DESC
  `;
  db.query(query, [date], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Mark delivery as deleted (isTemporarilyDeleted => 1)
const markDeliveryAsDeleted = (deliveryNumber, callback) => {
  const query = `UPDATE Deliveries SET isTemporarilyDeleted = 1 WHERE D_deliveryNumber = ?`;
  db.query(query, [deliveryNumber], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// ==============================================
// Delivery products functions

// Get delivery products by ID (delivery number)
const getDeliveryProductsOfDelivery = (deliveryNumber, callback) => {
  const query = `
    SELECT 
      dpd.D_deliveryNumber,
      dpd.P_productCode,
      p.P_productName as productName,
      b.B_brandName as brandName,
      s.S_supplierName as supplierName,
      dpd.DPD_quantity,
      p.P_unitPrice
    FROM DeliveryProductDetails dpd
    LEFT JOIN Products p ON dpd.P_productCode = p.P_productCode
    LEFT JOIN Brands b ON p.B_brandID = b.B_brandID
    LEFT JOIN Suppliers s ON p.S_supplierID = s.S_supplierID
    WHERE dpd.D_deliveryNumber = ?
    ORDER BY dpd.P_productCode;
  `;
  
  db.query(query, [deliveryNumber], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Get delivery products of all deliveries
const getDeliveryProductsOfAllDeliveries = (callback) => {
  const query = `
    SELECT 
      dpd.D_deliveryNumber,
      dpd.P_productCode,
      p.P_productName as productName,
      b.B_brandName as brandName,
      s.S_supplierName as supplierName,
      dpd.DPD_quantity,
      p.P_unitPrice
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

// Add products to the current delivery batch
const addDeliveryProducts = (deliveryProductsData, callback) => {
  // Check if we have a products array from the frontend
  const deliveryProducts = deliveryProductsData.products || deliveryProductsData;
  
  if (!deliveryProducts || !deliveryProducts.length) {
    return callback(null, { message: "No products to add" });
  }

  // check for delivery's existence
  const checkDeliveryQuery = "SELECT D_deliveryNumber FROM Deliveries WHERE D_deliveryNumber = ?";
  db.query(checkDeliveryQuery, [deliveryProducts[0].D_deliveryNumber], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) {
      return callback(new Error(`Delivery with number ${deliveryProducts[0].D_deliveryNumber} does not exist`));
    }
    
    // Prepare batch insert of products
    const insertProductsQuery = `
      INSERT INTO DeliveryProductDetails (D_deliveryNumber, P_productCode, DPD_quantity) 
      VALUES ?
    `;

    const values = deliveryProducts.map(product => [
      product.D_deliveryNumber,
      product.P_productCode,
      product.DPD_quantity,
    ]);

    db.query(
      insertProductsQuery,
      [values],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results);
      }
    );
  });
};

// ==============================================
// Payment details functions

// Get payment details of all deliveries
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
const updatePaymentDetails = (deliveryNumber, paymentData, callback) => {
  const { D_paymentTypeID, D_modeOfPaymentID, D_paymentStatusID, DPD_dateOfPaymentDue, DPD_dateOfPayment1, DPD_dateOfPayment2 } = paymentData;

  if (!DPD_dateOfPaymentDue || !DPD_dateOfPayment1) {
    return callback(new Error('Payment due date and first payment date are required'));
  }

  // Check if payment details exist
  const checkQuery = `SELECT D_deliveryNumber FROM DeliveryPaymentDetails WHERE D_deliveryNumber = ?`;

  db.query(checkQuery, [deliveryNumber], (err, results) => {
    if (err) {
      return callback(err);
    }

    let query;
    let params;

    if (results.length > 0) {
      // Update existing payment details
      query = `
        UPDATE DeliveryPaymentDetails
        SET D_paymentTypeID = ?,
            D_modeOfPaymentID     = ?,
            D_paymentStatusID     = ?,
            DPD_dateOfPaymentDue  = ?,
            DPD_dateOfPayment1    = ?,
            D_modeOfPaymentID2    = ?,
            D_paymentStatusID2    = ?,
            DPD_dateOfPaymentDue2 = ?,
            DPD_dateOfPayment2    = ?
        WHERE D_deliveryNumber = ?
      `;
      params = [
        deliveryNumber,
        D_paymentTypeID,
        D_modeOfPaymentID,
        D_paymentStatusID,
        DPD_dateOfPaymentDue,
        DPD_dateOfPayment1,
        D_modeOfPaymentID2,
        D_paymentStatusID2,
        DPD_dateOfPaymentDue2,
        DPD_dateOfPayment2
      ];
    } else {
      // Insert new payment details
      query = `
        INSERT INTO DeliveryPaymentDetails 
          (D_deliveryNumber,
          D_paymentTypeID,
          D_modeOfPaymentID,
          D_paymentStatusID,
          DPD_dateOfPaymentDue,
          DPD_dateOfPayment1,
          D_modeOfPaymentID2,
          D_paymentStatusID2,
          DPD_dateOfPaymentDue2,
          DPD_dateOfPayment2)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      params = [
        deliveryNumber,
        D_paymentTypeID,
        D_modeOfPaymentID,
        D_paymentStatusID,
        DPD_dateOfPaymentDue,
        DPD_dateOfPayment1,
        D_modeOfPaymentID2,
        D_paymentStatusID2,
        DPD_dateOfPaymentDue2,
        DPD_dateOfPayment2
      ];
    }

    db.query(query, params, (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  });
};

// ==============================================
// Types/modes/status functions

// Get all delivery payment types
const getAllDeliveryPaymentTypes = (callback) => {
  const query = `SELECT D_paymentTypeID, D_paymentName FROM DeliveryPaymentTypes ORDER BY D_paymentTypeID`;
  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Get all delivery mode of payments
const getAllDeliveryModeOfPayments = (callback) => {
  const query = `SELECT D_modeOfPaymentID, D_mopName FROM DeliveryModeOfPayment ORDER BY D_modeOfPaymentID`;
  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Get all delivery payment statuses
const getAllDeliveryPaymentStatuses = (callback) => {
  const query = `SELECT D_paymentStatusID, D_statusName FROM DeliveryPaymentStatus ORDER BY D_paymentStatusID`;
  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

module.exports = {
  // deliveries functions
  getAllDeliveries,
  addDelivery,
  searchDeliveriesByID,
  searchDeliveriesByDate,
  markDeliveryAsDeleted,
  
  // delivery products functions
  getDeliveryProductsOfDelivery,
  getDeliveryProductsOfAllDeliveries,
  addDeliveryProducts,
  
  // payment details functions
  getPaymentDetails,
  updatePaymentDetails,
  
  // types/modes/status functions
  getAllDeliveryPaymentTypes,
  getAllDeliveryModeOfPayments,
  getAllDeliveryPaymentStatuses,
};