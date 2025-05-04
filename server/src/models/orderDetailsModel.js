const db = require('../../db');
const orders = require('../models/ordersModel.js');

// Get all OrderDetails with product name, discount type, and computed total
const getAllOrderDetails = (callback) => {
  const query = `
    SELECT 
      od.OD_detailID,
      od.O_orderID,
      od.P_productCode,
      od.D_productDiscountID,
      d.D_discountType,
      od.OD_quantity,
      od.OD_unitPrice,
      od.OD_discountAmount,
      od.OD_itemTotal
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
      OD_discountAmount
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

  const OD_itemTotal = (OD_unitPrice * OD_quantity) - OD_discountAmount;

  const query = `
    UPDATE OrderDetails 
    SET 
      O_orderID = ?, 
      P_productCode = ?, 
      D_productDiscountID = ?, 
      OD_quantity = ?, 
      OD_unitPrice = ?, 
      OD_discountAmount = ?, 
      OD_itemTotal = ?
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
      OD_itemTotal,
      id
    ],
    (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        orders.updateOrderDiscount(O_orderID, () => {
          callback(null, results);
        });
      }
    }
  );
};

// Delete an OrderDetail
const deleteOrderDetail = (id, callback) => {
  // First get the order ID so we can update its discount after deletion
  const getOrderIdQuery = `SELECT O_orderID FROM OrderDetails WHERE OD_detailID = ?`;
  db.query(getOrderIdQuery, [id], (err, result) => {
    if (err || result.length === 0) {
      return callback(err || new Error('OrderDetail not found'), null);
    }

    const orderId = result[0].O_orderID;

    const deleteQuery = `DELETE FROM OrderDetails WHERE OD_detailID = ?`;
    db.query(deleteQuery, [id], (err, results) => {
      if (err) {
        callback(err, null);
      } else {
        orders.updateOrderDiscount(orderId, () => {
          callback(null, results);
        });
      }
    });
  });
};

const getOrderDetailById = (id, callback) => {
  const query = 'SELECT * FROM OrderDetails WHERE OD_detailID = ?';
  db.query(query, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

module.exports = {
  getAllOrderDetails,
  addOrderDetail,
  updateOrderDetail,
  deleteOrderDetail,
  getOrderDetailById,
};
