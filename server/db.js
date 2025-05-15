// const mysql = require('mysql2');
// const db = mysql.createPool({
//   host: 'mysql-d56cb8-mworld-inventory.g.aivencloud.com',
//   user: 'avnadmin',
//   password: 'AVNS_zCHF-_W0nDdwgf4J8sC',
//   database: 'defaultdb',
//   port: 11348,
//   ssl: {
//     rejectUnauthorized: false
//   },
//   waitForConnections: true,
//   connectionLimit: 10,  // Limit the number of connections in the pool
//   queueLimit: 0
// });

// db.getConnection((err, connection) => {
//     if (err) {
//       console.error('Could not connect to database:', err);
//     } else {
//       console.log('Connected to MySQL database');
//       connection.release();
//     }
//   });
  
//   module.exports = db;


// FOR REGTEST

const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // ⬅️ No password
  database: 'defaultdb',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('Could not connect to local database:', err);
  } else {
    console.log('Connected to local MySQL database FOR REG TEST');
    connection.release();
  }
});

module.exports = db;

