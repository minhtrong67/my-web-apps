import {useRef,useState} from 'react'
import {ChevronLeft,ChevronRight,File,FileImage} from 'lucide-react'
import {useT,locale} from '../i18n'
import {useSession} from '../hooks'
import {exportNode} from '../io'
import {Btn,Cookie,Credit,ExportMenu,PageHead,Segmented,useToast} from '../ui'

export function range(p,off){
 const n=new Date();let s,e
 if(p==='day'){s=new Date(n.getFullYear(),n.getMonth(),n.getDate()+off);e=new Date(s);e.setDate(e.getDate()+1)}
 else if(p==='week'){const d=(n.getDay()+6)%7;s=new Date(n.getFullYear(),n.getMonth(),n.getDate()-d+off*7);e=new Date(s);e.setDate(e.getDate()+7)}
 else if(p==='month'){s=new Date(n.getFullYear(),n.getMonth()+off,1);e=new Date(s.getFullYear(),s.getMonth()+1,1)}
 else{s=new Date(n.getFullYear()+off,0,1);e=new Date(s.getFullYear()+1,0,1)}
 return [s,e]}
export const tally=arr=>Object.entries(arr.reduce((m,k)=>(m[k]=(m[k]||0)+1,m),{})).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value)
export const Card=({title,children,className=''})=><section className={`card min-w-0 overflow-hidden p-5 ${className}`}><h3 className="mb-4 text-base font-medium">{title}</h3>{children}</section>
export const Stat=({icon:I,label,value})=><div className="card min-w-0 p-4"><Cookie className="mb-3 size-11 text-primary-container"><I className="size-5 text-on-primary-container"/></Cookie><p className="text-3xl font-semibold tabular-nums">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
export const None=()=>{const {t}=useT();return <p className="py-8 text-center text-sm text-muted-foreground">{t('s.nodata')}</p>}

// Khung thống kê dùng chung cho cả 3 module: chọn khoảng thời gian, xuất PNG / PDF, tiêu đề báo cáo.
// children nhận ({inRange,label}) để lọc dữ liệu theo khoảng thời gian đang chọn.
export function StatsFrame({module,session,children}){
 const {t,lang}=useT(),toast=useToast(),loc=locale(lang),[f,setF]=useSession(session,{p:'all',off:0}),ref=useRef(),[busy,setBusy]=useState(false)
 const [s,e]=f.p==='all'?[null,null]:range(f.p,f.off)
 const inRange=x=>{if(!s)return true;const d=x.createdAt?.toDate?.()||new Date();return d>=s&&d<e}
 const label=!s?t('p.all'):f.p==='day'?s.toLocaleDateString(loc,{dateStyle:'long'}):f.p==='week'?`${s.toLocaleDateString(loc,{day:'numeric',month:'short'})} – ${new Date(e-864e5).toLocaleDateString(loc,{day:'numeric',month:'short',year:'numeric'})}`:f.p==='month'?s.toLocaleDateString(loc,{month:'long',year:'numeric'}):String(s.getFullYear())
 const exp=fmt=>{setBusy(true);exportNode(ref.current,fmt,`personal-keep-${module}-stats-${new Date().toISOString().slice(0,10)}`).then(()=>toast(t('x.exported'))).catch(x=>toast(x.message,'error')).finally(()=>setBusy(false))}
 const move=d=>setF({...f,off:f.off+d})
 return <>
  <PageHead title={t('nav.stats')} sub={t('s.sub')}><ExportMenu busy={busy} onPick={exp} formats={[['png',t('x.fmt.png'),FileImage],['pdf',t('x.fmt.pdf'),File]]}/></PageHead>
  <div className="mb-5 flex flex-wrap items-center gap-3">
   <div className="max-w-full overflow-x-auto"><Segmented label="period" value={f.p} onChange={p=>setF({p,off:0})} options={[['all',t('p.all')],['day',t('p.day')],['week',t('p.week')],['month',t('p.month')],['year',t('p.year')]]}/></div>
   {s&&<div className="flex items-center gap-1"><Btn variant="outline" className="btn-sm !px-2" aria-label={t('p.prev')} title={t('p.prev')} onClick={()=>move(-1)}><ChevronLeft className="size-4"/></Btn>
    <span className="min-w-32 px-2 text-center text-sm font-medium">{label}</span>
    <Btn variant="outline" className="btn-sm !px-2" aria-label={t('p.next')} title={t('p.next')} onClick={()=>move(1)}><ChevronRight className="size-4"/></Btn></div>}</div>
  <div ref={ref} className="min-w-0 space-y-4 bg-background p-1">
   <div className="flex flex-wrap items-baseline justify-between gap-2 px-1"><p className="text-sm font-semibold">Personal Keep · {t('mod.'+module)} · {t('s.report')}</p><p className="text-xs text-muted-foreground">{label}</p></div>
   {children({inRange,label})}
   <Credit className="px-1"/></div></>}
