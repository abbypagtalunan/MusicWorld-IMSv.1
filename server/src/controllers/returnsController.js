const returnModel = require('../models/returnsModel');
const { getOrCreateReturnTypeId } = require('./returnTypeController');

// Route to fetch all active returns
const getAllReturns = (req, res) => {
  returnModel.getAllActiveReturns((err, results) => {
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
  const {
    P_productCode,
    returnTypeDescription,
    R_reasonOfReturn,
    R_dateOfReturn,
    R_returnQuantity,
    R_discountAmount,
    D_deliveryNumber,
    S_supplierID
  } = req.body;

  // Validate required fields
  if (!P_productCode || !returnTypeDescription || !R_reasonOfReturn || !R_dateOfReturn || !R_returnQuantity || !D_deliveryNumber || !S_supplierID) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Get or create return type ID
  getOrCreateReturnTypeId(returnTypeDescription, (err, RT_returnTypeID) => {
    if (err) {
      console.error('Error getting or creating return type:', err);
      return res.status(500).json({ message: 'Error processing return type' });
    }

    // Calculate total price based on product selling price * quantity * discount
    // In a real application, you would need to fetch the product's selling price from the database
    const getProductPrice = () => {
      // This should be replaced with an actual database query to get the product's selling price
      return 100; // Example price
    };

    const baseTotal = getProductPrice() * R_returnQuantity;
    const discountedTotal = baseTotal * (1 - R_discountAmount / 100); // Assuming R_discountAmount is in percentage

    returnModel.addReturn(
      {
        P_productCode,
        R_returnTypeID: RT_returnTypeID,
        R_reasonOfReturn,
        R_dateOfReturn,
        R_returnQuantity,
        R_discountAmount: R_discountAmount || 0,
        R_TotalPrice: discountedTotal,
        D_deliveryNumber,
        S_supplierID
      },
      (err, results) => {
        if (err) {
          console.error('Error inserting return:', err);
          return res.status(500).json({ message: 'Error inserting return' });
        }
        res.status(201).json({ message: 'Return added successfully', id: results.insertId });
      }
    );
  });
};

// Route to update a return record
const updateReturn = (req, res) => {
  const returnID = req.params.id;
  const {
    P_productCode,
    R_returnTypeID,
    R_reasonOfReturn,
    R_dateOfReturn,
    R_returnQuantity,
    R_discountAmount,
    D_deliveryNumber,
    S_supplierID
  } = req.body;

  if (!P_productCode || !R_returnTypeID || !R_reasonOfReturn || !R_dateOfReturn || !R_returnQuantity) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Calculate total price based on product selling price * quantity * discount
  const getProductPrice = () => {
    // This should be replaced with an actual database query to get the product's selling price
    return 100; // Example price
  };

  const baseTotal = getProductPrice() * R_returnQuantity;
  const discountedTotal = baseTotal * (1 - (R_discountAmount || 0) / 100); // Assuming R_discountAmount is in percentage

  returnModel.updateReturn(
    returnID,
    {
      P_productCode,
      R_returnTypeID,
      R_reasonOfReturn,
      R_dateOfReturn,
      R_returnQuantity,
      R_discountAmount: R_discountAmount || 0,
      R_TotalPrice: discountedTotal,
      D_deliveryNumber,
      S_supplierID
    },
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

// Route to soft-delete a return record
const deleteReturn = (req, res) => {
  const returnID = req.params.id;
  const { adminPW } = req.body;

  if (adminPW !== "2095") {
    return res.status(403).json({ message: "Invalid admin password" });
  }

  returnModel.softDeleteReturn(returnID, (err, results) => {
    if (err) {
      console.error('Error soft-deleting return:', err);
      res.status(500).json({ message: 'Error deleting return' });
    } else {
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Return not found' });
      }
      res.status(200).json({ message: 'Return marked as deleted successfully' });
    }
  });
};

module.exports = {
  getAllReturns,
  addReturn,
  updateReturn,
  deleteReturn
};