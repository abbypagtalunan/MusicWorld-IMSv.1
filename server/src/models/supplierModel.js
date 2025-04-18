//Where queries are placed
//Connection to database
const db = require('../../db');

// Get all suppliers
const getAllSuppliers = (callback) => {
  // Order by ID then status
  const query = `
        SELECT S_supplierID, S_supplierName, S_supplierStatus 
        FROM Suppliers
        ORDER BY 
          S_supplierID ASC,
          CASE S_supplierStatus
            WHEN 'Active' THEN 1
            WHEN 'Discontinued' THEN 2
            WHEN 'Archived' THEN 3
            ELSE 4
          END
        `;

  // Order by status first then name
  // const query = `
  //       SELECT S_supplierID, S_supplierName, S_supplierStatus 
  //       FROM Suppliers
  //       ORDER BY 
  //         CASE S_supplierStatus
  //           WHEN 'Active' THEN 1
  //           WHEN 'Discontinued' THEN 2
  //           WHEN 'Archived' THEN 3
  //           ELSE 4
  //         END,
  //         S_supplierName ASC;
  // `;
  
  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Add a new supplier
const addSupplier = (supplierData, callback) => {
  const { S_supplierID, S_supplierName, S_supplierStatus } = supplierData;
  const query = `INSERT INTO Suppliers (S_supplierID, S_supplierName, S_supplierStatus) VALUES (?, ?, ?)`;

  db.query(query, [S_supplierID, S_supplierName, S_supplierStatus], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      // Return the id of the newly inserted supplier
      callback(null, results.insertId);
    }
  });
};

// Update an existing supplier
const updateSupplier = (supplierId, supplierData, callback) => {
  const { S_supplierName, S_supplierStatus } = supplierData;
  const query = `
    UPDATE Suppliers
    SET S_supplierName = ?, S_supplierStatus = ?
    WHERE S_supplierID = ?;
  `;

  db.query(query, [S_supplierName, S_supplierStatus, supplierId], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Delete a supplier
const deleteSupplier = (supplierId, callback) => {
  const query = `DELETE FROM Suppliers WHERE S_supplierID = ?`;

  db.query(query, [supplierId], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

module.exports = {
  getAllSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
};
