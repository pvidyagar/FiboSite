// load all the things we need
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
var User       = require('../models/user');

// load the auth variables
var configAuth = require('./auth'); // use this one for testing

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });


    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        passReqToCallback : true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        profileFields   : ["id" , "emails" , "first_name" , "last_name" , "gender" , "friends" , "picture.type(large)"],
        enableProof : true
    },
    function(req, token, refreshToken, profile, done) {

       // var username = profile._json.name.split(' ').join(' ');

        // asynchronous
        process.nextTick(function() {

            console.log(profile);

            // check if the user is already logged in
            if (!req.user) {
            	//User is not logged in
                User.findOne({ 'profileId' : profile.id }, function(err, user) {

                    if (err)
                        return done(err);
                    //If we have user registered 
                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.token) {
                        	user.provider	= profile.provider;
                        	user.token		= token;
                            user.name		= profile.name.givenName + ' ' + profile.name.familyName;
                            user.email		= (profile.emails)? profile.emails[0].value: '';
                            user.gender	= profile.gender;
                            user.photo		= (profile.photos)? profile.photos[0].value: '';
                            user.role		= "Chef";
                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        var newUser            = new User();

                        newUser.provider	= profile.provider;
                        newUser.profileId	= profile.id;
                        newUser.token		= token;
                        newUser.name		= profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.email		= (profile.emails)? profile.emails[0].value: '';
                        newUser.gender		= profile.gender;
                        newUser.photo		= (profile.photos)? profile.photos[0].value: '';
                        newUser.role		= "Chef";
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user            = req.user; // pull the user out of the session
                user.provider	= profile.provider;
                user.profileId		= profile.id;
                user.token		= token;
                user.name		= profile.name.givenName + ' ' + profile.name.familyName;
                user.email		= (profile.emails)? profile.emails[0].value: '';
                user.gender	= profile.gender;
                user.photo	= (profile.photos)? profile.photos[0].value: '';
                user.role		= "Chef";
                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });

            }
        });

    }));


    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            console.log(profile);

            // check if the user is already logged in
            if (!req.user) {

                User.findOne({ 'profileId' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.token) {
                        	user.provider	= profile.provider;
                            user.token 		= token;
                            user.name  		= profile.displayName;
                            user.email 		= profile.emails[0].value; // pull the first email
                            user.gender 		= profile.gender;
                            user.photo		= (profile.photos)? profile.photos[0].value: '';
                            user.role		= "User";
                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user);
                    } else {
                        var newUser          = new User();
                        newUser.provider    = profile.provider;
                        newUser.profileId   = profile.id;
                        newUser.token 		= token;
                        newUser.name  		= profile.displayName;
                        newUser.email 		= profile.emails[0].value; // pull the first email
                        newUser.gender 		= profile.gender;
                        newUser.photo		= (profile.photos)? profile.photos[0].value: '';
                        newUser.role		= "User";
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user               = req.user; // pull the user out of the session
                
                user.provider   = profile.provider;
                user.profileId	= profile.id;
                user.token		= token;
                user.name 		= profile.displayName;
                user.email		= profile.emails[0].value; // pull the first email
                user.gender		= profile.gender;
                user.photo		= (profile.photos)? profile.photos[0].value: '';
                user.role		= "User";
                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });

            }

        });

    }));

};
