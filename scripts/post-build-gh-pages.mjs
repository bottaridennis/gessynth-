import fs from 'node:fs';
import path from 'node:path';

const distBrowserDir = path.resolve('dist/app/browser');

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

if (!fs.existsSync(distBrowserDir)) {
  fail(`Directory ${distBrowserDir} does not exist! Did "ng build" run?`);
}

// 1. The prerendered entry point must exist (outputMode "server" + Prerender route "**")
const indexPath = path.join(distBrowserDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  fail('index.html not found in the browser output. Check the prerender configuration.');
}

// 2. Relative base href so the site works under https://<user>.github.io/<repo>/
const indexHtml = fs.readFileSync(indexPath, 'utf8');
if (!indexHtml.includes('<base href="./">')) {
  fail('index.html does not use <base href="./">. Build with --base-href ./');
}

// 3. MediaPipe WASM runtime must be shipped next to the app (see angular.json assets)
const wasmDir = path.join(distBrowserDir, 'mediapipe', 'wasm');
const wasmFiles = fs.existsSync(wasmDir) ? fs.readdirSync(wasmDir) : [];
if (!wasmFiles.some((f) => f.endsWith('.wasm'))) {
  fail(`MediaPipe WASM files missing in ${wasmDir}.`);
}
console.log(`✓ MediaPipe WASM runtime present (${wasmFiles.length} files)`);

// 4. Create .nojekyll so GitHub Pages does not ignore underscore files or run Jekyll
fs.writeFileSync(path.join(distBrowserDir, '.nojekyll'), '');
console.log('✓ Created .nojekyll');

// 5. Copy index.html to 404.html for SPA route fallback
fs.copyFileSync(indexPath, path.join(distBrowserDir, '404.html'));
console.log('✓ Copied index.html -> 404.html for GitHub Pages routing');

console.log('✓ GitHub Pages post-build preparation completed successfully.');
