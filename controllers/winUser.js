
const sendWinUser = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(req.winUser));
};

module.exports = {sendWinUser}