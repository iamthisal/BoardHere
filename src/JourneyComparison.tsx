import { ArrowRight, Check, Clock3, Footprints, Scale, Timer, Users, Wallet, X } from 'lucide-react'
import type { Option } from './api'
import { crowdLabel } from './OptionCard'
import { estimatedArrival } from './EstimateBadge'
import { bestIds, crowdComfortValue } from './journeyDiscovery'

const modeName=(mode:string)=>mode==='taxi'?'Taxi':mode==='bus'?'Bus':'Walk'
const Best=()=> <span className="best-value"><Check size={11}/>Best</span>

export function JourneyComparison({options,now,onClose,onRemove}:{options:Option[];now:string;onClose:()=>void;onRemove:(id:string)=>void}) {
  const best={cost:bestIds(options,o=>o.cost_lkr),time:bestIds(options,o=>o.time_minutes),walk:bestIds(options,o=>o.walk_km),wait:bestIds(options,o=>o.wait_minutes),crowd:bestIds(options.filter(o=>o.crowd_level!=='not_applicable'),crowdComfortValue),saving:bestIds(options,o=>o.savings_lkr??-1,'max')}
  return <section className="comparison" aria-labelledby="comparison-title"><div className="comparison-heading"><div><span className="eyebrow">Side-by-side</span><h3 id="comparison-title"><Scale size={18}/>Compare journeys</h3></div><button type="button" onClick={onClose} aria-label="Close comparison"><X size={17}/></button></div>
    <p className="comparison-help">“Best” marks the strongest value in that row, not the overall recommendation.</p>
    <div className="comparison-grid">{options.map(option=><article key={option.id} className="comparison-card">
      <header><strong>{option.title}</strong><button type="button" onClick={()=>onRemove(option.id)} aria-label={`Remove ${option.title} from comparison`}><X size={14}/></button></header>
      <div className="comparison-modes" aria-label="Transport modes">{option.legs.map((leg,index)=><span key={leg.id}>{modeName(leg.mode)}{index<option.legs.length-1&&<ArrowRight size={11}/>}</span>)}</div>
      <dl>
        <div><dt><Wallet size={13}/>Fare</dt><dd>LKR {option.cost_lkr.toFixed(0)} {best.cost.has(option.id)&&<Best/>}</dd></div>
        <div><dt><Clock3 size={13}/>Total time</dt><dd>{option.time_minutes.toFixed(1)} min {best.time.has(option.id)&&<Best/>}</dd></div>
        <div><dt>Arrival</dt><dd>{estimatedArrival(now,option.time_minutes)}</dd></div>
        <div><dt><Footprints size={13}/>Walking</dt><dd>{option.walk_km.toFixed(2)} km {best.walk.has(option.id)&&<Best/>}</dd></div>
        <div><dt><Timer size={13}/>Waiting</dt><dd>{option.wait_minutes.toFixed(1)} min {best.wait.has(option.id)&&<Best/>}</dd></div>
        <div><dt><Users size={13}/>Crowd</dt><dd>{crowdLabel(option.crowd_level)} {best.crowd.has(option.id)&&<Best/>}</dd></div>
        <div><dt>Deadline</dt><dd>{option.fits_available_time?'Fits budget':'Exceeds budget'}</dd></div>
        <div><dt>Savings</dt><dd>{option.savings_lkr===null?'—':`LKR ${option.savings_lkr.toFixed(0)}`} {option.savings_lkr!==null&&best.saving.has(option.id)&&<Best/>}</dd></div>
      </dl>
    </article>)}</div>
  </section>
}
