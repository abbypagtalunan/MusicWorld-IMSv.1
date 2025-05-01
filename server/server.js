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

// Routes for Configurations
const supplierRoutes = require('./src/routes/supplierRoutes');
const brandRoutes = require('./src/routes/brandRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const productRoutes = require('./src/routes/productRoutes');
const productStockRoutes = require('./src/routes/productStockRoutes');
const productStatusRoutes = require('./src/routes/productStatusRoutes');
const deletedRoutes = require('./src/routes/deletedRoutes');
const deliveryRoutes = require('./src/routes/deliveryRoutes');
const deliveryModeOfPaymentRoutes = require('./src/routes/deliveryModeOfPaymentRouter');
const deliveryPaymentTypesRoutes = require('./src/routes/deliveryPaymentTypesRoutes');
const deliveryPaymentStatusRoutes = require('./src/routes/deliveryPaymentStatusRoutes');
const returnsRoutes = require('./src/routes/returnsRoutes');
const supBrdCatStatusRoutes = require('./src/routes/SupBrdCatStatusRoutes');
const returnTypeRoutes = require('./src/routes/returnTypeRoutes'); // ←
const discountRoutes = require('./src/routes/discountRoutes');

// Routes for Deliveries
app.use('/deliveryProducts', require('./src/routes/deliveryRoutes'));
app.use('/deliveryPaymentDetails', require('./src/routes/deliveryRoutes'));

// Use all routes for each entity here
app.use("/suppliers", supplierRoutes);
app.use("/brands", brandRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/productStocks", productStockRoutes);
app.use("/productStatus", productStatusRoutes);
app.use('/deleted', deletedRoutes);
app.use('/deliveries', deliveryRoutes);
app.use("/deliveryModeOfPayment", deliveryModeOfPaymentRoutes);
app.use("/deliveryPaymentTypes", deliveryPaymentTypesRoutes);
app.use("/deliveryPaymentStatus", deliveryPaymentStatusRoutes);
app.use('/returns', returnsRoutes);
app.use("/supBrdCatStatus", supBrdCatStatusRoutes);

//Routes for Transaction - Ordering - Discounts
app.use('/discounts', discountRoutes);
app.use("/returnTypes", returnTypeRoutes);

// Log that server is running
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});