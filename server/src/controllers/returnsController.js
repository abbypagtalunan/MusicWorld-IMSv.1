const returnModel = require('../models/returnsModel'); // Import the return model

// Route to fetch all returns
const getAllReturns = (req, res) => {
  // Access the getAllReturns method from the return model
  returnModel.getAllReturns((err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

// Route to add a new return
const addReturn = (req, res) => {
  const { P_productCode, R_returnTypeID, R_reasonOfReturn, R_dateOfReturn, R_returnQuantity, R_discountAmount } = req.body;

  // Validate required fields
  if (!P_productCode || !R_returnTypeID || !R_reasonOfReturn || !R_dateOfReturn || !R_returnQuantity) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Call the addReturn method from the return model
  returnModel.addReturn(
    { P_productCode, R_returnTypeID, R_reasonOfReturn, R_dateOfReturn, R_returnQuantity, R_discountAmount },
    (err, returnId) => {
      if (err) {
        console.error('Error inserting return:', err);
        res.status(500).json({ message: 'Error inserting return' });
      } else {
        res.status(201).json({ message: 'Return added successfully', id: returnId });
      }
    }
  );
};

// Route to update a return record
const updateReturn = (req, res) => {
  const returnID = req.params.id; // Extract return ID from the URL parameter
  const { P_productCode, R_returnTypeID, R_reasonOfReturn, R_dateOfReturn, R_returnQuantity, R_discountAmount } = req.body;

  // Validate required fields
  if (!P_productCode || !R_returnTypeID || !R_reasonOfReturn || !R_dateOfReturn || !R_returnQuantity) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Call the updateReturn method from the return model
  returnModel.updateReturn(
    returnID,
    { P_productCode, R_returnTypeID, R_reasonOfReturn, R_dateOfReturn, R_returnQuantity, R_discountAmount },
    (err, results) => {
      if (err) {
        console.error('Error updating return:', err);
        return res.status(500).json({ message: 'Error updating return' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Return not found' });
      }
      res.status(200).json({ message: 'Return updated successfully' });
    }
  );
};

// Route to delete a return record
const deleteReturn = (req, res) => {
  const returnID = req.params.id; // Extract return ID from the URL parameter
  const { adminPW } = req.body;

  // Validate admin password
  if (adminPW !== "2095") {
    return res.status(403).json({ message: "Invalid admin password" });
  }

  // Call the deleteReturn method from the return model
  returnModel.deleteReturn(returnID, (err, results) => {
    if (err) {
      console.error('Error deleting return:', err);
      res.status(500).json({ message: 'Error deleting return', results });
    } else {
      res.status(200).json({ message: 'Return deleted successfully', results });
    }
  });
};

module.exports = {
  getAllReturns,
  addReturn,
  updateReturn,
  deleteReturn,
};