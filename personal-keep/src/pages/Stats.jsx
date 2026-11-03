import {Activity,CheckCircle2,FolderKanban,Gauge,UserX,Users} from 'lucide-react'
import {useT,STATUS_KEYS,catKey,toolKey} from '../i18n'
import {useData} from '../data'
import {Skeleton} from '../ui'
import {BarChart,PieChart} from '../components/charts'
import {Card,None,Stat,StatsFrame,tally} from '../components/StatsKit'

// Thống kê của module Dự án
export default function Stats(){
 const {t}=useT(),{projects,accounts}=useData()
 if(!projects||!accounts)return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Skeleton n={6} className="h-40"/></div>
 return <StatsFrame module="projects" session="f:stats">{({inRange})=>{
  const list=projects.filter(inRange),by=k=>list.filter(p=>p.status===k).length,links=list.reduce((n,p)=>n+(p.userIds?.length||0),0)
  const status=STATUS_KEYS.map(k=>({label:t('status.'+k),value:by(k)})),cats=tally(list.map(p=>t('cat.'+catKey(p.category))))
  const tools=tally(list.flatMap(p=>(p.tools||[]).map(x=>toolKey(x)==='Other'?t('other'):x))).slice(0,8)
  const accs=accounts.map(a=>({label:a.name||a.email,value:list.filter(p=>p.userIds?.includes(a.id)).length})).filter(d=>d.value).sort((a,b)=>b.value-a.value).slice(0,8)
  const tags=tally(list.flatMap(p=>p.tags||[])).slice(0,12)
  return <>
   <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
    <Stat icon={FolderKanban} label={t('s.total')} value={list.length}/><Stat icon={Activity} label={t('status.active')} value={by('active')}/><Stat icon={CheckCircle2} label={t('status.done')} value={by('done')}/>
    <Stat icon={Users} label={t('s.accounts')} value={accounts.length}/><Stat icon={UserX} label={t('s.unassigned')} value={list.filter(p=>!p.userIds?.length).length}/><Stat icon={Gauge} label={t('s.avg')} value={list.length?(links/list.length).toFixed(1):'0'}/></div>
   <div className="grid min-w-0 gap-4 xl:grid-cols-2">
    <Card title={t('s.byStatus')}>{list.length?<BarChart data={status}/>:<None/>}</Card>
    <Card title={t('s.byCat')}>{cats.length?<PieChart data={cats}/>:<None/>}</Card>
    <Card title={t('s.byTool')}>{tools.length?<BarChart data={tools}/>:<None/>}</Card>
    <Card title={t('s.byAcc')}>{accs.length?<PieChart data={accs}/>:<None/>}</Card></div>
   <Card title={t('s.tags')}>{tags.length?<div className="flex flex-wrap gap-2">{tags.map(x=><span key={x.label} className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-sm text-secondary-foreground">#{x.label}<b className="tabular-nums">{x.value}</b></span>)}</div>:<None/>}</Card></>}}</StatsFrame>}
