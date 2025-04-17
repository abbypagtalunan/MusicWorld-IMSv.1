const express = require("express");
const cors = require("cors");
const app = express();
const supplierRoutes = require('../server/src/routes/supplierRoutes.js');


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

// Log that server is running
app.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});

