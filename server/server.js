const express = require("express");
const cors = require("cors");
const app = express();
const supplierRoutes = require('../server/src/routes/supplierRoutes.js');
const brandRoutes = require('../server/src/routes/brandRoutes.js');
const categoryRoutes = require('../server/src/routes/categoryRoutes.js');
const productRoutes = require('../server/src/routes/productRoutes.js')
const productStatusRoutes = require('../server/src/routes/productStatusRoutes.js');
const deliveryModeOfPaymentRoutes = require('../server/src/routes/deliveryModeOfPaymentRouter.js');
const deliveryPaymentTypesRoutes = require('./src/routes/deliveryPaymentTypesRoutes.js');
const deliveryPaymentStatusRoutes = require('./src/routes/deliveryPaymentStatusRoutes.js');
const returnRoutes = require('../server/src/routes/returnsRoutes,js');
const supBrdCatStatusRoutes = require('./src/routes/SupBrdCatStatusRoutes.js');

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

app.use("/deliveryPayStatus", deliveryPaymentStatusRoutes);
app.use('/returns', returnsRoutes);
app.use("/supBrdCatStatus", supBrdCatStatusRoutes);
app.use(cors());


// Log that server is running
app.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});