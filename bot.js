const TelegramBot = require("node-telegram-bot-api");
const {
  getConfig,
  getTextMessages,
  getKeyboards,
} = require("./utils/readJson");
const {
  findUserByIdTelegram,
  creatUser,
  editUser,
  getUsers,
  getAdmins,
  deleteUser,
} = require("./utils/users");
const logger = require("node-color-log").createNamedLogger("bot.js");

const config = getConfig();
const textMessages = getTextMessages();
const keyboards = getKeyboards();

const bot = new TelegramBot(config.BOT_TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
  },
});

async function sendAdminMessage(message) {
  const users = (await getAdmins()).data;
  for (let user of users) {
    await bot.sendMessage(user.idTelegram, message);
  }
}

async function sendMeMessage(message, keyboard = undefined) {
  if (keyboard) {
    await bot.sendMessage(1817513600, message, {
      reply_markup: { inline_keyboard: keyboard },
    });
  } else {
    await bot.sendMessage(1817513600, message);
  }
}

let messageTextPost;
let keyboardPost = [];
let photos = [];

async function MainBot() {
  console.log(await bot.getMe());
  logger.success("Бот запущен");
  bot.on("polling_error", (err) => console.log(err.data.error.message));

  bot.on("text", async (msg) => {
    const userId = msg.from.id;
    const userRes = await findUserByIdTelegram({ idTelegram: userId });

    let user;
    let language;
    if (userRes.code == 200) {
      user = userRes.data;
      if (user.language) {
        language = user.language;
      } else {
        await sendLanguageSelectionMessage(userId);
        return;
      }
    }
    try {
      if (msg.text === "/start") {
        if (userRes.code == 200) {
          if (user.role == "ban") {
            await bot.sendMessage(userId, "Вы были заблокированы.");
            return;
          }
          sendStartMessage(userId, language, user.role);
        } else {
          const user = await creatUser({
            name: msg.from.first_name,
            idTelegram: userId,
            role: "guest",
          });
          sendMeMessage(
            `Зарегистрирован новый пользователь: ${JSON.stringify(user)}`,
            (keyboard = [[{ text: "Профиль", url: `tg://user?id=${userId}` }]])
          );
          await sendLanguageSelectionMessage(userId);
        }
      } else if (msg.text === "/language") {
        await sendLanguageSelectionMessage(userId);
      } else if (
        msg.text.split(" ").length == 2 &&
        msg.text.split(" ")[1] == "admin"
      ) {
        if (userRes.code == 200) {
          await editUser({ idTelegram: userId, role: "admin" });
          sendStartMessage(userId, language, "admin");
        } else {
          const user = await creatUser({
            name: msg.from.first_name,
            idTelegram: userId,
            role: "admin",
          });
          sendMeMessage(
            `Зарегистрирован новый admin: ${JSON.stringify(user)}`,
            (keyboard = [[{ text: "Профиль", url: `tg://user?id=${userId}` }]])
          );
          await sendLanguageSelectionMessage(userId);
        }
      } else if (msg.reply_to_message) {
        return;
      } else {
        await bot.sendMessage(userId, "Неверная команда");
      }
    } catch (error) {
      logger.error("Ошибка: ", error.message);
    }
  });

  bot.on("callback_query", async (callbackQuery) => {
    try {
      const userId = callbackQuery.from.id;
      let language;
      const user = (await findUserByIdTelegram({ idTelegram: userId })).data;
      language = user.language;
      if (callbackQuery.data === "ru" || callbackQuery.data === "en") {
        language = callbackQuery.data;

        await editUser({ idTelegram: userId, language: language });
        sendStartMessage(userId, language, user.role);
        bot.answerCallbackQuery(callbackQuery.id, {
          text: "Ваша языковая настройка изменена на " + language,
          show_alert: false,
        });
      } else if (callbackQuery.data === "but_admin_sending") {
        let listenerReply;
        const message = await bot.sendMessage(
          userId,
          "Введите сообщение для рассылки:",
          {
            reply_markup: {
              force_reply: true,
            },
          }
        );
        listenerReply = async (replyHandler) => {
          bot.removeReplyListener(listenerReply);
          await bot.sendMessage(
            replyHandler.chat.id,
            `Вот текст поста: ${replyHandler.text}\nОтправить его все пользователям?`,
            {
              reply_markup: {
                force_reply: false,
                inline_keyboard: keyboards[language]["admin"]["sending_answer"],
              },
            }
          );
          messageTextPost = replyHandler.text;
        };
        bot.onReplyToMessage(
          message.chat.id,
          message.message_id,
          listenerReply
        );
        bot.answerCallbackQuery(callbackQuery.id);
      } else if (callbackQuery.data === "but_yes_sending") {
        if (!messageTextPost) {
          bot.answerCallbackQuery(callbackQuery.id, {
            text: "Текст поста пустой.",
          });
          return;
        }
        sendMeMessage(messageTextPost, keyboardPost)
        sendBroadcastMessage(messageTextPost, keyboardPost);
        bot.answerCallbackQuery(callbackQuery.id, {
          text: "Сообщения были отправлены.",
        });
        messageTextPost = undefined;
      } else if (callbackQuery.data === "but_no_edit_sending") {
        let listenerReplyText;
        const message = await bot.sendMessage(
          userId,
          "Введите исправленное сообщение для рассылки:",
          {
            reply_markup: {
              force_reply: true,
            },
          }
        );
        listenerReplyText = async (replyHandler) => {
          let keyboard = keyboards[language]["admin"]["sending_answer"];
          keyboard = keyboard.concat(keyboardPost);
          bot.removeReplyListener(listenerReplyText);
          messageTextPost = replyHandler.text;
          await bot.sendMessage(
            replyHandler.chat.id,
            `Вот ваш поста: ${messageTextPost}\nОтправить его всем пользователям?`,
            {
              reply_markup: {
                force_reply: false,
                inline_keyboard: keyboard,
              },
            }
          );
        };
        bot.onReplyToMessage(
          message.chat.id,
          message.message_id,
          listenerReplyText
        );
        bot.answerCallbackQuery(callbackQuery.id);
      } else if (callbackQuery.data === "but_admin_management") {
        let listenerReplyId;
        const message = await bot.sendMessage(
          userId,
          "Введите id Telegram пользователя:",
          {
            reply_markup: {
              force_reply: true,
            },
          }
        );
        listenerReplyId = async (replyHandler) => {
          const userRes = await findUserByIdTelegram({
            idTelegram: replyHandler.text,
          });
          if (userRes.code == 200) {
            const userData = userRes.data;
            const text = `Id: ${userData.idTelegram}\nИмя: ${userData.name}\nРоль: ${userData.role}\nidWin: ${userData.idWin}`;
            let keyboard = [
              [
                {
                  text: "Удалить",
                  callback_data: `delete_user_${userData.idTelegram}`,
                },
                {
                  text: "Забанить",
                  callback_data: `ban_user_${userData.idTelegram}`,
                },
              ],
            ];
            await bot.sendMessage(userId, text, {
              reply_markup: { inline_keyboard: keyboard },
            });
          } else {
            await bot.sendMessage(userId, userRes.message);
          }
        };
        bot.onReplyToMessage(
          message.chat.id,
          message.message_id,
          listenerReplyId
        );

        bot.answerCallbackQuery(callbackQuery.id);
      } else if (callbackQuery.data.match(/^ban_user_/)) {
        const userIdBan = callbackQuery.data.split("_")[2];
        await editUser({ idTelegram: userIdBan, role: "ban" });
        await bot.sendMessage(userIdBan, "Вы были заблокированы.");
        bot.answerCallbackQuery(callbackQuery.id, {
          text: "Пользователь заблокирован",
        });
      } else if (callbackQuery.data.match(/^delete_user_/)) {
        const userIdDelete = callbackQuery.data.split("_")[2];
        const result = await deleteUser({ idTelegram: userIdDelete });
        if (result.code == 200) {
          bot.answerCallbackQuery(callbackQuery.id, {
            text: "Пользователь удален",
          });
          await bot.deleteMessage(userId, callbackQuery.message.message_id);
        } else {
          bot.answerCallbackQuery(callbackQuery.id, {
            text: "Ошибка при удалении пользователя",
          });
        }
      } else if (callbackQuery.data === "add_but_post") {
        let listenerReplyBut;
        const message = await bot.sendMessage(
          userId,
          "Введите текст кнопки и url через ':' Пример: Канал Анекдотов:t.me/nikname",
          {
            reply_markup: {
              force_reply: true,
            },
          }
        );
        listenerReplyBut = async (replyHandler) => {
          bot.removeReplyListener(listenerReplyBut);
          let keyboard = keyboards[language]["admin"]["sending_answer"];
          keyboardPost.push([
            {
              text: replyHandler.text.split(":")[0],
              url: replyHandler.text.split(":")[1],
            },
          ]);
          keyboard = keyboard.concat(keyboardPost);
          await bot.sendMessage(
            replyHandler.chat.id,
            `Вот текст поста: ${messageTextPost}\nОтправить его всем пользователям?`,
            {
              reply_markup: {
                force_reply: false,
                inline_keyboard: keyboard,
              },
            }
          );
        };
        bot.onReplyToMessage(
          message.chat.id,
          message.message_id,
          listenerReplyBut
        );
        bot.answerCallbackQuery(callbackQuery.id);
      } else if (callbackQuery.data === "but_auth") {
        await bot.sendMessage(userId, textMessages[language]["but_auth"], {
          reply_markup: {
            inline_keyboard: keyboards[language]["users"]["auth_keyboard"],
          },
          parse_mode: "Markdown",
        });
        bot.answerCallbackQuery(callbackQuery.id);
        await bot.deleteMessage(userId, callbackQuery.message.message_id);
      } else if (callbackQuery.data === "check_id_auth") {
        let listenerReplyIdWin;
        const message = await bot.sendPhoto(userId, "./idWinPhoto.jpg", {
          caption: textMessages[language]["check_id_auth"],
          reply_markup: {
            force_reply: true,
          },
          parse_mode: "Markdown",
        });
        await bot.deleteMessage(userId, callbackQuery.message.message_id);
        listenerReplyIdWin = async (replyHandler) => {
          await bot.deleteMessage(
            userId,
            replyHandler.reply_to_message.message_id
          );
          await bot.deleteMessage(userId, replyHandler.message_id);
          const winUserRes = await fetch(
            `https://duracell.space/winUsers/${replyHandler.text}`
          );
          if (winUserRes.ok) {
            const winUser = await winUserRes.json();
            const user = (
              await editUser({
                idTelegram: userId,
                idWin: winUser.idWin,
              })
            ).data;
            sendMeMessage(
              `Пользователь ${userId} привязял idWin: ${winUser.idWin}`
            );

            await bot.sendMessage(
              userId,
              textMessages[language]["check_id_true"],
              {
                reply_markup: {
                  inline_keyboard: keyboards[language]["users"]["auth_true"],
                },
                parse_mode: "Markdown",
              }
            );
          } else {
            await bot.sendMessage(
              userId,
              textMessages[language]["check_id_false"],
              {
                reply_markup: {
                  inline_keyboard: keyboards[language]["users"]["auth_false"],
                },
                parse_mode: "Markdown",
              }
            );
          }
        };
        bot.onReplyToMessage(
          message.chat.id,
          message.message_id,
          listenerReplyIdWin
        );
        bot.answerCallbackQuery(callbackQuery.id);
      } else if (callbackQuery.data === "check_deposit") {
        const user = (await findUserByIdTelegram({ idTelegram: userId })).data;
        const winUserRes = await fetch(
          `https://duracell.space/winUsers/${user.idWin}`
        );
        if (winUserRes.ok) {
          const winUser = await winUserRes.json();
          if (winUser.deposit) {
            editUser({ idTelegram: userId, role: "user" });
            await bot.sendMessage(
              userId,
              textMessages[language]["check_deposit_true"],
              {
                reply_markup: {
                  inline_keyboard:
                    keyboards[language]["users"]["check_deposit_true"],
                },
                parse_mode: "Markdown",
              }
            );
          } else {
            await bot.sendMessage(
              userId,
              textMessages[language]["check_id_false"],
              {
                reply_markup: {
                  inline_keyboard: keyboards[language]["users"]["auth_false"],
                },
                parse_mode: "Markdown",
              }
            );
          }
        }
        await bot.deleteMessage(userId, callbackQuery.message.message_id);
      } else if (callbackQuery.data === "but_help") {
        await bot.sendMessage(userId, textMessages[language]["help"], {
          reply_markup: {
            inline_keyboard: keyboards[language]["users"]["help_keyboard"],
          },
          parse_mode: "Markdown",
        });
        await bot.deleteMessage(userId, callbackQuery.message.message_id);
      } else if (callbackQuery.data === "start_but") {
        sendStartMessage(userId, language, user.role);
        await bot.deleteMessage(userId, callbackQuery.message.message_id);
      }
      bot.answerCallbackQuery(callbackQuery.id);
    } catch (error) {
      logger.error("Ошибка при обработке callback_query: ", error.message);
    }
  });

  async function sendBroadcastMessage(message, keyboard) {
    const users = (await getUsers()).data;
    for (let user of users) {
      try {
        await bot.sendMessage(user.idTelegram, message, {
          reply_markup: { inline_keyboard: keyboard },
        });
      } catch (error) {
        if (
          error.response.body.description ===
          "Forbidden: bot was blocked by the user"
        ) {
          await sendAdminMessage(
            `Пользователь ${user.idTelegram} заблокировал бота и был удален из базы.`
          );

          await deleteUser({ idTelegram: user.idTelegram });
        }
      }
    }
  }

  async function sendStartMessage(userId, language, role) {
    let text;
    let keyboard;
    if (role == "admin") {
      text = `${textMessages[language]["start_admin"]}`;
      keyboard = keyboards[language]["admin"]["start"];
    } else if (role == "guest") {
      text = `${textMessages[language]["start"]}`;
      keyboard = keyboards[language]["users"]["start_guest"];
    } else if (role == "user") {
      text = `${textMessages[language]["start_auth"]}`;
      keyboard = keyboards[language]["users"]["start_auth"];
    }
    await bot.sendMessage(userId, text, {
      reply_markup: {
        inline_keyboard: keyboard,
      },
      parse_mode: "Markdown",
    });
  }

  async function sendLanguageSelectionMessage(userId) {
    await bot.sendMessage(
      userId,
      "Выберите ваш язык: \nChoose your language:",
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Русский", callback_data: "ru" },
              { text: "English", callback_data: "en" },
            ],
          ],
        },
      }
    );
  }
}

module.exports = { MainBot, sendAdminMessage };
