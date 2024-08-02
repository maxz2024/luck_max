const mongoose = require("mongoose");
const logger = require("node-color-log").createNamedLogger("database/connect.js");
logger.setDate(() => (new Date()).toLocaleString())

const DB_URL = "mongodb://127.0.0.1:27017/luck-Temshikovich";

async function connectToDatabase() {
  try {
    await mongoose.connect(DB_URL);
    logger.success("Успешно подключились к MongoDB");
  } catch (err) {
    logger.error("При подключении MongoDB возникла ошибка");
    console.error(err);
  }
}

module.exports = connectToDatabase;