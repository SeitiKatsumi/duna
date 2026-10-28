const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const site = process.argv[2];
if (!['meagderme', 'hipro'].includes(site)) throw Error('Expected meagderme or hipro');
const root = path.resolve(__dirname, '..');
const output = path.join(root, '.deploy-artifacts', site);
fs.mkdirSync(path.join(output, site), {recursive:true});
fs.mkdirSync(path.join(output, 'deploy'), {recursive:true});
for (const name of fs.readdirSync(path.join(root, site))) {
  if (['node_modules', '.next', 'dist', '.wrangler', '.sites-runtime', 'data'].includes(name) || name.startsWith('.env') && name !== '.env.example') continue;
  fs.cpSync(path.join(root, site, name), path.join(output, site, name), {recursive:true});
}
fs.copyFileSync(path.join(root, 'deploy/runtime.ts'), path.join(output, 'deploy/runtime.ts'));
const lines = fs.readFileSync(path.join(root, 'Dockerfile.lp'), 'utf8').replace('ARG SITE\n', `ARG SITE=${site}\n`).split(/\r?\n/);
fs.writeFileSync(path.join(output, 'captain-definition'), JSON.stringify({schemaVersion:2,dockerfileLines:lines}));
execFileSync('tar', ['-czf',path.join(root,'.deploy-artifacts',`${site}.tar.gz`),'-C',output,'captain-definition','deploy',site]);
console.log(`Packaged ${site}`);
