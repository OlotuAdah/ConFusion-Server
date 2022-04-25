const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const UserModel = require("./models/user");

exports.local = passport.use(new LocalStrategy(UserModel.authenticate()));

//provides supports for session; attach authenticated user to req object
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());
