const productModel = require('../models/productModel'); // Import the product model

// Route to fetch all products
const getAllProducts = (req, res) => {

  // Access the getAllProducts method or query
  productModel.getAllProducts((err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

// Route to add a new product
const addProduct = (req, res) => {
  const { P_productCode, P_productName, P_quantity, P_unitPrice, P_sellingPrice, P_dateAdded, P_productStatus, S_supplierID, B_brandID, C_categoryID } = req.body;
  if (!P_productCode || !P_productName || !P_productStatus) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  productModel.addProduct({ P_productCode, P_productName, P_quantity, P_unitPrice, P_sellingPrice, P_dateAdded, P_productStatus, S_supplierID, B_brandID, C_categoryID }, (err, productId) => {
    if (err) {
      console.error('Error inserting product:', err);
      res.status(500).json({ message: 'Error inserting product' });
    } else {
      res.status(201).json({ message: 'Product added successfully', id: productId });
    }
  });
};

// Route to update product details
const updateProduct = (req, res) => {
  const productCode = req.params.id;  // Extract product ID from the URL parameter
  const { P_productName, P_quantity, P_unitPrice, P_sellingPrice, P_productStatus, S_supplierID, B_brandID, C_categoryID } = req.body; // Get the new data from the request body

  if (!P_productName || !P_quantity || !P_unitPrice || !P_sellingPrice || !P_productStatus || !S_supplierID || !B_brandID || !C_categoryID) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  productModel.updateProduct(productCode, { P_productName, P_productStatus }, (err, results) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ message: 'Error updating product' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product updated successfully' });
  });
};

// Route to delete a product
const deleteProduct = (req, res) => {
  const productCode = req.params.id;
  productModel.deleteProduct(productCode, (err, results) => {
    if (err) {
      console.error('Error deleting product:', err);
      res.status(500).json({ message: 'Error deleting product', results });
    } else {
      res.status(200).json({ message: 'product deleted successfully', results });
    }
  });
};

module.exports = {
    getAllProducts,
    addProduct,
    updateProduct,
    deleteProduct,
};