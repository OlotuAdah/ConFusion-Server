var express = require("express");
const UserModel = require("../models/user");
const userRouter = express.Router();
const passport = require("passport");
const authenticate = require("../authenticate");
//////////////////////////////////

userRouter.use(express.json());

/* GET users listing. */
userRouter.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

userRouter.post("/signup", (req, res, next) => {
  const { username, password } = req.body;
  console.log(username + " " + password);
  UserModel.register(new UserModel({ username }), password, (err, _) => {
    if (err) {
      res.status(500).send({ err });
    }
    passport.authenticate("local")(req, res, () => {
      res.status(200).send({
        success: true,
        status: "Registeration Successful!",
      });
    });
  });
});

//login endpoint
userRouter.post("/login", passport.authenticate("local"), (req, res) => {
  //Note: req.user will be present after passport.authenticate() runs successfully
  const token = authenticate.getToken({ _id: req.user._id });
  res.status(200).send({
    success: true,
    token: token,
    status: "You're Successfully logged in!",
  });
});

userRouter.get("/logout", (req, res, next) => {
  if (req.session) {
    req.session.destroy(); //Destroys session on server-side
    res.clearCookie("session-id"); //Clears cookie on client-side
    res.redirect("/");
  } else {
    let err = new Error(`You are not logged in`);
    err.status = 401;
    return next(err);
  }
});
module.exports = userRouter;
