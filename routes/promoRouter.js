const express = require("express");
const Promotions = require("../models/promotions");

const promoRouter = express.Router();
promoRouter.use(express.json());

promoRouter
  .route("/")
  .get((req, res, next) => {
    Promotions.find({})
      .then(
        (promotions) => {
          res.status(200);
          if (promotions.length > 0) res.send(promotions);
          else res.send("No promotions added, yet");
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post((req, res, next) => {
    // console.log("Hitting /promotions");
    Promotions.create(req.body)
      .then(
        (promotions) => {
          res.status(201).send(promotions);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put((req, res, next) => {
    res.status(200).end("PUT operation not supported on /promotions");
  })
  .delete((req, res, next) => {
    Promotions.deleteMany()
      .then(
        (resp) => {
          res.status(200).send(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

//Route requests with dishId to this second part of the express router

promoRouter
  .route("/:promoId")
  .get((req, res, next) => {
    Promotions.findById(req.params.promoId)
      .then(
        (promotion) => {
          res.status(200).send(promotion);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .post((req, res, next) => {
    res
      .status(403)
      .send(
        "POST operation not supported on /promotions/" + req.params.promoId
      );
  })

  .put((req, res, next) => {
    Promotions.findOneAndUpdate(
      req.params.promoId,
      { $set: req.body },
      { new: true }
    )
      .then(
        (promotions) => {
          res
            .status(200)
            .setHeader("Content-Type", "application/json")
            .json(promotions);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .delete((req, res, next) => {
    Promotions.deleteOne({ _id: req.params.promoId })
      .then(
        () => {
          res
            .status(200)
            .setHeader("Content-Type", "application/json")
            .json(`Document with id: ${req.params.promoId} deleted!`);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = promoRouter;
