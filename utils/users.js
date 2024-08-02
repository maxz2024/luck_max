const users = require("../models/user");

const creatUser = async (body) => {
  try {
    const user = await users.create(body);

    return {code: 200, data: user};
  } catch (error) {
    return {
      code:404, 
      message: "Ошибка создания пользователя",
      details: error.message,
    };
  }
};

const findUserByIdTelegram = async (body) => {
  try {
    const user = await users.findOne({ idTelegram: body.idTelegram });
    if (!user) {
      return { code: 404, message: "Пользователь не найден" };
    }
    return { code: 200, data: user };
  } catch (error) {
    return {
      code: 500, 
      message: "Ошибка при поиске пользователя",
      details: error.message,
    };
  }
};

const editUser = async (body) => {
  try {
    const user = await users.findOne({ idTelegram: body.idTelegram });
    if (!user) {
      return { code: 404, message: "Пользователь не найден" };
    }
    Object.assign(user, body);
    await user.save();
    return { code: 200, data:user };
  } catch (error) {
    return {
      code: 500, 
      message: "Ошибка при редактировании пользователя",
      details: error.message,
    };
  }
};

const getUsers = async () => {
  try {
    const usersArray = await users.find({ role: { $ne: "admin" } });
    return { code: 200, data: usersArray };
  } catch (error) {
    return {
      code: 500, 
      message: "Ошибка при получении пользователей",
      details: error.message,
    };
  }
};

const getAdmins = async () => {
  try {
    const usersArray = await users.find({ role: "admin" });
    return { code: 200, data: usersArray };
  } catch (error) {
    return {
      code: 500, 
      message: "Ошибка при получении администраторов",
      details: error.message,
    };
  }
};

const deleteUser = async (body) => {
  try {
    const user = await users.findOneAndDelete({ idTelegram: body.idTelegram });
    if (!user) {
      return { code: 404, message: "Пользователь не найден" };
    }
    return { code: 200, message: "Пользователь удален" };
  } catch (error) {
    return {
      code: 500, 
      message: "Ошибка при удалении пользователя",
      details: error.message,
    };
  }
};


module.exports = { creatUser, findUserByIdTelegram, editUser, getUsers, deleteUser, getAdmins };
