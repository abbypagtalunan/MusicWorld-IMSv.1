const db = require('../../db');

// Add this to the bottom of returnTypeController.js
const getOrCreateReturnTypeID = (req, res) => {
  const { RT_returnTypeDescription } = req.body;

  if (!RT_returnTypeDescription) {
    return res.status(400).json({ message: 'Description is required' });
  }

  const selectQuery = `
    SELECT RT_returnTypeID FROM ReturnTypes WHERE RT_returnTypeDescription = ?
  `;
  const insertQuery = `
    INSERT INTO ReturnTypes (RT_returnTypeDescription) VALUES (?)
  `;

  db.query(selectQuery, [RT_returnTypeDescription], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error checking return type' });

    if (results.length > 0) {
      return res.status(200).json({ RT_returnTypeID: results[0].RT_returnTypeID });
    }

    db.query(insertQuery, [RT_returnTypeDescription], (err, insertResult) => {
      if (err) return res.status(500).json({ error: 'Error inserting return type' });
      res.status(201).json({ RT_returnTypeID: insertResult.insertId });
    });
  });
};

module.exports = {
  getAllReturnTypes,
  addReturnType,
  updateReturnType,
  deleteReturnType,
  getOrCreateReturnTypeID, // 👈 Add this to exports
};
