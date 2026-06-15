/* Render ChannelBlock icons (16/48/128) from an inline SVG via Playwright:
   a brick wall (the "wall" of blocked channels) under a ban/slash mark. */
const { chromium } = require('playwright');

const svg = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 128 128">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#3e4618"/><stop offset="1" stop-color="#2c3212"/></linearGradient>
    <clipPath id="r"><rect width="128" height="128" rx="28"/></clipPath></defs>
  <rect width="128" height="128" rx="28" fill="url(#g)"/>
  <g clip-path="url(#r)" stroke="#bdce74" stroke-width="6" opacity="0.55" stroke-linecap="round">
    <line x1="20" y1="44" x2="108" y2="44"/>
    <line x1="20" y1="64" x2="108" y2="64"/>
    <line x1="20" y1="84" x2="108" y2="84"/>
    <line x1="44" y1="34" x2="44" y2="54"/>
    <line x1="84" y1="34" x2="84" y2="54"/>
    <line x1="64" y1="54" x2="64" y2="74"/>
    <line x1="44" y1="74" x2="44" y2="94"/>
    <line x1="84" y1="74" x2="84" y2="94"/>
  </g>
  <circle cx="64" cy="64" r="32" fill="none" stroke="#eef0e2" stroke-width="10"/>
  <line x1="42" y1="42" x2="86" y2="86" stroke="#eef0e2" stroke-width="10" stroke-linecap="round"/>
</svg>`;

(async () => {
  const b = await chromium.launch();
  for (const s of [16, 48, 128]) {
    const p = await b.newPage({ viewport: { width: s, height: s }, deviceScaleFactor: 1 });
    await p.setContent('<style>html,body{margin:0;padding:0;background:transparent}</style>' + svg(s));
    await p.waitForTimeout(120);
    const el = await p.$('svg');
    await el.screenshot({ path: __dirname + '/../extension/icons/icon' + s + '.png', omitBackground: true });
    await p.close();
  }
  await b.close();
  console.log('icons done');
})();
