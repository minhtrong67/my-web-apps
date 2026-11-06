import {Activity,CheckCircle2,FolderKanban,Gauge,UserX,Users} from 'lucide-react'
import {useT,STATUS_KEYS,catKey,toolKey} from '../i18n'
import {useData} from '../data'
import {Skeleton} from '../ui'
import {Meter,PieChart,Progress,col,top} from '../components/charts'
import {Card,None,Stat,StatsFrame,tally} from '../components/OverviewKit'

// Thống kê module Dự án: toàn bộ dữ liệu, biểu đồ tròn + thẻ số liệu + thanh tiến độ %
export default function ProjectOverview(){
 const {t}=useT(),{projects:list,accounts}=useData()
 if(!list||!accounts)return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><Skeleton n={6} className="h-48"/></div>
 const n=list.length,by=k=>list.filter(p=>p.status===k).length,links=list.reduce((s,p)=>s+(p.userIds?.length||0),0),assigned=list.filter(p=>p.userIds?.length).length
 const status=STATUS_KEYS.map(k=>({label:t('status.'+k),value:by(k)})).filter(d=>d.value)
 const cats=top(tally(list.map(p=>t('cat.'+catKey(p.category)))),6,t('other'))
 const tools=top(tally(list.flatMap(p=>(p.tools||[]).map(x=>toolKey(x)==='Other'?t('other'):x))),6,t('other'))
 const accs=top(accounts.map(a=>({label:a.name||a.email,value:list.filter(p=>p.userIds?.includes(a.id)).length})).filter(d=>d.value).sort((a,b)=>b.value-a.value),6,t('other'))
 const tags=top(tally(list.flatMap(p=>p.tags||[])).map(d=>({...d,label:'#'+d.label})),6,t('other'))
 return <StatsFrame module="projects">{()=><>
  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6 lg:gap-4">
   <Stat icon={FolderKanban} label={t('s.total')} value={n}/><Stat icon={Activity} label={t('status.active')} value={by('active')}/><Stat icon={CheckCircle2} label={t('status.done')} value={by('done')}/>
   <Stat icon={Users} label={t('s.accounts')} value={accounts.length}/><Stat icon={UserX} label={t('s.unassigned')} value={n-assigned}/><Stat icon={Gauge} label={t('s.avg')} value={n?(links/n).toFixed(1):'0'}/></div>
  <div className="grid min-w-0 gap-4 lg:grid-cols-2 lg:gap-5 2xl:grid-cols-3">
   <Card title={t('s.progress')}><div className="space-y-6"><Meter label={t('status.done')} value={by('done')} total={n} color="var(--chart-4)"/>
    <div className="space-y-4">{STATUS_KEYS.map((k,i)=><Progress key={k} label={t('status.'+k)} value={by(k)} total={n} color={col(i)}/>)}</div></div></Card>
   <Card title={t('s.byCat')}>{cats.length?<PieChart data={cats} caption={t('nav.projects')}/>:<None/>}</Card>
   <Card title={t('s.byTool')}>{tools.length?<PieChart data={tools} caption={t('d.tools')}/>:<None/>}</Card>
   <Card title={t('s.byAcc')}>{accs.length?<PieChart data={accs} caption={t('nav.accounts')}/>:<None/>}</Card>
   <Card title={t('s.tags')}>{tags.length?<PieChart data={tags} caption={t('d.tags')} center={tally(list.flatMap(p=>p.tags||[])).length}/>:<None/>}</Card>
   <Card title={t('s.assigned')}><div className="space-y-6"><Meter label={t('s.assigned')} value={assigned} total={n} color="var(--chart-2)"/><Progress label={t('s.unassigned')} value={n-assigned} total={n} color="var(--chart-5)"/></div></Card></div></>}</StatsFrame>}
