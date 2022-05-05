const mongoose = require("mongoose");
const DishSchema = require("./dishes");

const FavoriteSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dishes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dish" }],
  },
  {
    timestamps: true,
  }
);

const Favorites = mongoose.model("Favorite", FavoriteSchema);
module.exports = Favorites;
