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
      'Products' as source
    FROM Products p
    LEFT JOIN Categories c ON p.C_categoryID = c.C_categoryID
    LEFT JOIN Brands b ON p.B_brandID = b.B_brandID
    LEFT JOIN Suppliers s ON p.S_supplierID = s.S_supplierID
    LEFT JOIN ProductStatus ps ON p.P_productStatusID = ps.P_productStatusID
    WHERE p.isDeleted = 0 AND p.P_productStatusID != 4
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
  const { P_productCode, C_categoryID, P_productName, B_brandID, S_supplierID, P_stockNum, P_lastRestockDateTime, P_unitPrice, P_sellingPrice, P_productStatusID, P_dateAdded } = productData;

  const insertProductQuery = `INSERT INTO Products (P_productCode, C_categoryID, P_productName, B_brandID, S_supplierID, P_stockNum, P_lastRestockDateTime, P_unitPrice, P_sellingPrice, P_productStatusID, P_dateAdded) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    insertProductQuery,
    [ P_productCode, C_categoryID, P_productName, B_brandID, S_supplierID, P_stockNum, P_lastRestockDateTime, P_unitPrice, P_sellingPrice, P_productStatusID, P_dateAdded ],
    (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    }
  );
};


// Update an existing brand
const updateProduct = (productCode, productData, callback) => {
  const { C_categoryID, P_productName, B_brandID, S_supplierID, P_stockNum, P_lastRestockDateTime, P_unitPrice, P_sellingPrice, P_productStatusID } = productData;

    const updateProductQuery = `
      UPDATE Products
      SET  C_categoryID = ?, P_productName = ?, B_brandID = ?, S_supplierID = ?, P_stockNum = ?, P_unitPrice = ?, P_sellingPrice = ?, P_productStatusID = ? 
      WHERE P_productCode = ?;
    `;

    db.query(
      updateProductQuery,
      [ C_categoryID, P_productName, B_brandID, S_supplierID, P_stockNum, P_lastRestockDateTime, P_unitPrice, P_sellingPrice, P_productStatusID, productCode ],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    }
  );
};

const updateProductPrice = (productData, callback) => {
  const { productCode, P_sellingPrice } = productData;

  const updateProductQuery = `
    UPDATE Products
    SET  P_sellingPrice = ?
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
  deleteProduct,
};
