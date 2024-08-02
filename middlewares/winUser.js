const { sendAdminMessage } = require("../bot");
const winUsers = require("../models/winUser");

const createWinUser = async (req, res, next) => {
  try {
    req.winUser = await winUsers.create(req.params);
    sendAdminMessage(`Пользователь ${req.winUser.idWin} зарегистрировался по вашей ссылке.`)
    next();
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    res.status(400).send(
      JSON.stringify({
        message: "Ошибка создания пользователя winUser",
        details: error.message,
      })
    );
  }
};

const editWinUser = async (req, res, next) => {
  
  try {
    const winUser = await winUsers.findOne({ idWin: req.params.idWin });
    if (!winUser) {
      return res.status(404).send({ message: "winUser не найден" });
    }
    Object.assign(winUser, {deposit: true});
    sendAdminMessage(`Пользователь ${req.params.idWin} внес депозит. ${req.params.deposit}`)
    await winUser.save();
    req.winUser = winUser;
    next();
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    res.status(500).send(
      JSON.stringify({
        message: "Ошибка при редактировании winUser",
        details: error.message,
      })
    );
  }
};
const getWinUser = async (req, res, next) => {
  try {
    const winUser = await winUsers.findOne({ idWin: req.params.idWin });
    if (!winUser) {
      return res.status(404).send({ message: "winUser не найден" });
    }
    req.winUser = winUser;
    next();
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    res.status(500).send(
      JSON.stringify({
        message: "Ошибка при поиске winUser",
        details: error.message,
      })
    );
  }
};


module.exports = {createWinUser, editWinUser, getWinUser}