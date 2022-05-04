var express = require("express");
const UserModel = require("../models/user");
const userRouter = express.Router();
const passport = require("passport");
const authenticate = require("../authenticate");
const cors = require("./cors");
//////////////////////////////////

userRouter.use(express.json());
userRouter.get(
  "/",
  cors.corsWithOptions,
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  function (req, res, next) {
    if (!req.user) return res.status(401).send("You're not Authenticated !");
    UserModel.find({})
      .then(
        (users) => {
          res.send(users);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  }
);

userRouter.post("/signup", cors.corsWithOptions, (req, res, next) => {
  const { username, password, firstname, lastname } = req.body;
  console.log(username + " " + password);
  //We want to ensure the user is successfully registered b4 saving firstname and lastname
  UserModel.register(new UserModel({ username }), password, (err, user) => {
    if (err) {
      return res.status(500).send({ err });
    }
    if (firstname) user.firstname = firstname;
    if (lastname) user.lastname = lastname;
    //After these updates to the user object, we need to save the chages to mongo
    user.save((err, user) => {
      if (err) {
        return res.status(500).send({ err });
      }
      passport.authenticate("local")(req, res, () => {
        res.status(200).send({
          success: true,
          status: "Registeration Successful!",
        });
      });
    });
  });
});

//login endpoint
userRouter.post(
  "/login",
  cors.corsWithOptions,
  passport.authenticate("local"),
  (req, res) => {
    //Note: req.user will be present after passport.authenticate() runs successfully
    const token = authenticate.getToken({ _id: req.user._id });
    res.status(200).send({
      success: true,
      token: token,
      status: "You're Successfully logged in!",
    });
  }
);

userRouter.get("/logout", cors.corsWithOptions, (req, res, next) => {
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
