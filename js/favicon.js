/* ==========================================================================
   favicon.js — keeps the favicon in sync with the GitHub profile picture
   --------------------------------------------------------------------------
   How it works:
     1. index.html already sets a static fallback href (the known avatar URL),
        so there is a correct favicon on first paint with zero JS.
     2. On load we apply a cached avatar_url from localStorage (instant).
     3. We then fetch the live GitHub user API (/users/<name>) and update the
        favicon to the returned avatar_url, caching it for 24h. This means the
        favicon always tracks the current GitHub profile picture — even if the
        avatar image itself changes on GitHub.

   The API call is best-effort: any failure (offline, rate-limited) leaves the
   existing favicon untouched, so the site never breaks.
   ========================================================================== */

(function () {
  'use strict';

  var CACHE_KEY = 'bp_avatar_url';
  var CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  /** Sets the href on the favicon + apple-touch-icon link elements. */
  function setFavicon(url) {
    if (!url) return;
    var fav = document.getElementById('favicon');
    if (fav) fav.href = url;
    var touch = document.getElementById('apple-touch-icon');
    if (touch) touch.href = url;
  }

  function getCached() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var entry = JSON.parse(raw);
      if (Date.now() - entry.ts > CACHE_TTL) return null;
      return entry.url;
    } catch (e) {
      return null;
    }
  }

  function setCached(url) {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ url: url, ts: Date.now() })
      );
    } catch (e) {
      // Private mode / storage full — skip.
    }
  }

  /** Applies the cached avatar, then refreshes from the GitHub API. */
  async function refresh() {
    // 1. Apply cached avatar immediately (no network).
    var cached = getCached();
    if (cached) setFavicon(cached);

    // 2. Fetch the live avatar_url from the GitHub user API.
    var username = (window.BP_CONFIG || {}).githubUsername || 'bottledpepsi';
    try {
      var res = await fetch('https://api.github.com/users/' + username);
      if (!res.ok) return; // rate-limited / not found — leave existing favicon.
      var data = await res.json();
      if (data.avatar_url) {
        setFavicon(data.avatar_url);
        setCached(data.avatar_url);
      }
    } catch (e) {
      // Network error — leave existing favicon.
    }
  }

  window.BP_FAVICON = { refresh: refresh };
})();
