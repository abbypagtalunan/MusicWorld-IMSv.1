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

// Import all routes
const supplierRoutes = require('./src/routes/supplierRoutes');
const brandRoutes = require('./src/routes/brandRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const productRoutes = require('./src/routes/productRoutes');
const productStockRoutes = require('./src/routes/productStockRoutes');
const productStatusRoutes = require('./src/routes/productStatusRoutes');
const deliveryRoutes = require('./src/routes/deliveryRoutes');
const deliveryModeOfPaymentRoutes = require('./src/routes/deliveryModeOfPaymentRouter');
const deliveryPaymentTypesRoutes = require('./src/routes/deliveryPaymentTypesRoutes');
const deliveryPaymentStatusRoutes = require('./src/routes/deliveryPaymentStatusRoutes');
const returnRoutes = require('./src/routes/returnsRoutes');
const supBrdCatStatusRoutes = require('./src/routes/SupBrdCatStatusRoutes');

// Setup delivery products and payment details routes
app.use('/deliveryProducts', require('./src/routes/deliveryRoutes'));
app.use('/deliveryPaymentDetails', require('./src/routes/deliveryRoutes'));

// Use all routes for each entity here
app.use("/suppliers", supplierRoutes);
app.use("/brands", brandRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/productStocks", productStockRoutes);
app.use("/productStatus", productStatusRoutes);
app.use('/deliveries', deliveryRoutes);
app.use("/deliveryModeOfPayment", deliveryModeOfPaymentRoutes);
app.use("/deliveryPaymentTypes", deliveryPaymentTypesRoutes);
app.use("/deliveryPaymentStatus", deliveryPaymentStatusRoutes);
app.use('/returns', returnRoutes);
app.use("/supBrdCatStatus", supBrdCatStatusRoutes);

// Log that server is running
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});