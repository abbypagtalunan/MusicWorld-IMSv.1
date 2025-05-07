const express = require("express");
const cors = require("cors");
const app = express();

// Enable CORS first, before route definitions
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ['Content-Type']
  })
);

// Parse JSON bodies
app.use(express.json());

// Import routes
const supplierRoutes = require('./src/routes/supplierRoutes');
const brandRoutes = require('./src/routes/brandRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const productRoutes = require('./src/routes/productRoutes');
const productStockRoutes = require('./src/routes/productStockRoutes');
const productStatusRoutes = require('./src/routes/productStatusRoutes');
const deletedDeliveriesRoutes = require('./src/routes/deletedDeliveriesRoutes');
const deletedOrdersRoutes = require('./src/routes/deletedOrdersRoutes');
const deletedProductsRoutes = require('./src/routes/deletedProductsRoutes');
const deletedReturnsRoutes = require('./src/routes/deletedReturnsRoutes');
const deliveryRoutes = require('./src/routes/deliveryRoutes');
const returnsRoutes = require('./src/routes/returnsRoutes');
const supBrdCatStatusRoutes = require('./src/routes/SupBrdCatStatusRoutes');
const returnTypeRoutes = require('./src/routes/returnTypeRoutes');
const discountRoutes = require('./src/routes/discountRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const orderDetailsRoutes = require('./src/routes/orderDetailsRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const accountRoutes = require('./src/routes/accountRoutes');

// Mount routes
app.use("/suppliers", supplierRoutes);
app.use("/brands", brandRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/productStocks", productStockRoutes);
app.use("/productStatus", productStatusRoutes);
app.use('/deletedDeliveries', deletedDeliveriesRoutes);
app.use('/deletedOrders', deletedOrdersRoutes);
app.use('/deletedProducts', deletedProductsRoutes);
app.use('/deletedReturns', deletedReturnsRoutes);
app.use('/deliveries', deliveryRoutes); // All delivery-related routes
app.use('/returns', returnsRoutes);
app.use("/supBrdCatStatus", supBrdCatStatusRoutes);
app.use('/discounts', discountRoutes);
app.use("/returnTypes", returnTypeRoutes);
app.use("/orders", orderRoutes);
app.use("/orderDetails", orderDetailsRoutes);
app.use("/transactions", transactionRoutes);
app.use("/accounts", accountRoutes); // All account-related routes

// Log that server is running
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});