const GITHUB_USERNAME = "bottledpepsi";

const languageColors = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  default: '#8b949e'
};

const projectNames = [
  "golden-dandelion-indicator",
  "reverse-aging-mod",
  "perfhud",
  "minecraft-external-esp",
  "cps-tester",
  "nvidia-clicker-game"
];

const grid = document.getElementById('projects-grid');

async function fetchRepoData(repoName) {
  try {
    // API endpoint allows CORS; the main website does not.
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });

    if (response.status === 403 || response.status === 429) {
      return { name: repoName, rateLimited: true };
    }

    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${repoName}:`, error);
    return { name: repoName, error: true };
  }
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

function renderProjectCard(card, data) {
  const url = card.dataset.url;
  card.classList.remove('skeleton');
  card.classList.add('loaded');

  card.onclick = () => window.open(url, '_blank', 'noopener,noreferrer');

  const name = card.querySelector('.project-name');
  const description = card.querySelector('.project-description');
  const meta = card.querySelector('.project-meta');

  name.classList.remove('skeleton-text');
  name.textContent = data.name;
  description.classList.remove('skeleton-text');

  if (data.rateLimited || data.error) {
    description.textContent = data.rateLimited ? "API rate limit reached" : "Failed to load details";
    meta.innerHTML = `<span class="meta-item" style="color: #8b949e;">Status: Error</span>`;
    return;
  }

  description.textContent = data.description || 'No description available';
  const langColor = languageColors[data.language] || languageColors.default;
  const metaItems = [];

  if (data.stargazers_count > 0) {
    metaItems.push(`
      <span class="meta-item">
        <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
          <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
        </svg>
        ${formatNumber(data.stargazers_count)}
      </span>
    `);
  }

  if (data.language) {
    metaItems.push(`
      <span class="meta-item">
        <span class="language-dot" style="background-color: ${langColor};"></span>
        ${data.language}
      </span>
    `);
  }

  metaItems.push(`
    <span class="meta-item">
      <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
        <path d="M1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0ZM8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm.5 4.75a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 .471.696l2.5 1a.75.75 0 0 0 .557-1.392L8.5 7.742V4.75Z"/>
      </svg>
      ${formatDate(data.updated_at)}
    </span>
  `);

  meta.innerHTML = metaItems.join('');
}

async function init() {
  if (!grid) return;

  grid.innerHTML = projectNames.map(() => `
    <div class="project-card skeleton"> 
      <div class="project-header"><h3 class="project-name skeleton-text">Loading...</h3></div>
      <p class="project-description skeleton-text">Fetching...</p>
      <div class="project-meta"></div>
    </div>
  `).join('');

  const results = await Promise.all(projectNames.map(name => fetchRepoData(name)));

  const sortedProjects = results.sort((a, b) => {
    if (a.rateLimited || b.rateLimited || a.error || b.error) return 0;
    return new Date(b.updated_at) - new Date(a.updated_at);
  });

  grid.innerHTML = '';

  sortedProjects.forEach((data, index) => {
    const card = document.createElement('div');
    card.className = 'project-card skeleton';
    card.dataset.url = `https://github.com/${GITHUB_USERNAME}/${data.name}/`;

    card.innerHTML = `
      <div class="project-header">
        <h3 class="project-name skeleton-text">Loading...</h3>
        <svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
        </svg>
      </div>
      <p class="project-description skeleton-text">Fetching...</p>
      <div class="project-meta"></div>
    `;

    grid.appendChild(card);
    setTimeout(() => renderProjectCard(card, data), index * 50);
  });
}

function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  init();
  initThemeToggle();
});
