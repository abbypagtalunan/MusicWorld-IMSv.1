const db = require('../../db');

// Get all OrderDetails with product name, discount type, and computed total
const getAllOrderDetails = (callback) => {
  const query = `
    SELECT 
      od.OD_detailID,
      od.O_orderID,
      od.P_productCode,
      p.P_productName,
      od.D_productDiscountID,
      d.D_discountType,
      od.OD_quantity,
      od.OD_unitPrice,
      od.OD_discountAmount,
      (od.OD_unitPrice * od.OD_quantity) - od.OD_discountAmount AS OD_totalItemAmount
    FROM OrderDetails od
    LEFT JOIN Products p ON od.P_productCode = p.P_productCode
    LEFT JOIN Discounts d ON od.D_productDiscountID = d.D_productDiscountID
    ORDER BY od.OD_detailID`;

  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};


// Add a new OrderDetail
const addOrderDetail = (data, callback) => {
  const {
    O_orderID,
    P_productCode,
    D_productDiscountID,
    OD_quantity,
    OD_unitPrice,
    OD_discountAmount,
  } = data;

  const query = `
    INSERT INTO OrderDetails 
    (O_orderID, P_productCode, D_productDiscountID, OD_quantity, OD_unitPrice, OD_discountAmount) 
    VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(
    query,
    [
      O_orderID,
      P_productCode,
      D_productDiscountID,
      OD_quantity,
      OD_unitPrice,
      OD_discountAmount,
    ],
    (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results.insertId);
      }
    }
  );
};

// Update an existing OrderDetail and recalculate total
const updateOrderDetail = (id, data, callback) => {
    const {
      O_orderID,
      P_productCode,
      D_productDiscountID,
      OD_quantity,
      OD_unitPrice,
      OD_discountAmount,
    } = data;
  
    // Calculate total amount
    const OD_totalItemAmount = (OD_unitPrice * OD_quantity) - OD_discountAmount;
  
    const query = `
      UPDATE OrderDetails 
      SET 
        O_orderID = ?, 
        P_productCode = ?, 
        D_productDiscountID = ?, 
        OD_quantity = ?, 
        OD_unitPrice = ?, 
        OD_discountAmount = ?, 
        OD_totalItemAmount = ?
      WHERE OD_detailID = ?`;
  
    db.query(
      query,
      [
        O_orderID,
        P_productCode,
        D_productDiscountID,
        OD_quantity,
        OD_unitPrice,
        OD_discountAmount,
        OD_totalItemAmount,
        id
      ],
      (err, results) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, results);
        }
      }
    );
  };
  

// Delete an OrderDetail
const deleteOrderDetail = (id, callback) => {
  const query = `DELETE FROM OrderDetails WHERE OD_detailID = ?`;
  db.query(query, [id], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

module.exports = {
  getAllOrderDetails,
  addOrderDetail,
  updateOrderDetail,
  deleteOrderDetail,
};
