const db = require('../../db');

// Get all Products
const getAllProducts = (callback) => {
  const query = `
    SELECT 
      p.P_productCode,
      p.P_productName,
      p.P_unitPrice,
      p.P_sellingPrice,
      p.P_dateAdded,
      p.P_SKU,
      c.C_categoryName as category,
      ps.P_productStatusName as status,
      pk.P_stockNum as stock,
      s.S_supplierName as supplier,
      b.B_brandName as brand
    FROM Products p
    LEFT JOIN Suppliers s ON p.S_supplierID = s.S_supplierID
    LEFT JOIN Brands b ON p.B_brandID = b.B_brandID
    LEFT JOIN Categories c ON p.C_categoryID = c.C_categoryID
    LEFT JOIN ProductStatus ps ON p.P_productStatusID = ps.P_productStatusID
    LEFT JOIN ProductStock pk ON p.PS_StockDetailsID = pk.PS_StockDetailsID;
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
  const { P_productCode, P_productName, P_unitPrice, P_sellingPrice, P_dateAdded, P_productStatusID, S_supplierID, B_brandID, C_categoryID, P_SKU, PS_StockDetailsID } = productData;

  const insertProductQuery = `
    INSERT INTO Products (P_productCode, P_productName, P_unitPrice, P_sellingPrice, P_dateAdded, P_productStatusID, S_supplierID, B_brandID, C_categoryID, P_SKU, PS_StockDetailsID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    insertProductQuery,
    [ P_productCode, P_productName, P_unitPrice, P_sellingPrice, P_dateAdded, P_productStatusID, S_supplierID, B_brandID, C_categoryID, P_SKU, PS_StockDetailsID ],
    (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    }
  );
};


// Update an existing brand
const updateProduct = (productCode, productData, callback) => {
  const { P_productName, P_unitPrice, P_sellingPrice, P_productStatusID, S_supplierID, B_brandID, C_categoryID, P_SKU, PS_StockDetailsID } = productData;
  const updateProductQuery = `
    UPDATE Products
    SET P_productName = ?, P_unitPrice = ?, P_sellingPrice = ?, P_productStatusID = ?, S_supplierID = ?, B_brandID = ?, C_categoryID = ?, P_SKU = ?, PS_StockDetailsID = ?
    WHERE P_productCode = ?;
  `;
  db.query(updateProductQuery, [P_productName, P_unitPrice, P_sellingPrice, P_productStatusID, S_supplierID, B_brandID, C_categoryID, P_SKU, PS_StockDetailsID, productCode], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
    }
  );
};

// Delete a Product
const deleteProduct = (productCode, callback) => {
  const deleteProductQuery = `DELETE FROM Products WHERE P_productCode = ?`;

  db.query(deleteProductQuery, [productCode], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });  
};

module.exports = {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
};
