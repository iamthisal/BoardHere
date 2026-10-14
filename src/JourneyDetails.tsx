import { ArrowRight, BusFront, Clock3, Footprints, Navigation, ShieldCheck, Timer, Users, Wallet, X } from 'lucide-react'
import type { CrowdLevel, Option } from './api'
import { CrowdButtons } from './CrowdButtons'
import { EstimateBadge, estimatedArrival } from './EstimateBadge'
import { crowdLabel } from './OptionCard'

const modeLabel=(mode:string)=>mode==='taxi'?'PickMe / tuk':mode==='bus'?'Bus':'Walk'
const ModeIcon=({mode}:{mode:string})=>mode==='bus'?<BusFront size={15}/>:mode==='walk'?<Footprints size={15}/>:<Navigation size={15}/>

export function JourneyDetails({option,now,recommended,onClose,onReport}:{option:Option;now:string;recommended:boolean;onClose:()=>void;onReport:(legId:string,level:CrowdLevel)=>Promise<void>}) {
  return <aside className="journey-details" aria-labelledby="journey-details-title">
    <header><div><span className="eyebrow">Selected journey</span><h2 id="journey-details-title">{option.title}</h2></div><button type="button" aria-label="Close journey details" onClick={onClose}><X size={18}/></button></header>
    {recommended&&<p className="details-recommended"><ShieldCheck size={14}/>Backend recommended option</p>}
    <div className="details-primary"><div><Clock3 size={16}/><span><strong>{option.time_minutes.toFixed(1)} min</strong><small>Arrive {estimatedArrival(now,option.time_minutes)}</small></span></div><div><Wallet size={16}/><span><strong>LKR {option.cost_lkr.toFixed(0)}</strong><small>Estimated fare</small></span></div></div>
    <div className="details-modes">{option.legs.map((leg,index)=><span key={leg.id}><span><ModeIcon mode={leg.mode}/>{modeLabel(leg.mode)}</span>{index<option.legs.length-1&&<ArrowRight size={12}/>}</span>)}</div>
    <dl className="details-stats"><div><dt><Footprints size={13}/>Walking</dt><dd>{option.walk_km.toFixed(2)} km</dd></div><div><dt><Timer size={13}/>Waiting</dt><dd>{option.wait_minutes.toFixed(1)} min</dd></div><div><dt><Users size={13}/>Crowd</dt><dd>{crowdLabel(option.crowd_level)}</dd></div><div><dt>Savings</dt><dd>{option.savings_lkr===null?'—':`LKR ${option.savings_lkr.toFixed(0)}`}</dd></div></dl>
    <div className={`budget-note ${option.fits_available_time?'':'late'}`}><ShieldCheck size={14}/>{option.fits_available_time?'Fits your time budget':'Exceeds your time budget'}</div>
    <EstimateBadge bucket={option.bucket}/>
    <p className="option-explanation">{option.explanation}</p>
    <h3>Journey legs</h3><ol className="journey-legs">{option.legs.map((leg,index)=><li key={leg.id}><span className={`leg-icon ${leg.mode}`}><ModeIcon mode={leg.mode}/></span><span className="leg-copy"><small>Leg {index+1}</small><strong>{leg.mode==='bus'?(leg.service_label||'Bus (estimated)'):modeLabel(leg.mode)} to {leg.to_stop.name}</strong><span>{leg.in_vehicle_minutes.toFixed(1)} min travel · {leg.wait_minutes.toFixed(1)} min wait · LKR {leg.cost_lkr.toFixed(0)}</span></span></li>)}</ol>
    <details className="score-details"><summary>Score breakdown (estimated)</summary><table><thead><tr><th>Criterion</th><th>Normalized</th><th>Weight</th><th>Contribution</th></tr></thead><tbody>{Object.entries(option.score_breakdown).map(([name,c])=><tr key={name}><th>{name}</th><td>{c.normalized.toFixed(3)}</td><td>{c.weight.toFixed(2)}</td><td>{c.contribution.toFixed(3)}</td></tr>)}</tbody></table><p>Total weighted score: {option.score.toFixed(3)} (estimated)</p></details>
    {option.legs.filter(leg=>leg.mode==='bus').map(leg=><div key={leg.id}><p className="report-leg-label">Bus to {leg.to_stop.name}</p><CrowdButtons legId={leg.id} onReport={onReport}/></div>)}
  </aside>
}
