var express = require('express');
var router = express.Router();
var common = require('./../common.js');

router.post('/invite', ensureAuthenticated, function(req, res, next) {
  console.log("invite: ", JSON.stringify(req.body));
  
  if (req.body.type === "user") {
    invite(req.body.eventId, req.body.id,
      function(err){
        if (err) {
          res.sendStatus(500);
        }
        else {
          res.sendStatus(200);
        }
      }
    );
  }
  else if (req.body.type === "group") {
    
    // get group members
    common.pool.query("SELECT `user_id` FROM `group_membership` WHERE `group_id` = ?",
      [req.body.id],
      function(err, rows, fields){
        if (err) {
          return next(err);
        }
        
        for (var i = 0; i < rows.length; i++) {
          invite(req.body.eventID, rows[i].user_id,
            function(err) {
              // do nothing, dangerously
              // evan knows a fancy way of doing this correctly
            }
          );
        }
      }
    );

  }
  else {
    // bad string
    res.sendStatus(500);
  }
  
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
