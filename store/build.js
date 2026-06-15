#!/usr/bin/env node
'use strict';
/* Packages the unpacked extension into the two distributables served by public/:
     • channelblock.zip          — Chrome / Chromium (MV3, service_worker),
                                    wrapped in a channelblock/ folder for a clean
                                    "Load unpacked".
     • channelblock-firefox.xpi  — Firefox (MV3, background.scripts + gecko id),
                                    flat at the archive root, as AMO requires.
   Both ship the SAME i18n.js / content/ / popup.* / sw.js / icons — only the
   manifest differs. Run after any change under extension/:  node store/build.js */
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXT = path.join(ROOT, 'extension');
const OUT = path.join(ROOT, 'public');

const SHARED = ['i18n.js', 'content', 'sw.js', 'popup.html', 'popup.js', 'popup.css', 'icons'];

function copy(src, dst) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const e of fs.readdirSync(src)) copy(path.join(src, e), path.join(dst, e));
  } else {
    fs.copyFileSync(src, dst);
  }
}

function zip(cwd, outFile) {
  fs.rmSync(outFile, { force: true });
  execFileSync('zip', ['-rX', outFile, '.', '-x', '*.DS_Store'], { cwd, stdio: 'ignore' });
}

function buildChrome() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'channelblock-chrome-'));
  const inner = path.join(tmp, 'channelblock');
  fs.mkdirSync(inner);
  for (const f of [...SHARED, 'manifest.json']) copy(path.join(EXT, f), path.join(inner, f));
  const out = path.join(OUT, 'channelblock.zip');
  zip(tmp, out);
  fs.rmSync(tmp, { recursive: true, force: true });
  return out;
}

function buildFirefox() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'channelblock-ff-'));
  for (const f of SHARED) copy(path.join(EXT, f), path.join(tmp, f));
  copy(path.join(EXT, 'manifest.firefox.json'), path.join(tmp, 'manifest.json'));
  const out = path.join(OUT, 'channelblock-firefox.xpi');
  zip(tmp, out);
  fs.rmSync(tmp, { recursive: true, force: true });
  return out;
}

const c = buildChrome();
const f = buildFirefox();
const kb = (p) => (fs.statSync(p).size / 1024).toFixed(1) + ' KB';
console.log(`✓ Chrome   ${path.relative(ROOT, c)}  (${kb(c)})`);
console.log(`✓ Firefox  ${path.relative(ROOT, f)}  (${kb(f)})`);
