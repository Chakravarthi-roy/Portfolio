const WORKER_URL = 'https://shy-salad-c1ba.chakri2405.workers.dev/';
let projects = [];

// ── URL MODE: ?mode=ba | ?mode=tech | default = neutral ──
const PORTFOLIO_MODE = new URLSearchParams(window.location.search).get('mode') || 'default';

// ── TYPEWRITER roles per mode ──
const rolesByMode = {
  ba:      ['Business Analyst', 'Product Thinker', 'Data Storyteller', 'Requirements Expert', 'Agile Practitioner'],
  tech:    ['SQL Enthusiast', 'Data Storyteller', 'Tableau Builder', 'Python Explorer', 'Product Thinker'],
  default: ['Business Analyst', 'SQL Enthusiast', 'Data Storyteller', 'Product Thinker', 'Tableau Builder'],
};

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
const roles = rolesByMode[PORTFOLIO_MODE] || rolesByMode.default;
let ri = 0, ci = 0, deleting = false;
function type() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const word = roles[ri];
  if (!deleting) {
    el.textContent = word.slice(0, ++ci);
    if (ci === word.length) { deleting = true; setTimeout(type, 1400); return; }
  } else {
    el.textContent = word.slice(0, --ci);
    if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
  }
  setTimeout(type, deleting ? 55 : 90);
}
type();

// ── FETCH PROJECTS ──
async function fetchProjects() {
  const grid = document.getElementById('projects-grid');
  grid.innerHTML = '<p style="color:var(--muted);font-size:14px;padding:1rem 0;">Loading projects...</p>';
  try {
    const res = await fetch(WORKER_URL);
    projects = await res.json();
    renderProjects();
  } catch (err) {
    grid.innerHTML = '<p style="color:var(--muted);font-size:14px;padding:1rem 0;">Could not load projects. Check your Worker URL!</p>';
  }
}

// ── RENDER PROJECTS ──
function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!projects.length) { grid.innerHTML = '<p style="color:var(--muted);font-size:14px;">No projects found.</p>'; return; }

  // Filter by tech boolean based on URL mode
  const filtered = projects.filter(p => {
    if (PORTFOLIO_MODE === 'tech') return p.tech === true;
    if (PORTFOLIO_MODE === 'ba')   return p.tech === false;
    return true; // default: show all
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
    const acRaw = acRest.join('|');
    const acs = acRaw.split(';').map(s => s.trim()).filter(Boolean);
    return { id, persona, action, benefit, acs };
  }).filter(Boolean);
}

function renderStoryCards(stories) {
  if (!stories.length) return '';
  const cards = stories.map(s => `
    <div class="story-card">
      <div class="story-card-pin"></div>
      <div class="story-card-inner">
        <div class="story-header">
          <span class="story-id">${s.id}</span>
        </div>
        <div class="story-persona-bar">
          <span class="story-persona-icon">👤</span>
          <span class="story-persona-text">As a <strong>${s.persona}</strong>,</span>
        </div>
        <p class="story-action">I want to <strong>${s.action}</strong></p>
        <p class="story-benefit">so that <strong>${s.benefit}</strong></p>
        <div class="story-divider"></div>
        <p class="story-ac-label">✓ Acceptance Criteria</p>
        <ul class="story-ac-list">
          ${s.acs.map(ac => `<li>${ac}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');
  return `
    <div class="detail-section">
      <h3>User Stories</h3>
      <div class="detail-stories-grid">${cards}</div>
    </div>
  `;
}

function openDetail(id) {
  const p = projects.find(x => x.id === id);
  if (!p) return;
  document.getElementById('proj-list').style.display = 'none';
  document.getElementById('proj-detail').classList.add('open');
  const stories = parseUserStories(p.userStories || '');
  const showStories = PORTFOLIO_MODE !== 'tech';
  document.getElementById('detail-content').innerHTML = `
    <div class="detail-hero">
      <img src="${p.picture || './static/default.png'}" alt="${p.title}"/>
    </div>
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
fetchProjects();
fetchBlogs();
triggerReveal();