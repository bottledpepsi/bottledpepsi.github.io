const GITHUB_USERNAME = 'bottledpepsi';

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
  default: '#8b949e'
};

async function fetchRepoData(repoName) {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`);
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${repoName}:`, error);
    return null;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Updated today';
  if (diffDays === 1) return 'Updated yesterday';
  if (diffDays < 7) return `Updated ${diffDays} days ago`;
  if (diffDays < 30) return `Updated ${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `Updated ${Math.floor(diffDays / 30)} months ago`;
  return `Updated ${Math.floor(diffDays / 365)} years ago`;
}

function renderProjectCard(card, data) {
  const url = card.dataset.url;
  
  card.classList.remove('skeleton');
  card.onclick = () => window.open(url, '_blank');
  
  const name = card.querySelector('.project-name');
  const description = card.querySelector('.project-description');
  const meta = card.querySelector('.project-meta');
  
  name.classList.remove('skeleton-text');
  name.textContent = data.name;
  
  description.classList.remove('skeleton-text');
  description.textContent = data.description || 'No description available';
  
  const langColor = languageColors[data.language] || languageColors.default;
  
  meta.innerHTML = `
    ${data.stargazers_count > 0 ? `
      <span class="meta-item">
        <svg class="star-icon" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
        </svg>
        ${data.stargazers_count}
      </span>
    ` : ''}
    ${data.language ? `
      <span class="meta-item">
        <span class="language-dot" style="background-color: ${langColor}"></span>
        ${data.language}
      </span>
    ` : ''}
    <span class="meta-item">${formatDate(data.updated_at)}</span>
  `;
}

function renderError(card) {
  const repoName = card.dataset.repo;
  const url = card.dataset.url;
  
  card.classList.remove('skeleton');
  card.onclick = () => window.open(url, '_blank');
  
  const name = card.querySelector('.project-name');
  const description = card.querySelector('.project-description');
  const meta = card.querySelector('.project-meta');
  
  name.classList.remove('skeleton-text');
  name.textContent = repoName;
  
  description.classList.remove('skeleton-text');
  description.textContent = 'Click to view project';
  
  meta.innerHTML = '';
}

async function init() {
  const projectCards = document.querySelectorAll('.project-card');
  
  for (const card of projectCards) {
    const repoName = card.dataset.repo;
    const data = await fetchRepoData(repoName);
    
    if (data) {
      renderProjectCard(card, data);
    } else {
      renderError(card);
    }
  }
}

function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  
  toggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  init();
  initThemeToggle();
});
