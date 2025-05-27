const db = require('../../db');

// Get all Products
const getAllProducts = (callback) => {
  const query = `
    SELECT 
      p.P_productCode,
      c.C_categoryName as category,
      p.P_productName,
      b.B_brandName as brand,
      s.S_supplierName as supplier,
      p.S_supplierID,
      p.P_stockNum as stock,
      p.P_lastRestockDateTime,
      p.P_unitPrice,
      p.P_sellingPrice,
      ps.P_productStatusName as status,
      p.P_dateAdded,
      p.isDeleted,
      p.P_lastEditedDateTime,
      'Products' as source
    FROM Products p
    LEFT JOIN Categories c ON p.C_categoryID = c.C_categoryID
    LEFT JOIN Brands b ON p.B_brandID = b.B_brandID
    LEFT JOIN Suppliers s ON p.S_supplierID = s.S_supplierID
    LEFT JOIN ProductStatus ps ON p.P_productStatusID = ps.P_productStatusID
    WHERE p.isDeleted = 0 AND p.P_productStatusID != 4
    ORDER BY p.P_dateAdded DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Add a new Product
const addProduct = (productData, callback) => {
  const { C_categoryID, P_productName, B_brandID, S_supplierID, P_stockNum, P_unitPrice, P_sellingPrice, P_productStatusID } = productData;

  const insertProductQuery = `INSERT INTO Products (C_categoryID, P_productName, B_brandID, S_supplierID, P_stockNum, P_unitPrice, P_sellingPrice, P_productStatusID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    insertProductQuery,
    [ C_categoryID, P_productName, B_brandID, S_supplierID, P_stockNum, P_unitPrice, P_sellingPrice, P_productStatusID ],
    (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    }
  );
};


// Update an existing brand
const updateProduct = (productCode, productData, callback) => {
  const { C_categoryID, P_productName, B_brandID, S_supplierID, P_stockNum, P_unitPrice, P_sellingPrice } = productData;

    const currentStockQuery = `SELECT P_stockNum FROM Products WHERE P_productCode = ?`;

    db.query(currentStockQuery, [productCode], (err, res) => {
      if (err) return callback(err);

      const currentStock = res[0]?.P_stockNum;
      const newStock = P_stockNum;

      const lastRestock = currentStock !== newStock ? `, P_lastRestockDateTime = CURRENT_TIMESTAMP` : '';

      const updateProductQuery = `
      UPDATE Products
      SET  C_categoryID = ?, P_productName = ?, B_brandID = ?, S_supplierID = ?, P_stockNum = ?, P_unitPrice = ?, P_sellingPrice = ?, P_lastEditedDateTime = CURRENT_TIMESTAMP ${lastRestock} 
      WHERE P_productCode = ?;
      `;

    db.query(
      updateProductQuery,
      [ C_categoryID, P_productName, B_brandID, S_supplierID, P_stockNum, P_unitPrice, P_sellingPrice, productCode ],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    }); 
  });
};

const updateProductPrice = (productData, callback) => {
  const { productCode, P_sellingPrice } = productData;

  const updateProductQuery = `
    UPDATE Products
    SET P_sellingPrice = ?,
        P_lastEditedDateTime = CURRENT_TIMESTAMP
    WHERE P_productCode = ?;
  `;

  db.query(
    updateProductQuery,
    [ P_sellingPrice, productCode ],
    (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    }
  );
};

// For Ordering: Deduct Product Stock Number
const deductProductStockNumber = (productData, callback) => {
  const { productCode, quantityOrdered } = productData;

  const query = `
    UPDATE Products 
    SET P_stockNum = GREATEST(P_stockNum - ?, 0) 
    WHERE P_productCode = ? AND isDeleted = 0
  `;

  db.query(query, [quantityOrdered, String(productCode)], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};

// Delete a Product
const deleteProduct = (productCode, callback) => {
  const query = `UPDATE Products SET isDeleted = 1, P_productStatusID = 4 WHERE P_productCode = ? AND isDeleted = 0`;
    
  db.query(query, [String(productCode)], (err, results) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
}

module.exports = {
  getAllProducts,
  addProduct,
  updateProduct,
  updateProductPrice,
  deductProductStockNumber,
  deleteProduct,
};
