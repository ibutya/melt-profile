async function includeHTML(selector, path) {
  const el = document.querySelector(selector);
  if (!el) return;
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  el.innerHTML = await res.text();
}

function highlightCurrentNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.global-nav__link').forEach((link) => {
    const href = link.getAttribute('href');
    const isActive =
      href === path ||
      (path === '' && href === 'index.html') ||
      (path === '/' && href === 'index.html');
    link.classList.toggle('global-nav__link--active', isActive);
  });
}

(async () => {
  try {
    await Promise.all([
      includeHTML('#nav-placeholder', 'components/nav.html'),
      includeHTML('#footer-placeholder', 'components/footer.html'),
    ]);
    highlightCurrentNav();
    document.dispatchEvent(new Event('includes:loaded'));
  } catch (err) {
    console.error(err);
  }
})();
