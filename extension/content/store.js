/* ChannelBlock — storage + blocklist model (content-script world).
 * One blocklist, keyed by the strongest identifier we have for a channel
 * (channelId > @handle > legacy /c|/user name > display name). A fast lookup
 * index is rebuilt whenever the list changes so filtering stays O(1) per card. */
'use strict';
var CW = (window.CW = window.CW || {});

CW.KEY = 'channelblock';
CW.SKEY = 'channelblock_stats';

CW.DEFAULTS = {
  enabled: true,      // master switch
  hideBlocked: true,  // remove blocked channels' videos
  showButtons: true,  // inject the 🚫 block buttons
  blockShorts: true,  // also hide blocked channels' Shorts
  guardPage: true,    // cover a blocked channel's own page
  stats: true,        // anonymous, aggregate, opt-out usage counts
  lang: 'auto',       // 'auto' | 'en' | 'fr'
  blocked: {}         // key -> { name, handle, channelId, legacy, addedAt }
};

CW.cfg = Object.assign({}, CW.DEFAULTS);
CW.index = { ids: new Set(), handles: new Set(), legacies: new Set(), names: new Set() };

CW.norm = function (s) {
  return (s || '').trim().toLowerCase().replace(/^@/, '').replace(/\s+/g, ' ');
};

CW.keyFor = function (idy) {
  if (!idy) return null;
  if (idy.channelId) return 'id:' + idy.channelId;
  if (idy.handle) return 'h:' + idy.handle.toLowerCase();
  if (idy.legacy) return 'l:' + idy.legacy.toLowerCase();
  if (idy.name) return 'n:' + CW.norm(idy.name);
  return null;
};

CW.buildIndex = function () {
  const idx = { ids: new Set(), handles: new Set(), legacies: new Set(), names: new Set() };
  const b = CW.cfg.blocked || {};
  for (const k in b) {
    const e = b[k] || {};
    if (e.channelId) idx.ids.add(e.channelId);
    if (e.handle) idx.handles.add(e.handle.toLowerCase());
    if (e.legacy) idx.legacies.add(e.legacy.toLowerCase());
    // Display-name matching is fuzzy and risks over-blocking same-named channels,
    // so only fall back to it for entries that carry NO stronger identifier.
    if (!e.channelId && !e.handle && !e.legacy && e.name) {
      const n = CW.norm(e.name);
      if (n) idx.names.add(n);
    }
  }
  CW.index = idx;
};

CW.isBlocked = function (idy) {
  if (!idy) return false;
  const idx = CW.index;
  if (idy.channelId && idx.ids.has(idy.channelId)) return true;
  if (idy.handle && idx.handles.has(idy.handle.toLowerCase())) return true;
  if (idy.legacy && idx.legacies.has(idy.legacy.toLowerCase())) return true;
  if (idy.name) { const n = CW.norm(idy.name); if (n && idx.names.has(n)) return true; }
  return false;
};

CW.save = function (cb) {
  try { chrome.storage.local.set({ [CW.KEY]: CW.cfg }, cb || function () {}); }
  catch (_) { cb && cb(); }
};

CW.addBlocked = function (idy) {
  const key = CW.keyFor(idy);
  if (!key) return false;
  if (!CW.cfg.blocked) CW.cfg.blocked = {};
  if (CW.cfg.blocked[key]) return false; // already blocked
  CW.cfg.blocked[key] = {
    name: (idy.name || '').trim() || idy.handle || idy.channelId || 'channel',
    handle: idy.handle || '',
    channelId: idy.channelId || '',
    legacy: idy.legacy || '',
    addedAt: Date.now()
  };
  CW.buildIndex();
  CW.save();
  CW.bump('channels', 1);
  return true;
};

CW.removeBlocked = function (key) {
  if (CW.cfg.blocked && CW.cfg.blocked[key]) {
    delete CW.cfg.blocked[key];
    CW.buildIndex();
    CW.save();
    return true;
  }
  return false;
};

/* ── anonymous, aggregate, opt-out usage stats ──
   Two local counters only: channels blocked, videos hidden. A storage write
   wakes sw.js, which POSTs one snapshot per browsing session. No identifier,
   no IP, no URLs, no browsing data. `stats:false` stops it entirely. */
CW.stats = { channels: 0, hidden: 0, lastSent: 0, lastActivity: 0, flush: false };
const SESSION_GAP = 30 * 60 * 1000; // 30 min idle ⇒ a new session began
CW.saveStats = function () { try { chrome.storage.local.set({ [CW.SKEY]: CW.stats }); } catch (_) {} };
CW.bump = function (k, n) {
  if (!CW.cfg.stats) return;
  n = n || 1;
  const now = Date.now();
  if (CW.stats.lastActivity && now - CW.stats.lastActivity > SESSION_GAP &&
      ((CW.stats.channels || 0) > 0 || (CW.stats.hidden || 0) > 0)) {
    CW.stats.flush = true;
  }
  CW.stats[k] = (CW.stats[k] || 0) + n;
  CW.stats.lastActivity = now;
  CW.saveStats();
};
