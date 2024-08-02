const express = require('express');
const winUserRouter = express.Router();
const { createWinUser, editWinUser, getWinUser } = require('../middlewares/winUser');
const { sendWinUser } = require('../controllers/winUser');

winUserRouter.get('/winUsers/create/:idWin', createWinUser, sendWinUser);
winUserRouter.get('/winUsers/:idWin', getWinUser, sendWinUser);
winUserRouter.get('/winUsers/deposit/:idWin/:deposit', editWinUser, sendWinUser);

module.exports = winUserRouter;
