/* ==========================================================================
   theme.js — theme toggle
   --------------------------------------------------------------------------
   WHY THE ANIMATION IS NOW RELIABLE
   The previous (React/next-themes) version passed `disableTransitionOnChange`,
   which injects a temporary <style> that kills ALL transitions for the duration
   of the theme switch — so the smooth cross-fade only appeared ~10% of the time
   (when the disable window happened to miss the paint).

   Here we do the opposite: the toggle ONLY flips the `data-theme` attribute on
   <html> and persists the choice. The actual colour animation is produced
   entirely by CSS `transition` declarations on every colour-changing element
   (see css/base.css + css/components.css). Because the elements already exist
   with their transitions defined before the attribute changes, the cross-fade
   runs every single time, on every browser.
   ========================================================================== */

(function () {
  'use strict';

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  /** Updates the aria-label to describe what clicking will do next. */
  function syncLabel() {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    var theme = currentTheme();
    toggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
    );
  }

  function setTheme(next) {
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
    syncLabel();
  }

  function init() {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    syncLabel();

    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  }

  window.BP_THEME = { init: init, setTheme: setTheme, currentTheme: currentTheme };
})();
