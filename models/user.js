const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  idTelegram: {
    type: String,
    required: true,
    unique: true,
  },
  idWin: {
    type: String,
    required: false,
  },
  language: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    required: true,
    enum: ["user", "ban", "guest", "admin"],
  },
});

module.exports = mongoose.model("user", userSchema);
