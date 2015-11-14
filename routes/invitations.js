var express = require('express');
var router = express.Router();

var common = require('./../common.js');

router.post('/invite', ensureAuthenticated, function(req, res, next) {
  console.log("invite: ", JSON.stringify(req.body));

});


function invite(eventId, userId, next) {

}


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

module.exports = router;
