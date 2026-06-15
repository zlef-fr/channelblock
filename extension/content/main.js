/* ChannelBlock — orchestration.
 * Loads config, wires storage + SPA-navigation hooks, and keeps the filter and
 * injected UI in sync as YouTube's Polymer app mutates the page. */
'use strict';
var CW = (window.CW = window.CW || {});

function resolveLang() {
  const pref = CW.cfg.lang;
  if (pref === 'en' || pref === 'fr') return pref;
  return window.CW_I18N ? window.CW_I18N.detect() : 'en';
}

// reapply(full=true) after a config/blocklist change: un-hide everything and
// drop injected buttons first, so unblocks take effect and nothing duplicates.
CW.reapply = function (full) {
  if (full) {
    document.querySelectorAll('[data-cb-hidden]').forEach(function (n) {
      n.style.removeProperty('display'); n.removeAttribute('data-cb-hidden'); n.__cbHidden = false;
    });
    document.querySelectorAll('.cb-block-btn').forEach(function (b) { b.remove(); });
    document.querySelectorAll('.cb-host').forEach(function (n) { n.__cbBtn = false; });
  }
  if (CW.cfg.enabled && CW.cfg.hideBlocked) { CW.applyCss(); CW.sweep(); }
  else if (CW.styleEl) { CW.styleEl.textContent = ''; }
};

CW.refresh = function (full) {
  CW.reapply(full);
  CW.injectButtons();
  CW.updateChannelPage();
};

CW.load = function (done) {
  try {
    chrome.storage.local.get([CW.KEY, CW.SKEY], function (r) {
      CW.cfg = Object.assign({}, CW.DEFAULTS, (r && r[CW.KEY]) || {});
      if (!CW.cfg.blocked) CW.cfg.blocked = {};
      CW.stats = Object.assign(CW.stats, (r && r[CW.SKEY]) || {});
      CW.lang = resolveLang();
      CW.buildIndex();
      done && done();
    });
  } catch (_) { done && done(); }
};

try {
  chrome.storage.onChanged.addListener(function (ch, area) {
    if (area !== 'local') return;
    if (ch[CW.KEY]) {
      const wasStats = CW.cfg.stats;
      CW.cfg = Object.assign({}, CW.DEFAULTS, ch[CW.KEY].newValue || {});
      if (!CW.cfg.blocked) CW.cfg.blocked = {};
      if (wasStats && !CW.cfg.stats) { CW.stats.channels = 0; CW.stats.hidden = 0; CW.saveStats(); }
      CW.lang = resolveLang();
      CW.buildIndex();
      CW.refresh(true);
    }
    if (ch[CW.SKEY]) {
      CW.stats = Object.assign({ channels: 0, hidden: 0, lastSent: 0, lastActivity: 0, flush: false }, ch[CW.SKEY].newValue || {});
    }
  });
} catch (_) {}

/* SPA navigation: YouTube swaps pages without a full load. */
function onRoute() {
  if (CW._showAwayPath !== location.pathname) CW._showAwayPath = null;
  setTimeout(function () { CW.refresh(false); }, 80);
  setTimeout(function () { CW.refresh(false); }, 450);
}
['pushState', 'replaceState'].forEach(function (m) {
  const orig = history[m];
  history[m] = function () { const r = orig.apply(this, arguments); onRoute(); return r; };
});
window.addEventListener('popstate', onRoute);
document.addEventListener('yt-navigate-finish', onRoute, true);

function start() {
  CW.refresh(false);
  let pending = false;
  const mo = new MutationObserver(function () {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      CW.applyCss(); CW.sweep(); CW.injectButtons();
    });
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
  // Watchdog: late-rendered channel headers, stylesheet survival, slow feeds.
  setInterval(function () { CW.refresh(false); }, 1500);
}

CW.load(function () {
  CW.applyCss(); // earliest possible, to avoid a flash of blocked cards
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
});

// Re-assert CSS the instant <head> exists (document_start can beat it).
if (!document.head) {
  new MutationObserver(function (_, obs) {
    if (document.head) { CW.applyCss(); obs.disconnect(); }
  }).observe(document.documentElement, { childList: true, subtree: true });
}
