/* ==========================================================================
   format.js — pure formatting helpers
   Exposed on `window.BP_FORMAT`.
   ========================================================================== */

(function () {
  'use strict';

  var MINUTE = 60 * 1000;
  var HOUR   = 60 * MINUTE;
  var DAY    = 24 * HOUR;
  var WEEK   = 7  * DAY;
  var MONTH  = 30 * DAY;
  var YEAR   = 365 * DAY;

  /**
   * Compact relative-time string: "today", "yesterday", "3d ago", "2w ago"…
   * Returns "" when no date is supplied.
   */
  function formatRelativeTime(dateString) {
    if (!dateString) return '';
    var diff = Date.now() - new Date(dateString).getTime();
    if (diff < DAY)        return 'today';
    if (diff < 2 * DAY)    return 'yesterday';
    if (diff < WEEK)       return Math.floor(diff / DAY)   + 'd ago';
    if (diff < MONTH)      return Math.floor(diff / WEEK)  + 'w ago';
    if (diff < YEAR)       return Math.floor(diff / MONTH) + 'mo ago';
    return Math.floor(diff / YEAR) + 'y ago';
  }

  /** Compact number: 1234 → "1.2k", 1_500_000 → "1.5M". */
  function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return (n / 1000).toFixed(1) + 'k';
    return String(n);
  }

  /** Language colour, falling back to a neutral grey. */
  function languageColor(language) {
    var colors = (window.BP_CONFIG || {}).languageColors || {};
    if (!language) return '#8b949e';
    return colors[language] || '#8b949e';
  }

  window.BP_FORMAT = {
    formatRelativeTime: formatRelativeTime,
    formatNumber: formatNumber,
    languageColor: languageColor,
  };
})();
