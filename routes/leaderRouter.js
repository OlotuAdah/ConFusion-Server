const express = require("express");
const Leaders = require("../models/leaders");
const authenticate = require("../authenticate");
const cors = require("./cors");

const leaderRouter = express.Router();
leaderRouter.use(express.json());

leaderRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) //cors: preflight request
  .get(cors.cors, (req, res, next) => {
    Leaders.find({})
      .then(
        (leaders) => {
          res.status(200);
          if (leaders.length > 0) res.send(leaders);
          else res.send("No Leadres added, yet");
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
      Leaders.create(req.body)
        .then(
          (leaders) => {
            res.status(201).send(leaders);
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
      res.status(403).send("PUT operation not supported on /leaders");
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Leaders.deleteMany()
        .then(
          (resp) => {
            res.status(200).send(resp);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

//Route requests with learderId to this second part of the express router

leaderRouter
  .route("/:leaderId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) //cors: preflight request
  .get(cors.cors, (req, res, next) => {
    Leaders.findById(req.params.leaderId)
      .then(
        (leader) => {
          res.status(200).send(leader);
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
          "POST operation not supported on /leaders/" + req.params.leaderId
        );
    }
  )

  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Leaders.findOneAndUpdate(
        req.params.leaderId,
        { $set: req.body },
        { new: true }
      )
        .then(
          (updatedLeader) => {
            res
              .status(200)
              .setHeader("Content-Type", "application/json")
              .json(updatedLeader);
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
      Leaders.deleteOne({ _id: req.params.leaderId })
        .then(
          () => {
            res
              .status(200)
              .setHeader("Content-Type", "application/json")
              .json(`Leader with id: ${req.params.leaderId} deleted!`);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

module.exports = leaderRouter;
