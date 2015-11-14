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

passport.use(new GoogleStrategy({
	clientID: '492634215704-u67fql0da7poc7jqcf01c11ljgovdphf.apps.googleusercontent.com',
    	clientSecret: 'bgrmAWX98WT9uLLDtKD-WmNj',
    	callbackURL: "http://127.0.0.1:3000/login/return",
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

  	common.pool.query('SELECT * FROM user WHERE openid = ?',[user.openid], function(err, rows, fields){
  		if(err)  return done(err);
  		
  		if(rows.length>0) {
  			console.log("user already exists");
  			return done(null, user);
  		} 

  		console.log("new user");
  		common.pool.query("INSERT INTO user (name, email, openid, image_url) VALUES (?,?,?,?)",[user.name, user.email, user.openid, user.img], function(err2, rows, fields){
  			if(err2) return done(err2);

  			console.log("new user created");
  			return done(null, user);
  		});
  	});
  }
));

function ensureNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) { return next(); }
  res.redirect('/events');
}

module.exports = router;
