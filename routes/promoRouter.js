const express = require("express");

const promoRouter = express.Router();
promoRouter.use(express.json());

promoRouter
  .route("/")
  .all((req, res, next) => {
    res.status(200).setHeader("Content-Type", "text/plain");
    next();
  })

  .get((req, res, next) => {
    res.send("Will send all the promotions to you!");
  })
  .post((req, res, next) => {
    res.send(
      "Will add the promotions dish: " +
        req.body.name +
        " with details: " +
        req.body.description
    );
  })
  .put((req, res, next) => {
    res.status(200).end("PUT operation not supported on /promotions");
  })
  .delete((req, res, next) => {
    res.send("Deleting all promotion info");
  });

//Route requests with dishId to this second part of the express router

promoRouter
  .route("/:promoId")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })

  .get((req, res, next) => {
    res.send(
      "Will send details of the promotion dish: " +
        req.params.promoId +
        " to you!"
    );
  })

  .post((req, res, next) => {
    res
      .status(403)
      .send(
        "POST operation not supported on /promotions/" + req.params.promoId
      );
  })

  .put((req, res, next) => {
    res.send(
      "Updating the promotion dish: " +
        req.params.promoId +
        "\n" +
        "Will update the promotion dish: " +
        req.body.name +
        " with details: " +
        req.body.description
    );
  })

  .delete((req, res, next) => {
    res.send("Deleting promotion dish: " + req.params.promoId);
  });

module.exports = promoRouter;
