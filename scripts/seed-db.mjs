import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
function sql(input) {
  return execFileSync('docker', ['compose', 'exec', '-T', 'db', 'psql', '-U', 'boardhere', '-d', 'boardhere', '-v', 'ON_ERROR_STOP=1', '-qAt'], {
    cwd: root, input, encoding: 'utf8', timeout: 30000,
  }).trim()
}
sql('create table if not exists public.boardhere_migrations (name text primary key, sha256 text not null);')
for (const name of (await readdir(new URL('../database/migrations/', import.meta.url))).filter(n => n.endsWith('.sql')).sort()) {
  if (!/^[a-zA-Z0-9_\.]+$/.test(name)) throw new Error('Invalid migration name')
  const contents = await readFile(new URL(`../database/migrations/${name}`, import.meta.url), 'utf8')
  const hash = createHash('sha256').update(contents.replaceAll('\r\n', '\n')).digest('hex')
  const applied = sql(`select sha256 from public.boardhere_migrations where name='${name}';`)
  if (applied && applied !== hash) throw new Error(`Applied migration changed: ${name}`)
  if (applied) continue
  const existingBaseline = name === '20261014000100_route_catalog.sql'
    && sql("select to_regclass('boardhere.stops') is not null;") === 't'
  if (!existingBaseline) sql(contents)
  sql(`insert into public.boardhere_migrations values ('${name}', '${hash}');`)
}
for (const name of (await readdir(new URL('../database/seeds/', import.meta.url))).filter(n => n.endsWith('.sql')).sort()) {
  sql(await readFile(new URL(`../database/seeds/${name}`, import.meta.url), 'utf8'))
}
console.log('Local demo schema and estimated seed data are ready.')
