const configMap = {
  supplier: {
    label: "Supplier",
    idField: "S_supplierID",
    nameField: "S_supplierName",
    api: {
      fetch: "http://localhost:8080/fetchSupplier",
      add: "http://localhost:8080/addSupplier",
      update: "http://localhost:8080/updateSupplier",
      delete: "http://localhost:8080/deleteSupplier",
    },
  },

  brand: {
    label: "Brand",
    idField: "B_brandID",
    nameField: "B_brandName",
    api: {
      fetch: "http://localhost:8080/fetchBrand",
      add: "http://localhost:8080/addBrand",
      update: "http://localhost:8080/updateBrand",
      delete: "http://localhost:8080/deleteBrand",
    },
  }
  
};

export default configMap;




// const configMap = {
//     supplier: {
//       label: "Supplier",
//       codeLabel: "Code",
//       fields: ["S_supplierName", "S_supplierID"],
//       api: {
//         fetch: "fetchSupplier",
//         add: "addSupplier",
//         update: "updateSupplier",
//         delete: "deleteSupplier",
//       }
//     },

//     brand: {
//       label: "Brand",
//       codeLabel: "Brand ID",
//       fields: ["B_brandName", "B_brandID"],
//       api: {
//         fetch: "fetchBrand",
//         add: "addBrand",
//         update: "updateBrand",
//         delete: "deleteBrand",
//       }
//     },

//     category: {
//       label: "Category",
//       codeLabel: "Category ID",
//       fields: ["C_categoryName", "C_categoryID"],
//       api: {
//         fetch: "fetchCategory",
//         add: "addCategory",
//         update: "updateCategory",
//         delete: "deleteCategory",
//         }
//     },

//     product_status: {
//         label: "Product Status",
//         codeLabel: "Product Status ID",
//         fields: ["P_productStatusName", "P_productStatusID"],
//         api: {
//           fetch: "fetchProductStatus",
//           add: "addProductStatus",
//           update: "updateProductStatus",
//           delete: "deleteProductStatus",
//         }
//       },

//       payment_type: {
//         label: "Payment Type",
//         codeLabel: "Payment Type ID",
//         fields: ["D_paymentTypeName", "D_paymentTypeID"],
//         api: {
//           fetch: "fetchProductStatus",
//           add: "addProductStatus",
//           update: "updateProductStatus",
//           delete: "deleteProductStatus",
//         }
//       }


//     //  ReturnType
//     //  DeliveryModeOfPayment
//     //  DeliveryPaymentStatus
//     //  DiscountType
    
//   };
  

