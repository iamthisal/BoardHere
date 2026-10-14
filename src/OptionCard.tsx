import { ArrowRight, BusFront, Check, Clock3, Footprints, Navigation, Plus, ShieldCheck, Timer, Users, Wallet } from 'lucide-react'
import type { Option, CrowdLevel } from './api'
import { EstimateBadge, estimatedArrival } from './EstimateBadge'
import { CrowdButtons } from './CrowdButtons'

export const crowdLabel = (level: string) => ({seats_free:'Seats likely',standing:'Standing',packed:'Packed',not_applicable:'Not applicable'}[level] || level)
const modeLabel=(mode:string)=>mode==='taxi'?'PickMe / tuk':mode==='bus'?'Bus':'Walk'
const ModeIcon=({mode,size=18}:{mode:string;size?:number})=>mode==='bus'?<BusFront size={size}/>:mode==='walk'?<Footprints size={size}/>:<Navigation size={size}/>

export function OptionCard({option, selected, recommended, onSelect, now,onReport,comparisonSelected=false,comparisonDisabled=false,onCompare}: {option:Option; selected:boolean; recommended:boolean; onSelect:()=>void;now?:string;onReport?:(legId:string,level:CrowdLevel)=>Promise<void>;comparisonSelected?:boolean;comparisonDisabled?:boolean;onCompare?:()=>void}) {
  const arrival=now?estimatedArrival(now,option.time_minutes):null
  return <article className={`option ${selected?'selected':''} ${recommended?'recommended':''}`} data-option-id={option.id}>
    {recommended&&<div className="recommend-ribbon"><Check size={13}/>Best match</div>}
    <button className="option-select" type="button" onClick={onSelect} aria-pressed={selected}>
      <div className="option-heading"><span className={`mode-icon ${option.legs[0].mode}`}><ModeIcon mode={option.legs[0].mode}/></span><div className="option-name"><strong>{option.title}</strong><span>{option.legs.length} {option.legs.length===1?'leg':'legs'} · {option.bucket.replaceAll('_',' ')}</span></div>{recommended&&<span className="recommend-label"><Check size={12}/>Recommended</span>}</div>
      <div className="primary-metrics"><div><Clock3 size={16}/><span><strong>{option.time_minutes.toFixed(1)} min</strong><small>{arrival?`Arrive ${arrival}`:'Estimated total'}</small></span></div><div><Wallet size={16}/><span><strong>LKR {option.cost_lkr.toFixed(0)}</strong><small>Estimated fare</small></span></div></div>
      <div className="mode-chain" aria-label="Transport modes">{option.legs.map((leg,index)=><span key={leg.id}><span className={`chain-mode ${leg.mode}`}><ModeIcon mode={leg.mode} size={13}/>{modeLabel(leg.mode)}</span>{index<option.legs.length-1&&<ArrowRight size={12}/>}</span>)}</div>
    </button>
    <dl className="journey-metrics"><div><dt><Footprints size={14}/>Walking</dt><dd>{option.walk_km.toFixed(2)} km</dd></div><div><dt><Timer size={14}/>Waiting</dt><dd>{option.wait_minutes.toFixed(1)} min</dd></div><div><dt><Users size={14}/>Crowd</dt><dd>{crowdLabel(option.crowd_level)}</dd></div><div><dt><Wallet size={14}/>You save</dt><dd>{option.savings_lkr===null?'—':`LKR ${option.savings_lkr.toFixed(0)}`}</dd></div></dl>
    <div className={`budget-note ${option.fits_available_time?'':'late'}`}>{option.fits_available_time?<ShieldCheck size={14}/>:<Timer size={14}/>}<span>{option.fits_available_time?'Fits your time budget':'Exceeds your time budget'}</span></div>
    <EstimateBadge bucket={option.bucket}/>
    {onCompare&&<button type="button" className={`compare-toggle ${comparisonSelected?'active':''}`} aria-pressed={comparisonSelected} disabled={comparisonDisabled&&!comparisonSelected} onClick={onCompare}>{comparisonSelected?<Check size={14}/>:<Plus size={14}/>} {comparisonSelected?'Selected to compare':'Add to compare'}</button>}
    {selected&&<div className="option-details"><p className="option-explanation">{option.explanation}</p><h3>Trip details</h3><ol className="journey-legs">{option.legs.map((leg,index)=><li key={leg.id}><span className={`leg-icon ${leg.mode}`}><ModeIcon mode={leg.mode} size={15}/></span><span className="leg-copy"><small>Leg {index+1}</small><strong>{leg.mode==='bus'?(leg.service_label||'Bus (estimated)'):modeLabel(leg.mode)} to {leg.to_stop.name}</strong><span>{leg.in_vehicle_minutes.toFixed(1)} min travel · {leg.wait_minutes.toFixed(1)} min wait · LKR {leg.cost_lkr.toFixed(0)}</span></span></li>)}</ol>
    <details className="score-details"><summary>Score breakdown (estimated)</summary><table><thead><tr><th>Criterion</th><th>Normalized</th><th>Weight</th><th>Contribution</th></tr></thead><tbody>{Object.entries(option.score_breakdown).map(([name,c])=><tr key={name}><th>{name}</th><td>{c.normalized.toFixed(3)}</td><td>{c.weight.toFixed(2)}</td><td>{c.contribution.toFixed(3)}</td></tr>)}</tbody></table><p>Total weighted score: {option.score.toFixed(3)} (estimated)</p></details>
    {onReport && option.legs.filter(l=>l.mode==='bus').map(l=><div key={l.id}><p className="report-leg-label">Bus to {l.to_stop.name}</p><CrowdButtons legId={l.id} onReport={onReport}/></div>)}</div>}
  </article>
}
