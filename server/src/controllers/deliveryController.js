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
  try {
    const { 
      D_deliveryNumber, 
      D_deliveryDate, 
      S_supplierID,
      products,
      payment
    } = req.body;
    
    console.log("Received delivery payload:", JSON.stringify(req.body, null, 2));
    
    const deliveryNumberInt = parseInt(D_deliveryNumber, 10);
    const supplierIDInt = parseInt(S_supplierID, 10);

    if (isNaN(deliveryNumberInt) || isNaN(supplierIDInt)) {
      return res.status(400).json({ message: 'Invalid data types for deliveryNumber or supplierID' });
    }

    if (!D_deliveryNumber || !D_deliveryDate || !S_supplierID) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate products array
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products array is required and cannot be empty' });
    }

    // Validate each product
    for (const product of products) {
      if (!product.P_productCode || product.DPD_quantity === undefined) {
        return res.status(400).json({ 
          message: 'Each product must have a product code and quantity',
          invalidProduct: product
        });
      }
      
      // Add this validation for product code format
      if (typeof product.P_productCode !== 'string' || product.P_productCode.length > 10) {
        return res.status(400).json({
          message: `Invalid product code format: ${product.P_productCode}. Must be a string up to 10 characters.`
        });
      }
      
      // Make sure quantity is a number
      const quantity = parseInt(product.DPD_quantity, 10);
      if (isNaN(quantity)) {
        return res.status(400).json({
          message: `Invalid quantity for product ${product.P_productCode}: ${product.DPD_quantity}`
        });
      }
    }

    // Validate payment details if present
    if (payment) {
      const requiredPaymentFields = ['D_paymentTypeID', 'D_modeOfPaymentID', 'D_paymentStatusID', 'DPD_dateOfPaymentDue'];
      
      for (const field of requiredPaymentFields) {
        if (!payment[field]) {
          return res.status(400).json({
            message: `Missing required payment field: ${field}`
          });
        }
      }
    }

    // Create the delivery data object
    const deliveryData = { 
      D_deliveryNumber, 
      D_deliveryDate, 
      S_supplierID 
    };

    // Insert delivery data
    deliveryModel.addDelivery(deliveryData, (err, deliveryResult) => {
      if (err) {
        console.error('Error inserting delivery:', err);
        return res.status(500).json({ message: 'Error inserting delivery', error: err.message });
      }

      const insertedDeliveryNumber = deliveryResult.insertId;

      // Insert products data
      const productPromises = products.map(product => {
        const productData = {
          D_deliveryNumber: insertedDeliveryNumber,
          P_productCode: product.P_productCode,
          DPD_quantity: product.DPD_quantity,
        };
        return new Promise((resolve, reject) => {
          deliveryModel.addDeliveryProducts([productData], (err, productResult) => {
            if (err) reject(err);
            else resolve(productResult);
          });
        });
      });

      // If payment data is provided, insert it
      let paymentPromise = Promise.resolve();
      if (payment) {
        const paymentData = {
          D_deliveryNumber: insertedDeliveryNumber,
          D_paymentTypeID: payment.D_paymentTypeID,
          D_modeOfPaymentID: payment.D_modeOfPaymentID,
          D_paymentStatusID: payment.D_paymentStatusID,
          DPD_dateOfPaymentDue: payment.DPD_dateOfPaymentDue,
          DPD_dateOfPayment1: payment.DPD_dateOfPayment1,
          DPD_dateOfPayment2: payment.DPD_dateOfPayment2,
        };
        paymentPromise = new Promise((resolve, reject) => {
          deliveryModel.addPayment(paymentData, (err, paymentResult) => {
            if (err) reject(err);
            else resolve(paymentResult);
          });
        });
      }

      // Execute all product insertions and payment insertion
      Promise.all([...productPromises, paymentPromise])
        .then(() => {
          res.status(201).json({ message: 'Delivery, products, and payment (if any) added successfully' });
        })
        .catch((err) => {
          console.error('Error processing delivery details:', err);
          res.status(500).json({ message: 'Error processing delivery details', error: err.message });
        });
    });

  } catch (error) {
    console.error('Unexpected error in addDelivery:', error);
    res.status(500).json({
      message: 'Unexpected error processing delivery',
      error: error.message || error.toString(),
      stack: error.stack // Include stack trace for debugging
    });
  }
};

// Delete a delivery
const deleteDelivery = (req, res) => {
  const deliveryNumber = req.params.deliveryNumber;  // Make sure this matches the URL parameter
  const { adminPW } = req.body;

  if (adminPW !== "2095") {
    return res.status(403).json({ message: "Authentication failed: Invalid admin password provided" });
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

// Mark a delivery as temporarily deleted
const markDeliveryAsDeleted = (req, res) => {
  const deliveryNumber = req.params.deliveryNumber;
  const { adminPW } = req.body;

  if (adminPW !== "2095") {
    return res.status(403).json({ message: "Authentication failed: Invalid admin password provided" });
  }

  deliveryModel.markDeliveryAsDeleted(deliveryNumber, (err, results) => {
    if (err) {
      console.error('Error marking delivery as deleted:', err);
      res.status(500).json({ message: 'Error marking delivery as deleted' });
    } else {
      res.status(200).json({ message: 'Delivery marked as deleted successfully', results });
    }
  });
};

//=============================================================================
// DELIVERY PRODUCTS
//=============================================================================

// Add product to a delivery
const addDeliveryProducts = (req, res) => {
  const { D_deliveryNumber, P_productCode, DPD_quantity } = req.body;
  
  if (!D_deliveryNumber || !P_productCode || !DPD_quantity) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Create a single product object
  const productDetail = {
    D_deliveryNumber, 
    P_productCode, 
    DPD_quantity
  };

  deliveryModel.addDeliveryProducts([productDetail], (err, results) => {
    if (err) {
      console.error('Error adding delivery product:', err);
      res.status(500).json({ message: 'Error adding delivery product' });
    } else {
      res.status(201).json({ message: 'Delivery product added successfully', results });
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
  
    // Add after checking other required fields
  if (!DPD_dateOfPaymentDue || !DPD_dateOfPayment1) {
    return res.status(400).json({ message: 'Payment due date and first payment date are required' });
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
  markDeliveryAsDeleted,
  
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