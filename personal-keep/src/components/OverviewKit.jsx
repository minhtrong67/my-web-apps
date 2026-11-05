import {useEffect,useRef,useState} from 'react'
import {File,FileImage} from 'lucide-react'
import {useT} from '../i18n'
import {exportNode} from '../io'
import {Cookie,ExportMenu,PageHead,useToast} from '../ui'

export const tally=arr=>Object.entries(arr.reduce((m,k)=>(m[k]=(m[k]||0)+1,m),{})).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value)
export const Card=({title,children,className=''})=><section className={`card min-w-0 overflow-hidden p-5 lg:p-6 ${className}`}><h3 className="mb-5 text-base font-medium">{title}</h3>{children}</section>
// đếm số từ 0 lên giá trị thật (chỉ với số nguyên)
function useCount(v){const to=/^\d+$/.test(String(v))?+v:null,[n,setN]=useState(0)
 useEffect(()=>{if(to===null)return;const t0=performance.now();let id;const step=t=>{const p=Math.min((t-t0)/800,1);setN(Math.round(to*(1-Math.pow(1-p,3))));p<1&&(id=requestAnimationFrame(step))};id=requestAnimationFrame(step);return()=>cancelAnimationFrame(id)},[to])
 return to===null?v:n}
const Count=({v})=>useCount(v)
export const Stat=({icon:I,label,value})=><div className="card card-hover min-w-0 p-4 lg:p-5"><Cookie className="mb-3 size-11 text-primary-container"><I className="size-5 text-on-primary-container"/></Cookie><p className="text-3xl font-semibold tabular-nums"><Count v={value}/></p><p className="text-xs text-muted-foreground">{label}</p></div>
export const None=()=>{const {t}=useT();return <p className="py-8 text-center text-sm text-muted-foreground">{t('s.nodata')}</p>}

// Khung thống kê dùng chung cho cả 3 module: luôn thống kê toàn bộ dữ liệu (không có bộ lọc), có xuất PNG / PDF.
export function StatsFrame({module,children}){
 const {t}=useT(),toast=useToast(),ref=useRef(),[busy,setBusy]=useState(false)
 const exp=fmt=>{setBusy(true);exportNode(ref.current,fmt,`personal-keep-${module}-stats-${new Date().toISOString().slice(0,10)}`).then(()=>toast(t('x.exported'))).catch(x=>toast(x.message,'error')).finally(()=>setBusy(false))}
 return <>
  <PageHead title={t('nav.stats')} sub={t('s.sub.all')}><ExportMenu busy={busy} onPick={exp} formats={[['png',t('x.fmt.png'),FileImage],['pdf',t('x.fmt.pdf'),File]]}/></PageHead>
  <div ref={ref} className="min-w-0 space-y-4 bg-background p-1 lg:space-y-5">
   <p className="px-1 text-sm font-semibold">Personal Keep · {t('mod.'+module)} · {t('s.report')}</p>
   {children()}</div></>}
