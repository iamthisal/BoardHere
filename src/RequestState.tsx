import { RefreshCw } from 'lucide-react'

export function RequestState({loading,error,empty,message,onRetry}: {loading:boolean;error:string;empty:boolean;message?:string|null;onRetry:()=>void}) {
  if (error) return <div className="request-state" role="alert"><p>{error}</p><button type="button" className="text-button" onClick={onRetry}><RefreshCw size={15}/>Retry connection</button></div>
  if (loading) return <div className="request-state" role="status">Finding estimated journey options...</div>
  if (empty) return <div className="request-state" role="status">{message || 'No eligible journey options. Choose a starting point closer to the demo corridor.'}</div>
  return null
}
