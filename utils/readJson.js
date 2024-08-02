const fs = require("fs");

function getConfig() {
  try {
    const data = fs.readFileSync("./data/config.json", "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Ошибка чтения конфигурационного файла:", err);
  }
}

function getTextMessages() {
  try {
    const data = fs.readFileSync("./data/text_messages.json", "utf8");
    configData = JSON.parse(data);
    return configData
  } catch (err) {
    console.error("Ошибка чтения файла текста сообщений:", err);
  }
}

function getKeyboards(){
  try {
    const data = fs.readFileSync("./data/keyboard.json", "utf8");
    configData = JSON.parse(data);
    return configData
  } catch (err) {
    console.error("Ошибка чтения файла клавиатуры:", err);
  }
}

module.exports = {getConfig, getTextMessages, getKeyboards}
