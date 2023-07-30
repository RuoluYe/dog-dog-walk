const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // unique help find quicker
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  dogs: [{ type: mongoose.Types.ObjectId, required: true, ref: "Dog" }], // will be dynamic later
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model("User", userSchema);
