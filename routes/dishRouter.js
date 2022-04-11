const expreess = require("express");
// const mongoose = require("mongoose");
const Dishes = require("../models/dishes");

const dishRouter = expreess.Router();
dishRouter.use(expreess.json());

dishRouter
  .route("/")
  .get((req, res, next) => {
    Dishes.find({})
      .then(
        (dishes) => {
          res
            .status(200)
            .setHeader("Content-Type", "application/json")
            .json(dishes);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post((req, res, next) => {
    Dishes.create(req.body)
      .then(
        (dish) => {
          console.log("Dish create", dish);
          res
            .status(201)
            .setHeader("Content-Type", "application/json")
            .json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put((req, res, next) => {
    res.status(403).send("Put opertaion not supported on /dishes");
    //put operation is not allowed on dishes //
  })
  .delete((req, res, next) => {
    Dishes.deleteMany()
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
  });

//Route requests with dishId to this second part of the express router

dishRouter
  .route("/:dishId")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          res
            .status(200)
            .setHeader("Content-Type", "application/json")
            .json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post((req, res, next) => {
    res
      .status(403)
      .send("Post opertaion not supported on /dishes/" + req.params.dishId);
  })
  .put((req, res, next) => {
    Dishes.findOneAndUpdate(
      req.params.dishId,
      { $set: req.body },
      { new: true }
    )
      .then(
        (dish) => {
          res
            .status(200)
            .setHeader("Content-Type", "application/json")
            .json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete((req, res, next) => {
    Dishes.deleteOne({ _id: req.params.dishId })
      .then(
        (resp) => {
          res
            .status(200)
            .setHeader("Content-Type", "application/json")
            .json(`Document with id: ${req.params.dishId} deleted!`);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = dishRouter;
