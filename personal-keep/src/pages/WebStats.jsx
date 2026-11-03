import {Globe,Layers,Link2,Tag} from 'lucide-react'
import {useT} from '../i18n'
import {useData,hostOf} from '../data'
import {Skeleton} from '../ui'
import {BarChart,PieChart} from '../components/charts'
import {Card,None,Stat,StatsFrame,tally} from '../components/StatsKit'

// Thống kê của module Trang web
export default function WebStats(){
 const {t}=useT(),{websites,wcats,webCat}=useData()
 if(!websites||!wcats)return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Skeleton n={4} className="h-40"/></div>
 return <StatsFrame module="websites" session="f:wstats">{({inRange})=>{
  const list=websites.filter(inRange),byCat=tally(list.map(w=>webCat(w)?.name||t('uncat'))),hosts=tally(list.map(w=>hostOf(w.url)))
  return <>
   <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <Stat icon={Globe} label={t('s.w.total')} value={list.length}/><Stat icon={Layers} label={t('s.w.cats')} value={wcats.length}/>
    <Stat icon={Link2} label={t('s.w.domains')} value={hosts.length}/><Stat icon={Tag} label={t('s.w.uncat')} value={list.filter(w=>!webCat(w)).length}/></div>
   <div className="grid min-w-0 gap-4 xl:grid-cols-2">
    <Card title={t('s.w.byCat')}>{byCat.length?<PieChart data={byCat}/>:<None/>}</Card>
    <Card title={t('s.w.top')}>{hosts.length?<BarChart data={hosts.slice(0,8)}/>:<None/>}</Card></div>
   <Card title={t('s.w.recent')}>{list.length?<ul className="divide-y divide-border">{list.slice(0,5).map(w=><li key={w.id} className="flex items-center justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0"><span className="min-w-0 truncate font-medium">{w.name}</span><span className="shrink-0 text-xs text-muted-foreground">{hostOf(w.url)}</span></li>)}</ul>:<None/>}</Card></>}}</StatsFrame>}
