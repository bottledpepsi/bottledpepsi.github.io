/* ==========================================================================
   projects.js — renders the Links and Projects sections
   --------------------------------------------------------------------------
   Exposes `window.BP_PROJECTS.renderLinks()` and `renderProjects()`.
   Uses the config/github/format modules loaded earlier (all deferred, so they
   are guaranteed to exist by the time main.js calls these).
   ========================================================================== */

(function () {
  'use strict';

  function config()  { return window.BP_CONFIG  || {}; }
  function format()  { return window.BP_FORMAT  || {}; }
  function github()  { return window.BP_GITHUB  || {}; }

  /* ── Links ──────────────────────────────────────────────────────────── */

  function renderLinks() {
    var grid = document.getElementById('links-grid');
    if (!grid) return;

    var links = config().links || [];
    grid.innerHTML = links.map(function (link) {
      return (
        '<a href="' + link.href + '" ' +
          'target="_blank" rel="noopener noreferrer" ' +
          'class="link-card" ' +
          'aria-label="' + link.label + '">' +
          '<svg class="link-icon" viewBox="0 0 24 24" fill="currentColor" ' +
            'aria-hidden="true" focusable="false">' +
            link.icon +
          '</svg>' +
        '</a>'
      );
    }).join('');
  }

  /* ── Projects ───────────────────────────────────────────────────────── */

  function skeletonCardHTML() {
    return (
      '<article class="project-card skeleton" aria-busy="true" aria-label="Loading project">' +
        '<div class="project-header">' +
          '<h3 class="project-name skeleton-text">Loading…</h3>' +
        '</div>' +
        '<p class="project-description skeleton-text">Fetching repository data…</p>' +
        '<div class="project-meta"></div>' +
      '</article>'
    );
  }

  function metaItemsHTML(repo) {
    var F = format();
    var items = [];

    if (repo.stargazers_count > 0) {
      items.push(
        '<span class="meta-item">' +
          '<svg class="star-icon" viewBox="0 0 16 16" fill="currentColor" ' +
            'aria-hidden="true" focusable="false">' +
            '<path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>' +
          '</svg>' +
          '<span aria-label="' + repo.stargazers_count + ' stars">' +
            F.formatNumber(repo.stargazers_count) +
          '</span>' +
        '</span>'
      );
    }

    if (repo.language) {
      var color = F.languageColor(repo.language);
      items.push(
        '<span class="meta-item">' +
          '<span class="language-dot" style="background-color:' + color + ';" aria-hidden="true"></span>' +
          '<span>' + repo.language + '</span>' +
        '</span>'
      );
    }

    var relTime = F.formatRelativeTime(repo.updated_at);
    if (relTime) {
      items.push(
        '<span class="meta-item">' +
          '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">' +
            '<path d="M1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0ZM8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm.5 4.75a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 .471.696l2.5 1a.75.75 0 0 0 .557-1.392L8.5 7.742V4.75Z"/>' +
          '</svg>' +
          '<time datetime="' + repo.updated_at + '" aria-label="Updated ' + relTime + '">' + relTime + '</time>' +
        '</span>'
      );
    }

    return items.join('');
  }

  function buildCard(name) {
    var username = config().githubUsername || 'bottledpepsi';
    var url = 'https://github.com/' + username + '/' + name + '/';

    var card = document.createElement('article');
    card.className = 'project-card skeleton';
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-busy', 'true');
    card.setAttribute('aria-label', 'Loading project');
    card.dataset.url = url;

    card.innerHTML =
      '<div class="project-header">' +
        '<h3 class="project-name skeleton-text">Loading…</h3>' +
        '<svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
          'stroke-width="2" aria-hidden="true" focusable="false">' +
          '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>' +
        '</svg>' +
      '</div>' +
      '<p class="project-description skeleton-text">Fetching…</p>' +
      '<div class="project-meta"></div>';

    // Keyboard + click interaction (available immediately, even while loading).
    var openRepo = function () {
      window.open(card.dataset.url, '_blank', 'noopener,noreferrer');
    };
    card.addEventListener('click', openRepo);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openRepo();
      }
    });

    return card;
  }

  function renderIntoCard(card, result) {
    card.classList.remove('skeleton');
    card.classList.add('loaded');
    card.removeAttribute('aria-busy');

    var nameEl = card.querySelector('.project-name');
    var descEl = card.querySelector('.project-description');
    var metaEl = card.querySelector('.project-meta');

    nameEl.classList.remove('skeleton-text');
    descEl.classList.remove('skeleton-text');

    if (!result.ok) {
      var name = result.name;
      nameEl.textContent = name;
      card.setAttribute('aria-label', name + ' repository');
      descEl.textContent = result.reason === 'rate-limited'
        ? 'GitHub API rate limit reached — try again shortly.'
        : 'Could not load repository details.';
      metaEl.innerHTML =
        '<span class="meta-item" aria-label="Error loading data">Unavailable</span>';
      return;
    }

    var repo = result.repo;
    card.setAttribute('aria-label', repo.name + ' repository');
    nameEl.textContent = repo.name;
    descEl.textContent = repo.description || 'No description available.';
    metaEl.innerHTML = metaItemsHTML(repo);
  }

  async function renderProjects() {
    var grid = document.getElementById('projects-grid');
    if (!grid) return;

    var names = config().projectNames || [];

    // Skeleton placeholders immediately.
    grid.innerHTML = names.map(function () { return skeletonCardHTML(); }).join('');

    var results = await github().fetchRepos(names);

    // Sort: successful repos by updated_at desc, errors last.
    var sorted = results.slice().sort(function (a, b) {
      var aDate = a.ok ? a.repo.updated_at : null;
      var bDate = b.ok ? b.repo.updated_at : null;
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

    // Rebuild cards from sorted results.
    grid.innerHTML = '';
    sorted.forEach(function (result, index) {
      var name = result.ok ? result.repo.name : result.name;
      var card = buildCard(name);
      grid.appendChild(card);
      // Stagger the load animation slightly.
      setTimeout(function () { renderIntoCard(card, result); }, index * 50);
    });
  }

  window.BP_PROJECTS = {
    renderLinks: renderLinks,
    renderProjects: renderProjects,
  };
})();
