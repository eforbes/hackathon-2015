var mysql      = require('mysql');

module.exports.pool = mysql.createPool({
  connectionLimit: 10,
  host     : "michael.evanforbes.net",
  user     : "michrosoft",
  password : "OneMansJunk",
  database : "michrosoft",
  port     : 3306
});
