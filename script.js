'use strict';

// ─── Config ──────────────────────────────────────────────────────────────────

const GITHUB_USERNAME = 'bottledpepsi';

const PROJECT_NAMES = [
  'golden-dandelion-indicator',
  'reverse-aging-mod',
  'perfhud',
  'minecraft-external-esp',
  'cps-tester',
  'nvidia-clicker-game',
];

const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  HTML:       '#e34c26',
  CSS:        '#563d7c',
  Python:     '#3572A5',
  Java:       '#b07219',
  'C++':      '#f34b7d',
  C:          '#555555',
  Go:         '#00ADD8',
  Rust:       '#dea584',
  Ruby:       '#701516',
  PHP:        '#4F5D95',
  Swift:      '#F05138',
  Kotlin:     '#A97BFF',
  default:    '#8b949e',
};

// ─── GitHub API ───────────────────────────────────────────────────────────────

const CACHE_PREFIX = 'bp_repo_';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Returns cached repo data if fresh, otherwise null.
 * @param {string} repoName
 * @returns {{ data: object, ts: number } | null}
 */
function getCached(repoName) {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + repoName);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.ts > CACHE_TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Saves repo data to session storage.
 * @param {string} repoName
 * @param {object} data
 */
function setCached(repoName, data) {
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + repoName,
      JSON.stringify({ data, ts: Date.now() })
    );
  } catch {
    // Storage full or blocked — silently skip.
  }
}

/**
 * Fetches a single repo from the GitHub API with caching and rate-limit handling.
 * @param {string} repoName
 * @returns {Promise<object>}
 */
async function fetchRepoData(repoName) {
  const cached = getCached(repoName);
  if (cached) return cached;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`,
      { headers: { Accept: 'application/vnd.github.v3+json' } }
    );

    if (response.status === 403 || response.status === 429) {
      // Respect Retry-After header when provided.
      return { name: repoName, rateLimited: true };
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    setCached(repoName, data);
    return data;
  } catch (error) {
    console.error(`[bottledpepsi] Failed to fetch "${repoName}":`, error);
    return { name: repoName, error: true };
  }
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

const MINUTE = 60 * 1000;
const HOUR   = 60 * MINUTE;
const DAY    = 24 * HOUR;
const WEEK   = 7  * DAY;
const MONTH  = 30 * DAY;
const YEAR   = 365 * DAY;

/**
 * Returns a human-readable relative time string.
 * @param {string} dateString  ISO 8601 date
 * @returns {string}
 */
function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const diff = Date.now() - new Date(dateString).getTime();
  if (diff < DAY)   return 'today';
  if (diff < 2 * DAY) return 'yesterday';
  if (diff < WEEK)  return `${Math.floor(diff / DAY)}d ago`;
  if (diff < MONTH) return `${Math.floor(diff / WEEK)}w ago`;
  if (diff < YEAR)  return `${Math.floor(diff / MONTH)}mo ago`;
  return `${Math.floor(diff / YEAR)}y ago`;
}

/**
 * Compact number formatter: 1234 → "1.2k".
 * @param {number} n
 * @returns {string}
 */
function formatNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

// ─── DOM helpers ─────────────────────────────────────────────────────────────

/**
 * Build the skeleton placeholder HTML for a single card.
 * @returns {string}
 */
function skeletonCardHTML() {
  return `
    <article class="project-card skeleton" aria-busy="true" aria-label="Loading project">
      <div class="project-header">
        <h3 class="project-name skeleton-text">Loading…</h3>
      </div>
      <p class="project-description skeleton-text">Fetching repository data…</p>
      <div class="project-meta"></div>
    </article>
  `;
}

/**
 * Renders loaded data into an existing card element.
 * @param {HTMLElement} card
 * @param {object} data  GitHub API response (or error object)
 */
function renderProjectCard(card, data) {
  const repoUrl = card.dataset.url;

  card.classList.remove('skeleton');
  card.classList.add('loaded');
  card.removeAttribute('aria-busy');
  card.setAttribute('aria-label', `${data.name} repository`);

  const nameEl        = card.querySelector('.project-name');
  const descriptionEl = card.querySelector('.project-description');
  const metaEl        = card.querySelector('.project-meta');

  nameEl.classList.remove('skeleton-text');
  nameEl.textContent = data.name;

  descriptionEl.classList.remove('skeleton-text');

  if (data.rateLimited || data.error) {
    descriptionEl.textContent = data.rateLimited
      ? 'GitHub API rate limit reached — try again shortly.'
      : 'Could not load repository details.';
    metaEl.innerHTML = `<span class="meta-item" aria-label="Error loading data">Unavailable</span>`;
    return;
  }

  descriptionEl.textContent = data.description || 'No description available.';

  // Build meta row
  const metaItems = [];

  if (data.stargazers_count > 0) {
    metaItems.push(`
      <span class="meta-item">
        <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"
             aria-hidden="true" focusable="false">
          <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
        </svg>
        <span aria-label="${data.stargazers_count} stars">${formatNumber(data.stargazers_count)}</span>
      </span>
    `);
  }

  if (data.language) {
    const langColor = LANGUAGE_COLORS[data.language] ?? LANGUAGE_COLORS.default;
    metaItems.push(`
      <span class="meta-item">
        <span class="language-dot" style="background-color:${langColor};"
              aria-hidden="true"></span>
        <span>${data.language}</span>
      </span>
    `);
  }

  const relTime = formatRelativeTime(data.updated_at);
  if (relTime) {
    metaItems.push(`
      <span class="meta-item">
        <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"
             aria-hidden="true" focusable="false">
          <path d="M1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0ZM8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm.5 4.75a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 .471.696l2.5 1a.75.75 0 0 0 .557-1.392L8.5 7.742V4.75Z"/>
        </svg>
        <time datetime="${data.updated_at}" aria-label="Updated ${relTime}">${relTime}</time>
      </span>
    `);
  }

  metaEl.innerHTML = metaItems.join('');
}

// ─── Projects init ────────────────────────────────────────────────────────────

async function initProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  // Render skeleton placeholders immediately.
  grid.innerHTML = PROJECT_NAMES.map(() => skeletonCardHTML()).join('');

  // Fetch all repos concurrently.
  const results = await Promise.all(PROJECT_NAMES.map(fetchRepoData));

  // Sort by most-recently updated (errors/rate-limited go last).
  const sorted = [...results].sort((a, b) => {
    if (!a.updated_at && !b.updated_at) return 0;
    if (!a.updated_at) return 1;
    if (!b.updated_at) return -1;
    return new Date(b.updated_at) - new Date(a.updated_at);
  });

  // Rebuild cards from sorted data.
  grid.innerHTML = '';

  sorted.forEach((data, index) => {
    const card = document.createElement('article');
    card.className = 'project-card skeleton';
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-busy', 'true');
    card.setAttribute('aria-label', 'Loading project');
    card.dataset.url = `https://github.com/${GITHUB_USERNAME}/${data.name}/`;

    card.innerHTML = `
      <div class="project-header">
        <h3 class="project-name skeleton-text">Loading…</h3>
        <svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" width="18" height="18"
             aria-hidden="true" focusable="false">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
        </svg>
      </div>
      <p class="project-description skeleton-text">Fetching…</p>
      <div class="project-meta"></div>
    `;

    grid.appendChild(card);

    // Attach interaction handlers immediately so the card is usable
    // via keyboard even while still in skeleton/loading state.
    const openRepo = () => window.open(card.dataset.url, '_blank', 'noopener,noreferrer');
    card.addEventListener('click', openRepo);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openRepo();
      }
    });

    // Stagger the load animation slightly to avoid layout thrash.
    setTimeout(() => renderProjectCard(card, data), index * 50);
  });
}

// ─── Theme toggle ─────────────────────────────────────────────────────────────

function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  /** Updates the aria-label to reflect what clicking will do next. */
  function syncLabel(theme) {
    toggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
    );
  }

  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  syncLabel(current);

  toggle.addEventListener('click', () => {
    const prev = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = prev === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch { /* private browsing */ }
    syncLabel(next);
  });
}

// ─── Copyright year ───────────────────────────────────────────────────────────

function initCopyrightYear() {
  const el = document.getElementById('copyright-year');
  if (el) el.textContent = new Date().getFullYear();
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initProjects();
  initThemeToggle();
  initCopyrightYear();
});
