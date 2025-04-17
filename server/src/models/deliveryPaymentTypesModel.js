const db = require('../../db');

// Get all Delivery Payment Types
const getAllDeliveryPaymentTypes = (callback) => {
  const query = 'SELECT D_paymentTypeID, D_paymentName FROM DeliveryPaymentTypes';
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
  const query = 'INSERT INTO DeliveryPaymentTypes (D_paymentName) VALUES (?)';
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
  const query = 'UPDATE DeliveryPaymentTypes SET D_paymentName = ? WHERE D_paymentTypeID = ?';
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
  const query = 'DELETE FROM DeliveryPaymentTypes WHERE D_paymentTypeID = ?';
  db.query(query, [statusId], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

module.exports = {
  getAllDeliveryPaymentTypes,
  addDeliveryPaymentType,
  updateDeliveryPaymentType,
  deleteDeliveryPaymentType,
};
