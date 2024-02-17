//original 3 lines
//main auth library
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
//JSON Web Token auth strateggy
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens

const config = require("./config.js");

// original
exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
  return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    console.log("JWT payload:", jwt_payload);
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) {
        return done(err, false);
      } else if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
);

exports.verifyUser = passport.authenticate("jwt", { session: false });

// Add this function to your existing authenticate.js file

exports.verifyAdmin = (req, res, next) => {
  // First, verify the user is authenticated
  if (req.isAuthenticated()) {
    // User is authenticated, now check if they are an admin
    if (req.user.admin) {
      // User is an admin, proceed to the next middleware or route handler
      return next();
    } else {
      // User is not an admin, return an error
      var err = new Error("You are not authorized to perform this operation!");
      err.status = 403; // Forbidden
      return next(err);
    }
  } else {
    // User is not authenticated, return an error
    var err = new Error("You are not authenticated!");
    err.status = 401; // Unauthorized
    return next(err);
  }
};
