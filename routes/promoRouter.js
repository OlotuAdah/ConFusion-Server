const express = require("express");
const Promotions = require("../models/promotions");
const authenticate = require("../authenticate");
const cors = require("./cors");

const promoRouter = express.Router();
promoRouter.use(express.json());

promoRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) //cors: preflight request
  .get(cors.cors, (req, res, next) => {
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
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promotions.create(req.body)
        .then(
          (promotions) => {
            res.status(201).send(promotions);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.status(200).end("PUT operation not supported on /promotions");
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promotions.deleteMany()
        .then(
          (resp) => {
            res.status(200).send(resp);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

//Route requests with dishId to this second part of the express router

promoRouter
  .route("/:promoId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) //cors: preflight request
  .get(cors.cors, (req, res, next) => {
    Promotions.findById(req.params.promoId)
      .then(
        (promotion) => {
          res.status(200).send(promotion);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })

  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res
        .status(403)
        .send(
          "POST operation not supported on /promotions/" + req.params.promoId
        );
    }
  )

  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
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
    }
  )

  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
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
    }
  );

module.exports = promoRouter;
