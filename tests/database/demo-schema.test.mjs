import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

test('demo schema and catalog permissions', async () => {
  execFileSync('docker', ['compose', 'exec', '-T', 'db', 'psql', '-U', 'boardhere', '-d', 'boardhere', '-v', 'ON_ERROR_STOP=1'], {
    cwd: fileURLToPath(new URL('../../', import.meta.url)),
    input: await readFile(new URL('./demo-schema.sql', import.meta.url), 'utf8'),
    encoding: 'utf8', timeout: 30000,
  })
})
