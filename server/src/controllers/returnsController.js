const db = require('./db');

// ====================== RETURNS =======================

// Fetch all returns
exports.getAllReturns = (req, res) => {
  const query = `SELECT * FROM Returns ORDER BY R_returnID DESC`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching returns' });
    res.json(results);
  });
};

// Add a return
exports.addReturn = (req, res) => {
  const {
    P_productCode, R_returnTypeID, R_reasonOfReturn,
    R_dateOfReturn, R_returnQuantity, R_discountAmount, R_totalPrice
  } = req.body;

  if (!P_productCode || !R_returnTypeID) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const query = `
    INSERT INTO Returns 
    (P_productCode, R_returnTypeID, R_reasonOfReturn, R_dateOfReturn, R_returnQuantity, R_discountAmount, R_totalPrice)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [
    P_productCode, R_returnTypeID, R_reasonOfReturn,
    R_dateOfReturn, R_returnQuantity, R_discountAmount, R_totalPrice
  ], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error inserting return' });
    res.status(201).json({ message: 'Return added', id: results.insertId });
  });
};

// Update a return
exports.updateReturn = (req, res) => {
  const id = req.params.id;
  const {
    P_productCode, R_returnTypeID, R_reasonOfReturn,
    R_dateOfReturn, R_returnQuantity, R_discountAmount, R_totalPrice
  } = req.body;

  const query = `
    UPDATE Returns SET
    P_productCode = ?, R_returnTypeID = ?, R_reasonOfReturn = ?, R_dateOfReturn = ?,
    R_returnQuantity = ?, R_discountAmount = ?, R_totalPrice = ?
    WHERE R_returnID = ?`;

  db.query(query, [
    P_productCode, R_returnTypeID, R_reasonOfReturn, R_dateOfReturn,
    R_returnQuantity, R_discountAmount, R_totalPrice, id
  ], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error updating return' });
    res.json({ message: 'Return updated' });
  });
};

// Delete a return
exports.deleteReturn = (req, res) => {
  const id = req.params.id;
  const query = `DELETE FROM Returns WHERE R_returnID = ?`;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error deleting return' });
    res.json({ message: 'Return deleted' });
  });
};