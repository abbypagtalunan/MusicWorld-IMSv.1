const returnModel = require('../models/returnsModel');
const { getOrCreateReturnTypeId } = require('./returnTypeController');

// Fetch all returns with type filter (customer/supplier)
const getAllReturns = (req, res) => {
  const typeFilter = req.query.type; // e.g., ?type=customer or ?type=supplier

  let query = `
    SELECT 
      R_returnID,
      P_productCode,
      R_returnTypeID,
      R_reasonOfReturn,
      R_dateOfReturn,
      R_returnQuantity,
      R_discountAmount,
      D_deliveryNumber,
      S_supplierID
    FROM Returns
  `;

  if (typeFilter === 'customer') {
    query += " WHERE R_returnTypeID IN (SELECT RT_returnTypeID FROM ReturnTypes WHERE returnTypeDescription LIKE '%Customer%')";
  } else if (typeFilter === 'supplier') {
    query += " WHERE R_returnTypeID IN (SELECT RT_returnTypeID FROM ReturnTypes WHERE returnTypeDescription LIKE '%Supplier%')";
  }

  returnModel.getAllReturnsCustomQuery(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

// Add new return
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
  if (!P_productCode || !returnTypeDescription || !R_reasonOfReturn || !R_dateOfReturn || !R_returnQuantity || !R_discountAmount || !D_deliveryNumber || !S_supplierID) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  getOrCreateReturnTypeId(returnTypeDescription, (err, RT_returnTypeID) => {
    if (err) {
      console.error('Error getting or creating return type:', err);
      return res.status(500).json({ message: 'Error processing return type' });
    }

    const insertReturnQuery = `
      INSERT INTO Returns (
        P_productCode, R_returnTypeID, R_reasonOfReturn, R_dateOfReturn,
        R_returnQuantity, R_discountAmount, D_deliveryNumber, S_supplierID
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    returnModel.addReturn(
      {
        P_productCode,
        R_returnTypeID: RT_returnTypeID,
        R_reasonOfReturn,
        R_dateOfReturn,
        R_returnQuantity,
        R_discountAmount,
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

// Update an existing return
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

  returnModel.updateReturn(
    returnID,
    {
      P_productCode,
      R_returnTypeID,
      R_reasonOfReturn,
      R_dateOfReturn,
      R_returnQuantity,
      R_discountAmount,
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

// Delete a return
const deleteReturn = (req, res) => {
  const returnID = req.params.id;
  const { adminPW } = req.body;

  if (adminPW !== "2095") {
    return res.status(403).json({ message: "Invalid admin password" });
  }

  returnModel.deleteReturn(returnID, (err, results) => {
    if (err) {
      console.error('Error deleting return:', err);
      res.status(500).json({ message: 'Error deleting return' });
    } else {
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Return not found' });
      }
      res.status(200).json({ message: 'Return deleted successfully' });
    }
  });
};

module.exports = {
  getAllReturns,
  addReturn,
  updateReturn,
  deleteReturn,
};