import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { SearchableStopCombobox, filterStops, nextActiveIndex } from '../../src/SearchableStopCombobox'
import { destinationUpdate, originUpdate } from '../../src/QueryControls'
import { buildInput, coordinateOriginUpdate, type QueryForm } from '../../src/query'
import type { Stop } from '../../src/api'

const stops:Stop[]=[
  {id:'origin',slug:'orion-city',name:'Orion City / Orugodawatta',lat:6.952,lng:79.879,kind:'origin',data_status:'estimated',source:'test'},
  {id:'borella',slug:'borella',name:'Borella transfer point',lat:6.916,lng:79.878,kind:'boarding',data_status:'estimated',source:'test'},
  {id:'maharagama',slug:'maharagama',name:'Maharagama drop-off',lat:6.848,lng:79.926,kind:'destination',data_status:'estimated',source:'test'},
]

test('stop search filters names case-insensitively and reports no results',()=>{
  assert.deepEqual(filterStops(stops,'BORELLA').map(stop=>stop.id),['borella'])
  assert.deepEqual(filterStops(stops,'drop-OFF').map(stop=>stop.id),['maharagama'])
  assert.deepEqual(filterStops(stops,'missing'),[])
  const html=renderToStaticMarkup(<SearchableStopCombobox id="test-search" label="Starting place" placeholder="Search stops" stops={[]} onSelect={()=>{}} onClear={()=>{}}/>)
  assert.ok(html.includes('role="combobox"') && html.includes('aria-controls="test-search-listbox"'))
})

test('origin and destination selection use known stop values',()=>{
  assert.deepEqual(originUpdate(stops[1]),{originStopId:'borella',lat:6.916,lng:79.878})
  assert.deepEqual(destinationUpdate(stops[2]),{destination:'maharagama'})
})

test('manual, GPS, and map coordinate updates clear a stale predefined origin',()=>{
  assert.deepEqual(coordinateOriginUpdate({lat:7.1}),{originStopId:undefined,lat:7.1})
  assert.deepEqual(coordinateOriginUpdate({lat:6.9,lng:79.9}),{originStopId:undefined,lat:6.9,lng:79.9})
})

test('keyboard index wraps and empty destination cannot be submitted',()=>{
  assert.equal(nextActiveIndex(-1,3,1),0)
  assert.equal(nextActiveIndex(0,3,-1),2)
  assert.equal(nextActiveIndex(2,3,1),0)
  assert.equal(nextActiveIndex(0,0,1),-1)
  const form:QueryForm={lat:6.952,lng:79.879,destination:'',preference:'fastest',minutes:90,overrideTime:false,time:''}
  assert.throws(()=>buildInput(form),/drop-off stop/)
})
