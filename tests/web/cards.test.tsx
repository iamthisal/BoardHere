import assert from 'node:assert/strict'
import test from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { OptionCard } from '../../src/OptionCard'
import type { Option } from '../../src/api'

export const option: Option = {id:'test',title:'Demo estimated option',cost_lkr:480,time_minutes:67.6,wait_minutes:18,walk_km:.2,walk_minutes:3,crowd_level:'packed',score:.15,score_breakdown:{cost:{raw:480,normalized:.5,weight:.6,contribution:.3}},bucket:'weekday_morning_peak',data_status:'estimated',rule_code:'ride',fits_available_time:true,savings_lkr:520,explanation:'Estimated saving: LKR 520.',legs:[{id:'leg',mode:'bus',from_stop_id:null,to_stop:{id:'stop',slug:'drop',name:'Drop-off',lat:6.8,lng:79.9,kind:'destination',data_status:'estimated',source:'Fixture'},cost_lkr:80,in_vehicle_minutes:32,wait_minutes:12,walk_km:0,crowd_level:'packed',crowd_source:'estimated (rule-based)',data_status:'estimated'}]}
test('ranked card shows computed metrics, explanation, legs and score breakdown',()=>{
  const html=renderToStaticMarkup(<OptionCard option={option} selected recommended onSelect={()=>{}}/>)
  for(const text of ['LKR 480','67.6 min','18.0 min','0.20 km','Packed','LKR 520','Recommended','Score breakdown']) assert.ok(html.includes(text),text)
  assert.ok(html.includes('data-option-id="test"'))
  assert.ok(html.includes('estimated'))
})
