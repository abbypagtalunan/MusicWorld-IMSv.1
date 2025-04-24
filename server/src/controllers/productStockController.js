const productModel = require('../models/productStockModel'); // Import the product model

// Route to fetch all products
const getAllProductStocks = (req, res) => {

  // Access the getAllProducts method or query
  productModel.getAllProductStocks((err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

module.exports = {
    getAllProductStocks,
};