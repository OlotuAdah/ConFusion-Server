const expreess = require("express");
const Dishes = require("../models/dishes");
const authenticate = require("../authenticate");

const dishRouter = expreess.Router();
dishRouter.use(expreess.json());

dishRouter
  .route("/")
  .get((req, res, next) => {
    Dishes.find({})
      .populate("comments.author")
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
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // if (!req.user.admin) return res.status(403).send("You're not Authorized!");
    Dishes.create(req.body)
      .then(
        (dish) => {
          // console.log("Dish create", dish);
          res
            .status(201)
            .setHeader("Content-Type", "application/json")
            .json(dish);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.status(403).send("Put opertaion not supported on /dishes");
    //put operation is not allowed on dishes //
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    if (!req.user.admin) return res.status(403).send("You're not Authorized!");
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
      .populate("comments.author")
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
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res
      .status(403)
      .send("Post opertaion not supported on /dishes/" + req.params.dishId);
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
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
    }
  );

///////////////////////////////////////////////////////////comments

dishRouter
  .route("/:dishId/comments")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate("comments.author")
      .then(
        (dish) => {
          if (dish !== null) {
            res
              .status(200)
              .setHeader("Content-Type", "application/json")
              .json(dish.comments);
          } else {
            let err = new Error(`Dish ${req.params.dishId} does not exist`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    // This route is used for posting comments. An ordinary user should be able to post a comment
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish != null) {
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            // console.log("Passed ===push");
            dish.save().then(
              (dish) => {
                Dishes.findById(dish._id)
                  //.populate("comments.author")
                  .then((dish) => {
                    res
                      .status(200)
                      .setHeader("Content-Type", "application/json")
                      .json(dish);
                  });
              },
              (err) => next(err)
            );
          } else {
            let err = new Error(`Dish ${req.params.dishId} does not exist`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res
      .status(403)
      .json(
        "Put opertaion not supported on /dishes/" +
          req.params.dishId +
          "comments"
      );
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      //Only the admin should be able to delete all comments

      Dishes.findById(req.params.dishId)
        .then(
          (dish) => {
            if (dish != null) {
              console.log("There are " + dish.comments.length + " on the dish");
              for (let i = 0; i < dish.comments.length; i++) {
                dish.comments.id(dish.comments[i]._id).remove();
              }
              dish.save().then((resp) => {
                res
                  .status(200)
                  .setHeader("Content-Type", "application/json")
                  .json({
                    msg: `Comments Removed: There're ${dish.comments.length} comments`,
                  });
              });
            } else {
              let err = new Error(`Dish ${req.params.dishId} does not exist`);
              err.status = 404;
              return next(err);
            }
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );
////////////////////////////////////////
//Route requests with dishId to this second part of the express router

dishRouter
  .route("/:dishId/comments/:commentId")
  .get((req, res, next) => {
    // if(!req.user._id === )
    Dishes.findById(req.params.dishId)
      .populate("comments.author")
      .then((dish) => {
        if (dish == null || dish.comments.id(req.params.commentId) == null)
          return res.status(404).send("Specified comments not found");
        console.log(dish.comments.id(req.params.commentId).author._id);
        console.log(req.user._id);
        return dish;
      })
      .then(
        (dish) => {
          if (dish != null && dish.comments.id(req.params.commentId) != null) {
            console.log(
              "Found dish with " + dish.comments.length + " comments"
            );
            res
              .status(200)
              .setHeader("Content-Type", "application/json")
              .json(dish.comments.id(req.params.commentId));
          } else if (dish == null) {
            let err = new Error(
              `Dish with id: ${req.params.dishId} does not exist`
            );
            err.status = 404;
            return next(err);
          } else {
            let err = new Error(
              `Comment with id: ${req.params.dishId} does not exist`
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId).then((dish) => {
      if (dish != null && dish.comments.id(req.params.commentId) != null) {
        /////////////This inner if block will only run if req is from the author
        if (!dish.comments.id(req.params.commentId).author.equals(req.user._id))
          return res.status(403).send("You're not Authorized!");
        else {
          res
            .status(403)
            .send(
              "Post opertaion not supported on /dishes/" +
                req.params.dishId +
                "/comments/" +
                req.params.commentId
            );
        }
        /////////////
      } else if (dish == null) {
        let err = new Error(
          `Dish with id: ${req.params.dishId} does not exist`
        );
        err.status = 404;
        return next(err);
      } else {
        let err = new Error(
          `Comment with id: ${req.params.dishId} does not exist`
        );
        err.status = 404;
        return next(err);
      }
    });
  })

  .put(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
          /////////////This inner if block will only run if req is from the author
          if (
            !dish.comments.id(req.params.commentId).author.equals(req.user._id)
          )
            return res.status(403).send("You're not Authorized!");
          return dish;
          /////////////
        } else if (dish == null) {
          let err = new Error(
            `Dish with id: ${req.params.dishId} does not exist`
          );
          err.status = 404;
          return next(err);
        } else {
          let err = new Error(
            `Comment with id: ${req.params.dishId} does not exist`
          );
          err.status = 404;
          return next(err);
        }
      })
      .then(
        (dish) => {
          //  At this point dish can not be null
          if (req.body.rating) {
            dish.comments.id(req.params.commentId).rating = req.body.rating;
          }
          if (req.body.commentText) {
            dish.comments.id(req.params.commentId).commentText =
              req.body.commentText;
          }
          dish.save().then(
            (dish) => {
              Dishes.findById(dish._id)
                .populate("comments.author")
                .then((dish) => {
                  res.status(200).json(dish);
                });
            },
            (err) => next(err)
          );
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(() => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
          /////////////This inner if block will only run if req is from the author
          if (
            !dish.comments.id(req.params.commentId).author.equals(req.user._id)
          )
            return res.status(403).send("You're not Authorized!");
          return dish;
          /////////////////
        } else if (dish == null) {
          let err = new Error(
            `Dish with id: ${req.params.dishId} does not exist`
          );
          err.status = 404;
          return next(err);
        } else {
          let err = new Error(
            `Comment with id: ${req.params.dishId} does not exist`
          );
          err.status = 404;
          return next(err);
        }
      })
      .then(
        (dish) => {
          ///// At this point dish can not be empty
          console.log("There are " + dish.comments.length + " on the dish");
          dish.comments.id(req.params.commentId).remove();

          dish.save().then((dish) => {
            Dishes.findById(dish._id)
              .populate("comments.author")
              .then((dish) => {
                res.status(200).json({
                  msg: `Comments Removed: There're ${dish.comments.length} comments`,
                });
              });
          });
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = dishRouter;
