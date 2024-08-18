// const mysql = require('mysql');

// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'Noor1818@',
//   database: 'pan'
// });

// connection.connect((err) => {
//   if (err) {
//     console.error('Error connecting to the database:', err);
//     return;
//   }
//   console.log('Connected to the MySQL server.');
// });

// module.exports = connection;

import mongoose from "mongoose";

export const connectDB = (url) => mongoose.connect(url);
