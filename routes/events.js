var express = require('express');
var router = express.Router();
var common = require('./../common.js');

// get list of events a user is invited to
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

// INSECURELY get list of events a user is invited to
router.post('/secureListEvents',
  function(req, res, next) {
    console.log("user", JSON.stringify(req.body));
    
    common.pool.query(
      "SELECT event_id, condition_id, `invitation`.status AS status, owner AS owner_id, title, description, location, start_time, response_deadline, minimum_attendance, `event`.`status` AS event_status, `owning_user`.name AS owner_name, `owning_user`.email AS owner_email, `owning_user`.image_url AS owner_image, ( SELECT COUNT(*) FROM `invitation` `i` WHERE `i`.event_id = `invitation`.event_id ) as number_invited, ( SELECT COUNT(*) FROM `invitation` `i` WHERE `i`.event_id = `invitation`.event_id AND `i`.`status` = 1 ) as number_attending FROM `invitation` LEFT JOIN `event` ON event_id = `event`.id LEFT JOIN `user` AS owning_user ON `owner` = owning_user.id WHERE user_id = ? and hidden = 0;",
      [req.body.id],
      function(err, rows, fields) {
        if(err) {
          res.sendStatus(500);
          return;
        }
        
        res.send({rows: rows});
      }
    );
  }
);

// respond to an invitation
router.post('/respond', ensureAuthenticated,
  function(req, res, next) {
    console.log("respond to event: ", JSON.stringify(req.body));
    
    common.pool.query("UPDATE `invitation` SET `status` = ? WHERE user_id = ? AND event_id = ?",
      [req.body.status, req.user.id, req.body.eventId],
      function(err, rows, fields) {
        if (err) {
          res.sendStatus(500);
        }
        else {
          res.sendStatus(204);
        }
      }
    );
  }
);

// INSECURELY respond to an invitation
router.post('/secureRespond',
  function(req, res, next) {
    console.log("respond to event: ", JSON.stringify(req.body));
    
    common.pool.query("UPDATE `invitation` SET `status` = ? WHERE user_id = ? AND event_id = ?",
      [req.body.status, req.body.id, req.body.eventId],
      function(err, rows, fields) {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        }
        else {
          res.send({message: "you did it! woo!"});
        }
      }
    );
  }
);

// submit a new event
router.post('/', ensureAuthenticated,
  function(req, res, next) {
    console.log("submit event: ", JSON.stringify(req.body));

    if(!req.body.minimum_attendance) {
      req.body.minimum_attendance = 0;
    }

    var response_date_obj = getDateObj(req.body.response_date, req.body.response_time);
    var start_date_obj = getDateObj(req.body.start_date, req.body.start_time);

    common.pool.query("INSERT INTO `event` (owner, title, description, location, start_time, response_deadline, minimum_attendance) VALUES (?,?,?,?,?,?,?)",
      [req.user.id, req.body.title, req.body.description, req.body.location, start_date_obj, response_date_obj, req.body.minimum_attendance],
      function(err, rows, fields) {
        if (err) {
          res.sendStatus(500);
          return;
        }
        else {
          var eventId = rows.insertId;
          
          common.pool.query("INSERT INTO `invitation` (user_id, event_id, status) VALUES (?,?,?)",
            [req.user.id, eventId, 1], // automatically accept
            function(err2, rows2, fields2) {
              if (err2) {
                // if this happens, we have an inconsistent database state
                console.log("ERR NEW:", err2);
                res.sendStatus(500);
                return;
              }
              res.redirect('/events');
            }
          );
        }
      }
    );
  }
);

// INSECURELY submit a new event
router.post('/secureCreateEvent',
  function(req, res, next) {
    console.log("submit event: ", JSON.stringify(req.body));

    if(!req.body.minimum_attendance) {
      req.body.minimum_attendance = 0;
    }

    var response_date_obj = getDateObj(req.body.response_date, req.body.response_time);
    var start_date_obj = getDateObj(req.body.start_date, req.body.start_time);

    common.pool.query("INSERT INTO `event` (owner, title, description, location, start_time, response_deadline, minimum_attendance) VALUES (?,?,?,?,?,?,?)",
      [req.body.id, req.body.title, req.body.description, req.body.location, start_date_obj, response_date_obj, req.body.minimum_attendance],
      function(err, rows, fields) {
        if (err) {
          console.log("secureCreateEvent error:", err);
          res.sendStatus(500);
          return;
        }
        else {
          var eventId = rows.insertId;
          
          common.pool.query("INSERT INTO `invitation` (user_id, event_id, status) VALUES (?,?,?)",
            [req.body.id, eventId, 1], // automatically accept
            function(err, rows, fields) {
              if (err) {
                // if this happens, we have an inconsistent database state
                res.sendStatus(500);
              }
              
              res.send({eventId: eventId});
            }
          );
        }
      }
    );
  }
);

// get list of users attending an event
router.post('/getAttendingUsers', ensureAuthenticated,
  function(req, res, next) {
    console.log("get attending users:", JSON.stringify(req.body));
    
    common.pool.query(
      "SELECT user_id, `status`, name, email, image_url, NOT (favoritee IS NULL) AS is_favorite FROM `invitation` LEFT JOIN `user` on user_id = id LEFT JOIN favorite on favoriter = ? AND favoritee = user_id WHERE event_id = ?",
      [req.user.id, req.body.eventId],
      function(err, rows, fields) {
        if(err) {
          res.sendStatus(500);
          return;
        }
        
        res.send(rows);
      }
    );
  }
);

// INSECURELY get list of users attending an event
router.post('/secureGetAttendingUsers',
  function(req, res, next) {
    console.log("insecurely get attending users:", JSON.stringify(req.body));
    
    common.pool.query(
      "SELECT user_id, `status`, name, email, image_url, NOT (favoritee IS NULL) AS is_favorite FROM `invitation` LEFT JOIN `user` on user_id = id LEFT JOIN favorite on favoriter = ? AND favoritee = user_id WHERE event_id = ?",
      [req.body.id, req.body.eventId],
      function(err, rows, fields) {
        if(err) {
          res.sendStatus(500);
          return;
        }
        
        res.send({rows: rows});
      }
    );
  }
);

// dismiss an event
router.post('/dismiss', ensureAuthenticated,
  function(req, res, next) {
    console.log("dismiss event:", JSON.stringify(req.body));
    
    common.pool.query("UPDATE `invitation` SET `hidden` = ? WHERE user_id = ? AND event_id = ?",
      [req.body.hidden, req.user.id, req.body.eventId],
      function(err, rows, fields) {
        if (err) {
          res.sendStatus(500);
        }
        else {
          res.sendStatus(204);
        }
      }
    );
  }
);

// INSECURELY dismiss an event
router.post('/secureDismiss', 
  function(req, res, next) {
    console.log("insecurely dismiss event:", JSON.stringify(req.body));
    
    common.pool.query("UPDATE `invitation` SET `hidden` = ? WHERE user_id = ? AND event_id = ?",
      [req.body.hidden, req.body.id, req.body.eventId],
      function(err, rows, fields) {
        if (err) {
          res.sendStatus(500);
        }
        else {
          res.send({}); // I wonder if this is ok
        }
      }
    );
  }
);

function getDateObj(d, t) {
    var parts = d.split("-");
    var time_parts = t.split(":");
    var hour = parseInt(time_parts[0])+(t.indexOf("am")>=0?0:12);
    console.log(parts[2], parts[1]-1, parts[0], hour, time_parts[1].substring(0,2));
    return new Date(parts[2], parts[0]-1, parts[1], hour, time_parts[1].substring(0,2));
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

module.exports = router;
