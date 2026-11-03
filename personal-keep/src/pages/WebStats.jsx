import {Globe,Layers,Link2,Tag} from 'lucide-react'
import {useT} from '../i18n'
import {useData,hostOf} from '../data'
import {Skeleton} from '../ui'
import {Meter,PieChart,Progress,top} from '../components/charts'
import {Card,None,Stat,StatsFrame,tally} from '../components/StatsKit'

// Thống kê module Trang web
export default function WebStats(){
 const {t}=useT(),{websites:list,wcats,webCat}=useData()
 if(!list||!wcats)return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><Skeleton n={4} className="h-48"/></div>
 const n=list.length,cat=w=>webCat(w),hosts=tally(list.map(w=>hostOf(w.url||''))),uncat=list.filter(w=>!cat(w)).length
 const byCat=tally(list.map(w=>cat(w)?.name||t('uncat')))
 const colorOf=name=>wcats.find(c=>c.name===name)?.color
 return <StatsFrame module="websites">{()=><>
  <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 lg:gap-4">
   <Stat icon={Globe} label={t('s.w.total')} value={n}/><Stat icon={Layers} label={t('s.w.cats')} value={wcats.length}/><Stat icon={Link2} label={t('s.w.domains')} value={hosts.length}/><Stat icon={Tag} label={t('s.w.uncat')} value={uncat}/></div>
  <div className="grid min-w-0 gap-4 lg:grid-cols-2 lg:gap-5 2xl:grid-cols-3">
   <Card title={t('s.w.byCat')}>{byCat.length?<PieChart data={top(byCat,7,t('other'))}/>:<None/>}</Card>
   <Card title={t('s.w.top')}>{hosts.length?<PieChart data={top(hosts,6,t('other'))} center={hosts.length}/>:<None/>}</Card>
   <Card title={t('s.share')}><div className="space-y-6"><Meter label={t('s.categorized')} value={n-uncat} total={n} color="var(--chart-4)"/>
    <div className="max-h-72 space-y-4 overflow-y-auto pr-1">{byCat.map(d=><Progress key={d.label} label={d.label} value={d.value} total={n} cls={`cc-${colorOf(d.label)||'indigo'}`} color="var(--cc)"/>)}</div></div></Card></div>
  <Card title={t('s.w.recent')}>{n?<ul className="grid gap-x-8 divide-y divide-border lg:grid-cols-2 lg:divide-y-0">{list.slice(0,6).map(w=><li key={w.id} className="flex items-center justify-between gap-3 py-2.5 text-sm"><span className="min-w-0 truncate font-medium">{w.name}</span><span className="shrink-0 text-xs text-muted-foreground">{hostOf(w.url||'')}</span></li>)}</ul>:<None/>}</Card></>}</StatsFrame>}
