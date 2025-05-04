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

const deleteDeleted = (req, res) => {
    const transactionID = req.params.id;
    const { adminPW } = req.body;

    if (adminPW !== "1234") {
      return res.status(403).json({ message: "Invalid admin password" });
    }
  
    deletedModel.deletePermanently(transactionID, (err, results) => {
      if (err) {
        console.error('Error deleting transaction:', err);
        res.status(500).json({ message: 'Error deleting transaction', results });
      } else {
        res.status(200).json({ message: 'transaction deleted successfully', results });
      }
    });
  };

module.exports = {
    getAllDeleted,
    deleteDeleted,
};