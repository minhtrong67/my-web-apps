import {useRef,useState} from 'react'
import {File,FileImage} from 'lucide-react'
import {useT} from '../i18n'
import {exportNode} from '../io'
import {Cookie,Credit,ExportMenu,PageHead,useToast} from '../ui'

export const tally=arr=>Object.entries(arr.reduce((m,k)=>(m[k]=(m[k]||0)+1,m),{})).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value)
export const Card=({title,children,className=''})=><section className={`card min-w-0 overflow-hidden p-5 lg:p-6 ${className}`}><h3 className="mb-5 text-base font-medium">{title}</h3>{children}</section>
export const Stat=({icon:I,label,value})=><div className="card min-w-0 p-4"><Cookie className="mb-3 size-11 text-primary-container"><I className="size-5 text-on-primary-container"/></Cookie><p className="text-3xl font-semibold tabular-nums">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
export const None=()=>{const {t}=useT();return <p className="py-8 text-center text-sm text-muted-foreground">{t('s.nodata')}</p>}

// Khung thống kê dùng chung cho cả 3 module: luôn thống kê toàn bộ dữ liệu (không có bộ lọc), có xuất PNG / PDF.
export function StatsFrame({module,children}){
 const {t}=useT(),toast=useToast(),ref=useRef(),[busy,setBusy]=useState(false)
 const exp=fmt=>{setBusy(true);exportNode(ref.current,fmt,`personal-keep-${module}-stats-${new Date().toISOString().slice(0,10)}`).then(()=>toast(t('x.exported'))).catch(x=>toast(x.message,'error')).finally(()=>setBusy(false))}
 return <>
  <PageHead title={t('nav.stats')} sub={t('s.sub.all')}><ExportMenu busy={busy} onPick={exp} formats={[['png',t('x.fmt.png'),FileImage],['pdf',t('x.fmt.pdf'),File]]}/></PageHead>
  <div ref={ref} className="min-w-0 space-y-4 bg-background p-1 lg:space-y-5">
   <p className="px-1 text-sm font-semibold">Personal Keep · {t('mod.'+module)} · {t('s.report')}</p>
   {children()}
   <Credit className="px-1"/></div></>}
