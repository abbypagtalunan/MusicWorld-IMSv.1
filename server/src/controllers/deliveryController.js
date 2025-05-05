const deliveryModel = require('../models/deliveryModel');

//=============================================================================
// DELIVERY MANAGEMENT
//=============================================================================

// Get all deliveries
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

// Search deliveries by delivery number
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

// Add a new delivery
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

// Delete a delivery
const deleteDelivery = (req, res) => {
  const deliveryNumber = req.params.deliveryNumber;  // Make sure this matches the URL parameter
  const { adminPW } = req.body;

  if (adminPW !== "2095") {
    return res.status(403).json({ message: "Invalid admin password" });
  }

  deliveryModel.deleteDelivery(deliveryNumber, (err, results) => {
    if (err) {
      console.error('Error deleting delivery:', err);
      res.status(500).json({ message: 'Error deleting delivery' });
    } else {
      res.status(200).json({ message: 'Delivery deleted successfully', results });
    }
  });
};

//=============================================================================
// DELIVERY PRODUCTS
//=============================================================================

// Add products to a delivery
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

// Get all delivery products
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

// Get delivery products by delivery number
const getDeliveryProductsByDeliveryNumber = (req, res) => {
  const deliveryNumber = req.params.deliveryNumber;
  
  deliveryModel.getDeliveryProductsByDeliveryNumber(deliveryNumber, (err, results) => {
    if (err) {
      console.error('Error fetching delivery products:', err);
      res.status(500).json({ error: 'Error fetching delivery products' });
    } else {
      res.json(results);
    }
  });
};

//=============================================================================
// PAYMENT DETAILS
//=============================================================================

// Add this after the PAYMENT DETAILS section header around line 255
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

// Update payment details
const updatePaymentDetails = (req, res) => {
  const deliveryNumber = req.params.deliveryNumber;
  const { D_paymentTypeID, D_modeOfPaymentID, D_paymentStatusID, DPD_dateOfPaymentDue, DPD_dateOfPayment1, DPD_dateOfPayment2 } = req.body;

  if (!deliveryNumber || !D_paymentTypeID || !D_modeOfPaymentID || !D_paymentStatusID) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  deliveryModel.updatePaymentDetails(
    deliveryNumber,
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

//=============================================================================
// PAYMENT TYPES
//=============================================================================

// Get all Delivery Payment Types
const getAllDeliveryPaymentTypes = (req, res) => {
  deliveryModel.getAllDeliveryPaymentTypes((err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

// Add a new Delivery Payment Type
const addDeliveryPaymentType = (req, res) => {
  const { D_paymentName } = req.body;
  if (!D_paymentName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  deliveryModel.addDeliveryPaymentType({ D_paymentName }, (err, deliveryPaymentTypeId) => {
    if (err) {
      console.error('Error inserting Delivery Payment Type:', err);
      res.status(500).json({ message: 'Error inserting Delivery Payment Type' });
    } else {
      res.status(201).json({ message: 'Delivery Payment Type added successfully', id: deliveryPaymentTypeId });
    }
  });
};

// Update an existing Delivery Payment Type
const updateDeliveryPaymentType = (req, res) => {
  const deliveryPaymentTypeId = req.params.id;
  const { D_paymentName } = req.body;

  if (!D_paymentName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  deliveryModel.updateDeliveryPaymentType(deliveryPaymentTypeId, { D_paymentName }, (err, results) => {
    if (err) {
      console.error('Error updating Delivery Payment Type:', err);
      return res.status(500).json({ message: 'Error updating Delivery Payment Type' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Delivery Payment Type not found' });
    }

    res.status(200).json({ message: 'Delivery Payment Type updated successfully' });
  });
};

// Delete a Delivery Payment Type
const deleteDeliveryPaymentType = (req, res) => {
  const deliveryPaymentTypeId = req.params.id;
  deliveryModel.deleteDeliveryPaymentType(deliveryPaymentTypeId, (err, results) => {
    if (err) {
      console.error('Error deleting Delivery Payment Type:', err);
      res.status(500).json({ message: 'Error deleting Delivery Payment Type', results });
    } else {
      res.status(200).json({ message: 'Delivery Payment Type deleted successfully', results });
    }
  });
};

//=============================================================================
// PAYMENT MODES
//=============================================================================

// Get all Delivery Modes of Payment
const getAllDeliveryModeOfPayments = (req, res) => {
  deliveryModel.getAllDeliveryModeOfPayments((err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

// Add a new Delivery Mode of Payment
const addDeliveryModeOfPayment = (req, res) => {
  const { D_mopName } = req.body;
  if (!D_mopName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  deliveryModel.addDeliveryModeOfPayment({ D_mopName }, (err, deliveryModeOfPaymentId) => {
    if (err) {
      console.error('Error inserting Delivery Mode of Payment:', err);
      res.status(500).json({ message: 'Error inserting Delivery Mode of Payment' });
    } else {
      res.status(201).json({ message: 'Delivery Mode of Payment added successfully', id: deliveryModeOfPaymentId });
    }
  });
};

// Update an existing Delivery Mode of Payment
const updateDeliveryModeOfPayment = (req, res) => {
  const deliveryModeOfPaymentId = req.params.id;
  const { D_mopName } = req.body;

  if (!D_mopName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  deliveryModel.updateDeliveryModeOfPayment(deliveryModeOfPaymentId, { D_mopName }, (err, results) => {
    if (err) {
      console.error('Error updating Delivery Mode of Payment:', err);
      return res.status(500).json({ message: 'Error updating Delivery Mode of Payment' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Delivery Mode of Payment not found' });
    }

    res.status(200).json({ message: 'Delivery Mode of Payment updated successfully' });
  });
};

// Delete a Delivery Mode of Payment
const deleteDeliveryModeOfPayment = (req, res) => {
  const deliveryModeOfPaymentId = req.params.id;
  deliveryModel.deleteDeliveryModeOfPayment(deliveryModeOfPaymentId, (err, results) => {
    if (err) {
      console.error('Error deleting Delivery Mode of Payment:', err);
      res.status(500).json({ message: 'Error deleting Delivery Mode of Payment', results });
    } else {
      res.status(200).json({ message: 'Delivery Mode of Payment deleted successfully', results });
    }
  });
};

//=============================================================================
// PAYMENT STATUS
//=============================================================================

// Get all Delivery Payment Statuses
const getAllDeliveryPaymentStatuses = (req, res) => {
  deliveryModel.getAllDeliveryPaymentStatuses((err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

// Add a new Delivery Payment Status
const addDeliveryPaymentStatus = (req, res) => {
  const { D_statusName } = req.body;
  if (!D_statusName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  deliveryModel.addDeliveryPaymentStatus({ D_statusName }, (err, insertId) => {
    if (err) {
      console.error('Error inserting Delivery Payment Status:', err);
      res.status(500).json({ message: 'Error inserting Delivery Payment Status' });
    } else {
      res.status(201).json({ message: 'Delivery Payment Status added successfully', id: insertId });
    }
  });
};

// Update an existing Delivery Payment Status
const updateDeliveryPaymentStatus = (req, res) => {
  const statusId = req.params.id;
  const { D_statusName } = req.body;

  if (!D_statusName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  deliveryModel.updateDeliveryPaymentStatus(statusId, { D_statusName }, (err, results) => {
    if (err) {
      console.error('Error updating Delivery Payment Status:', err);
      return res.status(500).json({ message: 'Error updating Delivery Payment Status' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Delivery Payment Status not found' });
    }

    res.status(200).json({ message: 'Delivery Payment Status updated successfully' });
  });
};

// Delete a Delivery Payment Status
const deleteDeliveryPaymentStatus = (req, res) => {
  const statusId = req.params.id;
  deliveryModel.deleteDeliveryPaymentStatus(statusId, (err, results) => {
    if (err) {
      console.error('Error deleting Delivery Payment Status:', err);
      res.status(500).json({ message: 'Error deleting Delivery Payment Status', results });
    } else {
      res.status(200).json({ message: 'Delivery Payment Status deleted successfully', results });
    }
  });
};

module.exports = {
  // Delivery Management
  getAllDeliveries,
  searchDeliveries,
  addDelivery,
  deleteDelivery,
  
  // Delivery Products
  addDeliveryProducts,
  getDeliveryProducts,
  getDeliveryProductsByDeliveryNumber,
  
  // Payment Details
  getPaymentDetails,
  updatePaymentDetails,
  
  // Payment Types
  getAllDeliveryPaymentTypes,
  addDeliveryPaymentType,
  updateDeliveryPaymentType,
  deleteDeliveryPaymentType,
  
  // Payment Modes
  getAllDeliveryModeOfPayments,
  addDeliveryModeOfPayment,
  updateDeliveryModeOfPayment,
  deleteDeliveryModeOfPayment,
  
  // Payment Status
  getAllDeliveryPaymentStatuses,
  addDeliveryPaymentStatus,
  updateDeliveryPaymentStatus,
  deleteDeliveryPaymentStatus
};