import {memo,useDeferredValue,useEffect,useMemo,useState} from 'react'
import {Copy,Eye,EyeOff,KeyRound,Plus,SearchX,TriangleAlert} from 'lucide-react'
import {PROVIDERS,useT} from '../i18n'
import {useData} from '../data'
import {useLocal,useSession,V0K} from '../hooks'
import {Acts,Btn,CardSkeleton,Confirm,Empty,Fab,PageHead,useToast} from '../ui'
import Toolbar,{Chips} from '../components/Toolbar'
import {KeyDialog} from '../components/forms'

const mask=k=>k.length<=8?'•'.repeat(k.length):`${k.slice(0,4)}••••••••${k.slice(-4)}`

const Item=memo(function Item({k,view,i,onEdit,onDelete,onCopy}){
 const {t}=useT(),[open,setOpen]=useState(false),list=view==='list'
 useEffect(()=>{if(!open)return;const id=setTimeout(()=>setOpen(false),20000);return()=>clearTimeout(id)},[open]) // tự ẩn sau 20 giây
 return <article style={{animationDelay:`${Math.min(i,8)*28}ms`}} className={`card card-item card-hover anim-up min-w-0 p-4 sm:p-5 ${list?'flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto] md:items-center md:gap-x-6':'flex flex-col gap-3'}`}>
  <div className="flex min-w-0 flex-col items-start gap-2"><h3 className="line-clamp-2 break-words font-semibold leading-snug">{k.name}</h3><span className="chip">{k.provider==='Other'?t('other'):k.provider}</span>
   {k.note&&<p className="line-clamp-2 break-words text-sm text-muted-foreground">{k.note}</p>}</div>
  <code className="block min-w-0 select-all break-all rounded-xl bg-muted px-3 py-2.5 font-mono text-[13px]">{open?k.key:mask(k.key)}</code>
  <div className="mt-auto flex items-center gap-1 pt-1 md:mt-0 md:pt-0">
   <Btn variant="soft" className="btn-sm flex-1 md:flex-none" icon={Copy} onClick={()=>onCopy(k)}>{t('copy')}</Btn>
   <button type="button" aria-label={t(open?'hide':'reveal')} title={t(open?'hide':'reveal')} aria-pressed={open} onClick={()=>setOpen(!open)} className="icon-btn">{open?<EyeOff className="size-4"/>:<Eye className="size-4"/>}</button>
   <Acts onEdit={()=>onEdit(k)} onDelete={()=>onDelete(k)}/></div></article>})

// Mini module quản lý API key (nằm trong module Prompt)
export default function ApiKeys({pending,setPending}){
 const {t}=useT(),toast=useToast(),{apikeys,removeKey}=useData()
 const [v,setV]=useSession('f:keys',V0K),[view,setView]=useLocal('view:keys','grid')
 const [dlg,setDlg]=useState(null),[ask,setAsk]=useState(null),[busy,setBusy]=useState(false)
 const f={...V0K,...v},set=p=>setV({...f,...p}),dq=useDeferredValue(f.q)
 useEffect(()=>{if(pending==='key'){setDlg({});setPending(null)}},[pending,setPending])
 const shown=useMemo(()=>{if(!apikeys)return null;const s=dq.trim().toLowerCase()
  const r=apikeys.filter(k=>(!f.prov||k.provider===f.prov)&&(!s||[k.name,k.provider,k.note].join(' ').toLowerCase().includes(s)))
  const cmp={old:(a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0),az:(a,b)=>a.name.localeCompare(b.name)}[f.sort]
  return cmp?[...r].sort(cmp):r},[apikeys,dq,f.prov,f.sort])
 const active=!!f.prov+(f.sort!=='new')
 const tags=[...(f.prov?[{k:'p',label:f.prov==='Other'?t('other'):f.prov,off:()=>set({prov:''})}]:[]),...(f.sort!=='new'?[{k:'o',label:t('sort.'+f.sort),off:()=>set({sort:'new'})}]:[])]
 const used=PROVIDERS.filter(p=>(apikeys||[]).some(k=>k.provider===p))
 const del=async()=>{setBusy(true);try{await removeKey(ask.id);setAsk(null)}catch(e){toast(e.message,'error')}setBusy(false)}
 const copy=async k=>{try{await navigator.clipboard.writeText(k.key);toast(t('keys.copied'))}catch{toast(t('web.copyfail'),'error')}}
 const grid=view==='grid'?'grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3':'flex flex-col gap-3'
 return <>
  <PageHead title={t('nav.keys')} sub={apikeys&&t('keys.count',{n:apikeys.length})} onAdd={()=>setDlg({})} addLabel={t('add')}/>
  <div className="mb-5 flex items-start gap-3 rounded-2xl bg-warn-container p-4 text-sm text-on-warn-container"><TriangleAlert className="mt-0.5 size-5 shrink-0"/><p>{t('keys.warn')}</p></div>
  <Toolbar ph={t('keys.search')} q={f.q} setQ={q=>set({q})} count={shown?.length} active={active} clear={()=>setV(V0K)} view={view} setView={setView} tags={tags}>
   <Chips label={t('flt.provider')} value={f.prov} onChange={prov=>set({prov})} options={[['',t('all')],...used.map(p=>[p,p==='Other'?t('other'):p])]}/>
   <Chips label={t('flt.sort')} value={f.sort} onChange={sort=>set({sort})} options={['new','old','az'].map(k=>[k,t('sort.'+k)])}/></Toolbar>
  {shown===null?<div className={grid}><CardSkeleton n={3} lines={2}/></div>
   :!apikeys.length?<Empty icon={KeyRound} text={t('keys.empty')} action={<Btn icon={Plus} onClick={()=>setDlg({})}>{t('add')}</Btn>}/>
   :!shown.length?<Empty icon={SearchX} text={t('noresult')}/>
   :<div className={grid}>{shown.map((k,i)=><Item key={k.id} k={k} i={i} view={view} onEdit={setDlg} onDelete={setAsk} onCopy={copy}/>)}</div>}
  <Fab onClick={()=>setDlg({})} label={t('dlg.addKey')}/>
  {dlg&&<KeyDialog init={dlg.id?dlg:null} onClose={()=>setDlg(null)}/>}
  {ask&&<Confirm title={t('c.title')} message={t('c.delKey',{name:ask.name})} confirmLabel={t('delete')} busy={busy} onConfirm={del} onClose={()=>setAsk(null)}/>}</>}
