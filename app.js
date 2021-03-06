const createError = require("http-errors");
const express = require("express");
const path = require("path");
const config = require("./config");
const logger = require("morgan");
const mongoose = require("mongoose");

const indexRouter = require("./routes/index");
const dishRouter = require("./routes/dishRouter");
const usersRouter = require("./routes/users");
const promoRouter = require("./routes/promoRouter");
const leaderRouter = require("./routes/leaderRouter");
const uploadRouter = require("./routes/uploadRouter");
const favoriteRouter = require("./routes/favouriteRouter");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
////////
const passport = require("passport");
const authenticate = require("./authenticate");

const uri = config.mongoURI;
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

app.all("*", (req, res, next) => {
  if (req.secure) return next(); //if req comes on secured port continue than the middleware stack
  //this will run if req.secure is not set/or true
  return res.redirect(
    307,
    `https://${req.hostname}:${app.get("secPort")}${req.url}`
  );
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use(express.static(path.join(__dirname, "public")));

app.use("/dishes", dishRouter);
app.use("/promotions", promoRouter);
app.use("/leaders", leaderRouter);
app.use("/favorites", favoriteRouter);
app.use("/imageUpload", uploadRouter);

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
