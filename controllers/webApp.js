const sendResult = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ message: "Даннные верны" }));
};

module.exports = {sendResult}