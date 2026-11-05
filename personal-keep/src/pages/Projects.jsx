import {memo,useDeferredValue,useEffect,useMemo,useState} from 'react'
import {Check,FolderKanban,Layers,ListChecks,Plus,RefreshCw,SearchX,Sparkles,Trash2,UserRound,X} from 'lucide-react'
import {useT,STATUS_KEYS,CAT_KEYS,catKey,toolKey,locale} from '../i18n'
import {useData} from '../data'
import {useLocal,useSession,V0P} from '../hooks'
import {Acts,Btn,CardSkeleton,Checkbox,ChipRow,ItemCard,Lead,Confirm,Dialog,Dropdown,Empty,Fab,PageHead,useToast} from '../ui'
import Toolbar,{Chips} from '../components/Toolbar'
import {ProjectDialog} from '../components/forms'

const ST={active:'bg-primary-container text-on-primary-container',paused:'bg-warn-container text-on-warn-container',done:'bg-ok-container text-on-ok-container',cancelled:'bg-muted text-muted-foreground'}
const Tag=({icon:I,tone,children})=><span className={`inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${tone}`}><I className="size-3.5 shrink-0"/><span className="truncate">{children}</span></span>

const Item=memo(function Item({p,accMap,view,i,onEdit,onDelete,selMode,checked,onToggle}){
 const {t,lang}=useT(),accs=(p.userIds||[]).map(x=>accMap[x]).filter(Boolean),first=accs[0],list=view==='list'
 const created=p.createdAt?.toDate&&t('item.created',{d:p.createdAt.toDate().toLocaleDateString(locale(lang))})
 const chips=[<Tag key="c" icon={Layers} tone="bg-secondary text-secondary-foreground border-transparent">{t('cat.'+catKey(p.category))}</Tag>,
  ...(p.tools||[]).map(x=><Tag key={'t'+x} icon={Sparkles} tone="text-foreground">{toolKey(x)==='Other'?t('other'):x}</Tag>),
  ...(p.tags||[]).map(x=><span key={'#'+x} className="chip bg-primary/10 text-primary">#{x}</span>)]
 const who=first
  ?<div className="flex min-w-0 items-center gap-2.5"><span className="flex shrink-0 -space-x-2">{accs.slice(0,3).map(a=><span key={a.id} title={a.name||a.email} className="avatar">{(a.name||a.email)[0]}</span>)}</span>
    <div className="min-w-0"><p className="truncate text-sm font-medium leading-tight">{first.name||first.email}{accs.length>1&&<span className="ml-1 font-normal text-muted-foreground">+{accs.length-1}</span>}</p>
     {first.name&&<p className="truncate text-xs text-muted-foreground">{first.email}</p>}</div></div>
  :<div className="flex items-center gap-2.5"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"><UserRound className="size-4"/></span><p className="truncate text-sm text-muted-foreground">{t('item.noacc')}</p></div>
 return <ItemCard view={view} i={i} selected={checked} onClick={selMode?onToggle:undefined}
  select={selMode&&<Checkbox checked={checked} onChange={onToggle} label={p.name}/>} lead={<Lead icon={FolderKanban}/>} title={p.name} sub={created}
  badge={<span className={`badge ${ST[p.status]||ST.active}`}><i className="size-1.5 rounded-full bg-current"/>{t('status.'+p.status)}</span>}
  desc={p.desc&&<p className="line-clamp-2 whitespace-pre-line break-words text-sm text-muted-foreground">{p.desc}</p>}
  meta={<ChipRow items={chips} max={list?1:3}/>} who={who} actions={!selMode&&<Acts onEdit={()=>onEdit(p)} onDelete={()=>onDelete(p)}/>}/>})

function BulkStatus({n,busy,onClose,onApply}){
 const {t}=useT(),[st,setSt]=useState('active')
 return <Dialog title={t('b.status')} onClose={()=>!busy&&onClose()} footer={<><Btn variant="neutral" icon={X} disabled={busy} onClick={onClose}>{t('cancel')}</Btn><Btn icon={Check} loading={busy} onClick={()=>onApply(st)}>{t('update')}</Btn></>}>
  <p className="mb-6 text-sm text-muted-foreground">{t('b.statusDesc',{n})}</p>
  <Dropdown label={t('f.status')} value={st} onChange={setSt} options={STATUS_KEYS.map(k=>[k,t('status.'+k)])}/></Dialog>}

export default function Projects({pending,setPending}){
 const {t}=useT(),toast=useToast(),{projects,accMap,removeProject,bulkStatus,bulkRemove}=useData()
 const [v,setV]=useSession('f:projects',V0P),[view,setView]=useLocal('view:projects','grid')
 const [dlg,setDlg]=useState(null),[ask,setAsk]=useState(null),[busy,setBusy]=useState(false),[selMode,setSelMode]=useState(false),[sel,setSel]=useState(()=>new Set()),[bulk,setBulk]=useState(null)
 const f={...V0P,...v},set=p=>setV({...f,...p}),dq=useDeferredValue(f.q)
 useEffect(()=>{if(pending==='project'){setDlg({});setPending(null)}},[pending,setPending])
 const shown=useMemo(()=>{if(!projects)return null;const s=dq.trim().toLowerCase()
  const r=projects.filter(p=>(f.status==='all'||p.status===f.status)&&(!f.cat||catKey(p.category)===f.cat)&&(!s||[p.name,p.desc,t('cat.'+catKey(p.category)),t('status.'+p.status),...(p.tags||[]),...(p.tools||[]),...(p.userIds||[]).flatMap(i=>[accMap[i]?.name,accMap[i]?.email])].join(' ').toLowerCase().includes(s)))
  const cmp={old:(a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0),az:(a,b)=>a.name.localeCompare(b.name)}[f.sort]
  return cmp?[...r].sort(cmp):r},[projects,accMap,dq,f.status,f.cat,f.sort,t])
 const active=(f.status!=='all')+!!f.cat+(f.sort!=='new')
 const tags=[...(f.status!=='all'?[{k:'s',label:t('status.'+f.status),off:()=>set({status:'all'})}]:[]),...(f.cat?[{k:'c',label:t('cat.'+f.cat),off:()=>set({cat:''})}]:[]),...(f.sort!=='new'?[{k:'o',label:t('sort.'+f.sort),off:()=>set({sort:'new'})}]:[])]
 const del=async()=>{setBusy(true);try{await removeProject(ask.id);setAsk(null)}catch(e){toast(e.message,'error')}setBusy(false)}
 // chỉ tính các dự án đang hiển thị (đang lọc thì 'chọn tất cả' chỉ chọn kết quả lọc)
 const ids=(shown||[]).filter(p=>sel.has(p.id)).map(p=>p.id),all=!!shown?.length&&ids.length===shown.length
 const toggle=id=>setSel(x=>{const n=new Set(x);n.has(id)?n.delete(id):n.add(id);return n})
 const exitSel=()=>{setSelMode(false);setSel(new Set())}
 const run=async(fn,msg)=>{setBusy(true);try{await fn();toast(t(msg,{n:ids.length}));exitSel();setBulk(null)}catch(e){toast(e.message,'error')}setBusy(false)}
 const grid=view==='grid'?'grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3 2xl:grid-cols-4':'flex flex-col gap-3'
 return <>
  <PageHead title={t('nav.projects')} sub={projects&&t('projects.count',{n:projects.length})} onAdd={()=>setDlg({})} addLabel={t('add')}>
   {!!projects?.length&&!selMode&&<Btn variant="outline" icon={ListChecks} onClick={()=>setSelMode(true)}>{t('select')}</Btn>}</PageHead>
  <Toolbar ph={t('projects.search')} q={f.q} setQ={q=>set({q})} count={shown?.length} active={active} clear={()=>setV(V0P)} view={view} setView={setView} tags={tags}>
   <Chips label={t('flt.status')} value={f.status} onChange={status=>set({status})} options={[['all',t('all')],...STATUS_KEYS.map(k=>[k,t('status.'+k)])]}/>
   <Chips label={t('flt.category')} value={f.cat} onChange={cat=>set({cat})} options={[['',t('all')],...CAT_KEYS.map(k=>[k,t('cat.'+k)])]}/>
   <Chips label={t('flt.sort')} value={f.sort} onChange={sort=>set({sort})} options={['new','old','az'].map(k=>[k,t('sort.'+k)])}/></Toolbar>
  {selMode&&<div className="anim-pop sticky top-[4.25rem] z-20 mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5 text-secondary-foreground shadow-md">
   <Checkbox checked={all} mixed={!!ids.length&&!all} onChange={c=>setSel(c?new Set((shown||[]).map(p=>p.id)):new Set())} label={t('selectAll')}/>
   <span className="mr-auto text-sm font-medium tabular-nums">{ids.length?t('selected',{n:ids.length}):t('selectAll')}</span>
   <Btn className="btn-sm" icon={RefreshCw} disabled={!ids.length} onClick={()=>setBulk('status')}>{t('b.status')}</Btn>
   <Btn variant="danger" className="btn-sm" icon={Trash2} disabled={!ids.length} onClick={()=>setBulk('delete')}>{t('delete')}</Btn>
   <Btn variant="neutral" className="btn-sm" icon={X} onClick={exitSel}>{t('select.exit')}</Btn></div>}
  {shown===null?<div className={grid}><CardSkeleton n={6} lines={4}/></div>
   :!projects.length?<Empty icon={FolderKanban} text={t('projects.empty')} action={<Btn icon={Plus} onClick={()=>setDlg({})}>{t('add')}</Btn>}/>
   :!shown.length?<Empty icon={SearchX} text={t('noresult')}/>
   :<div className={grid}>{shown.map((p,i)=><Item key={p.id} p={p} i={i} view={view} accMap={accMap} onEdit={setDlg} onDelete={setAsk} selMode={selMode} checked={sel.has(p.id)} onToggle={()=>toggle(p.id)}/>)}</div>}
  {!selMode&&<Fab onClick={()=>setDlg({})} label={t('dlg.addProject')}/>}
  {dlg&&<ProjectDialog init={dlg.id?dlg:null} onClose={()=>setDlg(null)}/>}
  {bulk==='status'&&<BulkStatus n={ids.length} busy={busy} onClose={()=>setBulk(null)} onApply={st=>run(()=>bulkStatus(ids,st),'b.done.status')}/>}
  {bulk==='delete'&&<Confirm title={t('b.delTitle',{n:ids.length})} message={t('b.del',{n:ids.length})} confirmLabel={t('delete')} busy={busy} onConfirm={()=>run(()=>bulkRemove(ids),'b.done.del')} onClose={()=>setBulk(null)}/>}
  {ask&&<Confirm title={t('c.title')} message={t('c.delProject',{name:ask.name})} confirmLabel={t('delete')} busy={busy} onConfirm={del} onClose={()=>setAsk(null)}/>}</>}
