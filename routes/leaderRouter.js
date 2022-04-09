const express = require("express");

const leaderRouter = express.Router();
leaderRouter.use(express.json());

leaderRouter
  .route("/")

  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })

  .get((req, res, next) => {
    res.send("Will send all the leaders info to you!");
  })
  .post((req, res, next) => {
    res.end(
      "Will add the leader: " +
        req.body.name +
        " And details: " +
        req.body.description
    );
  })
  .put((req, res, next) => {
    res.status(403).send("PUT operation not supported on /leaders");
  })
  .delete((req, res, next) => {
    res.send("Deleting all leaders info");
  });

//Route requests with learderId to this second part of the express router

leaderRouter
  .route("/:leaderId")
  .all((req, res, next) => {
    res.status(200).setHeader("Content-Type", "text/plain");
    next();
  })

  .get((req, res, next) => {
    res.send(
      "Will send details of the leader: " + req.params.leaderId + " to you!"
    );
  })

  .post((req, res, next) => {
    res
      .status(403)
      .send("POST operation not supported on /leaders/" + req.params.leaderId);
  })

  .put((req, res, next) => {
    res.send(
      "Updating the leader: " +
        req.params.leaderId +
        "\n" +
        "Will update the leader: " +
        req.body.name +
        " with details: " +
        req.body.description
    );
  })

  .delete((req, res, next) => {
    res.send("Deleting leader: " + req.params.leaderId);
  });

module.exports = leaderRouter;
