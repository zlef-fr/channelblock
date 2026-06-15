/* Record a live demo of ChannelBlock. Two browser sessions on one Xvfb display,
   captured continuously with ffmpeg (x11grab):
     A (no extension): landing, then a YouTube search where ONE channel fills the
        results over and over — YouTube's "Don't recommend" never makes it stick.
     B (extension):    the same search, but one click on the 🚫 button purges that
        channel everywhere; scroll proves it's gone, and its channel page is walled.
   B is launched on top of A (no window manager → newest window wins) so a title
   card covers the hand-off — no black frames. */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

const EXT = path.join(__dirname, '..', 'extension');
const OUT = '/tmp/channelblock-demo.mp4';
const W = 1366, H = 768;
const DISPLAY = process.env.DISPLAY || ':77';
const SOCS = { name: 'SOCS', value: 'CAISEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_LyaBg', domain: '.youtube.com', path: '/' };
const QUERY = 'https://www.youtube.com/results?search_query=top+10+facts';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ARGS = (extra = []) => [`--window-size=${W},${H}`, '--window-position=0,0', '--no-sandbox',
  '--disable-gpu', '--disable-infobars', '--hide-crash-restore-bubble', ...extra];

function cardHtml(title, sub, tone, badge) {
  const C = {
    brand: { a: '#bdce74', g: '#3e4618', soft: '#9dae50', glow: 'rgba(157,174,80,.22)' },
    bad: { a: '#ff7a7a', g: '#7a2230', soft: '#ffb0b0', glow: 'rgba(255,77,77,.30)' },
    good: { a: '#a6e878', g: '#2f5417', soft: '#c6e8a6', glow: 'rgba(111,154,58,.30)' },
  }[tone || 'brand'];
  const badgeHtml = badge ? `<div class=badge>${badge}</div>` : '';
  return `<!doctype html><html><head><meta charset=utf-8><style>
  html,body{margin:0;height:100vh}
  body{background:radial-gradient(62% 58% at 50% 42%, ${C.glow}, #06060a 72%);color:#e9eae2;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif}
  .badge{font:800 17px/1 system-ui;letter-spacing:.16em;text-transform:uppercase;color:#fff;
    background:${C.g};border:1.5px solid ${C.a}66;padding:10px 18px;border-radius:999px;margin-bottom:24px;
    box-shadow:0 8px 26px ${C.glow}}
  .logo{width:92px;height:92px;border-radius:22px;background:linear-gradient(135deg, ${C.g}, #0a0a0e);
    display:flex;align-items:center;justify-content:center;margin-bottom:26px;
    box-shadow:0 0 0 1px rgba(255,255,255,.06), 0 18px 54px ${C.glow};animation:pulse 2.4s ease-in-out infinite}
  @keyframes pulse{0%,100%{box-shadow:0 0 0 1px rgba(255,255,255,.06),0 14px 46px ${C.glow}}
    50%{box-shadow:0 0 0 1px rgba(255,255,255,.06),0 20px 78px ${C.glow}}}
  .logo svg{width:52px;height:52px}
  h1{font-size:50px;letter-spacing:-.025em;margin:0 0 14px;text-align:center;max-width:84%;font-weight:800;color:#fff}
  p{font-size:23px;color:${C.soft};margin:0;text-align:center;max-width:72%;line-height:1.4}</style></head>
  <body>${badgeHtml}
  <div class=logo><svg viewBox="0 0 24 24" fill=none>
  <circle cx=12 cy=12 r=9 stroke="${C.a}" stroke-width=1.8/>
  <line x1=5.6 y1=5.6 x2=18.4 y2=18.4 stroke="${C.a}" stroke-width=1.9 stroke-linecap=round/></svg></div>
  <h1>${title}</h1><p>${sub || ''}</p></body></html>`;
}
const showCard = (page, t, s, tone, badge) => page.setContent(cardHtml(t, s, tone, badge), { waitUntil: 'load' }).catch(() => {});

async function banner(page, text, color) {
  await page.evaluate(({ text, color }) => {
    let b = document.getElementById('cb-demo-banner');
    if (!b) { b = document.createElement('div'); b.id = 'cb-demo-banner'; document.documentElement.appendChild(b); }
    b.textContent = text;
    b.style.cssText = `position:fixed;z-index:2147483647;top:8px;left:50%;transform:translateX(-50%);
      background:${color || '#3e4618'};color:#fff;font:700 19px/1.2 system-ui,Segoe UI,Roboto,Arial;
      padding:13px 24px;border-radius:999px;box-shadow:0 10px 34px rgba(0,0,0,.6);pointer-events:none;
      border:1px solid rgba(255,255,255,.2);text-align:center;max-width:90vw;`;
  }, { text, color }).catch(() => {});
}
const clearOverlays = (page) => page.evaluate(() => {
  ['cb-demo-banner'].forEach((id) => { const e = document.getElementById(id); if (e) e.remove(); });
  document.querySelectorAll('.cb-demo-hl, .cb-demo-lab').forEach((e) => e.remove());
}).catch(() => {});

async function smoothScrollTo(page, to, steps = 40) {
  const from = await page.evaluate(() => window.scrollY).catch(() => 0);
  for (let i = 1; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(from + ((to - from) / steps) * i)).catch(() => {});
    await sleep(45);
  }
}

// Which channel fills the results? Count @handle occurrences across cards.
const dominantChannel = (page) => page.evaluate(() => {
  const counts = {}, names = {};
  document.querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer').forEach((n) => {
    const a = n.querySelector('ytd-channel-name a, a[href^="/@"]');
    if (!a) return;
    const m = (a.getAttribute('href') || '').match(/^\/@([^/?#]+)/);
    if (!m) return;
    const h = '@' + m[1];
    counts[h] = (counts[h] || 0) + 1;
    const nm = n.querySelector('ytd-channel-name #text, ytd-channel-name yt-formatted-string');
    if (nm && !names[h]) names[h] = (nm.textContent || '').trim();
  });
  let best = null, bc = 0;
  for (const h in counts) if (counts[h] > bc) { bc = counts[h]; best = h; }
  return best ? { handle: best, name: names[best] || best, count: bc } : null;
}).catch(() => null);

// Draw red boxes around the visible cards of one channel.
async function spotlightChannel(page, handle, label) {
  await page.evaluate(({ handle, label }) => {
    document.querySelectorAll('.cb-demo-hl, .cb-demo-lab').forEach((e) => e.remove());
    const h = handle.toLowerCase();
    const cards = [...document.querySelectorAll('ytd-video-renderer')].filter((n) => {
      const a = n.querySelector('a[href^="/@"]');
      return a && (a.getAttribute('href') || '').toLowerCase().startsWith('/' + h);
    }).filter((n) => n.offsetParent !== null);
    let firstR = null;
    cards.forEach((n) => {
      const r = n.getBoundingClientRect();
      if (r.bottom < 100 || r.top > window.innerHeight - 30) return;
      if (!firstR) firstR = r;
      const box = document.createElement('div'); box.className = 'cb-demo-hl';
      box.style.cssText = `position:fixed;z-index:2147483646;left:${Math.max(2, r.left - 6)}px;top:${r.top - 6}px;
        width:${r.width + 12}px;height:${Math.min(r.height, window.innerHeight) + 12}px;border:5px solid #ff4d4d;
        border-radius:14px;box-shadow:0 0 0 3px rgba(255,77,77,.22),0 0 30px 5px rgba(255,77,77,.65);pointer-events:none;`;
      document.documentElement.appendChild(box);
    });
    if (firstR) {
      const lab = document.createElement('div'); lab.className = 'cb-demo-lab'; lab.textContent = label;
      lab.style.cssText = `position:fixed;z-index:2147483647;left:${Math.max(8, firstR.left)}px;top:${Math.max(118, firstR.top - 44)}px;
        background:#ff4d4d;color:#fff;font:800 22px/1 system-ui;padding:10px 16px;border-radius:10px;
        box-shadow:0 10px 26px rgba(0,0,0,.55);pointer-events:none;`;
      document.documentElement.appendChild(lab);
    }
  }, { handle, label }).catch(() => {});
}

// Reveal the 🚫 button on a card of the channel, point at it, then click it.
async function blockViaButton(page, handle) {
  await page.addStyleTag({ content: '.cb-block-btn{opacity:1 !important;width:34px !important;height:34px !important;' +
    'box-shadow:0 0 0 4px rgba(189,206,116,.55),0 0 26px 6px rgba(189,206,116,.7) !important;}' }).catch(() => {});
  const y = await page.evaluate((handle) => {
    const h = handle.toLowerCase();
    const card = [...document.querySelectorAll('ytd-video-renderer')].find((n) => {
      const a = n.querySelector('a[href^="/@"]');
      return a && (a.getAttribute('href') || '').toLowerCase().startsWith('/' + h);
    });
    if (!card) return -1;
    card.setAttribute('data-cb-demo-target', '1');
    return Math.round(card.getBoundingClientRect().top + window.scrollY);
  }, handle).catch(() => -1);
  if (y < 0) return false;
  await smoothScrollTo(page, Math.max(0, y - 230), 24);
  await sleep(550);
  await page.evaluate(() => {
    const card = document.querySelector('[data-cb-demo-target]'); if (!card) return;
    const btn = card.querySelector('.cb-block-btn'); if (!btn) return;
    const r = btn.getBoundingClientRect();
    const ring = document.createElement('div'); ring.className = 'cb-demo-hl';
    ring.style.cssText = `position:fixed;z-index:2147483646;left:${r.left - 10}px;top:${r.top - 10}px;
      width:${r.width + 20}px;height:${r.height + 20}px;border:4px solid #bdce74;border-radius:12px;
      box-shadow:0 0 30px 7px rgba(189,206,116,.85);pointer-events:none;`;
    document.documentElement.appendChild(ring);
    const lab = document.createElement('div'); lab.className = 'cb-demo-lab'; lab.textContent = '👆 One click blocks the whole channel';
    lab.style.cssText = `position:fixed;z-index:2147483647;left:${r.right + 16}px;top:${Math.max(118, r.top - 4)}px;
      background:#3e4618;color:#fff;font:800 21px/1 system-ui;padding:11px 16px;border-radius:10px;
      border:1px solid rgba(189,206,116,.5);box-shadow:0 10px 26px rgba(0,0,0,.55);pointer-events:none;`;
    document.documentElement.appendChild(lab);
  }).catch(() => {});
  await sleep(2600);
  await page.evaluate(() => {
    const card = document.querySelector('[data-cb-demo-target]');
    const btn = card && card.querySelector('.cb-block-btn');
    if (btn) btn.click();
  }).catch(() => {});
  return true;
}

(async () => {
  const ff = spawn('ffmpeg', ['-y', '-f', 'x11grab', '-draw_mouse', '0', '-video_size', `${W}x${H}`,
    '-framerate', '25', '-i', DISPLAY, '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-preset', 'veryfast', '-crf', '23', '-movflags', '+faststart', OUT], { stdio: ['ignore', 'ignore', 'ignore'] });
  await sleep(900);

  // ════ Browser A — no extension ════
  const ctxA = await chromium.launchPersistentContext('/tmp/cb-rec-a', { headless: false, viewport: { width: W, height: H }, args: ARGS() });
  let a = ctxA.pages()[0] || await ctxA.newPage();
  await showCard(a, 'ChannelBlock', 'Block YouTube channels for good — a live demo', 'brand', 'Live demo'); await sleep(2400);
  await a.goto('https://channelblock.zlef.fr/', { waitUntil: 'networkidle' }).catch(() => {});
  await sleep(1400); await smoothScrollTo(a, 560, 26); await sleep(900);
  await a.evaluate(() => window.scrollTo(0, 0)); await sleep(500);

  await showCard(a, 'Without ChannelBlock', 'A normal YouTube search — one channel everywhere', 'bad', 'Before'); await sleep(2300);
  await ctxA.addCookies([SOCS]);
  await a.goto(QUERY, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await a.waitForSelector('ytd-video-renderer', { timeout: 20000 }).catch(() => {});
  await sleep(1800);
  const domA = await dominantChannel(a);
  const chName = (domA && domA.name) || 'that channel';
  await spotlightChannel(a, (domA && domA.handle) || '@mrbeast', '⛔ ' + chName + ' — again');
  await banner(a, 'The same channel fills your results, over and over', '#9c3142'); await sleep(3200);
  await clearOverlays(a);
  await smoothScrollTo(a, 1100, 34); await sleep(500);
  await spotlightChannel(a, (domA && domA.handle) || '@mrbeast', '⛔ …and again, further down');
  await banner(a, '“Don’t recommend this channel” never makes it stick', '#9c3142'); await sleep(3300);
  await clearOverlays(a);

  // hand-off title card (stays up while B launches over A → no black frame)
  await showCard(a, 'Now with ChannelBlock', 'One click — and it’s gone everywhere', 'good', 'After');

  // ════ Browser B — extension loaded (launched ON TOP of A) ════
  const ctxB = await chromium.launchPersistentContext('/tmp/cb-rec-b', {
    headless: false, viewport: { width: W, height: H },
    args: ARGS([`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`]),
  });
  await ctxB.addCookies([SOCS]);
  let b = ctxB.pages()[0] || await ctxB.newPage();
  await showCard(b, 'With ChannelBlock', 'Same search — watch one click do the work', 'good', 'After'); await sleep(2400);
  await ctxA.close(); // B is already on top showing its card → no black gap

  await b.goto(QUERY, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await b.waitForSelector('ytd-video-renderer', { timeout: 20000 }).catch(() => {});
  await sleep(2400);
  const domB = await dominantChannel(b);
  const handle = (domB && domB.handle) || (domA && domA.handle) || '@MrBeast';
  const name = (domB && domB.name) || chName;

  await banner(b, 'Hover any video from a channel you’re done with…', '#3e4618'); await sleep(1500);
  await clearOverlays(b);
  await blockViaButton(b, handle);
  await sleep(1300); // toast + filter
  await clearOverlays(b);
  // scroll into the pure results list so the verdict frame is clean
  await smoothScrollTo(b, 980, 30); await sleep(550);
  await banner(b, '✅ Every “' + name + '” video — gone from your results in one click', '#3e4618'); await sleep(3200);
  await clearOverlays(b);
  await smoothScrollTo(b, 1950, 46); await sleep(400);
  await banner(b, '✅ Scroll as far as you like — they don’t come back', '#3e4618'); await sleep(3000);
  await clearOverlays(b);

  // the blocked channel's own page is walled off by the guard overlay
  await showCard(b, 'Open their channel page', 'youtube.com/' + handle, 'good', 'After'); await sleep(2200);
  await b.goto('https://www.youtube.com/' + handle, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
  await b.waitForSelector('#cb-overlay', { timeout: 12000 }).catch(() => {});
  await sleep(1400);
  await banner(b, '✅ Even their channel page is walled off', '#3e4618'); await sleep(3400);

  await showCard(b, 'ChannelBlock', 'Free · open source · channelblock.zlef.fr', 'brand', 'Get it free'); await sleep(2600);

  await ctxB.close();
  await sleep(400);
  ff.kill('SIGINT');
  await sleep(1500);
  console.log('done; blocked handle=', handle, 'name=', name);
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
