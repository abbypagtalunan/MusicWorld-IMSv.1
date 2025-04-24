const { Product, ReturnType, Return } = require('../models/returnsModel');

exports.addReturn = async (req, res) => {
  try {
    const { productName, returnType, quantity, reason, discount } = req.body;

    // Validate input
    if (!productName || !returnType || !quantity || !reason || !discount) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Find the product by name
    const product = await Product.findOne({
      where: { P_productName: productName },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find the return type by description
    const returnTypeObj = await ReturnType.findOne({
      where: { RT_returnTypeDescription: returnType },
    });

    if (!returnTypeObj) {
      return res.status(404).json({ error: 'Return type not found' });
    }

    // Create the return entry
    const returnEntry = await Return.create({
      P_productCode: product.P_productCode,
      R_returnTypeID: returnTypeObj.RT_returnTypeID,
      R_reasonOfReturn: reason,
      R_returnQuantity: parseInt(quantity),
      R_discountAmount: parseFloat(discount),
    });

    res.status(201).json({ message: 'Return added successfully', data: returnEntry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};