import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

let connection: DatabaseSync | undefined;
function database() {
  if (!connection) {
    const filename = process.env.DUNA_DB_PATH || join(process.cwd(), 'data', 'leads.sqlite');
    mkdirSync(dirname(filename), { recursive: true });
    connection = new DatabaseSync(filename);
    connection.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
    if (!connection.prepare("SELECT name FROM sqlite_master WHERE name='leads'").get()) {
      const migration = process.env.DUNA_MIGRATION!;
      connection.exec(readFileSync(join(process.cwd(), migration), 'utf8'));
    }
  }
  return connection;
}

// ponytail: retain the small D1 query API used by both LPs; SQLite stays on a persistent volume.
const DB = {
  prepare(sql: string) {
    let values: (string | number | null)[] = [];
    return {
      bind(...params: (string | number | null)[]) { values = params; return this; },
      async first<T>() { return (database().prepare(sql).get(...values) ?? null) as T | null; },
      async all() { return { results: database().prepare(sql).all(...values), success: true }; },
      async run() { const result = database().prepare(sql).run(...values); return { success: true, meta: { changes: Number(result.changes) } }; },
    };
  },
};

export const env = { ...process.env, DB } as unknown as Cloudflare.Env;
