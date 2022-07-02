const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  newAcc: {
    type: Boolean,
    required: true,
  },
});

const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;
