/* ChannelBlock — channel identity extraction.
 * Pulls a { handle | channelId | legacy, name } from a video card or from the
 * current channel page, matched on stable /@handle · /channel/UC… · /c|/user
 * endpoints rather than fragile localized labels. */
'use strict';
var CW = (window.CW = window.CW || {});

CW.parsePath = function (href) {
  if (!href) return null;
  let path = href;
  try { path = new URL(href, location.origin).pathname; } catch (_) {}
  let m;
  if ((m = path.match(/^\/@([^/?#]+)/))) return { handle: '@' + m[1] };
  if ((m = path.match(/^\/channel\/(UC[0-9A-Za-z_-]+)/))) return { channelId: m[1] };
  if ((m = path.match(/^\/(?:c|user)\/([^/?#]+)/))) return { legacy: m[1] };
  return null;
};

// Anchors that, inside a video card, point at the uploading channel.
CW.CH_ANCHOR = [
  'ytd-channel-name a', '#channel-name a', 'a#avatar-link',
  '.yt-content-metadata-view-model-wiz a[href^="/@"]',
  '.yt-content-metadata-view-model-wiz a[href^="/channel/"]',
  'a.yt-simple-endpoint[href^="/@"]', 'a.yt-simple-endpoint[href^="/channel/"]',
  'a[href^="/@"]', 'a[href^="/channel/"]', 'a[href^="/c/"]', 'a[href^="/user/"]'
].join(',');

CW.detectNode = function (node) {
  if (!node) return null;
  let idy = null;
  let anchors;
  try { anchors = node.querySelectorAll(CW.CH_ANCHOR); } catch (_) { anchors = []; }
  for (const a of anchors) {
    const p = CW.parsePath(a.getAttribute('href') || a.href);
    if (p) { idy = p; break; }
  }
  let name = '';
  const nameEl = node.querySelector(
    'ytd-channel-name #text, ytd-channel-name yt-formatted-string, ' +
    '#channel-name #text, #channel-name yt-formatted-string, ' +
    '.yt-content-metadata-view-model-wiz a'
  );
  if (nameEl) name = (nameEl.textContent || '').trim();
  if (!name && idy && idy.handle) name = idy.handle;
  if (idy || name) return Object.assign({ name: name }, idy || {});
  return null;
};

// Is the current URL a channel page, and who is it?
CW.detectChannelPage = function () {
  const p = CW.parsePath(location.pathname);
  if (!p) return null;
  const idy = Object.assign({}, p);
  // Enrich with the canonical channelId when YouTube exposes it.
  try {
    const can = document.querySelector('link[rel="canonical"]');
    if (can) { const cp = CW.parsePath(can.getAttribute('href')); if (cp && cp.channelId) idy.channelId = cp.channelId; }
  } catch (_) {}
  let name = '';
  const h = document.querySelector(
    'yt-page-header-view-model h1, .dynamic-text-view-model-wiz h1, ' +
    'ytd-channel-name#channel-name #text, #channel-header #text, #channel-name #text'
  );
  if (h) name = (h.textContent || '').trim();
  if (!name) { const og = document.querySelector('meta[property="og:title"]'); if (og) name = (og.getAttribute('content') || '').trim(); }
  if (name) idy.name = name;
  return idy;
};
