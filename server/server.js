const mysql = require('mysql2');
const express = require('express')
const cors = require('cors');
const app = express()
app.use(
  cors({
    //allow origin port of frontend
    //change to * if all origin, pero specify muna natin
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], //allowable action methods can be changed
    allowedHeaders: ['Content-Type']
  })
)
app.use(express.json());

//NOTE:
// GET	Fetch data
// POST	Create something new
// PUT	Replace something completely
// PATCH	Update part of something
// DELETE	Remove something

const db = mysql.createPool({
  host: 'mysql-d56cb8-mworld-inventory.g.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_zCHF-_W0nDdwgf4J8sC',
  database: 'defaultdb',
  port: 11348,
  ssl: {
    rejectUnauthorized: false
  }
});


// route, (request: incoming http requests, body, address , response: modify and send back)
app.get('/fetchSupplier', (req, res) => {
  const query = 'SELECT S_supplierID, S_supplierName FROM Suppliers';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Error fetching data' }); //status number for error fetching data
    } else {
      res.json(results); //Send results ano lalabas sa website
    }
  });
});

// ADD supplier config
app.post('/addSupplier', (req, res) => {
  const { S_supplierID, S_supplierName } = req.body;
  if (!S_supplierID || !S_supplierName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const query = 'INSERT INTO Suppliers (S_supplierID, S_supplierName) VALUES (?, ?)';
  db.query(query, [S_supplierID, S_supplierName], (err, results) => {
    if (err) {
      console.error('Error inserting supplier:', err);
      res.status(500).json({ message: 'Error inserting supplier' });
    } else {
      res.status(201).json({ message: 'Supplier added successfully', id: results.insertId });
    }
  });
});

// PUT /updateSupplier/:id - Update supplier details
app.put('/updateSupplier/:id', (req, res) => {
  const supplierId = req.params.id;  // Extract supplier ID from the URL parameter
  const { S_supplierName, S_supplierID } = req.body; // Get the new data from the request body

  if (!S_supplierName || !S_supplierID) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const query = `
    UPDATE Suppliers
    SET S_supplierName = ?
    WHERE S_supplierID = ?;
  `;
  db.query(query, [S_supplierName, S_supplierID, supplierId], (err, results) => {
    if (err) {
      console.error('Error updating supplier:', err);
      return res.status(500).json({ message: 'Error updating supplier' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(200).json({ message: 'Supplier updated successfully' });
  });
});

app.delete('/deleteSupplier/:id', (req, res) => {
  const supplierId = req.params.id; 
  const query = 'DELETE FROM Suppliers WHERE S_supplierID = ?'; // Use S_supplierID here
  db.query(query, [supplierId], (err, results) => {
    if (err) {
      console.error('Error deleting supplier:', err);
      res.status(500).json({ message: 'Error deleting supplier', results });
    } else {
      res.status(200).json({ message: 'Supplier deleted successfully', results });
    }
  });
});


// give back array to server
app.get("/api/users", (req, res)=> {
  res.send([
    {id: 1, username: "aba"}
  ]);

  // Query Parameter
  // localhost:8080/product?key=value&key2=value2
  console.log(req.query)
});

// route finder "/api/users"/:id for single user record
app.get("/api/users/:id", (req, res)=> {
  console.log(req.params)
  //const parsedID = parseInt(req.params.id)
  // input validation
  // if(isNaN(parsedID))
  //   return res.status(400).send({msg: "Error"});
  // const findUser = [userdb].sendStatus(404);
  // return res.send(findUser);
});

//Query Parameter
app.get("/api/users", (req, res)=> {
  console.log(req.query)

  //deconstruct request
  const {
    query : {filter, value},
  } = req;

  // if(filter && value)

  //RETURN VALUE OF FILTER
  //   return response.send(
  // filter array or data that matches value
  //     array.filter((user) => user[filter].includes(value))
  // );

  // return response.send(all)
})




//dedicated port for backend
app.listen(8080, () => {
  console.log('Server running on http://localhost:8080');
});


// MIDDLEWARE
// next: function u call when done with middleware
// app.get("/", (req, res, next) => {

// })
