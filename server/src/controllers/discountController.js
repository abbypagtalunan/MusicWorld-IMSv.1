const discountModel = require('../models/discountModel');

// Route to fetch all discounts
const getAllDiscounts = (req, res) => {
  discountModel.getAllDiscounts((err, results) => {
    if (err) {
      console.error('Error fetching discounts from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
};

// Route to add a new discount
const addDiscount = (req, res) => {
  const { D_discountType } = req.body;
  if (!D_discountType) {
    return res.status(400).json({ message: 'Missing discount type' });
  }

  discountModel.addDiscount({ D_discountType }, (err, discountId) => {
    if (err) {
      console.error('Error inserting discount:', err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Discount ID already exists' });
      }
      return res.status(500).json({ message: 'Error inserting discount' });
    }
    res.status(201).json({ message: 'Discount added successfully', id: discountId });
  });
};

// Route to update discount details
const updateDiscount = (req, res) => {
  const discountId = req.params.id;
  const { D_discountType } = req.body;

  if (!D_discountType) {
    return res.status(400).json({ message: 'Missing discount type' });
  }

  discountModel.updateDiscount(discountId, { D_discountType }, (err, results) => {
    if (err) {
      console.error('Error updating discount:', err);
      return res.status(500).json({ message: 'Error updating discount' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    res.status(200).json({ message: 'Discount updated successfully' });
  });
};

// Route to delete a discount
const deleteDiscount = (req, res) => {
  const discountId = req.params.id;
  discountModel.deleteDiscount(discountId, (err, results) => {
    if (err) {
      console.error('Error deleting discount:', err);
      res.status(500).json({ message: 'Error deleting discount', results });
    } else {
      res.status(200).json({ message: 'Discount deleted successfully', results });
    }
  });
};

module.exports = {
  getAllDiscounts,
  addDiscount,
  updateDiscount,
  deleteDiscount,
};
