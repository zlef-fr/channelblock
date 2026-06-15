/* ChannelBlock — the filtering engine.
 * Two layers, same idea as ShortsBlock:
 *   1. CSS injected at document_start hides cards whose channel link matches a
 *      blocked @handle / channelId / legacy name — before first paint, no flash.
 *   2. A JS sweep catches what CSS can't express (display-name-only blocks,
 *      cards without a channel href) and counts hidden videos for stats. */
'use strict';
var CW = (window.CW = window.CW || {});

CW.RENDERERS = [
  'ytd-rich-item-renderer', 'ytd-video-renderer', 'ytd-grid-video-renderer',
  'ytd-compact-video-renderer', 'ytd-playlist-video-renderer', 'yt-lockup-view-model',
  'ytd-reel-item-renderer'
];
CW.SHORTS_RENDERERS = [
  'ytm-shorts-lockup-view-model', 'ytm-shorts-lockup-view-model-v2', 'ytd-reel-item-renderer'
];

function cssEsc(s) { return String(s).replace(/["\\]/g, '\\$&'); }

CW.buildCss = function () {
  if (!CW.cfg.enabled || !CW.cfg.hideBlocked) return '';
  const b = CW.cfg.blocked || {};
  const anchors = [];
  for (const k in b) {
    const e = b[k];
    if (e.handle) {
      const h = cssEsc(e.handle);
      anchors.push(`a[href="/${h}"]`, `a[href^="/${h}/"]`, `a[href^="/${h}?"]`);
    }
    if (e.channelId) {
      const c = cssEsc(e.channelId);
      anchors.push(`a[href="/channel/${c}"]`, `a[href^="/channel/${c}/"]`);
    }
    if (e.legacy) {
      const l = cssEsc(e.legacy);
      anchors.push(`a[href="/c/${l}"]`, `a[href^="/c/${l}/"]`, `a[href="/user/${l}"]`, `a[href^="/user/${l}/"]`);
    }
  }
  if (!anchors.length) return '';
  const anchSel = anchors.join(',');
  let rends = CW.RENDERERS.slice();
  if (!CW.cfg.blockShorts) rends = rends.filter((r) => r !== 'ytd-reel-item-renderer');
  return rends.map((r) => `${r}:has(:is(${anchSel}))`).join(',\n') + ' { display: none !important; }';
};

CW.styleEl = null;
CW.applyCss = function () {
  const css = CW.buildCss();
  // Polymer rebuilds <head>/<body> after document_start and drops a one-time
  // node, so re-adopt or re-create whenever ours has been detached.
  if (!CW.styleEl || !CW.styleEl.isConnected) {
    CW.styleEl = document.getElementById('channelblock-style');
    if (!CW.styleEl) { CW.styleEl = document.createElement('style'); CW.styleEl.id = 'channelblock-style'; }
    (document.head || document.documentElement).appendChild(CW.styleEl);
  }
  if (CW.styleEl.textContent !== css) CW.styleEl.textContent = css;
};

CW.sweep = function () {
  if (!CW.cfg.enabled || !CW.cfg.hideBlocked) return;
  let rends = CW.RENDERERS.slice();
  if (CW.cfg.blockShorts) rends = rends.concat(CW.SHORTS_RENDERERS);
  const sel = Array.from(new Set(rends)).join(',');
  let nodes;
  try { nodes = document.querySelectorAll(sel); } catch (_) { return; }
  let n = 0;
  for (const node of nodes) {
    if (node.__cbHidden) continue;
    if (++n > 1200) break; // safety cap on pathological pages
    const idy = CW.detectNode(node);
    if (idy && CW.isBlocked(idy)) {
      node.style.setProperty('display', 'none', 'important');
      node.setAttribute('data-cb-hidden', '1');
      node.__cbHidden = true;
      if (!node.__cbCounted) { node.__cbCounted = true; CW.bump('hidden', 1); }
    }
  }
};
