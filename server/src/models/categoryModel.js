const db = require('../../db');

// Get all Categories
const getAllCategories = (callback) => {
  const query = 'SELECT C_categoryID, C_categoryName, C_categoryStatus FROM Categories';
  
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
  const { C_categoryID, C_categoryName, C_categoryStatus } = categoryData;
  const query = 'INSERT INTO Categories (C_categoryID, C_categoryName, C_categoryStatus) VALUES (?, ?, ?)';

  db.query(query, [C_categoryID, C_categoryName, C_categoryStatus], (err, results) => {
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
  const { C_categoryName, C_categoryStatus } = categoryData;
  const query = `
    UPDATE Categories
    SET C_categoryName = ?, C_categoryStatus = ?
    WHERE C_categoryID = ?;
  `;

  db.query(query, [C_categoryName, C_categoryStatus, categoryId], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Delete a category
const deleteCategory = (categoryId, callback) => {
  const query = 'DELETE FROM Categories WHERE C_categoryID = ?';

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
