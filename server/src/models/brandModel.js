const db = require('../../db');

// Get all Brands
const getAllBrands = (callback) => {
  const query = 'SELECT B_brandID, B_brandName, B_brandStatus FROM Brands';
  
  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Add a new Brand
const addBrand = (brandData, callback) => {
  const { B_brandID, B_brandName, B_brandStatus } = brandData;
  const query = 'INSERT INTO Brands (B_brandID, B_brandName, B_brandStatus) VALUES (?, ?, ?)';

  db.query(query, [B_brandID, B_brandName, B_brandStatus], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      // Return the id of the newly inserted brand
      callback(null, results.insertId);
    }
  });
};

// Update an existing brand
const updateBrand = (brandId, brandData, callback) => {
  const { B_brandName, B_brandStatus } = brandData;
  const query = `
    UPDATE Brands
    SET B_brandName = ?, B_brandStatus = ?
    WHERE B_brandID = ?;
  `;

  db.query(query, [B_brandName, B_brandStatus, brandId], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Delete a Brand
const deleteBrand = (brandId, callback) => {
  const query = 'DELETE FROM Brands WHERE B_brandID = ?';

  db.query(query, [brandId], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

module.exports = {
  getAllBrands,
  addBrand,
  updateBrand,
  deleteBrand,
};
