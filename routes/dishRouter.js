const expreess = require("express");

const dishRouter = expreess.Router();
dishRouter.use(expreess.json());

dishRouter
  .route("/")
  .all((req, res, next) => {
    // done for all requests
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })
  .get((req, res, next) => {
    res.status(200).send("Will send all the dishes to you"); //
  })
  .post((req, res, next) => {
    res
      .status(201)
      .send(
        `Will add the dish: ${req.body.name} with the details: ${req.body.description}`
      );
  })
  .put((req, res, next) => {
    res.status(403).send("Put opertaion not supported on /dishes"); //
  })
  .delete((req, res, next) => {
    res.send("Deleting all the dishes"); //
  });

//Route requests with dishId to this second part of the express router

dishRouter
  .route("/:dishId")
  .get((req, res, next) => {
    res.status(200).send(`Send dish with dishId : ${req.params.dishId}`); //
  })
  .delete((req, res, next) => {
    res.status(200).send(`delete dish with dishId : ${req.params.dishId}`); //
  })
  .post((req, res, next) => {
    res
      .status(403)
      .send("Put opertaion not supported on /dishes/" + req.params.dishId); //
  })
  .put((req, res, next) => {
    res.status(201).send(`Update dish with dishId: ${req.params.dishId}
            Will update the dish with name: ${req.body.name} and details: ${req.body.description}`);
  })
  .delete((req, res, next) => {
    res.status(200).send(`Deleting dish with dishId : ${req.params.dishId} `);
  });

module.exports = dishRouter;
