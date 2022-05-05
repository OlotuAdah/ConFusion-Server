const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;
const UserSchema = Schema({
  firstname: {
    type: String,
    default: " ",
  },
  lastname: {
    type: String,
    default: " ",
  },
  facebookId: String,
  admin: {
    type: Boolean,
    default: false,
  },
});

//allows the plugin to add username an password fields automatically
UserSchema.plugin(passportLocalMongoose);
const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
