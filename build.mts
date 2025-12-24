import * as esbuild from 'esbuild';
import * as fs from 'node:fs';
import * as path from 'node:path';

const distDir = 'dist';

// Clean dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir);

// Build the main script
await esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: path.join(distDir, 'main.js'),
  format: 'esm',
  platform: 'node',
  target: 'node24',
  banner: {
    js: '#!/usr/bin/env node',
  },
  alias: {
    '@src': './src',
  },
  packages: 'external',
});

// Copy package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

// Remove dev dependencies and scripts from published package.json
// Keep dependencies since we're using packages: "external"
delete packageJson.devDependencies;
delete packageJson.scripts;

fs.writeFileSync(
  path.join(distDir, 'package.json'),
  JSON.stringify(packageJson, null, 2),
);

// Copy LICENSE and README if they exist
if (fs.existsSync('LICENSE')) {
  fs.copyFileSync('LICENSE', path.join(distDir, 'LICENSE'));
}

if (fs.existsSync('README.md')) {
  fs.copyFileSync('README.md', path.join(distDir, 'README.md'));
}

console.log('Build complete!');
