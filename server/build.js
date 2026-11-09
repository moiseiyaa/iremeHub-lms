'use strict';
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const dist = path.join(root, 'dist');

try {
  // Never package .env, credentials, runtime configuration or arbitrary source files.
  execFileSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['tsc', '--project', 'tsconfig.json'], {
    cwd: root,
    stdio: 'inherit'
  });

  fs.mkdirSync(dist, { recursive: true });
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  fs.writeFileSync(path.join(dist, 'package.json'),
    JSON.stringify({ ...packageJson, main: 'server.js' }, null, 2));

  const publicDir = path.join(root, 'public');
  if (fs.existsSync(publicDir)) {
    fs.cpSync(publicDir, path.join(dist, 'public'), { recursive: true });
  }

  // Fail closed if old artifacts contain sensitive configuration.
  for (const item of fs.readdirSync(dist)) {
    if (item === '.env' || item.startsWith('.env.')) {
      fs.rmSync(path.join(dist, item), { force: true, recursive: true });
    }
  }

  console.log('Server build complete (runtime secrets excluded).');
} catch (err) {
  console.error('Server build failed:', err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
}
