const { getConfig } = require("../utils/readJson");
const crypto = require("crypto");
const { findUserByIdTelegram } = require("../utils/users");
let configData = getConfig();
const botToken = configData.BOT_TOKEN;

const validateInitData = async (req, res, next) => {
  const initData = req.body.initData;
  const urlSearchParams = new URLSearchParams(initData);
  const data = Object.fromEntries(urlSearchParams.entries());


  const checkString = Object.keys(data)
    .filter((key) => key !== "hash")
    .map((key) => `${key}=${data[key]}`)
    .sort()
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  if (data.hash == signature) {
    const userRes = await findUserByIdTelegram({
      idTelegram: JSON.parse(data.user).id,
    });
    if (userRes.code == 200 && ["admin", "user"].includes(userRes.data.role)) {
      next();
    } else {
      res.setHeader("Content-Type", "application/json");
      res.status(400).send(
        JSON.stringify({
          message: "Ошибка",
          details: "Данные не совпали",
        })
      );
    }
  } else {
    res.setHeader("Content-Type", "application/json");
    res.status(400).send(
      JSON.stringify({
        message: "Ошибка",
        details: "Данные не совпали",
      })
    );
  }
};

module.exports = { validateInitData };
