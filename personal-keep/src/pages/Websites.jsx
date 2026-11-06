import {memo,useDeferredValue,useEffect,useMemo,useState} from 'react'
import {Copy,Download,ExternalLink,Globe,Plus,SearchX} from 'lucide-react'
import {useT} from '../i18n'
import {useData,hostOf} from '../data'
import {useLocal,useSession,V0W} from '../hooks'
import {Acts,Btn,CardSkeleton,CatChip,Confirm,Cookie,DataTable,Empty,Fab,ItemCard,PageHead,useToast} from '../ui'
import Toolbar,{Chips} from '../components/Toolbar'
import {WebsiteDialog} from '../components/forms'
import SEED from '../seed-websites.json'

// Favicon lấy theo tên miền; lỗi mạng / offline thì rơi về chữ cái đầu
const Favicon=({url,name})=>{const [bad,setBad]=useState(false),host=hostOf(url)
 return <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary-container text-base font-semibold uppercase text-on-primary-container">
  {bad?(name||host)[0]:<img src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`} alt="" width="28" height="28" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={()=>setBad(true)} className="size-7 object-contain"/>}</span>}

const safeHref=u=>/^https?:\/\//i.test(u)?u:undefined
const copyLink=async(url,t,toast)=>{try{await navigator.clipboard.writeText(url);toast(t('web.copied'))}catch{toast(t('web.copyfail'),'error')}}
const linkActions=(w,t,toast,onEdit,onDelete)=><><button type="button" aria-label={t('item.copy')} title={t('item.copy')} onClick={()=>copyLink(w.url,t,toast)} className="icon-btn"><Copy className="size-4"/></button><Acts onEdit={()=>onEdit(w)} onDelete={()=>onDelete(w)}/></>

const Item=memo(function Item({w,cat,i,onEdit,onDelete}){
 const {t}=useT(),toast=useToast(),href=safeHref(w.url)
 return <ItemCard i={i} lead={<Favicon url={w.url} name={w.name}/>} title={w.name}
  sub={<a href={href} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="break-all text-primary hover:underline">{w.url}</a>} badge={<CatChip cat={cat}/>}
  who={<a href={href} target="_blank" rel="noopener noreferrer" className="btn btn-soft btn-sm !px-4"><ExternalLink className="size-4 shrink-0"/>{t('item.open')}</a>}
  actions={linkActions(w,t,toast,onEdit,onDelete)}>
  {w.desc&&<p className="whitespace-pre-line break-words text-sm text-muted-foreground">{w.desc}</p>}</ItemCard>})

function WebsiteTable({rows,webCat,onEdit,onDelete}){
 const {t}=useT(),toast=useToast(),dash=<span className="text-muted-foreground">-</span>
 const columns=[
  {key:'name',label:t('d.name'),className:'min-w-52',render:w=><div className="flex items-center gap-3"><Favicon url={w.url} name={w.name}/><span className="font-semibold">{w.name}</span></div>},
  {key:'url',label:t('d.link'),className:'min-w-64',render:w=><a href={safeHref(w.url)} target="_blank" rel="noopener noreferrer" className="break-all text-primary hover:underline">{w.url}</a>},
  {key:'cat',label:t('d.cat'),nowrap:true,render:w=><CatChip cat={webCat(w)}/>},
  {key:'desc',label:t('d.desc'),className:'min-w-56',render:w=>w.desc?<span className="whitespace-pre-line text-muted-foreground">{w.desc}</span>:dash}]
 return <DataTable columns={columns} rows={rows} actions={w=><><a href={safeHref(w.url)} target="_blank" rel="noopener noreferrer" aria-label={t('item.open')} title={t('item.open')} className="icon-btn"><ExternalLink className="size-4"/></a>{linkActions(w,t,toast,onEdit,onDelete)}</>}/>}

export default function Websites({pending,setPending}){
 const {t}=useT(),toast=useToast(),{websites,wcats,webCat,removeWebsite,importRecords}=useData()
 const [v,setV]=useSession('f:websites',V0W),[view,setView]=useLocal('view:websites','grid')
 const [dlg,setDlg]=useState(null),[ask,setAsk]=useState(null),[busy,setBusy]=useState(false),[seeding,setSeeding]=useState(false)
 const f={...V0W,...v},set=p=>setV({...f,...p}),dq=useDeferredValue(f.q)
 useEffect(()=>{if(pending==='website'){setDlg({});setPending(null)}},[pending,setPending])
 const shown=useMemo(()=>{if(!websites)return null;const s=dq.trim().toLowerCase()
  const r=websites.filter(w=>{const c=webCat(w);return (!f.cat||(f.cat==='none'?!c:c?.id===f.cat))&&(!s||[w.name,w.desc,w.url,c?.name].join(' ').toLowerCase().includes(s))})
  const cmp={old:(a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0)||(a.createdAt?.nanoseconds||0)-(b.createdAt?.nanoseconds||0),az:(a,b)=>a.name.localeCompare(b.name)}[f.sort]
  return cmp?[...r].sort(cmp):r},[websites,webCat,dq,f.cat,f.sort])
 const active=!!f.cat+(f.sort!=='new')
 const tags=[...(f.cat?[{k:'c',label:f.cat==='none'?t('uncat'):wcats?.find(c=>c.id===f.cat)?.name||'…',off:()=>set({cat:''})}]:[]),...(f.sort!=='new'?[{k:'o',label:t('sort.'+f.sort),off:()=>set({sort:'new'})}]:[])]
 const del=async()=>{setBusy(true);try{await removeWebsite(ask.id);setAsk(null)}catch(e){toast(e.message,'error')}setBusy(false)}
 const seed=async()=>{setSeeding(true);try{toast(t('x.imported',{...await importRecords({websites:SEED}),skipped:0}))}catch(e){toast(t(e.message||'x.err'),'error')}setSeeding(false)}
 const grid='grid items-stretch gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3'
 return <>
  <PageHead title={t('nav.websites')} sub={websites&&t('websites.count',{n:websites.length})} onAdd={()=>setDlg({})} addLabel={t('add')}/>
  <Toolbar ph={t('websites.search')} q={f.q} setQ={q=>set({q})} count={shown?.length} active={active} clear={()=>setV(V0W)} view={view} setView={setView} tags={tags}>
   <Chips label={t('flt.category')} value={f.cat} onChange={cat=>set({cat})} options={[['',t('all')],...(wcats||[]).map(c=>[c.id,c.name]),...((websites||[]).some(w=>!webCat(w))?[['none',t('uncat')]]:[])]}/>
   <Chips label={t('flt.sort')} value={f.sort} onChange={sort=>set({sort})} options={['new','old','az'].map(k=>[k,t('sort.'+k)])}/></Toolbar>
  {shown===null?<div className={grid}><CardSkeleton n={6} lines={3}/></div>
   :!websites.length?<div className="space-y-4">
     <section className="anim-up flex flex-col gap-4 rounded-2xl bg-primary-container p-5 text-on-primary-container sm:flex-row sm:items-center sm:p-6">
      <Cookie className="size-14 shrink-0 text-primary"><Globe className="size-6 text-primary-foreground"/></Cookie>
      <div className="min-w-0 flex-1"><h2 className="text-lg font-semibold">{t('web.seed.title',{n:SEED.length})}</h2><p className="mt-1 text-sm opacity-80">{t('web.seed.desc')}</p></div>
      <Btn icon={Download} loading={seeding} onClick={seed}>{t('web.seed.btn',{n:SEED.length})}</Btn></section>
     <Empty icon={Globe} text={t('websites.empty')} action={<Btn variant="soft" icon={Plus} onClick={()=>setDlg({})}>{t('add')}</Btn>}/></div>
   :!shown.length?<Empty icon={SearchX} text={t('noresult')}/>
   :view==='list'?<WebsiteTable rows={shown} webCat={webCat} onEdit={setDlg} onDelete={setAsk}/>
   :<div className={grid}>{shown.map((w,i)=><Item key={w.id} w={w} cat={webCat(w)} i={i} onEdit={setDlg} onDelete={setAsk}/>)}</div>}
  <Fab onClick={()=>setDlg({})} label={t('dlg.addWebsite')}/>
  {dlg&&<WebsiteDialog init={dlg.id?dlg:null} onClose={()=>setDlg(null)}/>}
  {ask&&<Confirm title={t('c.title')} message={t('c.delWebsite',{name:ask.name})} confirmLabel={t('delete')} busy={busy} onConfirm={del} onClose={()=>setAsk(null)}/>}</>}
