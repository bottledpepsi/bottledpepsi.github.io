/* ==========================================================================
   main.js — bootstrap
   --------------------------------------------------------------------------
   Runs on DOMContentLoaded. Calls each module's init/render entry point.
   All scripts are loaded with `defer`, so by the time this runs the modules
   (config, format, github, projects, theme) are all defined.
   ========================================================================== */

(function () {
  'use strict';

  function initCopyrightYear() {
    var el = document.getElementById('copyright-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  function boot() {
    // Links render synchronously (no network) so they appear immediately.
    if (window.BP_PROJECTS) window.BP_PROJECTS.renderLinks();
    // Projects fetch from the GitHub API (async; shows skeletons first).
    if (window.BP_PROJECTS) window.BP_PROJECTS.renderProjects();
    if (window.BP_THEME)    window.BP_THEME.init();
    // Keep the favicon in sync with the GitHub profile picture.
    if (window.BP_FAVICON)  window.BP_FAVICON.refresh();
    initCopyrightYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
