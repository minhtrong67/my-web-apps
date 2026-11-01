import {useMemo,useState} from 'react'
import {Save,X} from 'lucide-react'
import {useT,STATUS_KEYS,CAT_KEYS,WCAT_KEYS,TOOLS,catKey,wcatKey,toolKey} from '../i18n'
import {useData,clean,normUrl,urlKey,EMAIL_RE} from '../data'
import {useLocal} from '../hooks'
import {Btn,Dialog,Dropdown,Field,Input,Textarea,useToast} from '../ui'

const TAG_RE=/^[\p{L}\p{N}._+-]{1,30}$/u
const SUGGEST=['react','vite','tailwind','firebase','typescript','nodejs','nextjs','python','tauri','supabase']
function TagInput({tags,setTags,toast,suggest}){
 const {t}=useT(),[v,setV]=useState(''),list=suggest.filter(s=>!tags.includes(s)).slice(0,10)
 const add=raw=>{const next=[...tags]
  for(const x of raw.split(/[\s,#]+/).map(i=>i.toLowerCase()).filter(Boolean)){
   if(!TAG_RE.test(x)){toast(t('e.tags.bad'),'error');continue}
   if(next.length>=10){toast(t('e.tags.max'),'error');break}
   if(!next.includes(x))next.push(x)}
  setTags(next);setV('')}
 return <div className="field up"><span className="lbl">{t('f.tags')}</span>
  <div className="flex min-h-14 flex-wrap items-center gap-2 rounded-md border border-input bg-transparent px-3 py-2 transition-[border-color,box-shadow] hover:border-foreground focus-within:!border-primary focus-within:ring-1 focus-within:ring-primary">
   {tags.map(x=><span key={x} className="anim-fade inline-flex h-8 items-center gap-1 rounded-lg bg-secondary pl-3 pr-1 text-sm font-medium text-secondary-foreground">#{x}
    <button type="button" aria-label={`${t('delete')} ${x}`} onClick={()=>setTags(tags.filter(i=>i!==x))} className="grid size-6 place-items-center rounded-full hover:bg-black/10 dark:hover:bg-white/10"><X className="size-3.5"/></button></span>)}
   <input value={v} placeholder={tags.length?t('f.tags.more'):t('f.tags.ph')} className="min-w-32 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground "
    onChange={e=>/[\s,]/.test(e.target.value)?add(e.target.value):setV(e.target.value.replace(/#/g,''))}
    onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();v&&add(v)}else if(e.key==='Backspace'&&!v&&tags.length)setTags(tags.slice(0,-1))}} onBlur={()=>v&&add(v)}/></div>
  {!!list.length&&<p className="mt-3 text-xs text-muted-foreground">{t('f.tags.recent')}</p>}<div className="mt-2 flex flex-wrap gap-2">{list.map(s=><button type="button" key={s} onClick={()=>tags.length<10&&setTags([...tags,s])} className="fchip !h-8 !px-2.5 !text-xs !font-normal text-muted-foreground">+ #{s}</button>)}</div></div>}

export function ProjectDialog({init,onClose}){
 const {t}=useT(),toast=useToast(),{projects,accounts,saveProject}=useData(),[recent,setRecent]=useLocal('recent-tags',[])
 const [f,setF]=useState({name:init?.name||'',desc:init?.desc||'',status:init?.status||'active',category:catKey(init?.category||'web'),tools:(init?.tools||[]).map(toolKey),userIds:(init?.userIds||[]).filter(id=>(accounts||[]).some(a=>a.id===id))})
 const [tags,setTags]=useState(init?.tags||[]),[busy,setBusy]=useState(false),[bad,setBad]=useState('')
 // gợi ý: hashtag dùng gần đây -> hashtag đã có trong các dự án -> gợi ý mặc định
 const suggest=useMemo(()=>[...new Set([...recent,...(projects||[]).flatMap(p=>p.tags||[]),...SUGGEST])],[recent,projects])
 const submit=async()=>{
  const name=clean(f.name),desc=f.desc.trim()
  const err=!name?['name','e.name.req']:name.length<2||name.length>80?['name','e.name.len']
   :(projects||[]).some(p=>p.id!==init?.id&&p.name.toLowerCase()===name.toLowerCase())?['name','e.name.dup']:desc.length>500?['desc','e.desc.len']:null
  if(err){setBad(err[0]);toast(t(err[1]),'error');return}
  setBusy(true)
  try{await saveProject({name,desc,status:f.status,category:f.category,tools:f.tools,tags,userIds:f.userIds},init?.id)
   setRecent([...new Set([...tags,...recent])].slice(0,30));toast(t('saved'));onClose()}
  catch(e){toast(e.message,'error');setBusy(false)}}
 return <Dialog full title={t(init?'dlg.editProject':'dlg.addProject')} onClose={onClose} footer={<>
  <Btn variant="ghost" icon={X} disabled={busy} onClick={onClose}>{t('cancel')}</Btn><Btn icon={Save} loading={busy} onClick={submit}>{t('save')}</Btn></>}>
  <Field label={t('f.pname')}><Input autoFocus invalid={bad==='name'} value={f.name} maxLength={120} placeholder={t('f.pname.ph')} onChange={e=>{setBad('');setF({...f,name:e.target.value})}} onKeyDown={e=>e.key==='Enter'&&submit()}/></Field>
  <Field label={t('f.desc')}><Textarea rows={3} invalid={bad==='desc'} value={f.desc} placeholder={t('f.desc.ph')} onChange={e=>{setBad('');setF({...f,desc:e.target.value})}}/><span className={`mt-1 block px-4 text-right text-xs tabular-nums ${f.desc.length>500?'text-destructive':'text-muted-foreground'}`}>{f.desc.length}/500</span></Field>
  <div className="grid gap-x-4 sm:grid-cols-2">
   <Dropdown label={t('f.status')} value={f.status} onChange={status=>setF({...f,status})} options={STATUS_KEYS.map(k=>[k,t('status.'+k)])}/>
   <Dropdown label={t('f.category')} value={f.category} onChange={category=>setF({...f,category})} options={CAT_KEYS.map(k=>[k,t('cat.'+k)])}/>
   <Dropdown multi label={t('f.tools')} placeholder={t('f.tools.ph')} value={f.tools} onChange={tools=>setF({...f,tools})} options={TOOLS.map(x=>[x,x==='Other'?t('other'):x])}/>
   <Dropdown multi label={t('f.accounts')} placeholder={t('f.accounts.ph')} value={f.userIds} onChange={userIds=>setF({...f,userIds})} options={(accounts||[]).map(a=>[a.id,a.name?`${a.name} · ${a.email}`:a.email])}/></div>
  {!accounts?.length&&<p className="-mt-3 mb-4 px-4 text-xs text-muted-foreground">{t('f.accounts.empty')}</p>}
  <TagInput tags={tags} setTags={setTags} toast={toast} suggest={suggest}/></Dialog>}

export function AccountDialog({init,onClose}){
 const {t}=useT(),toast=useToast(),{accounts,saveAccount}=useData()
 const [f,setF]=useState({name:init?.name||'',email:init?.email||'',note:init?.note||''}),[busy,setBusy]=useState(false),[bad,setBad]=useState('')
 const submit=async()=>{
  const name=clean(f.name),email=f.email.trim().toLowerCase(),note=f.note.trim()
  const err=!email?['email','e.email.req']:!EMAIL_RE.test(email)||email.length>100?['email','e.email.bad']
   :(accounts||[]).some(a=>a.id!==init?.id&&a.email.toLowerCase()===email)?['email','e.email.dup']:name.length>60?['name','e.aname.len']:note.length>200?['note','e.note.len']:null
  if(err){setBad(err[0]);toast(t(err[1]),'error');return}
  setBusy(true)
  try{await saveAccount({name,email,note},init?.id);toast(t('saved'));onClose()}catch(e){toast(e.message,'error');setBusy(false)}}
 return <Dialog title={t(init?'dlg.editAccount':'dlg.addAccount')} onClose={onClose} footer={<>
  <Btn variant="ghost" icon={X} disabled={busy} onClick={onClose}>{t('cancel')}</Btn><Btn icon={Save} loading={busy} onClick={submit}>{t('save')}</Btn></>}>
  <Field label={t('f.aname')}><Input autoFocus invalid={bad==='name'} value={f.name} placeholder={t('f.aname.ph')} onChange={e=>{setBad('');setF({...f,name:e.target.value})}}/></Field>
  <Field label={t('f.email')}><Input type="email" inputMode="email" invalid={bad==='email'} value={f.email} placeholder={t('f.email.ph')} onChange={e=>{setBad('');setF({...f,email:e.target.value})}} onKeyDown={e=>e.key==='Enter'&&submit()}/></Field>
  <Field label={t('f.note')}><Textarea rows={3} invalid={bad==='note'} value={f.note} placeholder={t('f.note.ph')} onChange={e=>{setBad('');setF({...f,note:e.target.value})}}/></Field></Dialog>}

export function WebsiteDialog({init,onClose}){
 const {t}=useT(),toast=useToast(),{websites,saveWebsite}=useData()
 const [f,setF]=useState({name:init?.name||'',url:init?.url||'',desc:init?.desc||'',category:wcatKey(init?.category||'tool')}),[busy,setBusy]=useState(false),[bad,setBad]=useState('')
 const submit=async()=>{
  const name=clean(f.name),url=normUrl(f.url),desc=f.desc.trim()
  const err=!name?['name','e.wname.req']:name.length>80?['name','e.wname.len']:!f.url.trim()?['url','e.url.req']:!url||url.length>500?['url','e.url.bad']
   :(websites||[]).some(w=>w.id!==init?.id&&urlKey(w.url)===urlKey(url))?['url','e.url.dup']:desc.length>500?['desc','e.desc.len']:null
  if(err){setBad(err[0]);toast(t(err[1]),'error');return}
  setBusy(true)
  try{await saveWebsite({name,url,category:f.category,desc},init?.id);toast(t('saved'));onClose()}catch(e){toast(e.message,'error');setBusy(false)}}
 return <Dialog title={t(init?'dlg.editWebsite':'dlg.addWebsite')} onClose={onClose} footer={<>
  <Btn variant="ghost" icon={X} disabled={busy} onClick={onClose}>{t('cancel')}</Btn><Btn icon={Save} loading={busy} onClick={submit}>{t('save')}</Btn></>}>
  <Field label={t('f.url')}><Input autoFocus type="url" inputMode="url" autoCapitalize="none" spellCheck={false} invalid={bad==='url'} value={f.url} maxLength={500} placeholder={t('f.url.ph')} onChange={e=>{setBad('');setF({...f,url:e.target.value})}} onKeyDown={e=>e.key==='Enter'&&submit()}/></Field>
  <Field label={t('f.wname')}><Input invalid={bad==='name'} value={f.name} maxLength={120} placeholder={t('f.wname.ph')} onChange={e=>{setBad('');setF({...f,name:e.target.value})}} onKeyDown={e=>e.key==='Enter'&&submit()}/></Field>
  <Dropdown label={t('f.wcat')} value={f.category} onChange={category=>setF({...f,category})} options={WCAT_KEYS.map(k=>[k,t('wcat.'+k)])}/>
  <Field label={t('f.wdesc')}><Textarea rows={3} invalid={bad==='desc'} value={f.desc} placeholder={t('f.wdesc.ph')} onChange={e=>{setBad('');setF({...f,desc:e.target.value})}}/><span className={`mt-1 block px-4 text-right text-xs tabular-nums ${f.desc.length>500?'text-destructive':'text-muted-foreground'}`}>{f.desc.length}/500</span></Field></Dialog>}
