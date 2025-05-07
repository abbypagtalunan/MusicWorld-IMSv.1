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
  const { P_productCode, C_categoryID, P_productName, B_brandID, S_supplierID, P_stockNum, P_lastRestockDateTime, P_unitPrice, P_sellingPrice, P_productStatusID = 1, P_dateAdded } = req.body;
  if (!P_productCode || !P_productName ) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  productModel.addProduct({ P_productCode, C_categoryID, P_productName, B_brandID, S_supplierID, P_stockNum, P_lastRestockDateTime, P_unitPrice, P_sellingPrice, P_productStatusID, P_dateAdded }, (err, productId) => {
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
  const { C_categoryID, P_productName, B_brandID, S_supplierID, P_stockNum, P_lastRestockDateTime, P_unitPrice, P_sellingPrice, P_productStatusID } = req.body; // Get the new data from the request body

  productModel.updateProduct(productCode, { C_categoryID, P_productName, B_brandID, S_supplierID, P_stockNum, P_lastRestockDateTime, P_unitPrice, P_sellingPrice, P_productStatusID }, (err, results) => {
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

const updateProductPrice = (req, res) => {
  const { productCode } = req.params;
  const { P_sellingPrice } = req.body;

  const productData = {
    productCode,
    P_sellingPrice,
  };

  productModel.updateProductPrice(productData, (err, results) => {
    if (err) {
      console.error('Error updating product price:', err);
      return res.status(500).json({ message: 'Error updating product price' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product price updated successfully' });
  });
};

// Route to delete a product
const deleteProduct = (req, res) => {
  const productCode = req.params.id;
  const { adminPW } = req.body;

  if (!adminPW || adminPW !== "1234") {
    return res.status(403).json({ message: "Invalid admin password" });
  }

  productModel.deleteProduct(productCode, (err, results) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ 
        message: 'Error deleting product',
        error: err.message 
      });
    }
    if (!results || results.affectedRows === 0) {
      return res.status(404).json({ 
        message: 'Product not found or already deleted' 
      });
    }
    res.status(200).json({ 
      message: 'Product deleted successfully',
      affectedRows: results.affectedRows 
    });
  });
};

module.exports = {
    getAllProducts,
    addProduct,
    updateProduct,
    updateProductPrice,
    deleteProduct,
};