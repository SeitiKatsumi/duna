import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const directory = mkdtempSync(join(tmpdir(), 'duna-check-'));
process.env.DUNA_DB_PATH = join(directory, 'check.sqlite');
process.env.DUNA_MIGRATION = 'meagderme/drizzle/0000_groovy_chimera.sql';
try {
  const { env } = await import('./runtime.ts');
  await env.DB.prepare('INSERT INTO settings (key,value) VALUES (?,?)').bind('check','persisted').run();
  assert.equal((await env.DB.prepare('SELECT value FROM settings WHERE key=?').bind('check').first()).value,'persisted');
  assert.equal((await env.DB.prepare('SELECT * FROM settings').all()).results.length,1);
  assert.equal(await env.DB.prepare('SELECT * FROM settings WHERE key=?').bind('absent').first(),null);
  console.log('SQLite persistence and bound queries: OK');
} finally {
  // The connection belongs to this short-lived process; Windows releases it on exit.
  process.on('exit',()=>{try{rmSync(directory,{recursive:true,force:true});}catch{}});
}
