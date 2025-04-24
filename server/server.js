const express = require("express");
const cors = require("cors");
const app = express();
const supplierRoutes = require('./src/routes/supplierRoutes.js');
const brandRoutes = require('./src/routes/brandRoutes.js');
const categoryRoutes = require('./src/routes/categoryRoutes.js');
const productRoutes = require('./src/routes/productRoutes.js');
const productStatusRoutes = require('./src/routes/productStatusRoutes.js');
const deliveryModeOfPaymentRoutes = require('./src/routes/deliveryModeOfPaymentRouter.js');
const deliveryPaymentTypesRoutes = require('./src/routes/deliveryPaymentTypesRoutes.js');
const deliveryPaymentStatusRoutes = require('./src/routes/deliveryPaymentStatusRoutes.js');
const returnsRoutes = require('./src/routes/returnsRoutes.js');
const supBrdCatStatusRoutes = require('./src/routes/SupBrdCatStatusRoutes.js');
const returnTypeRoutes = require('./src/routes/returnTypeRoutes.js');
app.use(
  cors({
    //allow origin port of frontend
    //change to * if all origin, pero specify muna natin
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ['Content-Type']
  })
)
app.use(express.json());

// Use all routes for each entity here
app.use("/suppliers", supplierRoutes);
app.use("/brands", brandRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/productStatus", productStatusRoutes);
app.use("/deliveryMOP", deliveryModeOfPaymentRoutes);
app.use("/deliveryPayTypes", deliveryPaymentTypesRoutes);
app.use("/deliveryPayStatus", deliveryPaymentStatusRoutes);
app.use('/returns', returnsRoutes);
app.use("/supBrdCatStatus", supBrdCatStatusRoutes);
app.use(cors());

// Log that server is running
app.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});

