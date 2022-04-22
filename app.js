let createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const dishRouter = require("./routes/dishRouter");
const usersRouter = require("./routes/users");
const promoRouter = require("./routes/promoRouter");
const leaderRouter = require("./routes/leaderRouter");

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
app.use(cookieParser("12345-67890-12345-67890"));
app.use(express.static(path.join(__dirname, "public")));

//Authenticate b4 user interact with data
function auth(req, res, next) {
  if (!req.signedCookies.user) {
    const authHeader = req.headers.authorization;
    console.log(req);
    if (!authHeader) {
      let err = new Error("You're not authenticated!");
      res.setHeader("www-Authenticate", "Basic");
      err.status = 401;
      return next(err);
    }
    let auth = new Buffer.from(authHeader.split(" ")[1], "base64");
    auth = auth.toString().split(":"); //this line will return an array
    const [username, password] = auth; // array unpacking
    console.log(username + " " + password);
    if (username === "admin" && password === "password") {
      console.log(username, password);
      res.cookie("user", "admin", { signed: true });
      next(); //continue other middlewares on the stack
    } else {
      let err = new Error("You're not authenticated!");
      res.setHeader("www-Authenticate", "Basic");
      err.status = 401;
      return next(err);
    }
  } else {
    // Cokie already exist and the user key is set on it
    console.log(`Signed Cookie 2: ${req.signedCookies.user}`);
    if (req.signedCookies.user === "admin") {
      //cokie contaon valid info
      next();
    } else {
      //cookie info is invalid
      let err = new Error("You're not authenticated!");
      err.status = 401;
      return next(err);
    }
  }
}

app.use(auth);

//Auth middleware ends
app.use("/", indexRouter);
app.use("/dishes", dishRouter);
app.use("/users", usersRouter);
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
