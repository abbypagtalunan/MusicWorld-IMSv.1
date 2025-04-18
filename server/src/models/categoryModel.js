const db = require('../../db');

// Get all Categories
const getAllCategories = (callback) => {
  const query = `
        SELECT 
          c.C_categoryID, 
          c.C_categoryName, 
          st.SupBrdCatStatusName AS C_categoryStatus
        FROM Categories c
        JOIN SupBrdCatStatus st ON c.C_categoryStatusID = st.SupBrdCatStatusID
        ORDER BY 
          CASE st.SupBrdCatStatusName
            WHEN 'Active' THEN 1
            WHEN 'Discontinued' THEN 2
            WHEN 'Archived' THEN 3
            ELSE 4
          END,
          c.C_categoryName ASC
      `;

  
  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Add a new category
const addCategory = (categoryData, callback) => {
  const { C_categoryID, C_categoryName, C_categoryStatusID } = categoryData;
  const query = `INSERT INTO Categories (C_categoryID, C_categoryName, C_categoryStatusID) VALUES (?, ?, ?)`;

  db.query(query, [C_categoryID, C_categoryName, C_categoryStatusID], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      // Return the id of the newly inserted category
      callback(null, results.insertId);
    }
  });
};

// Update an existing category
const updateCategory = (categoryId, categoryData, callback) => {
  const { C_categoryName, C_categoryStatusID } = categoryData;
  const query = `
    UPDATE Categories
    SET C_categoryName = ?, C_categoryStatusID = ?
    WHERE C_categoryID = ?;
  `;

  db.query(query, [C_categoryName, C_categoryStatusID, categoryId], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Delete a category
const deleteCategory = (categoryId, callback) => {
  const query = `DELETE FROM Categories WHERE C_categoryID = ?`;

  db.query(query, [categoryId], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

module.exports = {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
};
