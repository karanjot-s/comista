const mongoose = require("mongoose");
const Joi = require("joi");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model("User", userSchema);

const validate = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    email: Joi.string().email().required(),
  });

  return schema.validate(user);
};

const validateEmail = (user) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  return schema.validate(user);
};

module.exports = {
  User,
  validate,
  validateEmail,
};
