var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET downforthis page. */
router.get('/downforthis', function(req, res, next) {
  res.render('downforthis', { title: 'Down for this?' });
});

module.exports = router;
