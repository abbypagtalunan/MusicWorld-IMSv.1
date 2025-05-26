// controllers/returnController.js

const db = require('../../db');

// Helper function to get supplier ID by name
const getSupplierIdByName = (supplierName, callback) => {
  const query = 'SELECT S_supplierID FROM Suppliers WHERE S_supplierName = ?';
  db.query(query, [supplierName], (err, results) => {
    if (err) return callback(err, null);
    if (results.length === 0) return callback(new Error(`Supplier "${supplierName}" not found`), null);
    callback(null, results[0].S_supplierID);
  });
};

// Route to fetch all active returns
const getAllReturns = (req, res) => {
  const query = `
    SELECT 
      R_returnID,
      P_productCode,
      R_returnTypeID,
      R_reasonOfReturn,
      R_dateOfReturn,
      R_returnQuantity,
      R_discountAmount,
      R_TotalPrice,
      D_deliveryNumber,
      S_supplierID
    FROM Returns
    WHERE isTemporarilyDeleted = 0;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      return res.status(500).json({ error: 'Error fetching data' });
    }
    res.json(results);
  });
};

// addReturn function to handle adding new return records

const addReturn = (req, res) => {
  const { returnItems } = req.body;

  if (!Array.isArray(returnItems) || returnItems.length === 0) {
    return res.status(400).json({ message: 'No return items provided' });
  }

  // Validate required fields
  for (let item of returnItems) {
    const {
      P_productCode,
      R_returnTypeID,
      R_reasonOfReturn,
      R_dateOfReturn,
      R_returnQuantity,
      R_TotalPrice,
      D_deliveryNumber,
      S_supplierName
    } = item;

    if (
      !P_productCode ||
      !R_returnTypeID ||
      !R_reasonOfReturn ||
      !R_dateOfReturn ||
      !R_returnQuantity ||
      !R_TotalPrice ||
      !D_deliveryNumber ||
      !S_supplierName
    ) {
      return res.status(400).json({
        message: 'Missing required fields in one or more return items'
      });
    }
  }

  const processReturnItems = async () => {
    const values = [];
    const placeholders = [];

    for (let item of returnItems) {
      try {
        // Get Supplier ID
        const supplierId = await new Promise((resolve, reject) => {
          getSupplierIdByName(item.S_supplierName, (err, id) => {
            if (err) reject(err);
            else resolve(id);
          });
        });

        values.push(
          item.P_productCode,
          item.R_returnTypeID,
          item.R_reasonOfReturn,
          item.R_dateOfReturn,
          item.R_returnQuantity,
          item.R_discountAmount || 0,
          item.R_TotalPrice,
          item.D_deliveryNumber,
          supplierId
        );

        placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?, ?)');

        // Only update inventory if return type is 1 ("Stock Return", for example)
        if (item.R_returnTypeID === 1) {
          const updateStockQuery = `
            UPDATE Products 
            SET 
              P_stockNum = P_stockNum + ?,
              P_lastRestockDateTime = CURRENT_TIMESTAMP,
              P_lastEditedDateTime = CURRENT_TIMESTAMP
            WHERE P_productCode = ? AND isDeleted = 0
          `;

          db.query(updateStockQuery, [item.R_returnQuantity, item.P_productCode], (err, result) => {
            if (err) {
              console.error('Error updating stock for product:', item.P_productCode, err);
              return res.status(500).json({ message: 'Failed to update inventory' });
            }

            if (result.affectedRows === 0) {
              console.warn(`Product not found or is deleted: ${item.P_productCode}`);
              // Optionally continue or fail
            }
          });
        }

      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }

    const insertQuery = `
      INSERT INTO Returns (
        P_productCode,
        R_returnTypeID,
        R_reasonOfReturn,
        R_dateOfReturn,
        R_returnQuantity,
        R_discountAmount,
        R_TotalPrice,
        D_deliveryNumber,
        S_supplierID
      ) VALUES ${placeholders.join(',')}
    `;

    db.query(insertQuery, values, (err, results) => {
      if (err) {
        console.error('Error inserting returns:', err);
        return res.status(500).json({ message: 'Error inserting returns' });
      }

      res.status(201).json({
        message: 'Returns added successfully',
        insertId: results.insertId,
        affectedRows: results.affectedRows
      });
    });
  };

  processReturnItems();
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

  const getProductPrice = (callback) => {
    const query = 'SELECT P_sellingPrice FROM Products WHERE P_productCode = ?';
    db.query(query, [P_productCode], (err, results) => {
      if (err) return callback(err);
      if (results.length === 0) return callback(new Error('Product not found'));
      callback(null, results[0].P_sellingPrice);
    });
  };

  getProductPrice((err, productPrice) => {
    if (err) {
      console.error('Error fetching product price:', err);
      return res.status(500).json({ message: 'Error calculating total price' });
    }

    const baseTotal = productPrice * R_returnQuantity;
    const discountedTotal = baseTotal * (1 - (R_discountAmount || 0) / 100);

    const updateQuery = `
      UPDATE Returns SET
        P_productCode = ?,
        R_returnTypeID = ?,
        R_reasonOfReturn = ?,
        R_dateOfReturn = ?,
        R_returnQuantity = ?,
        R_discountAmount = ?,
        R_TotalPrice = ?,
        D_deliveryNumber = ?,
        S_supplierID = ?
      WHERE R_returnID = ?
    `;

    db.query(
      updateQuery,
      [
        P_productCode,
        R_returnTypeID,
        R_reasonOfReturn,
        R_dateOfReturn,
        R_returnQuantity,
        R_discountAmount,
        discountedTotal,
        D_deliveryNumber,
        S_supplierID,
        returnID
      ],
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
  });
};

// Route to soft-delete a return record
const deleteReturn = (req, res) => {
  const returnID = req.params.id;
  const { adminPW } = req.body;

  if (!adminPW) {
    return res.status(400).json({ message: "Password is required" });
  }

  const query = `SELECT * FROM UserAccounts WHERE roleID = 1 AND password = ?`;
  db.query(query, [adminPW], (err, results) => {
    if (err) {
      console.error('Error checking admin credentials:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(403).json({ message: "Invalid admin credentials" });
    }

    const softDeleteQuery = `UPDATE Returns SET isTemporarilyDeleted = 1 WHERE R_returnID = ?`;
    db.query(softDeleteQuery, [returnID], (err, results) => {
      if (err) {
        console.error('Error soft-deleting return:', err);
        return res.status(500).json({ message: 'Error deleting return' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Return not found' });
      }

      res.status(200).json({ message: 'Return marked as deleted successfully' });
    });
  });
};

module.exports = {
  getAllReturns,
  addReturn,
  updateReturn,
  deleteReturn
};