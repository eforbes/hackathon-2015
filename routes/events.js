var express = require('express');
var router = express.Router();

var common = require('./../common.js');

router.get('/', ensureAuthenticated, function(req, res, next) {
  console.log("user", JSON.stringify(req.user));
  res.render('downforthis', { title: 'Down for this?', user: req.user});
});

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
        res.redirect('/events');
        return;
      }
    }
  );
  
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

module.exports = router;
