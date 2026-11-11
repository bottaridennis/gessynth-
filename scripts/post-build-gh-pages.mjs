import fs from 'node:fs';
import path from 'node:path';

const distBrowserDir = path.resolve('dist/app/browser');

if (!fs.existsSync(distBrowserDir)) {
  console.error(`Error: Directory ${distBrowserDir} does not exist!`);
  process.exit(1);
}

// 1. Create .nojekyll so GitHub Pages does not ignore underscore files or run Jekyll
const noJekyllPath = path.join(distBrowserDir, '.nojekyll');
fs.writeFileSync(noJekyllPath, '');
console.log('✓ Created .nojekyll');

// 2. Copy index.html to 404.html for SPA route fallback
const indexPath = path.join(distBrowserDir, 'index.html');
const notFoundPath = path.join(distBrowserDir, '404.html');

if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, notFoundPath);
  console.log('✓ Copied index.html -> 404.html for GitHub Pages routing');
}

console.log('✓ GitHub Pages post-build preparation completed successfully.');
