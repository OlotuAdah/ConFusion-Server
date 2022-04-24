var express = require("express");
const User = require("../models/user");
const userRouter = express.Router();
userRouter.use(express.json());

/* GET users listing. */
userRouter.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

userRouter.post("/signup", (req, res, next) => {
  console.log(req.body);
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ username: req.body.username })
    .then((user) => {
      console.log(username + " " + password);
      if (user != null) {
        let err = new Error(`User ${username} already exist!`);
        err.status = 403; //forbidden
        return next(err);
      }
      return User.create({ username, password }).then(
        (returnedUser) => {
          res
            .status(201) //created successfully!
            .send({ status: "Registeration Successful", user: returnedUser });
        },
        (err) => next(err)
      );
    })
    .catch((err) => next(err));
});

//login endpoint
userRouter.post("/login", (req, res, next) => {
  if (!req.session.user) {
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
    User.findOne({ username })
      .then(
        (user) => {
          // console.log(username + " " + password);
          if (user === null) {
            let err = new Error(`User ${username} does not exist!`);
            res.setHeader("www-Authenticate", "Basic");
            err.status = 401;
            return next(err);
          } else if (user.password !== password) {
            let err = new Error(`Incorrect password!`);
            res.setHeader("www-Authenticate", "Basic");
            err.status = 401;
            return next(err);
          } else if (username === user.username && password === user.password) {
            // console.log(username, password);
            req.session.user = "authenticated";
            res.status(200).send({ msg: "You're authenticated!" });
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  } else {
    res.status(200).send("You're already authenticated!");
  }
});

userRouter.get("/logout", (req, res, next) => {
  if (req.session) {
    req.session.destroy(); //Destroys session on server-side
    res.clearCookie("session-id"); //Clears cookie on client-side
    res.redirect("/");
  } else {
    let err = new Error(`You are not logged in`);
    res.setHeader("www-Authenticate", "Basic");
    err.status = 401;
    return next(err);
  }
});
module.exports = userRouter;
