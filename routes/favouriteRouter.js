const express = require("express");
const Favorites = require("../models/favourite");
// const passport = require("passport");
const authenticate = require("../authenticate");
const cors = require("./cors"); ///later
//
const FavoriteRouter = express.Router();

FavoriteRouter.use(express.json());
//The dishId is for the id of the specific dish to be added as fav

FavoriteRouter.get(
  "/",
  cors.corsWithOptions,
  authenticate.verifyUser,
  (req, res, next) => {
    const userId = req.user._id;
    Favorites.findOne({ user: userId })
      .populate("dishes")
      .populate("user")
      .then(
        (fav) => {
          return res.status(200).json(fav);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  }
);

FavoriteRouter.post(
  "/",
  cors.corsWithOptions,
  authenticate.verifyUser,
  (req, res, next) => {
    const receivedDishes = Array.from(req.body);
    if (receivedDishes.length <= 0)
      return res
        .status(403)
        .json(
          "You must provide an array of atleast one dishId in the body of your request!"
        );
    //If we are here, it means req.body has atleast one dish id
    /////////////////////////
    Favorites.findOne({ user: req.user._id })
      .then(
        (fav) => {
          if (fav == null) {
            console.log("Ceating new fav----");
            //No favorite dish document for this user, create one
            const favorite = new Favorites({ user: req.user._id });
            //Now, loop through the number of dish ids received and add them to the array, dishes
            receivedDishes.map((dish) => favorite.dishes.push(dish._id));
            favorite.save((err, favorite) => {
              //after adding them, save the doc current state
              if (err) return next(err);
              else {
                console.log("Got here!");
                // res.setHeader("Content-Type", "application/json");
                return res.status(201).json(favorite);
              }
            });
          }
          ////////////////////  //user already has a favorite dish object, now update it
          else {
            let count = 0; //if Id already exist, count will hold the value
            console.log("fav doc exist, updating----");
            receivedDishes.map((dish) => {
              if (fav.dishes.indexOf(dish._id) === -1) {
                //id not added yet
                fav.dishes.push(dish._id);
              } else count++; //increase the number of dishIds that already exist!
            });
            //
            fav.save((err, fav) => {
              if (err) return next(err);
              else {
                return count > 0
                  ? res
                      .status(403)
                      .json(`${count} dishId(s) already exist. Not adding!`)
                  : res.status(201).json(fav);
              }
            });
          }
        }, //end .then
        (err) => next(err) //callback in .then
      )
      .catch((err) => next(err));
  }
);

FavoriteRouter.put(
  "/",
  cors.corsWithOptions,
  authenticate.verifyUser,
  (req, res, next) => {
    res.status(403).json("Put operation is not supported on this endpoint");
  }
);

FavoriteRouter.delete(
  "/",
  cors.corsWithOptions,
  authenticate.verifyUser,
  (req, res, next) => {
    ////////////////
    Favorites.deleteOne({ user: req.user._id })
      .then(
        (resp) => {
          res
            .status(200)
            .setHeader("Content-Type", "application/json")
            .json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  }
);

////////////////

/// /:dishId endpoints //////////////////////////////////////
///////////////
FavoriteRouter.get(
  "/:dishId",
  cors.corsWithOptions,
  authenticate.verifyUser,
  (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate("dishes")
      .then((fav) => {
        //filters the requested dish out using dishId and send it to the next then
        if (fav != null)
          return fav.dishes.filter((d) => d.equals(req.params.dishId));
        else {
          res.status(404).json(`No document found!`);
        }
      })
      .then((fav) => {
        fav.length > 0
          ? res.status(200).json(fav)
          : res
              .status(403)
              .json(
                `Invalid Dish Id ${req.params.dishId}, please cross check!`
              );
      })
      .catch((err) => next(err));
  }
);

FavoriteRouter.post(
  "/:dishId",
  cors.corsWithOptions,
  authenticate.verifyUser,
  (req, res, next) => {
    Favorites.findOne({ user: req.user._id }).then((fav) => {
      //find the fav doc for the logged in user
      if (fav == null) {
        //No favorite dish document for this user, create one
        const favorite = new Favorites({ user: req.user._id });
        favorite.dishes.push(req.params.dishId);
        favorite.save((err, favorite) => {
          if (err) return next(err);
          else {
            return res.status(201).json(favorite);
          }
        });
      } else {
        //user already has a favorite dish object, now update it
        if (fav.dishes.indexOf(req.params.dishId) != -1) {
          //the dish is alredy added as favorite for this particular user
          return res
            .status(403)
            .json(
              `You have already added ${req.params.dishId} to your favorite dish!`
            );
        } else {
          fav.dishes.push(req.params.dishId);
          fav.save((err, fav) => {
            if (err) return next(err);
            else {
              return res.status(201).json(fav);
            }
          });
        }
      }
    });
  }
);

FavoriteRouter.put(
  "/:dishId",
  cors.corsWithOptions,
  authenticate.verifyUser,
  (req, res, next) => {
    res.status(403).json("Put operation is not supported on this endpoint");
  }
);

FavoriteRouter.delete(
  "/:dishId",
  cors.corsWithOptions,
  authenticate.verifyUser,
  (req, res, next) => {
    Favorites.findOne({ user: req.user._id }) //find the fav doc for the logged in user
      .then((fav) => {
        //Incase a user wants to delete a document that does not exist!
        if (!fav)
          return res.status(404).json(`No document found for this user!`);
        const itemToRemove = fav.dishes.indexOf(req.params.dishId);
        fav.dishes.splice(itemToRemove, 1);
        fav.save((err, fav) => {
          if (err) return next(err);
          else {
            res.status(200).json(fav);
          }
        });
      })

      .catch((err) => next(err));
  }
);

module.exports = FavoriteRouter;
