const db = require('../../db');

// =========================
// DELIVERY CORE FUNCTIONS
// =========================

// Get all Deliveries
const getAllDeliveries = (callback) => {
  const query = `
    SELECT 
      d.D_deliveryNumber,
      d.D_deliveryDate,
      d.S_supplierID,
      s.S_supplierName as supplierName,
      SUM(dp.DPD_quantity * p.P_unitPrice) as totalCost
    FROM Deliveries d
    LEFT JOIN Suppliers s ON d.S_supplierID = s.S_supplierID
    LEFT JOIN DeliveryProductDetails dp ON d.D_deliveryNumber = dp.D_deliveryNumber
    LEFT JOIN Products p ON dp.P_productCode = p.P_productCode
    WHERE d.isTemporarilyDeleted = 0
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

// Get products for a specific delivery number
const getDeliveryProductsByDeliveryNumber = (deliveryNumber, callback) => {
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

// Search Deliveries by delivery number
const searchDeliveries = (deliveryNumber, callback) => {
  const query = `
    SELECT 
      d.D_deliveryNumber,
      d.D_deliveryDate,
      d.S_supplierID,
      s.S_supplierName as supplierName,
      SUM(dp.DPD_quantity * p.P_unitPrice) as totalCost
    FROM Deliveries d
    LEFT JOIN Suppliers s ON d.S_supplierID = s.S_supplierID
    LEFT JOIN DeliveryProductDetails dp ON d.D_deliveryNumber = dp.D_deliveryNumber
    LEFT JOIN Products p ON dp.P_productCode = p.P_productCode
    WHERE d.D_deliveryNumber = ?
    GROUP BY d.D_deliveryNumber, d.D_deliveryDate, d.S_supplierID, s.S_supplierName;
  `;
  
  db.query(query, [deliveryNumber], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Add a new Delivery
const addDelivery = (deliveryData, products, payment, callback) => {
  const { D_deliveryNumber, D_deliveryDate, S_supplierID } = deliveryData;

  console.log('Adding delivery with products and payment:', { deliveryData, products, payment });

  if (!D_deliveryNumber || !D_deliveryDate || !S_supplierID) {
    return callback(new Error("Missing required delivery fields"));
  }

  // Validate products array
  if (!Array.isArray(products) || products.length === 0) {
    return callback(new Error("Products array is required and cannot be empty"));
  }

  // Validate payment details
  if (payment && (!payment.D_paymentTypeID || !payment.D_modeOfPaymentID || !payment.D_paymentStatusID || !payment.DPD_dateOfPaymentDue)) {
    return callback(new Error("Missing required payment fields"));
  }

  // Start transaction
  db.beginTransaction(err => {
    if (err) return callback(err);

    // Step 1: Insert Delivery
    const insertDeliveryQuery = `
      INSERT INTO Deliveries (D_deliveryNumber, D_deliveryDate, S_supplierID, isTemporarilyDeleted) 
      VALUES (?, ?, ?, 0)
    `;

    db.query(insertDeliveryQuery, [D_deliveryNumber, D_deliveryDate, S_supplierID], (err, deliveryResult) => {
      if (err) return db.rollback(() => callback(err));

      // Step 2: Insert Products
      const productValues = products.map(product => [
        D_deliveryNumber,
        product.P_productCode,
        parseInt(product.DPD_quantity, 10)
      ]);

      const insertProductsQuery = `
        INSERT INTO DeliveryProductDetails (D_deliveryNumber, P_productCode, DPD_quantity) 
        VALUES ?
      `;

      db.query(insertProductsQuery, [productValues], (err, productResults) => {
        if (err) return db.rollback(() => callback(err));

        // Step 3: Insert Payment (if provided)
        if (payment) {
          const insertPaymentQuery = `
            INSERT INTO DeliveryPaymentDetails 
            (D_deliveryNumber, D_paymentTypeID, D_modeOfPaymentID, D_paymentStatusID, 
            DPD_dateOfPaymentDue, DPD_dateOfPayment1, DPD_dateOfPayment2)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;

          db.query(insertPaymentQuery, [
            D_deliveryNumber,
            payment.D_paymentTypeID,
            payment.D_modeOfPaymentID,
            payment.D_paymentStatusID,
            payment.DPD_dateOfPaymentDue,
            payment.DPD_dateOfPayment1,
            payment.DPD_dateOfPayment2 || null
          ], (err, paymentResult) => {
            if (err) return db.rollback(() => callback(err));

            // Commit transaction
            db.commit(err => {
              if (err) return db.rollback(() => callback(err));

              callback(null, {
                delivery: deliveryResult,
                products: productResults,
                payment: paymentResult
              });
            });
          });
        } else {
          // No payment, commit transaction
          db.commit(err => {
            if (err) return db.rollback(() => callback(err));

            callback(null, {
              delivery: deliveryResult,
              products: productResults
            });
          });
        }
      });
    });
  });
};

// Add products to an existing delivery
const addDeliveryProducts = (deliveryProductsData, callback) => {
  // Check if we have a products array from the frontend
  const deliveryProducts = deliveryProductsData.products || deliveryProductsData;
  
  if (!deliveryProducts || !deliveryProducts.length) {
    return callback(null, { message: "No products to add" });
  }

  // Add this check for delivery existence
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
        SET D_paymentTypeID = ?, D_modeOfPaymentID = ?, D_paymentStatusID = ?, 
            DPD_dateOfPaymentDue = ?, DPD_dateOfPayment1 = ?, DPD_dateOfPayment2 = ?
        WHERE D_deliveryNumber = ?
      `;
      params = [D_paymentTypeID, D_modeOfPaymentID, D_paymentStatusID, DPD_dateOfPaymentDue, DPD_dateOfPayment1, DPD_dateOfPayment2, deliveryNumber];
    } else {
      // Insert new payment details
      query = `
        INSERT INTO DeliveryPaymentDetails 
        (D_deliveryNumber, D_paymentTypeID, D_modeOfPaymentID, D_paymentStatusID, DPD_dateOfPaymentDue, DPD_dateOfPayment1, DPD_dateOfPayment2)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      params = [deliveryNumber, D_paymentTypeID, D_modeOfPaymentID, D_paymentStatusID, DPD_dateOfPaymentDue, DPD_dateOfPayment1, DPD_dateOfPayment2];
    }

    db.query(query, params, (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  });
};

// Add this new function above the existing deleteDelivery function
const markDeliveryAsDeleted = (deliveryNumber, callback) => {
  const query = `UPDATE Deliveries SET isTemporarilyDeleted = 1 WHERE D_deliveryNumber = ?`;
  db.query(query, [deliveryNumber], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Delete a Delivery
const deleteDelivery = (deliveryNumber, callback) => {
  // Start a transaction to ensure data integrity when deleting related records
  db.beginTransaction(err => {
    if (err) return callback(err);

    // First delete the payment details
    const deletePaymentDetailsQuery = `DELETE FROM DeliveryPaymentDetails WHERE D_deliveryNumber = ?`;
    db.query(deletePaymentDetailsQuery, [deliveryNumber], (err) => {
      if (err) {
        return db.rollback(() => callback(err));
      }

      // Then delete the product details
      const deleteProductDetailsQuery = `DELETE FROM DeliveryProductDetails WHERE D_deliveryNumber = ?`;
      db.query(deleteProductDetailsQuery, [deliveryNumber], (err) => {
        if (err) {
          return db.rollback(() => callback(err));
        }

        // Finally, delete the delivery record
        const deleteDeliveryQuery = `DELETE FROM Deliveries WHERE D_deliveryNumber = ?`;
        db.query(deleteDeliveryQuery, [deliveryNumber], (err, results) => {
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

// =========================
// DELIVERY PAYMENT TYPES
// =========================

// Get all Delivery Payment Types
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

// Add a new Delivery Payment Type
const addDeliveryPaymentType = (statusData, callback) => {
  const { D_paymentName } = statusData;
  const query = `INSERT INTO DeliveryPaymentTypes (D_paymentName) VALUES (?)`;
  db.query(query, [D_paymentName], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results.insertId);
    }
  });
};

// Update an existing Delivery Payment Type
const updateDeliveryPaymentType = (statusId, statusData, callback) => {
  const { D_paymentName } = statusData;
  const query = `UPDATE DeliveryPaymentTypes SET D_paymentName = ? WHERE D_paymentTypeID = ?`;
  db.query(query, [D_paymentName, statusId], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Delete a Delivery Payment Type
const deleteDeliveryPaymentType = (statusId, callback) => {
  const query = `DELETE FROM DeliveryPaymentTypes WHERE D_paymentTypeID = ?`;
  db.query(query, [statusId], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// =========================
// DELIVERY MODE OF PAYMENT
// =========================

// Get all Delivery Mode of Payments
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

// Add a new Delivery Mode of Payment
const addDeliveryModeOfPayment = (statusData, callback) => {
  const { D_mopName } = statusData;
  const query = `INSERT INTO DeliveryModeOfPayment (D_mopName) VALUES (?)`;
  db.query(query, [D_mopName], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results.insertId);
    }
  });
};

// Update an existing Delivery Mode of Payment
const updateDeliveryModeOfPayment = (statusId, statusData, callback) => {
  const { D_mopName } = statusData;
  const query = `UPDATE DeliveryModeOfPayment SET D_mopName = ? WHERE D_modeOfPaymentID = ?`;
  db.query(query, [D_mopName, statusId], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Delete a Delivery Mode of Payment
const deleteDeliveryModeOfPayment = (statusId, callback) => {
  const query = `DELETE FROM DeliveryModeOfPayment WHERE D_modeOfPaymentID = ?`;
  db.query(query, [statusId], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// =========================
// DELIVERY PAYMENT STATUS
// =========================

// Get all Delivery Payment Statuses
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

// Add a new Delivery Payment Status
const addDeliveryPaymentStatus = (data, callback) => {
  const { D_statusName } = data;
  const query = `INSERT INTO DeliveryPaymentStatus (D_statusName) VALUES (?)`;
  db.query(query, [D_statusName], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results.insertId);
    }
  });
};

// Update an existing Delivery Payment Status
const updateDeliveryPaymentStatus = (id, data, callback) => {
  const { D_statusName } = data;
  const query = `UPDATE DeliveryPaymentStatus SET D_statusName = ? WHERE D_paymentStatusID = ?`;
  db.query(query, [D_statusName, id], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Delete a Delivery Payment Status
const deleteDeliveryPaymentStatus = (id, callback) => {
  const query = `DELETE FROM DeliveryPaymentStatus WHERE D_paymentStatusID = ?`;
  db.query(query, [id], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

const addCompleteDelivery = (deliveryData, products, payment, callback) => {
  const { D_deliveryNumber, D_deliveryDate, S_supplierID } = deliveryData;
  
    // Log the incoming payload for debugging
    console.log("addCompleteDelivery payload:", { deliveryData, products, payment });

    // Validate delivery data
    if (!D_deliveryNumber || !D_deliveryDate || !S_supplierID) {
        return callback(new Error("Missing required delivery fields"));
    }

    // Validate products array
    if (!Array.isArray(products) || products.length === 0) {
        return callback(new Error("Products array is required and cannot be empty"));
    }

    // Validate payment details
    if (!payment.D_paymentTypeID || !payment.D_modeOfPaymentID || !payment.D_paymentStatusID || !payment.DPD_dateOfPaymentDue) {
        return callback(new Error("Missing required payment fields"));
    }
  
  // Format dates properly for MySQL if they're provided as strings
  const deliveryDateFormatted = D_deliveryDate instanceof Date ? 
    D_deliveryDate.toISOString().slice(0, 19).replace('T', ' ') : 
    D_deliveryDate;

  if (products && products.length > 0) {
    for (const product of products) {
      const quantity = parseInt(product.DPD_quantity, 10);
      if (isNaN(quantity) || quantity <= 0) {
        return callback(new Error(`Invalid quantity for product ${product.P_productCode}: ${product.DPD_quantity}`));
      }
    }
  }

  // Start a transaction to ensure all or nothing is committed
  db.beginTransaction(err => {
    if (err) return callback(err);

    // Step 1: Insert the delivery header
    const insertDeliveryQuery = `
      INSERT INTO Deliveries (D_deliveryNumber, D_deliveryDate, S_supplierID) 
      VALUES (?, ?, ?)
    `;

    db.query(
      insertDeliveryQuery,
      [D_deliveryNumber, deliveryDateFormatted, S_supplierID],
      (err, deliveryResult) => {
        if (err) {
          return db.rollback(() => callback(err));
        }

        // Step 2: Insert product details if they exist
        if (products && products.length > 0) {
          const insertProductsQuery = `
            INSERT INTO DeliveryProductDetails (D_deliveryNumber, P_productCode, DPD_quantity) 
            VALUES ?
          `;

        const productValues = products.map(product => [
          String(D_deliveryNumber),
          String(product.P_productCode),
          parseInt(product.DPD_quantity, 10)
        ]);

          db.query(insertProductsQuery, [productValues], (err, productResults) => {
            if (err) {
              return db.rollback(() => callback(err));
            }

            // Step 3: Insert payment details if they exist
            if (payment) {
              const { 
                D_paymentTypeID, 
                D_modeOfPaymentID, 
                D_paymentStatusID, 
                DPD_dateOfPaymentDue, 
                DPD_dateOfPayment1, 
                DPD_dateOfPayment2 
              } = payment;

              // Safely convert payment IDs to integers, default to null if invalid
              const paymentTypeID = D_paymentTypeID ? parseInt(D_paymentTypeID, 10) : null;
              const modeOfPaymentID = D_modeOfPaymentID ? parseInt(D_modeOfPaymentID, 10) : null;
              const paymentStatusID = D_paymentStatusID ? parseInt(D_paymentStatusID, 10) : null;

              // Check if any required payment ID is invalid
              if (isNaN(paymentTypeID) || isNaN(modeOfPaymentID) || isNaN(paymentStatusID)) {
                return db.rollback(() => callback(new Error('Invalid payment type, mode, or status ID')));
              }
              
              if (!DPD_dateOfPaymentDue || !DPD_dateOfPayment1) {
                return db.rollback(() => callback(new Error('Payment due date and first payment date are required')));
              }

              const insertPaymentQuery = `
                INSERT INTO DeliveryPaymentDetails 
                (D_deliveryNumber, D_paymentTypeID, D_modeOfPaymentID, D_paymentStatusID, 
                DPD_dateOfPaymentDue, DPD_dateOfPayment1, DPD_dateOfPayment2)
                VALUES (?, ?, ?, ?, ?, ?, ?)
              `;

              db.query(
                insertPaymentQuery, 
                [D_deliveryNumber, paymentTypeID, modeOfPaymentID, paymentStatusID, 
                DPD_dateOfPaymentDue instanceof Date ? DPD_dateOfPaymentDue.toISOString().slice(0, 10) : DPD_dateOfPaymentDue, 
                DPD_dateOfPayment1 instanceof Date ? DPD_dateOfPayment1.toISOString().slice(0, 10) : DPD_dateOfPayment1, 
                DPD_dateOfPayment2 ? (DPD_dateOfPayment2 instanceof Date ? DPD_dateOfPayment2.toISOString().slice(0, 10) : DPD_dateOfPayment2) : null], 
                (err, paymentResults) => {
                  if (err) {
                    return db.rollback(() => callback(err));
                  }

                  // Commit the transaction if everything succeeded
                  db.commit(err => {
                    if (err) {
                      return db.rollback(() => callback(err));
                    }
                    callback(null, {
                      delivery: deliveryResult,
                      products: productResults,
                      payment: paymentResults
                    });
                  });
                }
              );
            } else {
              // No payment details, just commit the transaction
              db.commit(err => {
                if (err) {
                  return db.rollback(() => callback(err));
                }
                callback(null, {
                  delivery: deliveryResult,
                  products: productResults
                });
              });
            }
          });
        } else {
          // No products, commit just the delivery
          db.commit(err => {
            if (err) {
              return db.rollback(() => callback(err));
            }
            callback(null, {
              delivery: deliveryResult
            });
          });
        }
      }
    );
  });
};

module.exports = {
  // Delivery Core Functions
  getAllDeliveries,
  searchDeliveries,
  addDelivery,
  addDeliveryProducts,
  getDeliveryProducts,
  getDeliveryProductsByDeliveryNumber,
  getPaymentDetails,
  updatePaymentDetails,
  deleteDelivery,
  markDeliveryAsDeleted,
  
  // Delivery Payment Types
  getAllDeliveryPaymentTypes,
  addDeliveryPaymentType,
  updateDeliveryPaymentType,
  deleteDeliveryPaymentType,
  
  // Delivery Mode of Payment
  getAllDeliveryModeOfPayments,
  addDeliveryModeOfPayment,
  updateDeliveryModeOfPayment,
  deleteDeliveryModeOfPayment,
  
  // Delivery Payment Status
  getAllDeliveryPaymentStatuses,
  addDeliveryPaymentStatus,
  updateDeliveryPaymentStatus,
  deleteDeliveryPaymentStatus
};