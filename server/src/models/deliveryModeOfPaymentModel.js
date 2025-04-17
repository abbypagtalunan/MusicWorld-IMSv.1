const db = require('../../db');

// Get all Delivery Mode of Payments
const getAllDeliveryModeOfPayments = (callback) => {
  const query = 'SELECT D_modeOfPaymentID, D_mopName FROM DeliveryModeOfPayment';
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
  const query = 'INSERT INTO DeliveryModeOfPayment (D_mopName) VALUES (?)';
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
  const query = 'UPDATE DeliveryModeOfPayment SET D_mopName = ? WHERE D_modeOfPaymentID = ?';
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
  const query = 'DELETE FROM DeliveryModeOfPayment WHERE D_modeOfPaymentID = ?';
  db.query(query, [statusId], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

module.exports = {
  getAllDeliveryModeOfPayments,
  addDeliveryModeOfPayment,
  updateDeliveryModeOfPayment,
  deleteDeliveryModeOfPayment,
};
