const db = require('../../db');

// Get all SupBrdCatStatus types
const getAllSBCS = (callback) => {
  const query = `SELECT SupBrdCatStatusID, SupBrdCatStatusName FROM SupBrdCatStatus ORDER BY SupBrdCatStatusID`;
  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Add a new SupBrdCatStatus type
const addSBCS = (data, callback) => {
  const { SupBrdCatStatusName } = data;
  const query = `INSERT INTO SupBrdCatStatus (SupBrdCatStatusName) VALUES (?)`;
  db.query(query, [SupBrdCatStatusName], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results.insertId);
    }
  });
};

// Update an existing SupBrdCatStatus type
const updateSBCS = (id, data, callback) => {
  const { SupBrdCatStatusName } = data;
  const query = `UPDATE SupBrdCatStatus SET SupBrdCatStatusName = ? WHERE SupBrdCatStatusID = ?`;
  db.query(query, [SupBrdCatStatusName, id], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Delete a SupBrdCatStatus type
const deleteSBCS = (id, callback) => {
  const query = `DELETE FROM SupBrdCatStatus WHERE SupBrdCatStatusID = ?`;
  db.query(query, [id], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

module.exports = {
  getAllSBCS,
  addSBCS,
  updateSBCS,
  deleteSBCS,
};
