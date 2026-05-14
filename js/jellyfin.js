// jellyfin.js — reads data/jellyfin.json and renders the page
// This file runs in the browser; no server needed.

document.getElementById('year').textContent = new Date().getFullYear();

// Type → emoji for the poster placeholder
const TYPE_EMOJI = {
  Movie:   '🎬',
  Series:  '📺',
  Episode: '📺',
  Music:   '🎵',
  Audio:   '🎵',
  Book:    '📖',
};

// Library collection type → readable label + emoji
const LIB_META = {
  movies:      { label: 'Movies',    emoji: '🎬' },
  tvshows:     { label: 'TV Shows',  emoji: '📺' },
  music:       { label: 'Music',     emoji: '🎵' },
  books:       { label: 'Books',     emoji: '📖' },
  photos:      { label: 'Photos',    emoji: '🖼️' },
  homevideos:  { label: 'Videos',    emoji: '📹' },
  mixed:       { label: 'Mixed',     emoji: '📁' },
};

// ─── Fetch the static JSON ────────────────────────────────────
fetch('data/jellyfin.json')
  .then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  })
  .then(data => render(data))
  .catch(err => {
    console.error('Could not load jellyfin.json:', err);
    renderError();
  });


// ─── Render everything ────────────────────────────────────────
function render(data) {

  // Server name + launch button
  if (data.server_name) {
    document.getElementById('server-name').textContent = data.server_name;
    document.title = `${data.server_name} — My Site`;
  }
  if (data.server_url) {
    document.getElementById('launch-btn').href = data.server_url;
  }

  // "Last updated" note
  if (data.generated_at) {
    const d = new Date(data.generated_at);
    const fmt = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    document.getElementById('generated-at').textContent = `Last updated ${fmt}`;
  }

  // Library stats
  renderLibraries(data.libraries || []);

  // Recent media grid
  renderRecent(data.recent || []);
}


function renderLibraries(libraries) {
  const grid = document.getElementById('stat-grid');
  grid.innerHTML = '';

  if (!libraries.length) {
    grid.innerHTML = '<div class="stat-card stat-card--loading">Run fetch_jellyfin.py to populate library stats.</div>';
    return;
  }

  libraries.forEach(lib => {
    const meta  = LIB_META[lib.type] || LIB_META.mixed;
    const card  = document.createElement('div');
    card.className = 'stat-card reveal';
    card.innerHTML = `
      <span class="stat-count">${lib.count.toLocaleString()}</span>
      <span class="stat-label">${meta.emoji} ${lib.name || meta.label}</span>
    `;
    grid.appendChild(card);
  });

  observeReveal();
}


function renderRecent(items) {
  const grid = document.getElementById('media-grid');
  grid.innerHTML = '';

  if (!items.length) {
    grid.innerHTML = `
      <div class="empty-state">
        No recent items yet — run <code>fetch_jellyfin.py</code> and push the JSON to see your media here.
      </div>`;
    return;
  }

  items.forEach(item => {
    const emoji = TYPE_EMOJI[item.type] || '🎞️';
    const card  = document.createElement('div');
    card.className = 'media-card reveal';

    const posterHTML = item.image_url
      ? `<img class="media-poster" src="${item.image_url}" alt="${escHtml(item.name)}" loading="lazy" />`
      : `<div class="media-poster-placeholder">${emoji}</div>`;

    const meta = [item.year, item.type].filter(Boolean).join(' · ');

    card.innerHTML = `
      ${posterHTML}
      <div class="media-info">
        <div class="media-title" title="${escHtml(item.name)}">${escHtml(item.name)}</div>
        <div class="media-meta">${escHtml(meta)}</div>
      </div>
    `;
    grid.appendChild(card);
  });

  observeReveal();
}


function renderError() {
  document.getElementById('stat-grid').innerHTML =
    '<div class="stat-card stat-card--loading">⚠️ Could not load jellyfin.json</div>';
  document.getElementById('media-grid').innerHTML =
    '<div class="empty-state">⚠️ Could not load media data. Make sure <code>data/jellyfin.json</code> exists.</div>';
}


// ─── Helpers ─────────────────────────────────────────────────

// Re-run the IntersectionObserver for dynamically added .reveal elements
function observeReveal() {
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
}

// Escape HTML to prevent XSS from API data
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
