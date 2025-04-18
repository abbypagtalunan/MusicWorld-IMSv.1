const db = require('../../db');

// Get all Product Statuses
const getAllProductStatus = (callback) => {
  const query = `SELECT P_productStatusID, P_productStatusName FROM ProductStatus ORDER BY P_productStatusID`;

  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Add a new Product Status
const addProductStatus = (statusData, callback) => {
  const { P_productStatusName } = statusData;
  const query = `INSERT INTO ProductStatus (P_productStatusName) VALUES (?)`;

  db.query(query, [P_productStatusName], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results.insertId);
    }
  });
};

// Update an existing Product Status
const updateProductStatus = (statusId, statusData, callback) => {
  const { P_productStatusName } = statusData;
  const query = `
    UPDATE ProductStatus
    SET P_productStatusName = ?
    WHERE P_productStatusID = ?;
  `;

  db.query(query, [P_productStatusName, statusId], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Delete a Product Status
const deleteProductStatus = (statusId, callback) => {
  const query = `DELETE FROM ProductStatus WHERE P_productStatusID = ?`;

  db.query(query, [statusId], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

module.exports = {
  getAllProductStatus,
  addProductStatus,
  updateProductStatus,
  deleteProductStatus,
};
