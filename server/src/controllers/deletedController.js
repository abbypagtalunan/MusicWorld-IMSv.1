const deletedModel = require('../models/deletedModel'); // Import the product model

// Route to fetch all products
const getAllDeleted = (req, res) => {

  // Access the getAllProducts method or query
  deletedModel.getAllDeleted((err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

module.exports = {
    getAllDeleted,
};