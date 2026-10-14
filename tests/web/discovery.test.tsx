import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Leg, Option } from '../../src/api'
import { JourneyComparison } from '../../src/JourneyComparison'
import { JourneyDiscoveryControls, JourneyFilterEmpty } from '../../src/JourneyDiscoveryControls'
import { bestIds, filterCounts, filterOptions, sortOptions, toggleComparison, transportCategory } from '../../src/journeyDiscovery'

const stop={id:'stop',slug:'destination',name:'Destination',lat:6.8,lng:79.9,kind:'destination' as const,data_status:'estimated',source:'Fixture'}
const leg=(id:string,mode:Leg['mode']):Leg=>({id,mode,from_stop_id:null,to_stop:stop,cost_lkr:0,in_vehicle_minutes:10,wait_minutes:0,walk_km:0,crowd_level:mode==='bus'?'standing':'not_applicable',crowd_source:'estimated',data_status:'estimated'})
const option=(id:string,legs:Leg[],values:Partial<Option>={}):Option=>({id,title:id,cost_lkr:100,time_minutes:30,wait_minutes:5,walk_km:.2,walk_minutes:3,crowd_level:'standing',score:.2,score_breakdown:{},bucket:'weekday_midday',data_status:'estimated',rule_code:'ride',fits_available_time:true,savings_lkr:50,explanation:'Estimated.',legs,...values})
const options=[
  option('taxi',[leg('t','taxi')],{cost_lkr:500,time_minutes:20,walk_km:0,crowd_level:'not_applicable'}),
  option('two-bus',[leg('w1','walk'),leg('b1','bus'),leg('b2','bus')],{cost_lkr:120,time_minutes:50,walk_km:.1,crowd_level:'packed'}),
  option('taxi-bus',[leg('t2','taxi'),leg('b3','bus')],{cost_lkr:300,time_minutes:35,walk_km:0,crowd_level:'seats_free'}),
  option('walk-bus',[leg('w2','walk'),leg('b4','bus')],{cost_lkr:80,time_minutes:55,walk_km:.8,crowd_level:'standing'}),
]

test('transport categories use leg modes and expose correct filter counts',()=>{
  assert.deepEqual(options.map(transportCategory),['taxi','bus','taxi-bus','walk-bus'])
  assert.deepEqual(filterCounts(options),{all:4,taxi:1,bus:1,'taxi-bus':1,'walk-bus':1})
  assert.deepEqual(filterOptions(options,'taxi-bus').map(o=>o.id),['taxi-bus'])
  assert.equal(filterOptions(options.filter(o=>o.id==='taxi'),'walk-bus').length,0)
  const html=renderToStaticMarkup(<JourneyDiscoveryControls options={options} filter="all" sort="recommended" onFilter={()=>{}} onSort={()=>{}}/> )
  for(const label of ['All journeys','Full taxi','Bus-based','Taxi + Bus','Walk + Bus','Recommended (backend order)']) assert.ok(html.includes(label))
  const empty=renderToStaticMarkup(<JourneyFilterEmpty onClear={()=>{}}/>)
  assert.ok(empty.includes('No journeys match this transport filter.')&&empty.includes('Show all journeys'))
})

test('all display sorts are deterministic and recommended preserves backend order',()=>{
  assert.deepEqual(sortOptions(options,'recommended').map(o=>o.id),options.map(o=>o.id))
  assert.equal(sortOptions(options,'cheapest')[0].id,'walk-bus')
  assert.equal(sortOptions(options,'fastest')[0].id,'taxi')
  assert.equal(sortOptions(options,'least-walking')[0].id,'taxi')
  assert.equal(sortOptions(options,'comfortable')[0].id,'taxi')
  const ties=[option('z',[leg('z','taxi')]),option('a',[leg('a','taxi')])]
  assert.deepEqual(sortOptions(ties,'cheapest').map(o=>o.id),['a','z'])
})

test('comparison selection is independent, removable, and limited to three',()=>{
  let ids:string[]=[]
  for(const id of ['a','b','c','d']) ids=toggleComparison(ids,id)
  assert.deepEqual(ids,['a','b','c'])
  assert.deepEqual(toggleComparison(ids,'b'),['a','c'])
})

test('comparison shows response values and explicit best-value labels',()=>{
  const compared=[options[0],options[3]]
  assert.deepEqual([...bestIds(compared,o=>o.cost_lkr)],['walk-bus'])
  const html=renderToStaticMarkup(<JourneyComparison options={compared} now="2026-10-14T08:00:00+05:30" onClose={()=>{}} onRemove={()=>{}}/>)
  for(const value of ['taxi','walk-bus','LKR 500','LKR 80','20.0 min','55.0 min','0.80 km','Fits budget','Best']) assert.ok(html.includes(value),value)
})
