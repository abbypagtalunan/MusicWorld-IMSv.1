const db = require('../../db');

// Get all Products
const getAllProductStocks = (callback) => {
  const query = `SELECT * FROM ProductStock  `;
  
  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

module.exports = {
    getAllProductStocks,

};