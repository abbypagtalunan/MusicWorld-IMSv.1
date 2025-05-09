const deletedOrdersModel = require('../models/deletedOrdersModel'); // Import the product model

// Route to fetch all products
const getAllDeleted = (req, res) => {

  // Access the getAllProducts method or query
  deletedOrdersModel.getAllDeleted((err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

const retrieveDeleted = (req, res) => {
  const orderID = req.params.id;

  deletedOrdersModel.retrieveDeleted(orderID, (err, results) => {
    if (err) {
      console.error('Error retrieving transaction:', err);
      res.status(500).json({ message: 'Error retrieving transaction', results });
    } else {
      res.status(200).json({ message: 'Transaction retrieved successfully', results });
    }
  });
}

const deleteDeleted = (req, res) => {
    const orderID = req.params.id;
    const { adminPW } = req.body;

    if (adminPW !== "1234") {
      return res.status(403).json({ message: "Invalid admin password" });
    }
  
    deletedOrdersModel.deletePermanently(orderID, (err, results) => {
      if (err) {
        console.error('Error deleting transaction:', err);
        res.status(500).json({ message: 'Error deleting transaction', results });
      } else {
        res.status(200).json({ message: 'Transaction deleted successfully', results });
      }
    });
  };

module.exports = {
    getAllDeleted,
    retrieveDeleted,
    deleteDeleted,
};