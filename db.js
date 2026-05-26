// db.js - MySQL Database Connection
const mysql = require('mysql2');

// MySQL Connection Pool (better than single connection)
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',         // Aapka MySQL username
    password: 'Lata@2004', // Aapka MySQL password
    database: 'ewaste',     // Database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Promise wrapper for async/await support
const db = pool.promise();

// Connection test
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ MySQL Connection FAILED:', err.message);
        console.log('   → MySQL Workbench kholo aur ewaste.sql run karo pehle');
    } else {
        console.log('✅ MySQL Database Connected Successfully!');
        connection.release();
    }
});

module.exports = db;
