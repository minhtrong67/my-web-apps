import {KeyRound,Layers,MessageSquareText,Ruler} from 'lucide-react'
import {useT} from '../i18n'
import {useData} from '../data'
import {Skeleton} from '../ui'
import {PieChart} from '../components/charts'
import {Card,None,Stat,StatsFrame,tally} from '../components/StatsKit'

// Thống kê của module Prompt (kèm API key)
export default function PromptStats(){
 const {t}=useT(),{prompts,pcats,promptCat,apikeys}=useData()
 if(!prompts||!pcats||!apikeys)return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Skeleton n={4} className="h-40"/></div>
 return <StatsFrame module="prompts" session="f:pstats">{({inRange})=>{
  const list=prompts.filter(inRange),keys=apikeys.filter(inRange),byCat=tally(list.map(p=>promptCat(p)?.name||t('uncat'))),tags=tally(list.flatMap(p=>p.tags||[])).slice(0,12)
  const prov=tally(keys.map(k=>k.provider==='Other'?t('other'):k.provider)),longest=[...list].sort((a,b)=>b.content.length-a.content.length).slice(0,5)
  const avg=list.length?Math.round(list.reduce((n,p)=>n+p.content.length,0)/list.length):0
  return <>
   <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <Stat icon={MessageSquareText} label={t('s.p.total')} value={list.length}/><Stat icon={Layers} label={t('s.p.cats')} value={pcats.length}/>
    <Stat icon={KeyRound} label={t('s.p.keys')} value={keys.length}/><Stat icon={Ruler} label={t('s.p.avg')} value={avg.toLocaleString()}/></div>
   <div className="grid min-w-0 gap-4 xl:grid-cols-2">
    <Card title={t('s.p.byCat')}>{byCat.length?<PieChart data={byCat}/>:<None/>}</Card>
    <Card title={t('s.p.byProv')}>{prov.length?<PieChart data={prov}/>:<None/>}</Card></div>
   <div className="grid min-w-0 gap-4 xl:grid-cols-2">
    <Card title={t('s.p.tags')}>{tags.length?<div className="flex flex-wrap gap-2">{tags.map(x=><span key={x.label} className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-sm text-secondary-foreground">#{x.label}<b className="tabular-nums">{x.value}</b></span>)}</div>:<None/>}</Card>
    <Card title={t('s.p.longest')}>{longest.length?<ul className="divide-y divide-border">{longest.map(p=><li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0"><span className="min-w-0 truncate font-medium">{p.title}</span><span className="shrink-0 text-xs tabular-nums text-muted-foreground">{t('item.chars',{n:p.content.length.toLocaleString()})}</span></li>)}</ul>:<None/>}</Card></div></>}}</StatsFrame>}
