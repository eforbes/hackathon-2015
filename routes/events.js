var express = require('express');
var router = express.Router();

var common = require('./../common.js');

router.get('/', ensureAuthenticated,
  function(req, res, next) {
    console.log("user", JSON.stringify(req.user));
    
    common.pool.query(
      "SELECT event_id, condition_id, `invitation`.status AS status, owner AS owner_id, title, description, location, start_time, response_deadline, minimum_attendance, `event`.`status` AS event_status, `owning_user`.name AS owner_name, `owning_user`.email AS owner_email, `owning_user`.image_url AS owner_image, ( SELECT COUNT(*) FROM `invitation` `i` WHERE `i`.event_id = `invitation`.event_id ) as number_invited, ( SELECT COUNT(*) FROM `invitation` `i` WHERE `i`.event_id = `invitation`.event_id AND `i`.`status` = 1 ) as number_attending FROM `invitation` LEFT JOIN `event` ON event_id = `event`.id LEFT JOIN `user` AS owning_user ON `owner` = owning_user.id WHERE user_id = ? and hidden = 0;",
      [req.user.id],
      function(err, rows, fields) {
        if(err) {
          res.sendStatus(500);
          return;
        }
        
        res.render('downforthis', {
          title: 'Down for this?',
          user: req.user,
          events: rows
        });
      }
    );
  }
);

router.post('/', ensureAuthenticated, function(req, res, next) {
  console.log("submit event: ", JSON.stringify(req.body));
  
  common.pool.query("INSERT INTO `event` (owner, title, description, location, start_time, response_deadline, minimum_attendance) VALUES (?,?,?,?,?,?,?)",
    [req.user.id, req.body.title, req.body.description, req.body.location, req.body.start_time, req.body.response_deadline, req.body.minimum_attendance],
    function(err, rows, fields) {
      if (err) {
        res.sendStatus(500);
        return;
      }
      else {
        var eventId = rows.insertId;
        
        common.pool.query("INSERT INTO `invitation` (user_id, event_id, status) VALUES (?,?,?)",
          [req.user.id, eventId, 1], // automatically accept
          function(err, rows, fields) {
            if (err) {
              // if this happens, we have an inconsistent database state
              res.sendStatus(500);
            }
            res.redirect('/events');
          }
        );
      }
    }
  );
  
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

module.exports = router;
