import { existsSync, mkdirSync, copyFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

if (!existsSync('.qa/playwright/playwright/driver/package/index.js') && !existsSync('.qa/browser/node_modules/playwright/index.js')) {
  if (process.platform !== 'win32') throw new Error('Install playwright in .qa/browser and set BROWSER_EXECUTABLE for your system.')
  mkdirSync('.qa', {recursive:true})
  execFileSync('docker', ['run','--rm','-v',`${resolve('.qa')}:/qa`,'one-way-home-api','python','-m','pip','download',
    '--no-deps','--only-binary=:all:','--platform','win_amd64','--python-version','312','playwright==1.51.0','-d','/qa'], {stdio:'inherit'})
  copyFileSync('.qa/playwright-1.51.0-py3-none-win_amd64.whl','.qa/playwright.zip')
  execFileSync('powershell.exe', ['-NoProfile','-Command','Expand-Archive -LiteralPath .qa/playwright.zip -DestinationPath .qa/playwright -Force'], {stdio:'inherit'})
}
console.log('Browser checks are ready; they use installed Edge by default. No browser is installed by this script.')
