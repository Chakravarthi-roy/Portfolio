const WORKER_URL = 'https://shy-salad-c1ba.chakri2405.workers.dev/';
let projects = [];
let content = {};

// ── URL MODE: ?mode=tech | default = pm ──
const PORTFOLIO_MODE = new URLSearchParams(window.location.search).get('mode') || 'pm';

// ── SVG ICONS for skill rows ──
const ICONS = {
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>`,
};

// ── LOAD CONTENT JSON ──
async function loadContent() {
  const file = PORTFOLIO_MODE === 'tech' ? 'tech' : 'pm';
  try {
    const res = await fetch(`./static/${file}.json`);
    content = await res.json();
    applyContent();
  } catch (err) {
    console.error('Could not load content JSON:', err);
  }
}

// ── APPLY CONTENT TO DOM ──
function applyContent() {
  const c = content.cards;
  setCard(0, c.reading,  c.readingSub);
  setCard(1, c.learning, c.learningSub);
  setCard(2, c.openTo,   c.openToSub);

  const tagsEl = document.querySelector('.clothesline-tags');
  if (tagsEl) {
    tagsEl.innerHTML = content.clothesline.map(t => `<span class="chip">${t}</span>`).join('');
  }

  const roleEl = document.querySelector('.about-profile-role');
  if (roleEl) roleEl.textContent = content.about.role;

  const headlineEl = document.querySelector('.about-headline');
  if (headlineEl) headlineEl.innerHTML = content.about.headline
    .replace('insights.', '<span class="about-highlight">insights.</span>')
    .replace('insights', '<span class="about-highlight">insights</span>');

  const bioEls = document.querySelectorAll('.about-bio-text');
  const bios = [content.about.bio1, content.about.bio2, content.about.bio3];
  bioEls.forEach((el, i) => { if (bios[i]) el.textContent = bios[i]; });

  const quoteEl = document.querySelector('.about-quote p');
  if (quoteEl) quoteEl.textContent = content.about.quote;

  const skillsRows = document.querySelector('.about-skills-rows');
  if (skillsRows && content.about.skillRows) {
    skillsRows.innerHTML = content.about.skillRows.map(row => `
      <div class="about-skill-row">
        <div class="about-skill-category">
          <span class="ask-icon">${ICONS[row.icon] || ICONS.star}</span>
          <span>${row.label}</span>
        </div>
        <div class="about-skill-chips">
          ${row.chips.map(chip => `<span class="ask-chip ${row.type}">${chip}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  startTypewriter();
}

function setCard(index, value, sub) {
  const cards = document.querySelectorAll('.currently-card');
  if (!cards[index]) return;
  cards[index].querySelector('.currently-value').textContent = value;
  cards[index].querySelector('.currently-sub').textContent = sub;
}

// ── PHOTO MODAL ──
function openModal() {
  const img = document.querySelector('.photo-frame img');
  document.getElementById('modal-img').src = img ? img.src : './static/pic.jpg';
  document.getElementById('photo-modal').classList.add('open');
}
function closeModal() {
  document.getElementById('photo-modal').classList.remove('open');
}

// ── HANDLE CLICK ──
function handleClick() {
  const btn = document.getElementById('cta-btn');
  btn.classList.add('swinging');
  setTimeout(() => {
    btn.classList.remove('swinging');
    goTo('projects');
  }, 950);
}

// ── NAVIGATION ──
function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.getElementById('nav-' + page).classList.add('active');
  window.scrollTo(0, 0);
  if (page === 'projects') closeDetail();
  if (page === 'blogs') closeBlogDetail();
  triggerReveal();
}

// ── TYPEWRITER ──
let ri = 0, ci = 0, deleting = false, typeTimer = null;
function startTypewriter() {
  if (typeTimer) clearTimeout(typeTimer);
  ri = 0; ci = 0; deleting = false;
  type();
}
function type() {
  const el = document.getElementById('typewriter');
  if (!el || !content.typewriterRoles) return;
  const roles = content.typewriterRoles;
  const word = roles[ri];
  if (!deleting) {
    el.textContent = word.slice(0, ++ci);
    if (ci === word.length) { deleting = true; typeTimer = setTimeout(type, 1400); return; }
  } else {
    el.textContent = word.slice(0, --ci);
    if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
  }
  typeTimer = setTimeout(type, deleting ? 55 : 90);
}

// ── FETCH PROJECTS ──
async function fetchProjects() {
  const grid = document.getElementById('projects-grid');
  grid.innerHTML = '<p style="color:var(--muted);font-size:14px;padding:1rem 0;">Loading projects...</p>';
  try {
    const res = await fetch(WORKER_URL);
    projects = await res.json();
    renderProjects();
  } catch (err) {
    grid.innerHTML = '<p style="color:var(--muted);font-size:14px;padding:1rem 0;">Could not load projects.</p>';
  }
}

// ── RENDER PROJECTS ──
function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!projects.length) { grid.innerHTML = '<p style="color:var(--muted);font-size:14px;">No projects found.</p>'; return; }

  const filtered = projects.filter(p => {
    if (PORTFOLIO_MODE === 'tech') return p.tech === true;
    return p.tech === false;
  });

  if (!filtered.length) { grid.innerHTML = '<p style="color:var(--muted);font-size:14px;">No projects found.</p>'; return; }

  grid.innerHTML = filtered.map(p => `
    <div class="proj-card reveal" onclick="openDetail('${p.id}')">
      <div class="proj-thumb">
        <img src="${p.picture || './static/default.png'}" alt="${p.title}"/>
      </div>
      <div class="proj-body">
        <div class="proj-tags">${p.tags.map(t => `<span class="proj-tag">${t}</span>`).join('')}</div>
        <p class="proj-title">${p.title}</p>
        <p class="proj-desc">${p.description}</p>
      </div>
    </div>
  `).join('');
  triggerReveal();
}

// ── PROJECT DETAIL ──
function parseUserStories(raw) {
  if (!raw || !raw.trim()) return [];
  return raw.trim().split('\n').map(line => {
    const parts = line.split('|').map(s => s.trim());
    if (parts.length < 5) return null;
    const [id, persona, action, benefit, ...acRest] = parts;
    const acs = acRest.join('|').split(';').map(s => s.trim()).filter(Boolean);
    return { id, persona, action, benefit, acs };
  }).filter(Boolean);
}

function renderStoryCards(stories) {
  if (!stories.length) return '';
  const cards = stories.map(s => `
    <div class="story-card">
      <div class="story-card-pin"></div>
      <div class="story-card-inner">
        <div class="story-header"><span class="story-id">${s.id}</span></div>
        <div class="story-persona-bar">
          <span class="story-persona-icon">👤</span>
          <span class="story-persona-text">As a <strong>${s.persona}</strong>,</span>
        </div>
        <p class="story-action">I want to <strong>${s.action}</strong></p>
        <p class="story-benefit">so that <strong>${s.benefit}</strong></p>
        <div class="story-divider"></div>
        <p class="story-ac-label">✓ Acceptance Criteria</p>
        <ul class="story-ac-list">${s.acs.map(ac => `<li>${ac}</li>`).join('')}</ul>
      </div>
    </div>
  `).join('');
  return `<div class="detail-section"><h3>User Stories</h3><div class="detail-stories-grid">${cards}</div></div>`;
}

function openDetail(id) {
  const p = projects.find(x => x.id === id);
  if (!p) return;
  document.getElementById('proj-list').style.display = 'none';
  document.getElementById('proj-detail').classList.add('open');
  const stories = parseUserStories(p.userStories || '');
  const showStories = PORTFOLIO_MODE !== 'tech';
  document.getElementById('detail-content').innerHTML = `
    <div class="detail-hero"><img src="${p.picture || './static/default.png'}" alt="${p.title}"/></div>
    <div class="detail-tags">${p.tags.map(t => `<span class="proj-tag">${t}</span>`).join('')}</div>
    <h2 class="detail-title">${p.title}</h2>
    <div class="detail-section"><h3>Overview</h3><p>${p.overview}</p></div>
    ${p.tableauLink ? `<div class="detail-section"><h3>Dashboard</h3><div class="tableau-embed"><iframe src="${p.tableauLink}?:showVizHome=no&:embed=true" width="100%" height="420" frameborder="0" allowfullscreen></iframe></div></div>` : ''}
    ${showStories ? renderStoryCards(stories) : ''}
    <div style="margin-top:1.5rem;display:flex;gap:10px;flex-wrap:wrap;">
      ${p.liveLink ? `<a class="detail-link" href="${p.liveLink}" target="_blank">View live →</a>` : ''}
      ${p.githubLink ? `<a class="detail-link outline" href="${p.githubLink}" target="_blank">GitHub</a>` : ''}
    </div>
  `;
  window.scrollTo(0, 0);
}

function closeDetail() {
  document.getElementById('proj-list').style.display = 'block';
  document.getElementById('proj-detail').classList.remove('open');
  window.scrollTo(0, 0);
}

// ── FETCH & RENDER BLOGS ──
let blogData = [];

async function fetchBlogs() {
  const list = document.getElementById('blog-list');
  list.innerHTML = '<p style="color:var(--muted);font-size:14px;padding:1rem 0;">Loading posts...</p>';
  try {
    const res = await fetch(WORKER_URL + 'blogs');
    blogData = await res.json();
    list.innerHTML = blogData.map((b, i) => `
      <div class="blog-card reveal" onclick="openBlogDetail(${i})">
        <div class="blog-card-fold"></div>
        <div class="blog-card-holes">
          <div class="blog-card-hole"></div>
          <div class="blog-card-hole"></div>
          <div class="blog-card-hole"></div>
        </div>
        <p class="blog-tag">${b.tag}</p>
        <p class="blog-title">${b.title}</p>
        <p class="blog-meta">${b.date}</p>
        <span class="blog-arrow">→</span>
      </div>
    `).join('');
    triggerReveal();
  } catch (err) {
    list.innerHTML = '<p style="color:var(--muted);font-size:14px;">Could not load posts.</p>';
  }
}

function openBlogDetail(index) {
  const b = blogData[index];
  if (!b) return;
  document.getElementById('blog-list-view').style.display = 'none';
  document.getElementById('blog-detail-view').style.display = 'block';
  document.getElementById('blog-detail-content').innerHTML = `
    <div class="blog-reading-header">
      <p class="blog-reading-tag">${b.tag}</p>
      <h1 class="blog-reading-title">${b.title}</h1>
      <div class="blog-reading-meta">
        <span>📅 ${b.date}</span>
        <span>✍️ Chakravarthi</span>
      </div>
    </div>
    <div class="blog-reading-fade">
      <div class="blog-reading-content">${b.preview || '<p>Preview not available.</p>'}</div>
    </div>
    <div class="blog-medium-cta">
      <p>Enjoying the read? The full story is waiting on Medium.</p>
      <a class="blog-medium-link" href="${b.link}" target="_blank">Read full story on Medium ↗</a>
    </div>
  `;
  window.scrollTo(0, 0);
}

function closeBlogDetail() {
  document.getElementById('blog-list-view').style.display = 'block';
  document.getElementById('blog-detail-view').style.display = 'none';
  window.scrollTo(0, 0);
}

// ── SCROLL REVEAL ──
function triggerReveal() {
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight - 40) el.classList.add('visible');
    });
  }, 100);
}
window.addEventListener('scroll', triggerReveal);

// ── INIT ──
loadContent();
fetchProjects();
fetchBlogs();
triggerReveal();