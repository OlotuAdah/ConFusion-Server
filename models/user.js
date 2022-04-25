const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;
const UserSchema = Schema({
  admin: {
    type: Boolean,
    default: false,
  },
});

//allows the plugin to add username an password fields automatically
UserSchema.plugin(passportLocalMongoose);
const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
