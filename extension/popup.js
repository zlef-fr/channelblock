/* ChannelBlock popup — toggles + blocked-channel management, i18n EN/FR. */
'use strict';
const KEY = 'channelblock';
const DEFAULTS = {
  enabled: true, hideBlocked: true, showButtons: true, blockShorts: true,
  guardPage: true, stats: true, lang: 'auto', blocked: {}
};
const TOGGLES = ['hideBlocked', 'showButtons', 'blockShorts', 'guardPage', 'stats'];

const $ = (id) => document.getElementById(id);
let cfg = Object.assign({}, DEFAULTS);
let lang = 'en';

/* ── i18n ── */
function t(key, vars) { return window.CW_I18N.t(lang, key, vars); }
function applyI18n() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.getAttribute('data-i18n-ph')); });
  document.querySelectorAll('.lang .lg').forEach((b) => b.classList.toggle('on', b.dataset.lang === lang));
}

/* ── channel-link parsing (mirror of the content script's, kept tiny) ── */
function parseInput(raw) {
  let s = (raw || '').trim();
  if (!s) return null;
  let path = s;
  if (/^https?:\/\//i.test(s) || /youtube\.com/i.test(s)) {
    try { path = new URL(s.replace(/^(?!https?:\/\/)/i, 'https://')).pathname; } catch (_) {}
  } else if (s[0] !== '/' && s[0] !== '@') {
    path = '/' + s; // bare token → treat as a path fragment
  } else {
    path = s[0] === '@' ? '/' + s : s;
  }
  let m;
  if ((m = path.match(/^\/@([^/?#]+)/))) return { handle: '@' + m[1], name: '@' + m[1] };
  if ((m = path.match(/^\/channel\/(UC[0-9A-Za-z_-]+)/))) return { channelId: m[1], name: m[1] };
  if ((m = path.match(/^\/(?:c|user)\/([^/?#]+)/))) return { legacy: m[1], name: m[1] };
  if (/^@/.test(s)) return { handle: s.toLowerCase(), name: s };
  return null;
}
function keyFor(idy) {
  if (idy.channelId) return 'id:' + idy.channelId;
  if (idy.handle) return 'h:' + idy.handle.toLowerCase();
  if (idy.legacy) return 'l:' + idy.legacy.toLowerCase();
  if (idy.name) return 'n:' + idy.name.trim().toLowerCase().replace(/^@/, '');
  return null;
}

/* ── render ── */
function renderToggles() {
  const power = $('power');
  power.classList.toggle('off', !cfg.enabled);
  $('statusText').textContent = cfg.enabled ? t('on') : t('off');
  document.querySelector('main').classList.toggle('disabled', !cfg.enabled);
  TOGGLES.forEach((k) => { $(k).checked = !!cfg[k]; });
}

function renderList() {
  const list = $('list');
  list.textContent = '';
  const entries = Object.entries(cfg.blocked || {}).sort((a, b) => (b[1].addedAt || 0) - (a[1].addedAt || 0));
  $('count').textContent = entries.length ? t('n_blocked', { n: entries.length }) : '';
  $('empty').hidden = entries.length > 0;
  for (const [key, e] of entries) {
    const row = document.createElement('div');
    row.className = 'row';
    const av = document.createElement('div');
    av.className = 'av';
    av.textContent = (e.name || e.handle || '?').replace(/^@/, '').charAt(0) || '?';
    const meta = document.createElement('div');
    meta.className = 'meta';
    const nm = document.createElement('div');
    nm.className = 'nm';
    nm.textContent = e.name || e.handle || e.channelId || 'channel';
    const hd = document.createElement('div');
    hd.className = 'hd';
    hd.textContent = e.handle || (e.channelId ? '/channel/' + e.channelId : (e.legacy ? '/c/' + e.legacy : ''));
    meta.append(nm, hd);
    const un = document.createElement('button');
    un.className = 'un';
    un.textContent = t('unblock');
    un.addEventListener('click', () => { delete cfg.blocked[key]; save(); });
    row.append(av, meta, un);
    list.appendChild(row);
  }
}

function render() { renderToggles(); renderList(); }

function save(cb) {
  chrome.storage.local.set({ [KEY]: cfg }, () => { render(); cb && cb(); });
}

/* ── events ── */
$('power').addEventListener('click', () => { cfg.enabled = !cfg.enabled; save(); });
TOGGLES.forEach((k) => { $(k).addEventListener('change', (e) => { cfg[k] = e.target.checked; save(); }); });

document.querySelectorAll('.lang .lg').forEach((b) => {
  b.addEventListener('click', () => { lang = b.dataset.lang; cfg.lang = lang; applyI18n(); save(); });
});

function doAdd() {
  const err = $('addErr');
  const idy = parseInput($('addInput').value);
  if (!idy) { err.textContent = t('add_invalid'); err.hidden = false; return; }
  err.hidden = true;
  const key = keyFor(idy);
  if (!cfg.blocked) cfg.blocked = {};
  if (!cfg.blocked[key]) {
    cfg.blocked[key] = { name: idy.name || idy.handle || idy.channelId || 'channel', handle: idy.handle || '', channelId: idy.channelId || '', legacy: idy.legacy || '', addedAt: Date.now() };
  }
  $('addInput').value = '';
  save();
}
$('addBtn').addEventListener('click', doAdd);
$('addInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') doAdd(); });

$('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ channelblock: true, exportedAt: new Date().toISOString(), blocked: cfg.blocked || {} }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'channelblock-blocklist.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$('import').addEventListener('click', () => $('importFile').click());
$('importFile').addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const data = JSON.parse(r.result);
      const incoming = data.blocked || data;
      if (incoming && typeof incoming === 'object') {
        cfg.blocked = Object.assign({}, cfg.blocked, incoming);
        save();
      }
    } catch (_) {}
    $('importFile').value = '';
  };
  r.readAsText(file);
});
$('clear').addEventListener('click', () => {
  if (!Object.keys(cfg.blocked || {}).length) return;
  if (confirm(t('clear_confirm'))) { cfg.blocked = {}; save(); }
});

$('reload').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) chrome.tabs.reload(tabs[0].id);
    window.close();
  });
});

chrome.storage.onChanged.addListener((ch, area) => {
  if (area === 'local' && ch[KEY]) { cfg = Object.assign({}, DEFAULTS, ch[KEY].newValue || {}); if (!cfg.blocked) cfg.blocked = {}; render(); }
});

/* ── init ── */
chrome.storage.local.get(KEY, (r) => {
  cfg = Object.assign({}, DEFAULTS, (r && r[KEY]) || {});
  if (!cfg.blocked) cfg.blocked = {};
  lang = window.CW_I18N.detect(cfg.lang);
  applyI18n();
  render();
});
