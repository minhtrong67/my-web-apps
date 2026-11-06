import {memo,useDeferredValue,useEffect,useMemo,useState} from 'react'
import {Check,FolderKanban,ListChecks,Plus,RefreshCw,SearchX,Trash2,UserRound,X} from 'lucide-react'
import {useT,STATUS_KEYS,CAT_KEYS,catKey,toolKey,locale} from '../i18n'
import {useData} from '../data'
import {useLocal,useSession,V0P} from '../hooks'
import {Acts,Btn,CardSkeleton,Checkbox,DataTable,Detail,Details,ItemCard,Lead,Confirm,Dialog,Dropdown,Empty,Fab,PageHead,useToast} from '../ui'
import Toolbar,{Chips} from '../components/Toolbar'
import {ProjectDialog} from '../components/forms'

const ST={active:'bg-primary-container text-on-primary-container',paused:'bg-warn-container text-on-warn-container',done:'bg-ok-container text-on-ok-container',cancelled:'bg-muted text-muted-foreground'}

const accLine=a=><li key={a.id} className="flex items-start gap-2.5"><span className="avatar !size-8 !text-xs">{(a.name||a.email)[0]}</span><div className="min-w-0 text-sm leading-tight">{a.name&&<p className="break-words font-medium">{a.name}</p>}<p className="break-all text-xs text-muted-foreground">{a.email}</p></div></li>
const statusBadge=(p,t)=><span className={`badge ${ST[p.status]||ST.active}`}><i className="size-1.5 rounded-full bg-current"/>{t('status.'+p.status)}</span>
const fmtDate=(p,lang)=>p.createdAt?.toDate?.().toLocaleDateString(locale(lang))||''
const toolsOf=(p,t)=>(p.tools||[]).map(x=>toolKey(x)==='Other'?t('other'):x).join(', ')

const Item=memo(function Item({p,accMap,i,onEdit,onDelete,selMode,checked,onToggle}){
 const {t,lang}=useT(),accs=(p.userIds||[]).map(x=>accMap[x]).filter(Boolean),tags=(p.tags||[]).map(x=>'#'+x).join(' ')
 return <ItemCard i={i} selected={checked} onClick={selMode?onToggle:undefined} select={selMode&&<Checkbox checked={checked} onChange={onToggle} label={p.name}/>}
  lead={<Lead icon={FolderKanban}/>} title={p.name} sub={t('item.created',{d:fmtDate(p,lang)})} badge={statusBadge(p,t)}
  who={accs.length?<ul className="space-y-2">{accs.map(accLine)}</ul>:<p className="flex items-center gap-2 text-sm text-muted-foreground"><UserRound className="size-4"/>{t('item.noacc')}</p>}
  actions={!selMode&&<Acts onEdit={()=>onEdit(p)} onDelete={()=>onDelete(p)}/>}>
  {p.desc&&<p className="whitespace-pre-line break-words text-sm text-muted-foreground">{p.desc}</p>}
  <Details><Detail label={t('d.cat')}>{t('cat.'+catKey(p.category))}</Detail><Detail label={t('d.tools')}>{toolsOf(p,t)}</Detail><Detail label={t('d.tags')}>{tags&&<span className="text-primary">{tags}</span>}</Detail></Details></ItemCard>})

function ProjectTable({rows,accMap,selMode,sel,onToggle,onToggleAll,allChecked,someChecked,onEdit,onDelete}){
 const {t,lang}=useT()
 const columns=[
  {key:'name',label:t('d.name'),className:'min-w-56',render:p=><><p className="font-semibold">{p.name}</p>{p.desc&&<p className="mt-0.5 whitespace-pre-line text-xs text-muted-foreground">{p.desc}</p>}</>},
  {key:'status',label:t('d.status'),nowrap:true,render:p=>statusBadge(p,t)},
  {key:'cat',label:t('d.cat'),nowrap:true,render:p=>t('cat.'+catKey(p.category))},
  {key:'tools',label:t('d.tools'),className:'min-w-32',render:p=>toolsOf(p,t)||<span className="text-muted-foreground">-</span>},
  {key:'tags',label:t('d.tags'),className:'min-w-32',render:p=>(p.tags||[]).length?<span className="text-primary">{p.tags.map(x=>'#'+x).join(' ')}</span>:<span className="text-muted-foreground">-</span>},
  {key:'acc',label:t('d.accounts'),className:'min-w-52',render:p=>{const a=(p.userIds||[]).map(x=>accMap[x]).filter(Boolean);return a.length?<ul className="space-y-1.5">{a.map(x=><li key={x.id} className="leading-tight">{x.name&&<span className="block font-medium">{x.name}</span>}<span className="block break-all text-xs text-muted-foreground">{x.email}</span></li>)}</ul>:<span className="text-muted-foreground">{t('item.noacc')}</span>}},
  {key:'date',label:t('d.created'),nowrap:true,render:p=>fmtDate(p,lang)}]
 return <DataTable columns={columns} rows={rows} selectable={selMode} isSelected={p=>sel.has(p.id)} onToggle={p=>onToggle(p.id)} onToggleAll={onToggleAll} allChecked={allChecked} someChecked={someChecked}
  onRowClick={selMode?p=>onToggle(p.id):undefined} actions={selMode?undefined:p=><Acts onEdit={()=>onEdit(p)} onDelete={()=>onDelete(p)}/>}/>}

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
 const grid='grid items-stretch gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3'
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
   :view==='list'?<ProjectTable rows={shown} accMap={accMap} selMode={selMode} sel={sel} onToggle={toggle} onToggleAll={()=>setSel(all?new Set():new Set(shown.map(p=>p.id)))} allChecked={all} someChecked={!!ids.length} onEdit={setDlg} onDelete={setAsk}/>
   :<div className={grid}>{shown.map((p,i)=><Item key={p.id} p={p} i={i} accMap={accMap} onEdit={setDlg} onDelete={setAsk} selMode={selMode} checked={sel.has(p.id)} onToggle={()=>toggle(p.id)}/>)}</div>}
  {!selMode&&<Fab onClick={()=>setDlg({})} label={t('dlg.addProject')}/>}
  {dlg&&<ProjectDialog init={dlg.id?dlg:null} onClose={()=>setDlg(null)}/>}
  {bulk==='status'&&<BulkStatus n={ids.length} busy={busy} onClose={()=>setBulk(null)} onApply={st=>run(()=>bulkStatus(ids,st),'b.done.status')}/>}
  {bulk==='delete'&&<Confirm title={t('b.delTitle',{n:ids.length})} message={t('b.del',{n:ids.length})} confirmLabel={t('delete')} busy={busy} onConfirm={()=>run(()=>bulkRemove(ids),'b.done.del')} onClose={()=>setBulk(null)}/>}
  {ask&&<Confirm title={t('c.title')} message={t('c.delProject',{name:ask.name})} confirmLabel={t('delete')} busy={busy} onConfirm={del} onClose={()=>setAsk(null)}/>}</>}
