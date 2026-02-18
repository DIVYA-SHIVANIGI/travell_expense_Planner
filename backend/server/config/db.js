const mysql = require('mysql');
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "home_essentials"
});
db.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL!");
});
module.exports = db;
