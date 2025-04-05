const mysql = require('mysql2');
const express = require('express')
const cors = require('cors');
const app = express()
app.use(
  cors({
    //allow origin port of frontend
    //change to * if all origin, pero specify muna natin
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT"], //allowable action methods can be changed
  })
)
app.use(express.json());

//NOTE:
// GET	Fetch data
// POST	Create something new
// PUT	Replace something completely
// PATCH	Update part of something
// DELETE	Remove something

const connection = mysql.createPool({
  host: 'mysql-d56cb8-mworld-inventory.g.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_zCHF-_W0nDdwgf4J8sC',
  database: 'defaultdb',
  port: 11348,
  ssl: {
    rejectUnauthorized: false
  }
});

app.get('/fetchSupplier', (req, res) => {
  const query = 'SELECT S_supplierID, S_supplierName FROM Suppliers';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
});

//dedicated port for backend
app.listen(8080, () => {
  console.log('Server running on http://localhost:8080');
});
