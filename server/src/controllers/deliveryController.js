const deliveryModel = require('../models/deliveryModel'); // Import the delivery model

// Route to fetch all deliveries
const getAllDeliveries = (req, res) => {
  deliveryModel.getAllDeliveries((err, results) => {
    if (err) {
      console.error('Error fetching deliveries from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

// Route to search deliveries by delivery number
const searchDeliveries = (req, res) => {
  const { deliveryNumber } = req.query;
  if (!deliveryNumber) {
    return res.status(400).json({ message: 'Delivery number is required for search' });
  }

  deliveryModel.searchDeliveries(deliveryNumber, (err, results) => {
    if (err) {
      console.error('Error searching deliveries:', err);
      res.status(500).json({ error: 'Error searching deliveries' });
    } else {
      res.json(results);
    }
  });
};

// Route to add a new delivery
const addDelivery = (req, res) => {
  const { D_deliveryNumber, D_deliveryDate, S_supplierID } = req.body;
  if (!D_deliveryNumber || !D_deliveryDate || !S_supplierID) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  deliveryModel.addDelivery({ D_deliveryNumber, D_deliveryDate, S_supplierID }, (err, deliveryId) => {
    if (err) {
      console.error('Error inserting delivery:', err);
      res.status(500).json({ message: 'Error inserting delivery' });
    } else {
      res.status(201).json({ message: 'Delivery added successfully', id: deliveryId });
    }
  });
};

// Route to add products to a delivery
const addDeliveryProducts = (req, res) => {
  const { products } = req.body;
  
  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: 'Products array is required' });
  }

  deliveryModel.addDeliveryProducts(products, (err, results) => {
    if (err) {
      console.error('Error adding delivery products:', err);
      res.status(500).json({ message: 'Error adding delivery products' });
    } else {
      res.status(201).json({ message: 'Delivery products added successfully', results });
    }
  });
};

// Route to get all delivery products
const getDeliveryProducts = (req, res) => {
  deliveryModel.getDeliveryProducts((err, results) => {
    if (err) {
      console.error('Error fetching delivery products:', err);
      res.status(500).json({ error: 'Error fetching delivery products' });
    } else {
      res.json(results);
    }
  });
};

// Route to get all payment details
const getPaymentDetails = (req, res) => {
  deliveryModel.getPaymentDetails((err, results) => {
    if (err) {
      console.error('Error fetching payment details:', err);
      res.status(500).json({ error: 'Error fetching payment details' });
    } else {
      res.json(results);
    }
  });
};

// Route to update payment details
const updatePaymentDetails = (req, res) => {
  const deliveryNum = req.params.deliveryNumber;
  const { D_paymentTypeID, D_modeOfPaymentID, D_paymentStatusID, DPD_dateOfPaymentDue, DPD_dateOfPayment1, DPD_dateOfPayment2 } = req.body;

  if (!deliveryNum || !D_paymentTypeID || !D_modeOfPaymentID || !D_paymentStatusID) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  deliveryModel.updatePaymentDetails(
    deliveryNum,
    { D_paymentTypeID, D_modeOfPaymentID, D_paymentStatusID, DPD_dateOfPaymentDue, DPD_dateOfPayment1, DPD_dateOfPayment2 },
    (err, results) => {
      if (err) {
        console.error('Error updating payment details:', err);
        res.status(500).json({ message: 'Error updating payment details' });
      } else {
        res.status(200).json({ message: 'Payment details updated successfully', results });
      }
    }
  );
};

// Route to delete a delivery
const deleteDelivery = (req, res) => {
  const deliveryNum = req.params.id;
  const { adminPW } = req.body;

  if (adminPW !== "2095") {
    return res.status(403).json({ message: "Invalid admin password" });
  }

  deliveryModel.deleteDelivery(deliveryNum, (err, results) => {
    if (err) {
      console.error('Error deleting delivery:', err);
      res.status(500).json({ message: 'Error deleting delivery' });
    } else {
      res.status(200).json({ message: 'Delivery deleted successfully', results });
    }
  });
};

module.exports = {
  getAllDeliveries,
  searchDeliveries,
  addDelivery,
  addDeliveryProducts,
  getDeliveryProducts,
  getPaymentDetails,
  updatePaymentDetails,
  deleteDelivery
};