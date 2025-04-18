const db = require('../../db');

// Get all Brands
const getAllBrands = (callback) => {
  const query = `
        SELECT 
          b.B_brandID, 
          b.B_brandName, 
          st.SupBrdCatStatusName AS B_brandStatus
        FROM Brands b
        JOIN SupBrdCatStatus st ON b.B_brandStatusID = st.SupBrdCatStatusID
        ORDER BY 
          CASE st.SupBrdCatStatusName
            WHEN 'Active' THEN 1
            WHEN 'Discontinued' THEN 2
            WHEN 'Archived' THEN 3
            ELSE 4
          END,
          b.B_brandName ASC
      `;

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
  const { B_brandID, B_brandName, B_brandStatusID } = brandData;
  const query = `INSERT INTO Brands (B_brandID, B_brandName, B_brandStatusID) VALUES (?, ?, ?)`;

  db.query(query, [B_brandID, B_brandName, B_brandStatusID], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results.insertId);
    }
  });
};

// Update an existing brand
const updateBrand = (brandId, brandData, callback) => {
  const { B_brandName, B_brandStatusID } = brandData;
  const query = `
    UPDATE Brands
    SET B_brandName = ?, B_brandStatusID = ?
    WHERE B_brandID = ?;
  `;

  db.query(query, [B_brandName, B_brandStatusID, brandId], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Delete a Brand
const deleteBrand = (brandId, callback) => {
  const query = `DELETE FROM Brands WHERE B_brandID = ?`;

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
