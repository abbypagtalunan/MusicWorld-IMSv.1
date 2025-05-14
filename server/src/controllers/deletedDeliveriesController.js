const deletedDeliveriesModel = require('../models/deletedDeliveriesModel'); 
const db = require('../../db');

// Route to fetch all products
const getAllDeleted = (req, res) => {

  // Access the getAllProducts method or query
  deletedDeliveriesModel.getAllDeleted((err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

const retrieveDeleted = (req, res) => {
  const deliveryNumber = req.params.id;

  deletedDeliveriesModel.retrieveDeleted(deliveryNumber, (err, results) => {
    if (err) {
      console.error('Error retrieving transaction:', err);
      res.status(500).json({ message: 'Error retrieving transaction', results });
    } else {
      res.status(200).json({ message: 'Transaction retrieved successfully', results });
    }
  });
}

const deleteDeleted = (req, res) => {
  const deliveryNumber = req.params.id;
  const { adminPW } = req.body;

  if (!adminPW) {
    return res.status(403).json({ message: "Invalid admin password" });
  }
    
  const query = `
    SELECT * FROM UserAccounts 
    WHERE roleID = 1 AND password = ? 
  `;

  db.query(query, [adminPW], (err, results) => {
    if (err) {
      console.error('Error checking admin credentials:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    console.log('Admin lookup result:', results);

    if (results.length === 0) {
      return res.status(403).json({ message: "Invalid admin credentials" });
    }

    deletedDeliveriesModel.deletePermanently(deliveryNumber, (err, results) => {
      if (err) {
        console.error('Error deleting transaction:', err);
        res.status(500).json({ message: 'Error deleting transaction', results });
      } else {
        res.status(200).json({ message: 'transaction deleted successfully', results });
      }
    });
  })
};

module.exports = {
    getAllDeleted,
    retrieveDeleted,
    deleteDeleted,
};