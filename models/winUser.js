const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const winUserSchema = new mongoose.Schema({
  idWin: {
    type: String,
    required: false,
    unique: true,
  },
  deposit: {
    type: Boolean,
    required: false,
  }
});



module.exports = mongoose.model("winUser", winUserSchema);
