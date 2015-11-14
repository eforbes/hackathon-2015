var express = require('express');
var router = express.Router();

var common = require('./../common.js');

router.get('/', ensureAuthenticated, function(req, res, next) {
  console.log("user", JSON.stringify(req.user));
  res.render('downforthis', { title: 'Down for this?', user: req.user});
});

router.post('/', ensureAuthenticated, function(req, res, next) {
  console.log("submit event: ", JSON.stringify(request.body));



  
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

module.exports = router;
