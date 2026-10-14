import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

test('estimated demo seed totals and verification status', async () => {
  execFileSync('docker', ['compose', 'exec', '-T', 'db', 'psql', '-U', 'boardhere', '-d', 'boardhere', '-v', 'ON_ERROR_STOP=1'], {
    cwd: fileURLToPath(new URL('../../', import.meta.url)),
    input: await readFile(new URL('./seed-catalog.sql', import.meta.url), 'utf8'),
    encoding: 'utf8', timeout: 30000,
  })
})
