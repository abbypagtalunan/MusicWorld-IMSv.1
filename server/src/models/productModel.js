const db = require('../../db');

// Get all Products
const getAllProducts = (callback) => {
  const query = `
    SELECT 
      p.P_productCode,
      c.C_categoryName as category,
      p.P_SKU,
      p.P_productName,
      b.B_brandName as brand,
      s.S_supplierName as supplier,
      p.S_supplierID,
      pk.P_stockNum as stock,
      p.P_unitPrice,
      p.P_sellingPrice,
      ps.P_productStatusName as status,
      p.P_dateAdded
    FROM Products p
    LEFT JOIN Categories c ON p.C_categoryID = c.C_categoryID
    LEFT JOIN Brands b ON p.B_brandID = b.B_brandID
    LEFT JOIN Suppliers s ON p.S_supplierID = s.S_supplierID
    LEFT JOIN ProductStock pk ON p.PS_StockDetailsID = pk.PS_StockDetailsID
    LEFT JOIN ProductStatus ps ON p.P_productStatusID = ps.P_productStatusID;
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
  const { P_productCode, C_categoryID, P_SKU, P_productName, B_brandID, S_supplierID, stockAmt, P_unitPrice, P_sellingPrice, P_productStatusID, P_dateAdded } = productData;

  const checkquery = `SELECT PS_StockDetailsID FROM ProductStock WHERE P_stockNum = ? LIMIT 1`;

  db.query(checkquery, [stockAmt], (err, checkres) => {
    if (err) return callback(err);

    const stockE = checkres[0];

    const insertProductStock = (PS_StockDetailsID) => {
      const insertProductQuery = `INSERT INTO Products (P_productCode, C_categoryID, P_SKU, P_productName, B_brandID, S_supplierID, PS_StockDetailsID, P_unitPrice, P_sellingPrice, P_productStatusID, P_dateAdded) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(
        insertProductQuery,
        [ P_productCode, C_categoryID, P_SKU, P_productName, B_brandID, S_supplierID, PS_StockDetailsID, P_unitPrice, P_sellingPrice, P_productStatusID, P_dateAdded ],
        (err, results) => {
          if (err) return callback(err);
          callback(null, results);
        }
      );
    };

    if (stockE) {
      insertProductStock(stockE.PS_StockDetailsID);
    } else {
      const insertStockQuery = `INSERT INTO ProductStock (P_stockNum) VALUES (?)`;
      db.query(insertStockQuery, [ stockAmt ], (err, stockres) => {
          if (err) return callback(err);
          insertProductStock(stockres.insertId);
      });
    }
  });
};


// Update an existing brand
const updateProduct = (productCode, productData, callback) => {
  const { C_categoryID, P_SKU, P_productName, B_brandID, S_supplierID, stockAmt, P_unitPrice, P_sellingPrice, P_productStatusID } = productData;

  const checkquery = `SELECT PS_StockDetailsID FROM ProductStock WHERE P_stockNum = ? LIMIT 1`;

  db.query(checkquery, [stockAmt], (err, checkRes) => {
    if (err) return callback(err);

    const stockE = checkRes[0];

    const updateProductStock = (stockID) => {
      const updateProductQuery = `
        UPDATE Products
        SET  C_categoryID = ?, P_SKU = ?, P_productName = ?, B_brandID = ?, S_supplierID = ?, PS_StockDetailsID = ?, P_unitPrice = ?, P_sellingPrice = ?, P_productStatusID = ? 
        WHERE P_productCode = ?;
      `;

      db.query(
        updateProductQuery,
        [ C_categoryID, P_SKU, P_productName, B_brandID, S_supplierID, stockID, P_unitPrice, P_sellingPrice, P_productStatusID, productCode ],
        (err, results) => {
          if (err) return callback(err);
          callback(null, results);
        }
      );
    };

    if (stockE) {
      updateProductStock(stockE.PS_StockDetailsID);
    } else {
      const insertStockQuery = `INSERT INTO ProductStock (P_stockNum) VALUES (?)`;
      db.query(insertStockQuery, [ stockAmt ], (err, stockRes) => {
          if (err) return callback(err);
          updateProductStock(stockRes.insertId);
      });
    }
  });
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
  const query = `UPDATE Products SET isDeleted = '1' WHERE P_productCode = ?`;
    
  db.query(query, [productCode], (err, results) => {
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
