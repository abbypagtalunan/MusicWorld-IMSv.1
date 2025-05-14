const deliveryModel = require('../models/deliveryModel');

// ==============================================
// Deliveries functions

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

// Add a new delivery
const addDelivery = (req, res) => {
  try {
    const { D_deliveryNumber, D_deliveryDate, products, payment } = req.body;
    // console.log("Received delivery payload:", JSON.stringify(req.body, null, 2));
    
    // ensure that delivery number is integer
    const raw = String(D_deliveryNumber).trim();
    if (!/^\d+$/.test(raw)) {
      return res.status(400).json({ message: 'Delivery number not an integer' });
    }
    const dnInt = Number(raw);

    // 1. Required fields
    if (!D_deliveryNumber || !D_deliveryDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 2. Validate products array
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products array is required and cannot be empty' });
    }

    // 3. Validate each product
    for (const prod of products) {
      const { P_productCode, DPD_quantity } = prod;
      if (!P_productCode || DPD_quantity === undefined) {
        return res.status(400).json({
          message: 'Each product must have a product code and quantity',
          invalidProduct: prod
        });
      }
      const codeInt = parseInt(P_productCode, 10);
      if (Number.isNaN(codeInt)) {
        return res.status(400).json({ message: `Invalid numeric product code: ${P_productCode}` });
      }
      const qtyInt = parseInt(DPD_quantity, 10);
      if (Number.isNaN(qtyInt)) {
        return res.status(400).json({ message: `Invalid quantity for product ${codeInt}: ${DPD_quantity}` });
      }
      prod.P_productCode = codeInt;
      prod.DPD_quantity    = qtyInt;
    }

    // 4. Validate payment if provided
    if (payment) {
      const required = ['D_paymentTypeID', 'D_modeOfPaymentID', 'D_paymentStatusID'];
      for (const field of required) {
        if (!payment[field]) {
          return res.status(400).json({ message: `Missing required payment field: ${field}` });
        }
      }
      // if 2-month installment, ensure second fields exist
      if (payment.D_modeOfPaymentID2 && (
          !payment.D_paymentStatusID2 ||
          !payment.DPD_dateOfPaymentDue2 ||
          !payment.DPD_dateOfPayment2
      )) {
        return res.status(400).json({ message: "Missing second-payment fields" });
      }
    }

    // 5. Delegate all inserts to the model
    const deliveryData = { D_deliveryNumber, D_deliveryDate };
    deliveryModel.addDelivery(deliveryData, products, payment, (err, result) => {
      if (err) {
        console.error('Error inserting delivery:', err);
        // Duplicate‐entry: MySQL error code ER_DUP_ENTRY
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'The indicated delivery number was already used' });
        }
        return res.status(500).json({ message: 'Error inserting delivery', error: err.message });
      }
      res.status(201).json({ message: 'Delivery, products, and payment added successfully', result });
    });

  } catch (error) {
    console.error('Unexpected error in addDelivery:', error);
    res.status(500).json({
      message: 'Unexpected error processing delivery',
      error:   error.message,
      stack:   error.stack
    });
  }
};

// Search deliveries by ID (delivery number)
const searchDeliveriesByID = (req, res) => {
  const { deliveryNumber } = req.query;
  if (!deliveryNumber) {
    return res.status(400).json({ message: 'Delivery number is required for search' });
  }

  deliveryModel.searchDeliveriesByID(deliveryNumber, (err, results) => {
    if (err) {
      console.error('Error searching deliveries:', err);
      res.status(500).json({ error: 'Error searching deliveries' });
    } else {
      res.json(results);
    }
  });
};

// Search deliveries by date
const searchDeliveriesByDate = (req, res) => {
  const { date } = req.query;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ message: 'A valid date query (YYYY-MM-DD) is required' });
  }
  deliveryModel.searchDeliveriesByDate(date, (err, results) => {
    if (err) {
      console.error('Error searching deliveries by date:', err);
      return res.status(500).json({ error: 'Error searching deliveries' });
    }
    res.json(results);
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

// ==============================================
// Delivery products functions

// Get all delivery products
const getDeliveryProductsOfAllDeliveries = (req, res) => {
  deliveryModel.getDeliveryProductsOfAllDeliveries((err, results) => {
    if (err) {
      console.error('Error fetching delivery products:', err);
      res.status(500).json({ error: 'Error fetching delivery products' });
    } else {
      res.json(results);
    }
  });
};

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

// Get delivery products by ID (delivery number)
const getDeliveryProductsOfDelivery = (req, res) => {
  const deliveryNumber = req.params.deliveryNumber;
  
  deliveryModel.getDeliveryProductsOfDelivery(deliveryNumber, (err, results) => {
    if (err) {
      console.error('Error fetching delivery products:', err);
      res.status(500).json({ error: 'Error fetching delivery products' });
    } else {
      res.json(results);
    }
  });
};

// ==============================================
// Payment details functions

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
  const {
    D_paymentTypeID,
    D_modeOfPaymentID,
    D_paymentStatusID,
    DPD_dateOfPaymentDue,
    DPD_dateOfPayment1,
    // for 2nd payment
    D_modeOfPaymentID2,
    D_paymentStatusID2,
    DPD_dateOfPaymentDue2,
    DPD_dateOfPayment2
  } = req.body;

  if (!deliveryNumber || !D_paymentTypeID || !D_modeOfPaymentID || !D_paymentStatusID) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
    // Add after checking other required fields
  if (!DPD_dateOfPaymentDue || !DPD_dateOfPayment1) {
    return res.status(400).json({ message: 'Payment due date and first payment date are required' });
  }

  deliveryModel.updatePaymentDetails(
    deliveryNumber,
    {
      D_paymentTypeID,
      D_modeOfPaymentID,
      D_paymentStatusID,
      DPD_dateOfPaymentDue,
      DPD_dateOfPayment1,
      // second-payment fields:
      D_modeOfPaymentID2,
      D_paymentStatusID2,
      DPD_dateOfPaymentDue2,
      DPD_dateOfPayment2
    },
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

// ==============================================
// Types/modes/status functions

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

module.exports = {
  // deliveries functions
  getAllDeliveries,
  addDelivery,
  searchDeliveriesByID,
  searchDeliveriesByDate,
  markDeliveryAsDeleted,
  
  // delivery products functions
  getDeliveryProductsOfDelivery,
  getDeliveryProductsOfAllDeliveries,
  addDeliveryProducts,
  
  // payment details functions
  getPaymentDetails,
  updatePaymentDetails,
  
  // types/modes/status functions
  getAllDeliveryPaymentTypes,
  getAllDeliveryModeOfPayments,
  getAllDeliveryPaymentStatuses,
};