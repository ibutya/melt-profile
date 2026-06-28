function initWorksFilter() {
  const filterBtns = document.querySelectorAll('.works-filter__btn');
  const cards = document.querySelectorAll('.work-card');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.filter;

      filterBtns.forEach((b) => b.classList.remove('works-filter__btn--active'));
      btn.classList.add('works-filter__btn--active');

      cards.forEach((card) => {
        const match = category === 'all' || card.dataset.category === category;
        card.classList.toggle('work-card--hidden', !match);
      });
    });
  });
}

document.addEventListener('works:rendered', initWorksFilter);
