var express = require('express');
var router = express.Router();

var passport = require('passport')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var common = require('./../common.js');

router.get('/return', passport.authenticate('google', {failureRedirect: '/error'}),
 function(req, res){
    res.redirect('/events');
});

router.get('/', ensureNotAuthenticated, passport.authenticate('google'));

// get a user by their email address
router.get('/getUserByEmail', function(req, res, next){
  console.log("get user by email", req.query);
  var email = req.query.email;
  
  if (!email) {
    res.sendStatus(400); // bad request
  }
  
  common.pool.query("SELECT * FROM user WHERE email=?",
    [email],
    function(err, rows, fields) {
      if (err) {
        console.log("getUserByEmail error:", err);
        res.sendStatus(500);
        return;
      }
      else if (rows.length == 0) {
        res.sendStatus(404);
        return;
      }
      else {
        res.send(rows[0]);
      }
    }
  );
});

// get all of my favorites
router.get('/getFavoriteUsers', ensureAuthenticated,
  function(req, res, next) {
    common.pool.query("SELECT id, name, email, image_url FROM favorite LEFT JOIN `user` on favoritee = id WHERE favoriter = ?;",
      [req.user.id],
      function(err, rows, fields) {
        if (err) {
          res.sendStatus(500);
          return;
        }
        res.send(rows);
      }
    );
  }
);

// INSECURELY get all of my favorites
router.post('/getFavoriteUsers',
  function(req, res, next) {
    common.pool.query("SELECT id, name, email, image_url FROM favorite LEFT JOIN `user` on favoritee = id WHERE favoriter = ?;",
      [req.body.id],
      function(err, rows, fields) {
        if (err) {
          res.sendStatus(500);
          return;
        }
        res.send({rows: rows});
      }
    );
  }
);

// set or unset a user as a favorite
router.post('/setFavorite', ensureAuthenticated,
  function(req, res, next) {
    if (req.body.favorite === "true") {
      common.pool.query("INSERT IGNORE INTO favorite (favoriter, favoritee) VALUES (?, ?)",
        [req.user.id, req.body.favoriteeId],
        function(err, rows, fields) {
          if (err) {
            res.sendStatus(500);
            return;
          }
          res.send({status: true});
        }
      );
    }
    else {
      common.pool.query("DELETE FROM favorite WHERE favoriter = ? AND favoritee = ?",
        [req.user.id, req.body.favoriteeId],
        function(err, rows, fields) {
          if (err) {
            res.sendStatus(500);
            return;
          }
          res.send({status: false});
        }
      );
    }
  }
);

// INSECURELY set or unset a user as a favorite
router.post('/secureSetFavorite',
  function(req, res, next) {
    if (req.body.favorite === "true") {
      common.pool.query("INSERT IGNORE INTO favorite (favoriter, favoritee) VALUES (?, ?)",
        [req.body.id, req.body.favoriteeId],
        function(err, rows, fields) {
          if (err) {
            res.sendStatus(500);
            return;
          }
          res.send({status: true});
        }
      );
    }
    else {
      common.pool.query("DELETE FROM favorite WHERE favoriter = ? AND favoritee = ?",
        [req.body.id, req.body.favoriteeId],
        function(err, rows, fields) {
          if (err) {
            res.sendStatus(500);
            return;
          }
          res.send({status: false});
        }
      );
    }
  }
);

passport.use(new GoogleStrategy({
    clientID: '492634215704-u67fql0da7poc7jqcf01c11ljgovdphf.apps.googleusercontent.com',
    clientSecret: 'bgrmAWX98WT9uLLDtKD-WmNj',
    callbackURL: "http://" + common.serverAddress + "/login/return",
    scope: ['profile','email']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log("tok ", accessToken);
  
    var user = {
      openid: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      img: profile.photos[0].value
    };
    createUser(user, done);
    
  }
));

// INSECURELY create user or log in
router.post('/secureUserCreate',
  function(req, res, next) {
    console.log('"secure" user create: ', JSON.stringify(req.body));
    
    var user = {
      openid: req.body.openid,
      name:   req.body.name,
      email:  req.body.email,
      img:    req.body.img
    };
    
    createUser(user,
      function(err, user) {
        if(err) {
          console.log("dalbers error: ", err);
          res.send(500);
        }
        else {
          res.send(user);
        }
      }
    );
  }
);

router.get('/logout', function(req, res, next) {
	req.logout();
  	res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

function ensureNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) { return next(); }
  res.redirect('/events');
}

// create a new user, or not if it isn't new
function createUser(user, done) {
  common.pool.query('SELECT * FROM user WHERE openid = ?',
    [user.openid],
    function(err, rows, fields){
      if(err)  return done(err);
      
      if(rows.length > 0) {
        console.log("user already exists");
        user.id = rows[0].id;
        return done(null, user);
      } 

      console.log("new user");
      common.pool.query("INSERT INTO user (name, email, openid, image_url) VALUES (?,?,?,?)",
        [user.name, user.email, user.openid, user.img],
        function(err2, rows, fields){
          if(err2) return done(err2);

          user.id = rows.insertId;
          return done(null, user);
        }
      );
    }
  );
}

module.exports = router;
