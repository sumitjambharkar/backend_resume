const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require("./model/User")

// Configure Passport
passport.use(new GoogleStrategy({
    clientID: '1039391698722-ftracto0ej906fs87n0bfb7gnekc7chn.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "/auth/google/callback"
  }, function(accessToken, refreshToken, profile, done) {
    // Check if user already exists in database
    User.findOne({ googleId: profile.id }).then(existingUser => {
      if (existingUser) {
        // User already exists, return the user
        done(null, existingUser);
      } else {
        // User doesn't exist, create a new user in the database
        new User({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          image:profile.photos[0].value,
        }).save().then(newUser => {
          done(null, newUser);
        });
      }
    });
}));

// Passport session setup
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id)
      .then(user => {
          done(null, user);
      })
      .catch(err => {
          done(err, null);
      });
});
