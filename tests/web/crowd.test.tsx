import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { CrowdButtons } from '../../src/CrowdButtons'
test('one-tap buttons expose all three unverified report choices',()=>{
  const html=renderToStaticMarkup(<CrowdButtons legId="bus-leg" onReport={async()=>{}}/>)
  for(const label of ['Seats free','Standing','Packed','unverified']) assert.ok(html.includes(label))
  assert.equal((html.match(/<button/g)||[]).length,3)
})
