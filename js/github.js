/* ==========================================================================
   github.js — GitHub REST API client with sessionStorage caching
   --------------------------------------------------------------------------
   Exposes `window.BP_GITHUB.fetchRepos(projectNames)` which resolves to an
   array of result objects:
     { ok: true,  repo: {...} }
     { ok: false, name, reason: 'rate-limited' | 'not-found' | 'network' }
   All requests run concurrently. Errors never reject the outer promise so the
   UI can render partial results.
   ========================================================================== */

(function () {
  'use strict';

  var CACHE_PREFIX = 'bp_repo_';

  function config() {
    return window.BP_CONFIG || {};
  }

  /** Returns cached repo data if fresh, otherwise null. */
  function getCached(repoName) {
    try {
      var raw = sessionStorage.getItem(CACHE_PREFIX + repoName);
      if (!raw) return null;
      var entry = JSON.parse(raw);
      var ttl = (config().cacheTtlMs) || (5 * 60 * 1000);
      if (Date.now() - entry.ts > ttl) return null;
      return entry.data;
    } catch (e) {
      return null;
    }
  }

  /** Saves repo data to sessionStorage. Silently skips on failure. */
  function setCached(repoName, data) {
    try {
      sessionStorage.setItem(
        CACHE_PREFIX + repoName,
        JSON.stringify({ data: data, ts: Date.now() })
      );
    } catch (e) {
      // Storage full or blocked — skip.
    }
  }

  /** Fetches a single repo with caching + rate-limit handling. */
  async function fetchRepo(repoName) {
    var cached = getCached(repoName);
    if (cached) return { ok: true, repo: cached };

    var username = config().githubUsername || 'bottledpepsi';

    try {
      var response = await fetch(
        'https://api.github.com/repos/' + username + '/' + repoName,
        { headers: { Accept: 'application/vnd.github.v3+json' } }
      );

      if (response.status === 403 || response.status === 429) {
        return { ok: false, name: repoName, reason: 'rate-limited' };
      }
      if (response.status === 404) {
        return { ok: false, name: repoName, reason: 'not-found' };
      }
      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      var data = await response.json();
      setCached(repoName, data);
      return { ok: true, repo: data };
    } catch (e) {
      console.error('[bottledpepsi] Failed to fetch "' + repoName + '":', e);
      return { ok: false, name: repoName, reason: 'network' };
    }
  }

  /** Fetches all repos concurrently. Never rejects. */
  async function fetchRepos(projectNames) {
    return Promise.all(projectNames.map(fetchRepo));
  }

  window.BP_GITHUB = { fetchRepos: fetchRepos, fetchRepo: fetchRepo };
})();
