const db = require('../../db');

// Get all Products
const getAllProducts = (callback) => {
  const query = `
    SELECT 
      p.P_productCode,
      p.P_productName,
      p.P_quantity,
      p.P_unitPrice,
      p.P_sellingPrice,
      p.P_dateAdded,
      s.S_supplierName AS supplierName,
      b.B_brandName AS brandName,
      c.C_categoryName AS categoryName
    FROM Products p
    LEFT JOIN ProductSupplier ps ON p.P_productCode = ps.P_productCode
    LEFT JOIN Suppliers s ON ps.S_supplierID = s.S_supplierID
    LEFT JOIN ProductBrand pb ON p.P_productCode = pb.P_productCode
    LEFT JOIN Brands b ON pb.B_brandID = b.B_brandID
    LEFT JOIN Categories c ON p.C_categoryID = c.C_categoryID;
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
  const { P_productCode, P_productName, P_quantity, P_unitPrice, P_sellingPrice, P_dateAdded, P_productStatus, S_supplierID, B_brandID, C_categoryID } = productData;

  const insertProductQuery = `
    INSERT INTO Products (P_productCode, P_productName, P_quantity, P_unitPrice, P_sellingPrice, P_dateAdded, P_productStatus, C_categoryID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    insertProductQuery,
    [ P_productCode, P_productName, P_quantity, P_unitPrice, P_sellingPrice, P_dateAdded, P_productStatus, C_categoryID ],
    (err, results) => {
      if (err) return callback(err);

      const insertSupplierQuery = `
        INSERT INTO ProductSupplier (P_productCode, S_supplierID) VALUES (?, ?)`;
      db.query(insertSupplierQuery, [P_productCode, S_supplierID], (err) => {
        if (err) return callback(err);

         const insertBrandQuery = `
          INSERT INTO ProductBrand (P_productCode, B_brandID) VALUES (?, ?)`;
        db.query(insertBrandQuery, [P_productCode, B_brandID], (err) => {
          if (err) return callback(err);

          callback(null, results);
        });
      });
    }
  );
};


// Update an existing brand
const updateProduct = (productCode, productData, callback) => {
  const { P_productName, P_quantity, P_unitPrice, P_sellingPrice, P_productStatus, S_supplierID, B_brandID, C_categoryID } = productData;
  const updateProductQuery = `
    UPDATE Products
    SET P_productName = ?, P_quantity = ?, P_unitPrice = ?, P_sellingPrice = ?, P_productStatus = ?, C_categoryID = ?
    WHERE P_productCode = ?;
  `;
  db.query(updateProductQuery, [P_productName, P_quantity, P_unitPrice, P_sellingPrice, P_productStatus, C_categoryID], (err, results) => {
    if (err) return callback(err);

      const updateSupplierQuery = `
        UPDATE ProductSupplier
        SET S_supplierID = ?
        WHERE P_productCode = ?
      `;
     db.query(updateSupplierQuery, [S_supplierID, productCode], (err) => {
      if (err) return callback(err);

        const updateBrandQuery = `
         UPDATE ProductBrand
         SET B_brandID = ?
          WHERE P_productCode = ?
        `;
        db.query(updateBrandQuery, [B_brandID, productCode], (err) => {
          if (err) return callback(err);

          callback(null, results);
        });
      });
    }
  );
};

// Delete a Product
const deleteProduct = (productCode, callback) => {
  const deleteSupplierQuery = `DELETE FROM ProductSupplier WHERE P_productCode = ?`;
  const deleteBrandQuery = `DELETE FROM ProductBrand WHERE P_productCode = ?`;
  const deleteProductQuery = `DELETE FROM Products WHERE P_productCode = ?`;

  db.query(deleteSupplierQuery, [productCode], (err) => {
    if (err) return callback(err);

    db.query(deleteBrandQuery, [productCode], (err) => {
      if (err) return callback(err);

      db.query(deleteProductQuery, [productCode], (err, results) => {
        if (err) return callback(err);

        callback(null, results);
      });
    });
  });
};

module.exports = {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
};
