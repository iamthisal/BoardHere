import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { QueryControls } from '../../src/QueryControls'
import { buildInput, type QueryForm } from '../../src/query'

const form: QueryForm = {lat:6.952,lng:79.879,destination:'maharagama',preference:'fastest',minutes:90,overrideTime:true,time:'2026-10-14T08:00'}
test('controls expose all preferences, budget, and Sri Lanka time', () => {
  const html = renderToStaticMarkup(<QueryControls form={form} stops={[]} onChange={()=>{}}/> )
  for (const label of ['Starting place','Search stops by name','Bus drop-off stop','Search destinations','Cheapest','Fastest','Comfortable','Minutes available','Date and time (Sri Lanka)']) assert.ok(html.includes(label))
  assert.equal((html.match(/role="combobox"/g)||[]).length,2)
  assert.ok(html.includes('max="1440"'))
})
test('time overrides are offset-aware; invalid numeric inputs fail', () => {
  assert.equal(buildInput(form).now,'2026-10-14T08:00:00+05:30')
  assert.equal(buildInput({...form,overrideTime:false}).now,undefined)
  assert.throws(()=>buildInput({...form,lat:NaN}))
  assert.throws(()=>buildInput({...form,minutes:0}))
  assert.throws(()=>buildInput({...form,time:'2026-02-31T08:00'}))
  assert.throws(()=>buildInput({...form,time:'2026-10-14T24:30'}))
})
