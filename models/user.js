const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const UserSchema = Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    default: false,
  },
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
