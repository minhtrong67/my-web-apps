import {useMemo,useState} from 'react'
import {Eye,EyeOff,X} from 'lucide-react'
import {useT,STATUS_KEYS,CAT_KEYS,TOOLS,CAT_COLORS,PROVIDERS,catKey,toolKey} from '../i18n'
import {useData,clean,normUrl,urlKey,EMAIL_RE} from '../data'
import {useLocal} from '../hooks'
import {Dialog,Dropdown,Field,FormButtons,Input,Textarea,useSaveFlow,useToast} from '../ui'

const TAG_RE=/^[\p{L}\p{N}._+-]{1,30}$/u
const SUGGEST=['react','vite','tailwind','firebase','typescript','nodejs','nextjs','python','tauri','supabase']
export function TagInput({tags,setTags,toast,suggest}){
 const {t}=useT(),[v,setV]=useState(''),list=suggest.filter(s=>!tags.includes(s)).slice(0,10)
 const add=raw=>{const next=[...tags]
  for(const x of raw.split(/[\s,#]+/).map(i=>i.toLowerCase()).filter(Boolean)){
   if(!TAG_RE.test(x)){toast(t('e.tags.bad'),'warning');continue}
   if(next.length>=10){toast(t('e.tags.max'),'warning');break}
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

const counter=(n,max)=><span className={`mt-1 block px-4 text-right text-xs tabular-nums ${n>max?'text-destructive':'text-muted-foreground'}`}>{n.toLocaleString()}/{max.toLocaleString()}</span>
// hook dùng chung cho mọi form: kiểm tra -> (sửa thì xác nhận cập nhật) -> lưu -> đóng
function useForm({init,name,run,onClose}){
 const {t}=useT(),toast=useToast(),[busy,setBusy]=useState(false),[bad,setBad]=useState('')
 const fail=(field,key)=>{setBad(field);toast(t(key),'warning');return null}
 const flow=useSaveFlow({edit:!!init,name,check:()=>run.check(fail),save:async d=>{setBusy(true);try{await run.save(d);onClose()}catch(e){toast(e.message,'error');setBusy(false)}}})
 return {t,toast,busy,bad,setBad,flow,footer:<FormButtons busy={busy} edit={!!init} onClose={onClose} onSave={flow.go}/>}}

export function ProjectDialog({init,onClose}){
 const {projects,accounts,saveProject}=useData(),[recent,setRecent]=useLocal('recent-tags',[])
 const [f,setF]=useState({name:init?.name||'',desc:init?.desc||'',status:init?.status||'active',category:catKey(init?.category||'web'),tools:(init?.tools||[]).map(toolKey),userIds:(init?.userIds||[]).filter(id=>(accounts||[]).some(a=>a.id===id))})
 const [tags,setTags]=useState(init?.tags||[])
 // gợi ý: hashtag dùng gần đây -> hashtag đã có trong các dự án -> gợi ý mặc định
 const suggest=useMemo(()=>[...new Set([...recent,...(projects||[]).flatMap(p=>p.tags||[]),...SUGGEST])],[recent,projects])
 const {t,toast,bad,setBad,flow,footer}=useForm({init,name:init?.name,onClose,run:{
  check:fail=>{const name=clean(f.name),desc=f.desc.trim()
   if(!name)return fail('name','e.name.req');if(name.length<2||name.length>80)return fail('name','e.name.len')
   if((projects||[]).some(p=>p.id!==init?.id&&p.name.toLowerCase()===name.toLowerCase()))return fail('name','e.name.dup')
   if(desc.length>500)return fail('desc','e.desc.len')
   return {name,desc,status:f.status,category:f.category,tools:f.tools,tags,userIds:f.userIds}},
  save:async d=>{await saveProject(d,init?.id);setRecent([...new Set([...tags,...recent])].slice(0,30))}}})
 return <Dialog full title={t(init?'dlg.editProject':'dlg.addProject')} onClose={onClose} footer={footer}>
  <Field label={t('f.pname')}><Input autoFocus invalid={bad==='name'} value={f.name} maxLength={120} placeholder={t('f.pname.ph')} onChange={e=>{setBad('');setF({...f,name:e.target.value})}} onKeyDown={e=>e.key==='Enter'&&flow.go()}/></Field>
  <Field label={t('f.desc')}><Textarea rows={3} invalid={bad==='desc'} value={f.desc} placeholder={t('f.desc.ph')} onChange={e=>{setBad('');setF({...f,desc:e.target.value})}}/>{counter(f.desc.length,500)}</Field>
  <div className="grid gap-x-4 sm:grid-cols-2">
   <Dropdown label={t('f.status')} value={f.status} onChange={status=>setF({...f,status})} options={STATUS_KEYS.map(k=>[k,t('status.'+k)])}/>
   <Dropdown label={t('f.category')} value={f.category} onChange={category=>setF({...f,category})} options={CAT_KEYS.map(k=>[k,t('cat.'+k)])}/>
   <Dropdown multi label={t('f.tools')} placeholder={t('f.tools.ph')} value={f.tools} onChange={tools=>setF({...f,tools})} options={TOOLS.map(x=>[x,x==='Other'?t('other'):x])}/>
   <Dropdown multi label={t('f.accounts')} placeholder={t('f.accounts.ph')} value={f.userIds} onChange={userIds=>setF({...f,userIds})} options={(accounts||[]).map(a=>[a.id,a.name?`${a.name} · ${a.email}`:a.email])}/></div>
  {!accounts?.length&&<p className="-mt-3 mb-4 px-4 text-xs text-muted-foreground">{t('f.accounts.empty')}</p>}
  <TagInput tags={tags} setTags={setTags} toast={toast} suggest={suggest}/>{flow.node}</Dialog>}

export function AccountDialog({init,onClose}){
 const {accounts,saveAccount}=useData()
 const [f,setF]=useState({name:init?.name||'',email:init?.email||'',note:init?.note||''})
 const {t,bad,setBad,flow,footer}=useForm({init,name:init?.name||init?.email,onClose,run:{
  check:fail=>{const name=clean(f.name),email=f.email.trim().toLowerCase(),note=f.note.trim()
   if(!email)return fail('email','e.email.req');if(!EMAIL_RE.test(email)||email.length>100)return fail('email','e.email.bad')
   if((accounts||[]).some(a=>a.id!==init?.id&&a.email.toLowerCase()===email))return fail('email','e.email.dup')
   if(name.length>60)return fail('name','e.aname.len');if(note.length>200)return fail('note','e.note.len')
   return {name,email,note}},save:d=>saveAccount(d,init?.id)}})
 return <Dialog title={t(init?'dlg.editAccount':'dlg.addAccount')} onClose={onClose} footer={footer}>
  <Field label={t('f.aname')}><Input autoFocus invalid={bad==='name'} value={f.name} placeholder={t('f.aname.ph')} onChange={e=>{setBad('');setF({...f,name:e.target.value})}}/></Field>
  <Field label={t('f.email')}><Input type="email" inputMode="email" invalid={bad==='email'} value={f.email} placeholder={t('f.email.ph')} onChange={e=>{setBad('');setF({...f,email:e.target.value})}} onKeyDown={e=>e.key==='Enter'&&flow.go()}/></Field>
  <Field label={t('f.note')}><Textarea rows={3} invalid={bad==='note'} value={f.note} placeholder={t('f.note.ph')} onChange={e=>{setBad('');setF({...f,note:e.target.value})}}/></Field>{flow.node}</Dialog>}

const catOptions=(cats,t)=>[['',t('uncat')],...(cats||[]).map(c=>[c.id,c.name])]

export function WebsiteDialog({init,onClose}){
 const {websites,wcats,webCat,saveWebsite}=useData()
 const [f,setF]=useState({name:init?.name||'',url:init?.url||'',desc:init?.desc||'',category:init?webCat(init)?.id||'':wcats?.[0]?.id||''})
 const {t,bad,setBad,flow,footer}=useForm({init,name:init?.name,onClose,run:{
  check:fail=>{const name=clean(f.name),url=normUrl(f.url),desc=f.desc.trim()
   if(!name)return fail('name','e.wname.req');if(name.length>80)return fail('name','e.wname.len')
   if(!f.url.trim())return fail('url','e.url.req');if(!url||url.length>500)return fail('url','e.url.bad')
   if((websites||[]).some(w=>w.id!==init?.id&&urlKey(w.url)===urlKey(url)))return fail('url','e.url.dup')
   if(desc.length>500)return fail('desc','e.desc.len')
   return {name,url,category:f.category,desc}},save:d=>saveWebsite(d,init?.id)}})
 return <Dialog title={t(init?'dlg.editWebsite':'dlg.addWebsite')} onClose={onClose} footer={footer}>
  <Field label={t('f.url')}><Input autoFocus type="url" inputMode="url" autoCapitalize="none" spellCheck={false} invalid={bad==='url'} value={f.url} maxLength={500} placeholder={t('f.url.ph')} onChange={e=>{setBad('');setF({...f,url:e.target.value})}} onKeyDown={e=>e.key==='Enter'&&flow.go()}/></Field>
  <Field label={t('f.wname')}><Input invalid={bad==='name'} value={f.name} maxLength={120} placeholder={t('f.wname.ph')} onChange={e=>{setBad('');setF({...f,name:e.target.value})}} onKeyDown={e=>e.key==='Enter'&&flow.go()}/></Field>
  <Dropdown label={t('f.wcat')} placeholder={t('uncat')} value={f.category} onChange={category=>setF({...f,category})} options={catOptions(wcats,t)}/>
  <Field label={t('f.wdesc')}><Textarea rows={3} invalid={bad==='desc'} value={f.desc} placeholder={t('f.wdesc.ph')} onChange={e=>{setBad('');setF({...f,desc:e.target.value})}}/>{counter(f.desc.length,500)}</Field>{flow.node}</Dialog>}

// kind: 'website' | 'prompt'
export function CategoryDialog({kind,init,onClose}){
 const {wcats,pcats,saveCategory}=useData(),list=(kind==='website'?wcats:pcats)||[]
 const [f,setF]=useState({name:init?.name||'',color:init?.color||CAT_COLORS[list.length%CAT_COLORS.length]})
 const {t,bad,setBad,flow,footer}=useForm({init,name:init?.name,onClose,run:{
  check:fail=>{const name=clean(f.name)
   if(!name)return fail('name','e.cname.req');if(name.length>40)return fail('name','e.cname.len')
   if(list.some(c=>c.id!==init?.id&&c.name.toLowerCase()===name.toLowerCase()))return fail('name','e.cname.dup')
   return {name,color:f.color}},save:d=>saveCategory(kind,d,init?.id)}})
 return <Dialog title={t(init?'dlg.editCategory':'dlg.addCategory')} onClose={onClose} footer={footer}>
  <Field label={t('f.cname')}><Input autoFocus invalid={bad==='name'} value={f.name} maxLength={60} placeholder={t('f.cname.ph')} onChange={e=>{setBad('');setF({...f,name:e.target.value})}} onKeyDown={e=>e.key==='Enter'&&flow.go()}/></Field>
  <p className="mb-2.5 text-xs font-medium tracking-wide text-muted-foreground">{t('f.ccolor')}</p>
  <div className="mb-2 flex flex-wrap gap-2">{CAT_COLORS.map(c=><button key={c} type="button" title={t('accent.'+c)} aria-label={t('accent.'+c)} aria-pressed={f.color===c} onClick={()=>setF({...f,color:c})}
   className={`cc-${c} grid size-10 place-items-center bg-[var(--cc)] text-white transition-[border-radius,transform,box-shadow] duration-300 [transition-timing-function:var(--ease-spring)] active:scale-90 ${f.color===c?'rounded-[14px] ring-2 ring-foreground ring-offset-2 ring-offset-popover':'rounded-full'}`}>{f.color===c&&<span className="size-2 rounded-full bg-white"/>}</button>)}</div>
  <p className="mt-4"><span className={`cchip cc-${f.color}`}><i className="size-2 shrink-0 rounded-full bg-current opacity-70"/>{clean(f.name)||t('f.cname.ph')}</span></p>{flow.node}</Dialog>}

export function PromptDialog({init,onClose}){
 const {prompts,pcats,promptCat,savePrompt}=useData(),[recent,setRecent]=useLocal('recent-ptags',[])
 const [f,setF]=useState({title:init?.title||'',content:init?.content||'',category:init?promptCat(init)?.id||'':pcats?.[0]?.id||''}),[tags,setTags]=useState(init?.tags||[])
 const suggest=useMemo(()=>[...new Set([...recent,...(prompts||[]).flatMap(p=>p.tags||[])])],[recent,prompts])
 const {t,toast,bad,setBad,flow,footer}=useForm({init,name:init?.title,onClose,run:{
  check:fail=>{const title=clean(f.title),content=f.content.trim()
   if(!title)return fail('title','e.ptitle.req');if(title.length<2||title.length>100)return fail('title','e.ptitle.len')
   if((prompts||[]).some(p=>p.id!==init?.id&&p.title.toLowerCase()===title.toLowerCase()))return fail('title','e.ptitle.dup')
   if(!content)return fail('content','e.content.req');if(content.length>10000)return fail('content','e.content.len')
   return {title,content,category:f.category,tags}},
  save:async d=>{await savePrompt(d,init?.id);setRecent([...new Set([...tags,...recent])].slice(0,30))}}})
 return <Dialog full title={t(init?'dlg.editPrompt':'dlg.addPrompt')} onClose={onClose} footer={footer}>
  <Field label={t('f.ptitle')}><Input autoFocus invalid={bad==='title'} value={f.title} maxLength={140} placeholder={t('f.ptitle.ph')} onChange={e=>{setBad('');setF({...f,title:e.target.value})}}/></Field>
  <Dropdown label={t('f.pcat')} placeholder={t('uncat')} value={f.category} onChange={category=>setF({...f,category})} options={catOptions(pcats,t)}/>
  <Field label={t('f.content')}><Textarea rows={12} invalid={bad==='content'} value={f.content} placeholder={t('f.content.ph')} onChange={e=>{setBad('');setF({...f,content:e.target.value})}}/>{counter(f.content.length,10000)}</Field>
  <TagInput tags={tags} setTags={setTags} toast={toast} suggest={suggest}/>{flow.node}</Dialog>}

export function KeyDialog({init,onClose}){
 const {apikeys,saveKey}=useData(),[show,setShow]=useState(false)
 const [f,setF]=useState({name:init?.name||'',provider:init?.provider||'OpenAI',key:init?.key||'',note:init?.note||''})
 const {t,bad,setBad,flow,footer}=useForm({init,name:init?.name,onClose,run:{
  check:fail=>{const name=clean(f.name),key=f.key.trim(),note=f.note.trim()
   if(!name)return fail('name','e.kname.req');if(name.length>60)return fail('name','e.kname.len')
   if(!key)return fail('key','e.key.req');if(key.length>500||/\s/.test(key))return fail('key','e.key.len')
   if((apikeys||[]).some(k=>k.id!==init?.id&&k.key===key))return fail('key','e.key.dup')
   if(note.length>200)return fail('note','e.note.len')
   return {name,provider:f.provider,key,note}},save:d=>saveKey(d,init?.id)}})
 return <Dialog title={t(init?'dlg.editKey':'dlg.addKey')} onClose={onClose} footer={footer}>
  <Field label={t('f.kname')}><Input autoFocus invalid={bad==='name'} value={f.name} maxLength={80} placeholder={t('f.kname.ph')} onChange={e=>{setBad('');setF({...f,name:e.target.value})}}/></Field>
  <Dropdown label={t('f.provider')} value={f.provider} onChange={provider=>setF({...f,provider})} options={PROVIDERS.map(p=>[p,p==='Other'?t('other'):p])}/>
  <Field label={t('f.key')}><div className="relative"><Input type={show?'text':'password'} autoComplete="off" spellCheck={false} invalid={bad==='key'} value={f.key} maxLength={520} className="pr-12 font-mono" placeholder={t('f.key.ph')} onChange={e=>{setBad('');setF({...f,key:e.target.value})}} onKeyDown={e=>e.key==='Enter'&&flow.go()}/>
   <button type="button" aria-label={t(show?'hide':'reveal')} title={t(show?'hide':'reveal')} onClick={()=>setShow(!show)} className="icon-btn absolute right-2 top-1/2 -translate-y-1/2">{show?<EyeOff className="size-5"/>:<Eye className="size-5"/>}</button></div></Field>
  <Field label={t('f.knote')}><Textarea rows={2} invalid={bad==='note'} value={f.note} placeholder={t('f.knote.ph')} onChange={e=>{setBad('');setF({...f,note:e.target.value})}}/></Field>{flow.node}</Dialog>}
