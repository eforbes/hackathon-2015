var express = require('express');
var router = express.Router();
var common = require('./../common.js');

router.post('/invite', ensureAuthenticated, function(req, res, next) {
  console.log("invite: ", JSON.stringify(req.body));
  
});


function invite(eventId, userId, next) {
  console.log("submit invitation: ", eventId, ", ", userId);
  
  common.pool.query("INSERT INTO `invitation` (user_id, event_id) VALUES (?,?)",
    [userId, eventId],
    function(err, rows, fields) {
      if (err) {
        return next(err);
      }
      else {
        return next(null);
      }
    }
  );
  
}


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

module.exports = router;
