(function () {
  const hour = new Date().getHours();
  const el = document.documentElement;
  if (hour < 6 || hour >= 18) {
    el.classList.add('night');
  } else {
    el.classList.add('day');
  }
})();
