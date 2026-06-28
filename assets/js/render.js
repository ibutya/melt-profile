let configCache = null;

async function loadConfig() {
  if (configCache) return configCache;
  const res = await fetch('/api/config');
  if (!res.ok) throw new Error('Failed to load config');
  configCache = await res.json();
  return configCache;
}

function avatarSrc(config) {
  return config.avatarUrl || '/api/avatar';
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el && text != null) el.textContent = text;
}

function setMeta(name, content, attr = 'name') {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function applySiteMeta(config) {
  const { site } = config;
  const pageTitle = document.body.dataset.pageTitle;
  document.title = pageTitle ? `${pageTitle} | ${site.name}` : `${site.name} | Profile`;
  setMeta('description', site.description);
  setMeta('og:title', site.name, 'property');
  setMeta('og:description', site.description, 'property');
  setMeta('og:image', avatarSrc(config), 'property');

  document.querySelectorAll('[data-site-name]').forEach((el) => {
    el.textContent = site.name;
  });

  const year = new Date().getFullYear();
  setText('footer-copy', `© ${year} ${site.copyright || site.name}. All rights reserved.`);
}

function applyAvatar(config, selector, size) {
  document.querySelectorAll(selector).forEach((img) => {
    img.src = avatarSrc(config);
    img.alt = `${config.profile.name} のアバター`;
    if (size) {
      img.width = size;
      img.height = size;
    }
  });
}

function renderSocialLinks(config, container) {
  const icons = {
    github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.395-.135-.345-.72-1.395-1.23-1.875-.42-.45-1.02-.78 0-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>',
    twitter: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    discord: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 12.3 12.3 0 0 0-.608 1.25 18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
  };

  container.innerHTML = Object.entries(config.links)
    .filter(([, link]) => link?.url)
    .map(([key, link]) => `
      <a href="${link.url}" class="social-links__item" target="_blank" rel="noopener noreferrer" aria-label="${link.label}">
        ${icons[key] || ''}
      </a>
    `)
    .join('');
}

function renderContactLinks(config, container) {
  const icons = { github: '⌨', twitter: '𝕏', discord: '💬' };

  container.innerHTML = Object.entries(config.links)
    .filter(([, link]) => link?.url)
    .map(([key, link]) => `
      <a href="${link.url}" class="contact-link-card card" target="_blank" rel="noopener noreferrer">
        <span class="contact-link-card__icon" aria-hidden="true">${icons[key] || '🔗'}</span>
        <span class="contact-link-card__label">${link.label}</span>
        <span class="contact-link-card__value">${link.display || link.url}</span>
      </a>
    `)
    .join('');
}

function renderSkills(config, container) {
  container.innerHTML = config.skills
    .map((skill) => `<span class="tag skill-grid__tag">${skill}</span>`)
    .join('');
}

function renderInterests(config, container) {
  container.innerHTML = config.interests
    .map((item) => `
      <article class="interest-list__item card">
        <h3 class="interest-list__title">${item.icon} ${item.title}</h3>
        <p class="interest-list__desc">${item.description}</p>
      </article>
    `)
    .join('');
}

function renderWorks(config, container) {
  const linkLabels = { github: 'GitHub', demo: 'Demo', listen: 'Listen' };

  container.innerHTML = config.works
    .map((work) => {
      const actions = Object.entries(work.links || {})
        .map(([key, url]) => {
          const cls = key === 'github' ? 'btn btn--secondary' : 'btn btn--outline';
          return `<a href="${url}" class="${cls}" target="_blank" rel="noopener noreferrer">${linkLabels[key] || key}</a>`;
        })
        .join('');

      return `
        <article class="work-card card" data-category="${work.category}">
          <img src="${work.thumbnail}" alt="" class="work-card__thumb" width="400" height="225">
          <div class="work-card__body">
            <h2 class="work-card__title">${work.title}</h2>
            <p class="work-card__desc">${work.description}</p>
            <div class="work-card__tags">
              ${work.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="work-card__actions">${actions}</div>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderHome(config) {
  const { profile } = config;
  applyAvatar(config, '.hero__avatar', 140);
  setText('profile-name', profile.name);
  setText('profile-catch', profile.catchphrase);
  setText('bio-short', profile.bioShort);

  const social = document.getElementById('social-links');
  if (social) renderSocialLinks(config, social);
}

function renderAbout(config) {
  const { profile } = config;
  applyAvatar(config, '.profile-card__avatar', 120);
  setText('profile-name', profile.name);
  setText('profile-location', `📍 ${profile.location}`);
  setText('profile-bio', profile.bioLong);

  const skills = document.getElementById('skills-container');
  if (skills) renderSkills(config, skills);

  const interests = document.getElementById('interests-container');
  if (interests) renderInterests(config, interests);
}

function renderWorksPage(config) {
  const grid = document.getElementById('works-grid');
  if (grid) {
    renderWorks(config, grid);
    document.dispatchEvent(new Event('works:rendered'));
  }
}

function renderContact(config) {
  const links = document.getElementById('contact-links');
  if (links) renderContactLinks(config, links);

  const form = document.getElementById('contact-form');
  if (form && config.contact?.formspreeId) {
    form.action = `https://formspree.io/f/${config.contact.formspreeId}`;
  }
}

async function renderPage() {
  const config = await loadConfig();
  applySiteMeta(config);

  const page = document.body.dataset.page;
  switch (page) {
    case 'home':
      renderHome(config);
      break;
    case 'about':
      renderAbout(config);
      break;
    case 'works':
      renderWorksPage(config);
      break;
    case 'contact':
      renderContact(config);
      break;
  }
}

async function init() {
  if (!document.querySelector('.global-nav')) {
    await new Promise((resolve) => {
      document.addEventListener('includes:loaded', resolve, { once: true });
    });
  }
  await renderPage();
}

document.addEventListener('DOMContentLoaded', () => {
  init().catch((err) => console.error(err));
});

window.renderPage = renderPage;