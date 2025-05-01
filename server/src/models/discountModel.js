const db = require('../../db');

// Get all Discounts
const getAllDiscounts = (callback) => {
  const query = `
    SELECT 
      D_productDiscountID,
      D_discountType
    FROM Discounts
    ORDER BY D_discountType ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Add a new Discount
const addDiscount = (discountData, callback) => {
  const { D_discountType } = discountData;
  const query = `
    INSERT INTO Discounts (D_discountType) 
    VALUES (?)
  `;

  db.query(query, [D_discountType], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results.insertId);
    }
  });
};

// Update an existing Discount
const updateDiscount = (discountId, discountData, callback) => {
  const { D_discountType } = discountData;
  const query = `
    UPDATE Discounts
    SET D_discountType = ?
    WHERE D_productDiscountID = ?
  `;

  db.query(query, [D_discountType, discountId], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Delete a Discount
const deleteDiscount = (discountId, callback) => {
  const query = `DELETE FROM Discounts WHERE D_productDiscountID = ?`;

  db.query(query, [discountId], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

module.exports = {
  getAllDiscounts,
  addDiscount,
  updateDiscount,
  deleteDiscount,
};
