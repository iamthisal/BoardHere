import { mkdir, readdir } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { buildSync } from 'esbuild'

await mkdir('.qa/web', {recursive:true})
const files = (await readdir('tests/web')).filter(f=>f.endsWith('.test.tsx'))
const outputs = files.map(file => {
  const output = `.qa/web/${file.replace('.tsx','.cjs')}`
  buildSync({entryPoints:[`tests/web/${file}`],outfile:output,bundle:true,platform:'node',format:'cjs',jsx:'automatic',logLevel:'silent'})
  return output
})
execFileSync(process.execPath, ['--test',...outputs], {stdio:'inherit'})
