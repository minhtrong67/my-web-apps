import {useEffect,useMemo,useState} from 'react'
import {Layers,Plus,Tag} from 'lucide-react'
import {useT} from '../i18n'
import {useData} from '../data'
import {Acts,Btn,Confirm,Cookie,Empty,Fab,PageHead,Skeleton,useToast} from '../ui'
import {CategoryDialog} from '../components/forms'

// Quản lý danh mục, dùng chung cho module Trang web (kind='website') và module Prompt (kind='prompt')
export default function Categories({kind,pending,setPending}){
 const {t}=useT(),toast=useToast(),d=useData(),web=kind==='website'
 const cats=web?d.wcats:d.pcats,items=web?d.websites:d.prompts,catOf=web?d.webCat:d.promptCat
 const [dlg,setDlg]=useState(null),[ask,setAsk]=useState(null),[busy,setBusy]=useState(false)
 useEffect(()=>{if(pending===(web?'wcategory':'pcategory')){setDlg({});setPending(null)}},[pending,setPending,web])
 const count=useMemo(()=>{const m={};(items||[]).forEach(i=>{const c=catOf(i);if(c)m[c.id]=(m[c.id]||0)+1});return m},[items,catOf])
 const uncat=(items||[]).filter(i=>!catOf(i)).length
 const del=async()=>{setBusy(true);try{await d.removeCategory(kind,ask.id);setAsk(null)}catch(e){toast(e.message,'error')}setBusy(false)}
 return <>
  <PageHead title={t('nav.categories')} sub={cats&&t('categories.count',{n:cats.length})} onAdd={()=>setDlg({})} addLabel={t('add')}/>
  {cats===null?<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><Skeleton n={6} className="h-24"/></div>
   :!cats.length?<Empty icon={Layers} text={t('categories.empty')} action={<Btn icon={Plus} onClick={()=>setDlg({})}>{t('add')}</Btn>}/>
   :<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {cats.map((c,i)=><article key={c.id} style={{animationDelay:`${Math.min(i,10)*30}ms`}} className="card card-hover anim-up flex items-center gap-3 p-4">
     <Cookie className={`cc-${c.color||'indigo'} size-12 text-[var(--cc)]`}><Tag className="size-5 text-white"/></Cookie>
     <div className="min-w-0 flex-1"><h3 className="truncate font-semibold">{c.name}</h3><p className="text-xs text-muted-foreground">{t('item.nitems',{n:count[c.id]||0})}</p></div>
     <Acts onEdit={()=>setDlg(c)} onDelete={()=>setAsk(c)}/></article>)}
    {uncat>0&&<article className="flex items-center gap-3 rounded-xl border border-dashed border-border p-4"><Cookie className="size-12 text-muted"><Tag className="size-5 text-muted-foreground"/></Cookie>
     <div className="min-w-0 flex-1"><h3 className="truncate font-semibold text-muted-foreground">{t('uncat')}</h3><p className="text-xs text-muted-foreground">{t('item.nitems',{n:uncat})}</p></div></article>}</div>}
  <Fab onClick={()=>setDlg({})} label={t('dlg.addCategory')}/>
  {dlg&&<CategoryDialog kind={kind} init={dlg.id?dlg:null} onClose={()=>setDlg(null)}/>}
  {ask&&<Confirm title={t('c.title')} message={t('c.delCategory',{name:ask.name,n:count[ask.id]||0})} confirmLabel={t('delete')} busy={busy} onConfirm={del} onClose={()=>setAsk(null)}/>}</>}
