const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const UserModel = require("./models/user");
const config = require("./config");
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");
const FacebookTokenStrategy = require("passport-facebook-token");

//exports.local makes this module directly available anywhere it's required
exports.local = passport.use(new LocalStrategy(UserModel.authenticate()));

//provides supports for session; attach authenticated user to req object
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

//exported functions
exports.getToken = (user) => {
  const oneHour = 60 * 60; //3600
  return jwt.sign(user, config.secret, { expiresIn: oneHour });

  //Expires in 1 hour, after which the token needs to be renewed
};

const opts = {};
opts.secretOrKey = config.secret;
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

exports.jwtpassport = passport.use(
  new JWTStrategy(opts, (jwt_returned_user, done) => {
    UserModel.findOne({ _id: jwt_returned_user._id })
      .then((user) => {
        if (user) {
          return done(null, user); //attach user to req object
        }
        return done(null, false);
      })
      .catch((err) => done(err, false));
  })
);
//Facebook OAuth Strategy
const faceBookOAuthOptions = {
  clientID: config.facebook.clientId,
  clientSecret: config.facebook.clientSecret,
};
exports.facebookPassport = passport.use(
  new FacebookTokenStrategy(
    faceBookOAuthOptions,
    (accessToken, refreshToken, profile, done) => {
      UserModel.findOne({ facebookId: profile.id }, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (!err && user !== null) {
          return done(null, user); //attch user to req object
        } else {
          user = new UserModel({ username: profile.displayName });
          user.facebookId = profile.id;
          user.firstname = profile.name.givenName;
          user.lastname = profile.name.familyName;
          user.save((err, user) => {
            if (err) return done(err, false);
            else return done(null, user);
          });
        }
      });
    }
  )
);

exports.verifyUser = passport.authenticate("jwt", { session: false }); //session:false means jwt isn't creating session

exports.verifyAdmin = function (req, res, next) {
  if (req.user.admin) {
    next();
  } else {
    var err = new Error("You are not authorized");
    err.status = 403;
    return next(err);
  }
};
