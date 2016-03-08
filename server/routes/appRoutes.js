var User = require('../models/user');
var uniqueValidator = require('mongoose-unique-validator');

module.exports = function(app, passport) {

	// normal routes
	// ===============================================================

	app.get('/', function(req, res) {
		res.render('homeDelights', {
			user : req.user ? req.user : null
		});
	});

	app.get('/welcome', isLoggedIn, function(req, res) {
		res.render('homeDelights', {
			user : req.user
		});
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.render('homeDelights', {
			user : null
		});
	});

	app.get('/fetchUserInfo', function(req, res) {
		userInfo = req.user;
		res.json(userInfo);
	});

	app.post('/updateUserInfo', function(req, res) {
		var data = req.body

		User.update({
			_id : data.id
		}, {
			$set : {
				"name" : data.name,
				"gender" : data.gender,
				"email" : data.email,
				"mobileno" : data.mobileno,
				"address" : data.address
			}
		}, function(err, doc) {
			if (err || !doc) {
				console.log(err);
			} else {
				console.log(doc);
				res.json(doc);
			}
		});
	});

	app.post('/signUpData/:role', function(req, res) {
		var userData = User({

			name : req.body.fullname,
			email : req.body.email,
			mobileno : req.body.mobilenumber,
			role : req.params.role,
			password : req.body.password
		});

		userData.save(function(err, docs) {

			if (err != null) {
				res.json(true);
			} else {
				res.json(false);
			}
		});

	});
	// =============================================================================
	// AUTHENTICATE (FIRST LOGIN)
	// ==================================================
	// =============================================================================

	// facebook -------------------------------

	// send to facebook to do the authentication
	app.get('/auth/facebook', passport.authenticate('facebook', {
		scope : [ 'public_profile', 'email', 'user_friends' ]
	}));

	// handle the callback after facebook has authenticated the user
	app.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect : '/welcome',
		failureRedirect : '/'
	}));

	// google ---------------------------------

	// send to google to do the authentication
	app.get('/auth/google', passport.authenticate('google', {
		scope : [ 'profile', 'email' ]
	}));

	// the callback after google has authenticated the user
	app.get('/auth/google/callback', passport.authenticate('google', {
		successRedirect : '/welcome',
		failureRedirect : '/'
	}));

	// =============================================================================
	// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT)
	// =============
	// =============================================================================

	// facebook -------------------------------

	// send to facebook to do the authentication
	app.get('/auth/facebook', passport.authorize('facebook', {
		scope : [ 'public_profile', 'email', 'user_friends' ]
	}));

	// handle the callback after facebook has authorized the user
	app.get('/auth/facebook/callback', passport.authorize('facebook', {
		successRedirect : '/welcome',
		failureRedirect : '/'
	}));

	// google ---------------------------------

	// send to google to do the authentication
	app.get('/auth/google', passport.authorize('google', {
		scope : [ 'profile', 'email' ]
	}));

	// the callback after google has authorized the user
	app.get('/auth/google/callback', passport.authorize('google', {
		successRedirect : '/welcome',
		failureRedirect : '/'
	}));

	// =============================================================================
	// UNLINK ACCOUNTS
	// =============================================================
	// =============================================================================
	// used to unlink accounts. for social accounts, just remove the token
	// for local account, remove email and password
	// user account will stay active in case they want to reconnect in the
	// future

	// facebook -------------------------------
	app.get('/unlink/facebook', function(req, res) {
		var user = req.user;
		user.facebook.token = undefined;
		user.save(function(err) {
			res.redirect('/welcome');
		});
	});

	// google ---------------------------------
	app.get('/unlink/google', function(req, res) {
		var user = req.user;
		user.google.token = undefined;
		user.save(function(err) {
			res.redirect('/welcome');
		});
	});

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}
