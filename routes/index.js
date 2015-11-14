var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET downforthis page. */
router.get('/downforthis', ensureAuthenticated, function(req, res, next) {
  res.render('downforthis', { title: 'Down for this?' });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}


module.exports = router;
