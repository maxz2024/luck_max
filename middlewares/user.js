// const users = require("../models/user");

// const creatUser = async (req, res, next) => {
//   try {
//     req.user = await users.create(req.body);

//     next();
//   } catch (error) {
//     res.setHeader("Content-Type", "application/json");
//     res.status(400).send(
//       JSON.stringify({
//         message: "Ошибка создания пользователя",
//         details: error.message,
//       })
//     );
//   }
// };

// const findUserByIdTelegram = async (req, res, next) => {
//   try {
//     const user = await users.findOne({ idTelegram: req.params.idTelegram });
//     if (!user) {
//       return res.status(404).send({ message: "Пользователь не найден" });
//     }
//     req.user = user;
//     next();
//   } catch (error) {
//     res.setHeader("Content-Type", "application/json");
//     res.status(500).send(
//       JSON.stringify({
//         message: "Ошибка при поиске пользователя",
//         details: error.message,
//       })
//     );
//   }
// };

// const editUser = async (req, res, next) => {
//   try {
//     const user = await users.findOne({ idTelegram: req.params.idTelegram });
//     if (!user) {
//       return res.status(404).send({ message: "Пользователь не найден" });
//     }
//     Object.assign(user, req.body);
//     await user.save();
//     req.user = user;
//     next();
//   } catch (error) {
//     res.setHeader("Content-Type", "application/json");
//     res.status(500).send(
//       JSON.stringify({
//         message: "Ошибка при редактировании пользователя",
//         details: error.message,
//       })
//     );
//   }
// };



// module.exports = {creatUser, findUserByIdTelegram, editUser}
