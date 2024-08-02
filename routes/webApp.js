const { sendResult } = require("../controllers/webApp");
const { validateInitData } = require("../middlewares/webApp");

const webAppRouter = require("express").Router();

webAppRouter.post("/webApp/check-validation", validateInitData, sendResult);

module.exports = webAppRouter;
