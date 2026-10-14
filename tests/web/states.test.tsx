import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { RequestState } from '../../src/RequestState'

test('loading, backend failure, empty and success states are distinct',()=>{
  const render=(loading:boolean,error:string,empty:boolean)=>renderToStaticMarkup(<RequestState loading={loading} error={error} empty={empty} onRetry={()=>{}}/>)
  assert.ok(render(true,'',false).includes('role="status"'))
  assert.ok(render(false,'Database unavailable',true).includes('Retry connection'))
  assert.ok(render(false,'',true).includes('No eligible journey'))
  assert.equal(render(false,'',false),'')
})
