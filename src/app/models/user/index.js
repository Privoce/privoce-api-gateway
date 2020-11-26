const mongoose = require("mongoose");

const { Schema, model: Model } = mongoose;

const UserSchema = new Schema({
  nickname: {
    type: String,
    default: "",
    trim: true,
    unique: false,
    required: true,
    lowercase: true,
  },
  email: {
    type: String,
    default: "",
    trim: true,
    unique: true,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    default: "",
    trim: true,
    required: false,
  },
  profileColor: {
    type: String,
    default: "",
    trim: true,
    required: true,
  },
  googleAuthToken: {
    type: String,
    default: "",
    trim: true,
    required: false,
  },
});

const UserModel = new Model("User", UserSchema);

exports.UserModel = UserModel;
exports.UserSchema = UserSchema;
