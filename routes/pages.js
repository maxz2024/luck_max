const pagesRouter = require("express").Router();
const path = require("path");

pagesRouter.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

pagesRouter.get("/NonAuth", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/NonAuth.html"));
});

pagesRouter.get("/game", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/game.html"));
});

pagesRouter.get("/game1", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/game1.html"));
});

module.exports = pagesRouter;
