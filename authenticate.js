const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const UserModel = require("./models/user");
const config = require("./config");
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");

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
  new JWTStrategy(opts, (jwt_payload, done) => {
    UserModel.findOne({ _id: jwt_payload._id })
      .then((user) => {
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      })
      .catch((err) => done(err, false));
  })
);

exports.verifyUser = passport.authenticate("jwt", { session: false }); //jwy isn't creating session
