let interval = null;
function getRandomTarget() {
  const rand = Math.random();
  if (rand < 0.7) {
    // 70% chance for range 1.00 - 2.00
    return (1.0 + Math.random() * 1.0).toFixed(2);
  } else if (rand < 0.85) {
    // 15% chance for range 2.00 - 5.00
    return (2.0 + Math.random() * 3.0).toFixed(2);
  } else if (rand < 0.95) {
    // 10% chance for range 5.00 - 10.00
    return (5.0 + Math.random() * 5.0).toFixed(2);
  } else {
    // 5% chance for range 10+
    return (10.0 + Math.random() * 9.99).toFixed(2);
  }
}

function startCounter() {
  clearInterval(interval);
  let counterNumber = document.getElementById("counter");
  let target = getRandomTarget();
  let current = 1.01;
  counterNumber.textContent = current.toFixed(2);

  const button = document.querySelector(".btn-signal");
  button.disabled = true;

  interval = setInterval(function () {
    let increment = (target - current) / 100 + 0.01;
    current += increment;
    if (current >= target) {
      clearInterval(interval);
      current = target;
      button.style.backgroundColor = "#007bff";
      button.disabled = false;
    }
    counterNumber.textContent = current.toFixed(2);
  }, 20);
}


window.addEventListener('resize', function() {
  console.log('Ширина экрана: ' + window.innerWidth + 'px');
  console.log('Высота экрана: ' + window.innerHeight + 'px');
});
