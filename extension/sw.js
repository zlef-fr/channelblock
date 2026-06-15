/* ChannelBlock — background service worker.
 * Owns the anonymous, aggregate, opt-out usage flush. The content script just
 * increments two local counters (channels blocked, videos hidden) and flags a
 * flush at session boundaries; the storage write wakes this worker, which POSTs
 * one snapshot per browsing session, then resets. Also flushes on startup to
 * mop up the previous session. Stores nothing remote. See /privacy. */
'use strict';

const ENDPOINT = 'https://channelblock.zlef.fr/api/collect';
const SKEY = 'channelblock_stats';
const CKEY = 'channelblock';

const version = () => { try { return chrome.runtime.getManifest().version; } catch (_) { return '0'; } };

async function flush(force) {
  let data;
  try { data = await chrome.storage.local.get([SKEY, CKEY]); } catch (_) { return; }
  const cfg = data[CKEY] || {};
  if (cfg.stats === false) return;                                  // opted out
  const s = data[SKEY] || {};
  if ((s.channels || 0) <= 0 && (s.hidden || 0) <= 0) return;       // nothing to send
  if (!force && !s.flush) return;                                   // wait for a session boundary

  const payload = {
    v: version(),
    features: {
      enabled: cfg.enabled !== false, hideBlocked: cfg.hideBlocked !== false,
      showButtons: cfg.showButtons !== false, blockShorts: cfg.blockShorts !== false,
      guardPage: cfg.guardPage !== false
    },
    usage: { channels: s.channels || 0, hidden: s.hidden || 0 }
  };
  // Reset first so a retry/other context can't double-count this session.
  try { await chrome.storage.local.set({ [SKEY]: { channels: 0, hidden: 0, lastSent: Date.now(), lastActivity: s.lastActivity || 0, flush: false } }); } catch (_) {}
  try { await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload), keepalive: true }); } catch (_) {}
}

chrome.storage.onChanged.addListener((ch, area) => { if (area === 'local' && ch[SKEY]) flush(false); });
if (chrome.runtime.onStartup) chrome.runtime.onStartup.addListener(() => flush(true));
if (chrome.runtime.onInstalled) chrome.runtime.onInstalled.addListener(() => flush(true));
