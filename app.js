const createError = require("http-errors");
const express = require("express");
const path = require("path");
// const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const dishRouter = require("./routes/dishRouter");
const usersRouter = require("./routes/users");
const promoRouter = require("./routes/promoRouter");
const leaderRouter = require("./routes/leaderRouter");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
////////
const passport = require("passport");
const authenticate = require("./authenticate");

const mongoose = require("mongoose");
const uri = "mongodb://localhost:27017/conFusion";
const connect = mongoose.connect(uri);
////////
connect.then(
  (db) => {
    console.log("Connected correctly to server!");
  },
  (err) => console.log(err)
);

///////

const app = express();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser("12345-67890-12345-67890"));
app.use(
  session({
    name: "session-id",
    secret: "12345-67890-54321-67890", //uuid preferable
    saveUninitialized: false,
    resave: false,
    store: new FileStore(),
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);
app.use("/users", usersRouter);

//Authenticate before user interact with other endpoints (data)
function auth(req, _, next) {
  //The res object is not needed in this block
  if (!req.user) {
    let err = new Error("You're not authenticated!");
    err.status = 403;
    return next(err);
  } else {
    next();
  }
}
app.use(auth);
//////////////////////////////////
app.use("/dishes", dishRouter);
app.use("/promotions", promoRouter);
app.use("/leaders", leaderRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.log(err.message);
  // set locals, only providing error in development
  //let msg = err.message;
  res.status(err.status || 500);
  res.locals.message = `${err.status} error occured: ` + err.message;
  res.locals.error = req.app.get("env") === "development" ? err.stack : {};

  // render the error page
  res.render("error"); //render error.ejs files with the set local variables
  // res.send({ error: msg }); //use this without rendering
});

module.exports = app;
