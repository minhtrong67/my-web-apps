import {memo,useDeferredValue,useEffect,useMemo,useState} from 'react'
import {Copy,Eye,EyeOff,KeyRound,Plus,SearchX,TriangleAlert} from 'lucide-react'
import {PROVIDERS,useT} from '../i18n'
import {useData} from '../data'
import {useLocal,useSession,V0K} from '../hooks'
import {Acts,Btn,CardSkeleton,Confirm,Empty,Fab,ItemCard,Lead,PageHead,useToast} from '../ui'
import Toolbar,{Chips} from '../components/Toolbar'
import {KeyDialog} from '../components/forms'

const mask=k=>k.length<=8?'•'.repeat(k.length):`${k.slice(0,4)}••••••••${k.slice(-4)}`

const provName=(k,t)=>k.provider==='Other'?t('other'):k.provider
// ẩn / hiện key; tự ẩn lại sau 20 giây
function useReveal(){const [open,setOpen]=useState(false);useEffect(()=>{if(!open)return;const id=setTimeout(()=>setOpen(false),20000);return()=>clearTimeout(id)},[open]);return [open,setOpen]}
const RevealBtn=({open,setOpen})=>{const {t}=useT();return <button type="button" aria-label={t(open?'hide':'reveal')} title={t(open?'hide':'reveal')} aria-pressed={open} onClick={()=>setOpen(!open)} className="icon-btn">{open?<EyeOff className="size-4"/>:<Eye className="size-4"/>}</button>}

const Item=memo(function Item({k,i,onEdit,onDelete,onCopy}){
 const {t}=useT(),[open,setOpen]=useReveal()
 return <ItemCard i={i} lead={<Lead icon={KeyRound}/>} title={k.name} sub={provName(k,t)}
  who={<Btn variant="soft" className="btn-sm" icon={Copy} onClick={()=>onCopy(k)}>{t('copy')}</Btn>} actions={<><RevealBtn open={open} setOpen={setOpen}/><Acts onEdit={()=>onEdit(k)} onDelete={()=>onDelete(k)}/></>}>
  <code className="block select-all break-all rounded-lg bg-muted px-3 py-2.5 font-mono text-[13px]">{open?k.key:mask(k.key)}</code>
  {k.note&&<p className="whitespace-pre-line break-words text-sm text-muted-foreground">{k.note}</p>}</ItemCard>})

function KeyRow({k,onEdit,onDelete,onCopy}){const {t}=useT(),[open,setOpen]=useReveal();return <tr className="border-t border-border transition-colors hover:bg-accent">
 <td className="px-4 py-3 align-top font-semibold">{k.name}</td><td className="px-4 py-3 align-top">{provName(k,t)}</td>
 <td className="px-4 py-3 align-top"><code className="break-all font-mono text-[13px]">{open?k.key:mask(k.key)}</code></td>
 <td className="px-4 py-3 align-top text-muted-foreground">{k.note?<span className="whitespace-pre-line">{k.note}</span>:'-'}</td>
 <td className="px-3 py-2 align-top"><div className="flex items-center justify-end gap-0.5 whitespace-nowrap"><button type="button" aria-label={t('copy')} title={t('copy')} onClick={()=>onCopy(k)} className="icon-btn"><Copy className="size-4"/></button><RevealBtn open={open} setOpen={setOpen}/><Acts onEdit={()=>onEdit(k)} onDelete={()=>onDelete(k)}/></div></td></tr>}
function KeyTable({rows,onEdit,onDelete,onCopy}){const {t}=useT()
 return <div className="card anim-fade overflow-x-auto p-0"><table className="w-full min-w-[780px] border-collapse text-left text-sm"><thead><tr className="bg-muted/60 text-xs font-semibold text-muted-foreground">
  <th className="px-4 py-3">{t('d.name')}</th><th className="px-4 py-3">{t('d.provider')}</th><th className="min-w-64 px-4 py-3">{t('d.key')}</th><th className="px-4 py-3">{t('d.note')}</th><th className="w-px px-4 py-3"><span className="sr-only">{t('actions')}</span></th></tr></thead>
  <tbody>{rows.map(k=><KeyRow key={k.id} k={k} onEdit={onEdit} onDelete={onDelete} onCopy={onCopy}/>)}</tbody></table></div>}

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
 const grid='grid items-stretch gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3'
 return <>
  <PageHead title={t('nav.keys')} sub={apikeys&&t('keys.count',{n:apikeys.length})} onAdd={()=>setDlg({})} addLabel={t('add')}/>
  <div className="mb-5 flex items-start gap-3 rounded-2xl bg-warn-container p-4 text-sm text-on-warn-container"><TriangleAlert className="mt-0.5 size-5 shrink-0"/><p>{t('keys.warn')}</p></div>
  <Toolbar ph={t('keys.search')} q={f.q} setQ={q=>set({q})} count={shown?.length} active={active} clear={()=>setV(V0K)} view={view} setView={setView} tags={tags}>
   <Chips label={t('flt.provider')} value={f.prov} onChange={prov=>set({prov})} options={[['',t('all')],...used.map(p=>[p,p==='Other'?t('other'):p])]}/>
   <Chips label={t('flt.sort')} value={f.sort} onChange={sort=>set({sort})} options={['new','old','az'].map(k=>[k,t('sort.'+k)])}/></Toolbar>
  {shown===null?<div className={grid}><CardSkeleton n={3} lines={2}/></div>
   :!apikeys.length?<Empty icon={KeyRound} text={t('keys.empty')} action={<Btn icon={Plus} onClick={()=>setDlg({})}>{t('add')}</Btn>}/>
   :!shown.length?<Empty icon={SearchX} text={t('noresult')}/>
   :view==='list'?<KeyTable rows={shown} onEdit={setDlg} onDelete={setAsk} onCopy={copy}/>
   :<div className={grid}>{shown.map((k,i)=><Item key={k.id} k={k} i={i} onEdit={setDlg} onDelete={setAsk} onCopy={copy}/>)}</div>}
  <Fab onClick={()=>setDlg({})} label={t('dlg.addKey')}/>
  {dlg&&<KeyDialog init={dlg.id?dlg:null} onClose={()=>setDlg(null)}/>}
  {ask&&<Confirm title={t('c.title')} message={t('c.delKey',{name:ask.name})} confirmLabel={t('delete')} busy={busy} onConfirm={del} onClose={()=>setAsk(null)}/>}</>}
