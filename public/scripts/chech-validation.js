let tg = window.Telegram.WebApp;

const userData = tg.initDataUnsafe.user;
tg.expand();

fetch("/webApp/check-validation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ initData: tg.initData }),
  })
    .then((response) => {
      if (response.status != 200) {
        window.location.href = "/NonAuth"
      }
    })
    .catch((error) => {
      console.error("Ошибка:", error);
    });