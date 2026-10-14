import { useState } from 'react'
import { Armchair, PersonStanding, Users } from 'lucide-react'
import type { CrowdLevel } from './api'

export function CrowdButtons({legId,onReport}: {legId:string;onReport:(legId:string,level:CrowdLevel)=>Promise<void>}) {
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  async function send(level:CrowdLevel) {
    setBusy(true);setError('')
    try {await onReport(legId,level)} catch(e) {setError(e instanceof Error?e.message:'Report failed. Retry.')} finally {setBusy(false)}
  }
  return <div className="crowd-report"><span>Report crowd (unverified)</span><div className="crowd-buttons" role="group" aria-label="Report crowd">{([
    ['seats_free','Seats free',Armchair],['standing','Standing',PersonStanding],['packed','Packed',Users],
  ] as const).map(([level,label,Icon])=><button type="button" key={level} disabled={busy} onClick={()=>send(level)}><Icon size={14}/>{label}</button>)}</div>{busy && <small role="status">Saving report...</small>}{error && <small role="alert">{error}</small>}</div>
}
