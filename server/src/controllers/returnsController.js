const db = require('../db');

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


// ====================== RETURN TYPES =======================

exports.getAllReturnTypes = (req, res) => {
  const query = `SELECT * FROM ReturnTypes ORDER BY RT_returnTypeID`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error fetching return types' });
    res.json(results);
  });
};

exports.addReturnType = (req, res) => {
  const { RT_returnTypeDescription } = req.body;
  if (!RT_returnTypeDescription) {
    return res.status(400).json({ message: 'Missing return type description' });
  }

  const query = `INSERT INTO ReturnTypes (RT_returnTypeDescription) VALUES (?)`;
  db.query(query, [RT_returnTypeDescription], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error adding return type' });
    res.status(201).json({ message: 'Return type added', id: results.insertId });
  });
};

exports.updateReturnType = (req, res) => {
  const id = req.params.id;
  const { RT_returnTypeDescription } = req.body;
  if (!RT_returnTypeDescription) {
    return res.status(400).json({ message: 'Missing return type description' });
  }

  const query = `UPDATE ReturnTypes SET RT_returnTypeDescription = ? WHERE RT_returnTypeID = ?`;
  db.query(query, [RT_returnTypeDescription, id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error updating return type' });
    res.json({ message: 'Return type updated' });
  });
};

exports.deleteReturnType = (req, res) => {
  const id = req.params.id;
  const query = `DELETE FROM ReturnTypes WHERE RT_returnTypeID = ?`;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error deleting return type' });
    res.json({ message: 'Return type deleted' });
  });
};

exports.addReturn = (req, res) => {
    const {
      P_productCode, R_returnTypeID, R_reasonOfReturn,
      R_dateOfReturn, R_returnQuantity, R_discountAmount, R_totalPrice
    } = req.body;
  
    const query = `
      INSERT INTO Returns 
      (P_productCode, R_returnTypeID, R_reasonOfReturn, R_dateOfReturn, R_returnQuantity, R_discountAmount, R_totalPrice)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
    db.query(query, [
      P_productCode, R_returnTypeID, R_reasonOfReturn, R_dateOfReturn,
      R_returnQuantity, R_discountAmount, R_totalPrice
    ], (err, results) => {
      if (err) return res.status(500).json({ message: 'Error inserting return', error: err });
      res.status(201).json({ message: 'Return added', id: results.insertId });
    });
  };
  