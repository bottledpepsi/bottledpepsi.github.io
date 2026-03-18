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
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  default: '#8b949e'
};

async function fetchRepoData(repoName) {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
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
  
  const handleClick = () => window.open(url, '_blank', 'noopener,noreferrer');
  card.onclick = handleClick;
  card.onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const name = card.querySelector('.project-name');
  const description = card.querySelector('.project-description');
  const meta = card.querySelector('.project-meta');

  name.classList.remove('skeleton-text');
  name.textContent = data.name;

  description.classList.remove('skeleton-text');
  description.textContent = data.description || 'No description available';

  const langColor = languageColors[data.language] || languageColors.default;

  const metaItems = [];

  if (data.stargazers_count > 0) {
    metaItems.push(`
      <span class="meta-item" title="${data.stargazers_count} stars">
        <svg class="star-icon" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
        </svg>
        ${formatNumber(data.stargazers_count)}
      </span>
    `);
  }

  if (data.forks_count > 0) {
    metaItems.push(`
      <span class="meta-item" title="${data.forks_count} forks">
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/>
        </svg>
        ${formatNumber(data.forks_count)}
      </span>
    `);
  }

  if (data.language) {
    metaItems.push(`
      <span class="meta-item" title="Primary language: ${data.language}">
        <span class="language-dot" style="background-color: ${langColor}; color: ${langColor}"></span>
        ${data.language}
      </span>
    `);
  }

  metaItems.push(`
    <span class="meta-item" title="Last updated: ${new Date(data.updated_at).toLocaleDateString()}">
      <svg viewBox="0 0 16 16" fill="currentColor">
        <path d="M1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0ZM8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm.5 4.75a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 .471.696l2.5 1a.75.75 0 0 0 .557-1.392L8.5 7.742V4.75Z"/>
      </svg>
      ${formatDate(data.updated_at)}
    </span>
  `);

  meta.innerHTML = metaItems.join('');
}

function renderError(card) {
  const repoName = card.dataset.repo;
  const url = card.dataset.url;

  card.classList.remove('skeleton');
  card.classList.add('loaded');
  
  const handleClick = () => window.open(url, '_blank', 'noopener,noreferrer');
  card.onclick = handleClick;
  card.onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

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
  
  // Fetch all repos in parallel for better performance
  const fetchPromises = Array.from(projectCards).map(card => {
    const repoName = card.dataset.repo;
    return fetchRepoData(repoName).then(data => ({ card, data }));
  });

  const results = await Promise.all(fetchPromises);
  
  // Render with staggered animation
  results.forEach(({ card, data }, index) => {
    setTimeout(() => {
      if (data) {
        renderProjectCard(card, data);
      } else {
        renderError(card);
      }
    }, index * 100);
  });
}

function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');

  toggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update theme-color meta tag
    if (metaThemeColor) {
      metaThemeColor.content = newTheme === 'dark' ? '#0d1117' : '#ffffff';
    }
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  init();
  initThemeToggle();
});
