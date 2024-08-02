const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const connectToDatabase = require("./database/connect");
const logger = require('node-color-log');
const { MainBot } = require("./bot");
const pagesRouter = require("./routes/pages");
const cors = require("./controllers/cors");
const cookieParser = require("cookie-parser");
const webAppRouter = require("./routes/webApp");
const winUserRouter = require("./routes/winUser");
// const { usersRouter } = require("./routes/user");

logger.setDate(() => (new Date()).toLocaleString())

const app = express();
const PORT = require('../ports.json').luck_max;

connectToDatabase();

app.use(
  '/',
  cors,
  cookieParser(),
  bodyParser.json(),
  // usersRouter,
  // apiRouter,
  pagesRouter,
  webAppRouter,
  winUserRouter,
  express.static(path.join(__dirname, "public")),
);

app.listen(PORT);
logger.success(`Сервер запущен на ${PORT}!`)
MainBot()