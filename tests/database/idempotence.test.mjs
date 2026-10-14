import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
test('seed script can be run repeatedly without duplicating demo data', () => {
  const cwd = fileURLToPath(new URL('../../', import.meta.url))
  const run = () => execFileSync(process.execPath, ['scripts/seed-db.mjs'], { cwd, encoding: 'utf8', timeout: 60000 })
  const snapshot = () => execFileSync('docker', ['compose', 'exec', '-T', 'db', 'psql', '-U', 'boardhere', '-d', 'boardhere', '-qAt', '-c',
    'select (select count(*) from boardhere.stops),(select count(*) from boardhere.journey_options),(select count(*) from boardhere.journey_legs),(select count(*) from boardhere.route_time_profile)'], {cwd,encoding:'utf8'})
  run(); const first = snapshot(); run(); assert.equal(snapshot(), first)
})
