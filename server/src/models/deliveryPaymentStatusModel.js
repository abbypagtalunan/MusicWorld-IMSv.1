const db = require('../../db');

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

module.exports = {
  getAllDeliveryPaymentStatuses,
  addDeliveryPaymentStatus,
  updateDeliveryPaymentStatus,
  deleteDeliveryPaymentStatus,
};
