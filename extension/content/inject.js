/* ChannelBlock — UI injected into youtube.com:
 *   • a 🚫 button on every video card (shown on hover) that blocks its channel,
 *   • a floating Block / Unblock button on channel pages,
 *   • a full-page guard overlay when you land on a blocked channel,
 *   • a small toast confirming a block. */
'use strict';
var CW = (window.CW = window.CW || {});

CW.t = function (key, vars) {
  const lang = CW.lang || 'en';
  return window.CW_I18N ? window.CW_I18N.t(lang, key, vars) : key;
};

function banSvg(w) {
  w = w || 15;
  return '<svg viewBox="0 0 24 24" width="' + w + '" height="' + w + '" fill="none" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>' +
    '<line x1="5.6" y1="5.6" x2="18.4" y2="18.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
}

/* ── per-card block buttons ── */
CW.injectButtons = function () {
  if (!CW.cfg.enabled || !CW.cfg.showButtons) return;
  let rends = CW.RENDERERS.slice();
  if (CW.cfg.blockShorts) rends = rends.concat(CW.SHORTS_RENDERERS);
  const sel = Array.from(new Set(rends)).join(',');
  let nodes;
  try { nodes = document.querySelectorAll(sel); } catch (_) { return; }
  let n = 0;
  for (const node of nodes) {
    if (node.__cbBtn || node.__cbHidden) continue;
    if (++n > 1200) break;
    node.__cbBtn = true;
    const idy = CW.detectNode(node);
    if (!idy || CW.isBlocked(idy)) continue;
    node.classList.add('cb-host');
    const btn = document.createElement('button');
    btn.className = 'cb-block-btn';
    btn.type = 'button';
    btn.title = CW.t('block_channel');
    btn.setAttribute('aria-label', CW.t('block_channel'));
    btn.innerHTML = banSvg(15);
    btn.addEventListener('click', function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      const id2 = CW.detectNode(node) || idy;
      if (CW.addBlocked(id2)) CW.toast(CW.t('toast_blocked', { name: id2.name || id2.handle || 'channel' }));
      CW.refresh(true);
    }, true);
    node.appendChild(btn);
  }
};

/* ── toast ── */
CW.toast = function (msg) {
  let t = document.getElementById('cb-toast');
  if (!t) { t = document.createElement('div'); t.id = 'cb-toast'; (document.body || document.documentElement).appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(CW._toastT);
  CW._toastT = setTimeout(function () { t.classList.remove('show'); }, 2200);
};

/* ── channel-page button + guard overlay ── */
CW._showAwayPath = null;

function buildPageButton(idy, blocked) {
  let el = document.getElementById('cb-page');
  if (!el) { el = document.createElement('div'); el.id = 'cb-page'; (document.body || document.documentElement).appendChild(el); }
  const label = blocked ? CW.t('unblock_channel') : CW.t('block_channel');
  el.innerHTML = '<button type="button" class="cb-pagebtn' + (blocked ? ' on' : '') + '">' + banSvg(16) + '<span></span></button>';
  el.querySelector('span').textContent = label;
  el.querySelector('button').onclick = function () {
    if (blocked) { CW.removeBlocked(CW.keyFor(idy)); }
    else { if (CW.addBlocked(idy)) CW.toast(CW.t('toast_blocked', { name: idy.name || 'channel' })); }
    CW.refresh(true);
  };
}

function buildOverlay(idy) {
  if (document.getElementById('cb-overlay')) return;
  const ov = document.createElement('div');
  ov.id = 'cb-overlay';
  ov.innerHTML =
    '<div class="cb-ov-card">' +
      '<div class="cb-ov-ic">' + banSvg(34) + '</div>' +
      '<h2></h2><p class="cb-ov-name"></p><p class="cb-ov-desc"></p>' +
      '<div class="cb-ov-row"><button class="cb-ov-unblock"></button><button class="cb-ov-show"></button></div>' +
    '</div>';
  ov.querySelector('h2').textContent = CW.t('ov_title');
  ov.querySelector('.cb-ov-name').textContent = idy.name || '';
  ov.querySelector('.cb-ov-desc').textContent = CW.t('ov_desc');
  ov.querySelector('.cb-ov-unblock').textContent = CW.t('ov_unblock');
  ov.querySelector('.cb-ov-show').textContent = CW.t('ov_show');
  ov.querySelector('.cb-ov-unblock').onclick = function () { CW.removeBlocked(CW.keyFor(idy)); ov.remove(); CW.refresh(true); };
  ov.querySelector('.cb-ov-show').onclick = function () { CW._showAwayPath = location.pathname; ov.remove(); };
  (document.body || document.documentElement).appendChild(ov);
}

CW.updateChannelPage = function () {
  const page = document.getElementById('cb-page');
  const ov = document.getElementById('cb-overlay');
  const idy = CW.cfg.enabled ? CW.detectChannelPage() : null;
  if (!idy) { if (page) page.remove(); if (ov) ov.remove(); return; }
  const blocked = CW.isBlocked(idy);

  if (blocked && CW.cfg.guardPage && CW.cfg.hideBlocked) {
    if (page) page.remove();
    if (CW._showAwayPath === location.pathname) { if (ov) ov.remove(); return; }
    buildOverlay(idy);
    return;
  }
  if (ov) ov.remove();
  if (!CW.cfg.showButtons) { if (page) page.remove(); return; }
  buildPageButton(idy, blocked);
};
