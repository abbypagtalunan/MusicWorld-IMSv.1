const categoryModel = require('../models/categoryModel'); // Import the category model

// Route to fetch all Categories
const getAllCategories = (req, res) => {

  // Access the getAllCategories method or query
  categoryModel.getAllCategories((err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

// Route to add a new category
const addCategory = (req, res) => {
  const { C_categoryID, C_categoryName, C_categoryStatus } = req.body;
  if (!C_categoryID || !C_categoryName || !C_categoryStatus) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  categoryModel.addCategory({ C_categoryID, C_categoryName, C_categoryStatus }, (err, categoryId) => {
    if (err) {
      console.error('Error inserting category:', err);
      res.status(500).json({ message: 'Error inserting category' });
    } else {
      res.status(201).json({ message: 'category added successfully', id: categoryId });
    }
  });
};

// Route to update category details
const updateCategory = (req, res) => {
  const categoryId = req.params.id;  // Extract category ID from the URL parameter
  const { C_categoryName, C_categoryStatus } = req.body; // Get the new data from the request body

  if (!C_categoryName || !C_categoryStatus) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  categoryModel.updateCategory(categoryId, { C_categoryName, C_categoryStatus }, (err, results) => {
    if (err) {
      console.error('Error updating category:', err);
      return res.status(500).json({ message: 'Error updating category' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category updated successfully' });
  });
};

// Route to delete a category
const deleteCategory = (req, res) => {
  const categoryId = req.params.id;
  categoryModel.deleteCategory(categoryId, (err, results) => {
    if (err) {
      console.error('Error deleting category:', err);
      res.status(500).json({ message: 'Error deleting category', results });
    } else {
      res.status(200).json({ message: 'category deleted successfully', results });
    }
  });
};

module.exports = {
    getAllCategories,
    addCategory,
    updateCategory,
    deleteCategory,
};
