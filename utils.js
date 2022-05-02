// const UserModel = require("./models/user");
const Dishes = require("./models/dishes");

const limitAccessToAuthour = function (req, res, next) {
  //   console.log(req.params.dishId);
  Dishes.findById(req.params.dishId)
    .then((dish) => {
      if (dish == null) {
        let err = new Error("Doc not found!");
        return next(err);
      }
      if (dish.comments.id(req.params.commentId).author.equals(req.user._id)) {
        req.user.allow = true;
        return next();
      }
      req.user.allow = false;
      return next();
    })
    .catch((err) => next(err));
  return next();
};

module.exports = limitAccessToAuthour;
