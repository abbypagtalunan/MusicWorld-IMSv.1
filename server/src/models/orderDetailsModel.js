const db = require('../../db');
const orders = require('../models/ordersModel.js');

const getAllOrderDetails = (callback) => {
  const query = `
    SELECT 
      od.OD_detailID,
      od.O_orderID,
      od.P_productCode,
      p.P_productName,    
      od.D_discountType,
      od.OD_quantity,
      od.OD_unitPrice,
      od.OD_sellingPrice,
      od.OD_discountAmount,
      od.OD_netSale,
      od.OD_grossSale,
      od.OD_grossProfit,
      b.B_brandName,
      s.S_supplierName
    FROM OrderDetails od
    LEFT JOIN Products p ON od.P_productCode = p.P_productCode
    LEFT JOIN Brands b ON p.B_brandID = b.B_brandID
    LEFT JOIN Suppliers s ON p.S_supplierID = s.S_supplierID
    ORDER BY od.OD_detailID;
    `;

  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
      // console.log("Query Results:", results);
    }
  });
};

const fetchReportData = (callback) => {
  const query = `
    (
  SELECT 
    od.OD_detailID,
    o.O_orderID,
    o.O_receiptNumber,
    o.T_transactionDate,
    o.T_totalAmount,
    o.D_wholeOrderDiscount,
    o.O_orderPayment,
    o.isTemporarilyDeleted,
    od.OD_detailID,
    od.P_productCode,
    p.P_productName,
    od.D_discountType,
    od.OD_quantity,
    od.OD_unitPrice,
    od.OD_sellingPrice,
    od.OD_discountAmount,
    od.OD_netSale,
    od.OD_grossSale,
    od.OD_grossProfit,
    b.B_brandName,
    s.S_supplierName,
    'Sales' as recordType
  FROM Orders o
  LEFT JOIN OrderDetails od ON o.O_orderID = od.O_orderID
  LEFT JOIN Products p ON od.P_productCode = p.P_productCode
  LEFT JOIN Brands b ON p.B_brandID = b.B_brandID
  LEFT JOIN Suppliers s ON p.S_supplierID = s.S_supplierID
  WHERE o.isTemporarilyDeleted = 0
)
UNION ALL
(
  SELECT 
    od.OD_detailID,
    o.O_orderID,
    o.O_receiptNumber,
    r.R_dateOfReturn as T_transactionDate,
    o.T_totalAmount,
    o.D_wholeOrderDiscount,
    o.O_orderPayment,
    0 as isTemporarilyDeleted,
    od.OD_detailID,
    r.P_productCode,
    p.P_productName,
    od.D_discountType,
    r.R_returnQuantity as OD_quantity,
    od.OD_unitPrice,
    od.OD_sellingPrice,
    -1 * r.R_discountAmount as OD_discountAmount,
    -1 * (r.R_TotalPrice - r.R_discountAmount) as OD_netSale,
    -1 * r.R_TotalPrice as OD_grossSale,
    -1 * (r.R_TotalPrice - r.R_discountAmount - od.OD_unitPrice * r.R_returnQuantity) as OD_grossProfit,
    b.B_brandName,
    s.S_supplierName,
    'Returns' as recordType
  FROM Returns r
  LEFT JOIN OrderDetails od ON r.OD_detailID = od.OD_detailID
  LEFT JOIN Orders o ON od.O_orderID = o.O_orderID
  LEFT JOIN Products p ON r.P_productCode = p.P_productCode
  LEFT JOIN Brands b ON p.B_brandID = b.B_brandID
  LEFT JOIN Suppliers s ON p.S_supplierID = s.S_supplierID
)
ORDER BY T_transactionDate;
`

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
    D_discountType,
    OD_quantity,
    OD_unitPrice,
    OD_sellingPrice,
    OD_discountAmount,
  } = data;

  const query = `
    INSERT INTO OrderDetails 
    (O_orderID, P_productCode, D_discountType, OD_quantity, OD_unitPrice, OD_sellingPrice, OD_discountAmount) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    query,
    [
      O_orderID,
      P_productCode,
      D_discountType,
      OD_quantity,
      OD_unitPrice,
      OD_sellingPrice,
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
    D_discountType,
    OD_quantity,
    OD_unitPrice,
    OD_sellingPrice,
    OD_discountAmount,
  } = data;

  const OD_itemTotal = (OD_unitPrice * OD_quantity) - OD_discountAmount;

  const query = `
    UPDATE OrderDetails 
    SET 
      O_orderID = ?, 
      P_productCode = ?, 
      D_discountType = ?,
      OD_quantity = ?, 
      OD_unitPrice = ?, 
      OD_sellingPrice = ?,
      OD_discountAmount = ?, 
      OD_itemTotal = ?
    WHERE OD_detailID = ?`;

  db.query(
    query,
    [
      O_orderID,
      P_productCode,
      D_discountType,
      OD_quantity,
      OD_unitPrice,
      OD_sellingPrice,
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
  fetchReportData,
  addOrderDetail,
  updateOrderDetail,
  deleteOrderDetail,
  getOrderDetailById,
};
