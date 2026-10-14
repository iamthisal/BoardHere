import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const sql = await readFile(new URL('./route-catalog.sql', import.meta.url), 'utf8')

test('PostgreSQL route catalog constraints and access rules', () => {
  execFileSync('docker', [
    'compose', 'exec', '-T', 'db', 'psql',
    '--username=boardhere', '--dbname=boardhere', '--no-psqlrc', '--set=ON_ERROR_STOP=1',
  ], {
    cwd: fileURLToPath(new URL('../../', import.meta.url)),
    input: sql,
    encoding: 'utf8',
    timeout: 30000,
  })
})
