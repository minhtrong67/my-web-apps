import {KeyRound,Layers,MessageSquareText,Ruler} from 'lucide-react'
import {useT} from '../i18n'
import {useData} from '../data'
import {Skeleton} from '../ui'
import {Meter,PieChart,Progress,top} from '../components/charts'
import {Card,None,Stat,StatsFrame,tally} from '../components/OverviewKit'

// Thống kê module Prompt (kèm API key)
export default function PromptOverview(){
 const {t}=useT(),{prompts:list,pcats,promptCat,apikeys}=useData()
 if(!list||!pcats||!apikeys)return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><Skeleton n={4} className="h-48"/></div>
 const n=list.length,len=p=>(p.content||'').length,categorized=list.filter(p=>promptCat(p)).length,tagged=list.filter(p=>p.tags?.length).length
 const byCat=top(tally(list.map(p=>promptCat(p)?.name||t('uncat'))),7,t('other')),prov=top(tally(apikeys.map(k=>k.provider==='Other'?t('other'):k.provider||'?')),6,t('other'))
 const allTags=tally(list.flatMap(p=>p.tags||[])),tags=top(allTags.map(d=>({...d,label:'#'+d.label})),6,t('other'))
 const longest=[...list].sort((a,b)=>len(b)-len(a)).slice(0,5),max=len(longest[0]||{})||1,avg=n?Math.round(list.reduce((s,p)=>s+len(p),0)/n):0
 return <StatsFrame module="prompts">{()=><>
  <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 lg:gap-4">
   <Stat icon={MessageSquareText} label={t('s.p.total')} value={n}/><Stat icon={Layers} label={t('s.p.cats')} value={pcats.length}/><Stat icon={KeyRound} label={t('s.p.keys')} value={apikeys.length}/><Stat icon={Ruler} label={t('s.p.avg')} value={avg.toLocaleString()}/></div>
  <div className="grid min-w-0 gap-4 lg:grid-cols-2 lg:gap-5 2xl:grid-cols-3">
   <Card title={t('s.p.byCat')}>{byCat.length?<PieChart data={byCat} caption={t('nav.prompts')}/>:<None/>}</Card>
   <Card title={t('s.p.byProv')}>{prov.length?<PieChart data={prov} caption={t('nav.keys')}/>:<None/>}</Card>
   <Card title={t('s.progress')}><div className="space-y-6"><Meter label={t('s.categorized')} value={categorized} total={n} color="var(--chart-4)"/><Meter label={t('s.tagged')} value={tagged} total={n} color="var(--chart-2)"/></div></Card>
   <Card title={t('s.p.tags')}>{tags.length?<PieChart data={tags} center={allTags.length} caption={t('d.tags')}/>:<None/>}</Card>
   <Card title={t('s.p.longest')} className="2xl:col-span-2">{longest.length?<div className="space-y-4">{longest.map(p=><Progress key={p.id} label={p.title} value={len(p)} total={max} hint={t('item.chars',{n:len(p).toLocaleString()})}/>)}</div>:<None/>}</Card></div></>}</StatsFrame>}
