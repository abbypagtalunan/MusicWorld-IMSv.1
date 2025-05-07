const orderDetailsModel = require('../models/orderDetailsModel');

// Route to fetch all order details
const getAllOrderDetails = (req, res) => {
  orderDetailsModel.getAllOrderDetails((err, results) => {
    if (err) {
      console.error('Error fetching order details from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

// Fetch report data
const fetchReportData = (req, res) => {
  orderDetailsModel.fetchReportData((err, results) => {
    if (err) {
      console.error('Error fetching report data from database:', err);
      res.status(500).json({ error: 'Error fetching report data' });
    } else {
      res.json(results);
    }
  });
};

// Add order detail
const addOrderDetail = (req, res) => {
  const {
    O_orderID,
    P_productCode,
    D_discountType,
    OD_quantity,
    OD_unitPrice,
    OD_sellingPrice,
    OD_discountAmount,
  } = req.body;

  console.log("Received order detail data:", req.body); 

  if (!O_orderID || !P_productCode || OD_quantity == null || OD_unitPrice == null || OD_sellingPrice == null) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  orderDetailsModel.addOrderDetail(
    {
      O_orderID,
      P_productCode,
      D_discountType,
      OD_quantity,
      OD_unitPrice,
      OD_sellingPrice,
      OD_discountAmount,
    },
    (err, insertId) => {
      if (err) {
        console.error('Error inserting order detail:', err);
        return res.status(500).json({ message: 'Error inserting order detail' });
      }
      res.status(201).json({id: insertId});
    }
  );
};


// Route to update an existing order detail
const updateOrderDetail = (req, res) => {
  const orderDetailId = req.params.id;
  const {
    O_orderID,
    P_productCode,
    D_discountType,
    OD_quantity,
    OD_unitPrice,
    OD_sellingPrice,
    OD_discountAmount,
  } = req.body;

  if (!O_orderID || !P_productCode || OD_quantity == null || OD_unitPrice == null || OD_sellingPrice == null) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  orderDetailsModel.updateOrderDetail(
    orderDetailId,
    {
      O_orderID,
      P_productCode,
      D_discountType,
      OD_quantity,
      OD_unitPrice,
      OD_sellingPrice,
      OD_discountAmount,
    },
    (err, results) => {
      if (err) {
        console.error('Error updating order detail:', err);
        return res.status(500).json({ message: 'Error updating order detail' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Order detail not found' });
      }

      res.status(200).json({ message: 'Order detail updated successfully' });
    }
  );
};

// Route to delete an order detail
const deleteOrderDetail = (req, res) => {
  const orderDetailId = req.params.id;
  orderDetailsModel.deleteOrderDetail(orderDetailId, (err, results) => {
    if (err) {
      console.error('Error deleting order detail:', err);
      res.status(500).json({ message: 'Error deleting order detail', results });
    } else {
      res.status(200).json({ message: 'Order detail deleted successfully', results });
    }
  });
};

module.exports = {
  getAllOrderDetails,
  fetchReportData,
  addOrderDetail,
  updateOrderDetail,
  deleteOrderDetail,
};
