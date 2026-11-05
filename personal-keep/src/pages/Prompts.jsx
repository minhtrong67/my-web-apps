import {memo,useDeferredValue,useEffect,useMemo,useState} from 'react'
import {Copy,MessageSquareText,Pencil,Plus,SearchX,X} from 'lucide-react'
import {useT} from '../i18n'
import {useData} from '../data'
import {useLocal,useSession,V0R} from '../hooks'
import {Acts,Btn,CardSkeleton,CatChip,ChipRow,Confirm,Dialog,Empty,Fab,ItemCard,Lead,PageHead,useToast} from '../ui'
import Toolbar,{Chips} from '../components/Toolbar'
import {PromptDialog} from '../components/forms'

const copyText=async(text,ok,fail,toast)=>{try{await navigator.clipboard.writeText(text);toast(ok)}catch{toast(fail,'error')}}

const Item=memo(function Item({p,cat,view,i,onView,onEdit,onDelete,onCopy}){
 const {t}=useT(),tags=p.tags||[]
 return <ItemCard view={view} i={i} onClick={()=>onView(p)} lead={<Lead icon={MessageSquareText}/>} title={p.title} sub={t('item.chars',{n:p.content.length.toLocaleString()})} badge={<CatChip cat={cat}/>}
  desc={<p className="line-clamp-2 whitespace-pre-line break-words text-sm text-muted-foreground">{p.content}</p>}
  meta={tags.length?<ChipRow max={3} items={tags.map(x=><span key={x} className="chip bg-primary/10 text-primary">#{x}</span>)}/>:null}
  who={<Btn variant="soft" className="btn-sm" icon={Copy} onClick={e=>{e.stopPropagation();onCopy(p)}}>{t('copy')}</Btn>}
  actions={<Acts onEdit={()=>onEdit(p)} onDelete={()=>onDelete(p)}/>}/>})

function ViewDialog({p,cat,onClose,onEdit,onCopy}){
 const {t}=useT()
 return <Dialog title={p.title} onClose={onClose} footer={<><Btn variant="neutral" icon={X} onClick={onClose}>{t('close')}</Btn><Btn variant="soft" icon={Pencil} onClick={onEdit}>{t('edit')}</Btn><Btn icon={Copy} onClick={onCopy}>{t('copy')}</Btn></>}>
  <div className="mb-4 flex flex-wrap items-center gap-1.5"><CatChip cat={cat}/>{(p.tags||[]).map(x=><span key={x} className="chip bg-primary/10 text-primary">#{x}</span>)}</div>
  <pre className="max-h-[50dvh] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-muted p-4 font-sans text-sm leading-relaxed">{p.content}</pre>
  <p className="mt-2 text-right text-xs text-muted-foreground">{t('item.chars',{n:p.content.length.toLocaleString()})}</p></Dialog>}

export default function Prompts({pending,setPending}){
 const {t}=useT(),toast=useToast(),{prompts,pcats,promptCat,removePrompt}=useData()
 const [v,setV]=useSession('f:prompts',V0R),[view,setView]=useLocal('view:prompts','grid')
 const [dlg,setDlg]=useState(null),[ask,setAsk]=useState(null),[show,setShow]=useState(null),[busy,setBusy]=useState(false)
 const f={...V0R,...v},set=p=>setV({...f,...p}),dq=useDeferredValue(f.q)
 useEffect(()=>{if(pending==='prompt'){setDlg({});setPending(null)}},[pending,setPending])
 const shown=useMemo(()=>{if(!prompts)return null;const s=dq.trim().toLowerCase()
  const r=prompts.filter(p=>{const c=promptCat(p);return (!f.cat||(f.cat==='none'?!c:c?.id===f.cat))&&(!s||[p.title,p.content,c?.name,...(p.tags||[])].join(' ').toLowerCase().includes(s))})
  const cmp={old:(a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0),az:(a,b)=>a.title.localeCompare(b.title)}[f.sort]
  return cmp?[...r].sort(cmp):r},[prompts,promptCat,dq,f.cat,f.sort])
 const active=!!f.cat+(f.sort!=='new')
 const tags=[...(f.cat?[{k:'c',label:f.cat==='none'?t('uncat'):pcats?.find(c=>c.id===f.cat)?.name||'…',off:()=>set({cat:''})}]:[]),...(f.sort!=='new'?[{k:'o',label:t('sort.'+f.sort),off:()=>set({sort:'new'})}]:[])]
 const del=async()=>{setBusy(true);try{await removePrompt(ask.id);setAsk(null)}catch(e){toast(e.message,'error')}setBusy(false)}
 const copy=p=>copyText(p.content,t('copied'),t('web.copyfail'),toast)
 const grid=view==='grid'?'grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3 2xl:grid-cols-4':'flex flex-col gap-3'
 return <>
  <PageHead title={t('nav.prompts')} sub={prompts&&t('prompts.count',{n:prompts.length})} onAdd={()=>setDlg({})} addLabel={t('add')}/>
  <Toolbar ph={t('prompts.search')} q={f.q} setQ={q=>set({q})} count={shown?.length} active={active} clear={()=>setV(V0R)} view={view} setView={setView} tags={tags}>
   <Chips label={t('flt.category')} value={f.cat} onChange={cat=>set({cat})} options={[['',t('all')],...(pcats||[]).map(c=>[c.id,c.name]),...((prompts||[]).some(p=>!promptCat(p))?[['none',t('uncat')]]:[])]}/>
   <Chips label={t('flt.sort')} value={f.sort} onChange={sort=>set({sort})} options={['new','old','az'].map(k=>[k,t('sort.'+k)])}/></Toolbar>
  {shown===null?<div className={grid}><CardSkeleton n={6} lines={4}/></div>
   :!prompts.length?<Empty icon={MessageSquareText} text={t('prompts.empty')} action={<Btn icon={Plus} onClick={()=>setDlg({})}>{t('add')}</Btn>}/>
   :!shown.length?<Empty icon={SearchX} text={t('noresult')}/>
   :<div className={grid}>{shown.map((p,i)=><Item key={p.id} p={p} cat={promptCat(p)} i={i} view={view} onView={setShow} onEdit={setDlg} onDelete={setAsk} onCopy={copy}/>)}</div>}
  <Fab onClick={()=>setDlg({})} label={t('dlg.addPrompt')}/>
  {show&&<ViewDialog p={show} cat={promptCat(show)} onClose={()=>setShow(null)} onCopy={()=>copy(show)} onEdit={()=>{setDlg(show);setShow(null)}}/>}
  {dlg&&<PromptDialog init={dlg.id?dlg:null} onClose={()=>setDlg(null)}/>}
  {ask&&<Confirm title={t('c.title')} message={t('c.delPrompt',{name:ask.title})} confirmLabel={t('delete')} busy={busy} onConfirm={del} onClose={()=>setAsk(null)}/>}</>}
