import {useRef,useState} from 'react'
import {Check,Download,ExternalLink,LogOut,Monitor,Moon,RotateCcw,Smartphone,Sun,Upload,Palette,Database,UserRound,Info} from 'lucide-react'
import {signOut} from 'firebase/auth'
import {auth} from '../firebase'
import {FONTS,useT} from '../i18n'
import {MODS,ROUTES,normRoute} from '../routes'
import {useData} from '../data'
import {useInstall,useSettings} from '../hooks'
import {ACCENTS,normAccent,normFs} from '../accents'
import {dl} from '../io'
import {normalize,rec,useTransfer} from '../transfer'
import {useFormats} from '../components/Toolbar'
import {Accordion,Btn,Confirm,Cookie,Credit,Dropdown,ExportMenu,Segmented,useToast} from '../ui'
import SEED from '../seed-websites.json'

const Section=({icon:I,title,desc,children})=><section className="card p-5 md:p-6"><div className="mb-4 flex items-start gap-3"><Cookie className="size-11 text-secondary"><I className="size-5 text-secondary-foreground"/></Cookie>
 <div className="pt-0.5"><h2 className="text-lg font-medium leading-tight">{title}</h2>{desc&&<p className="mt-1 text-sm text-muted-foreground">{desc}</p>}</div></div>{children}</section>
const Row=({label,children})=><div className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><span className="text-sm font-medium">{label}</span>{children}</div>

function Transfer({type}){
 const {t}=useT(),data=useData(),items=data[type]
 const {busy,exportAs,importFile}=useTransfer(type,items),fileRef=useRef(),formats=useFormats()
 return <div className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
  <div><p className="text-sm font-medium">{t('nav.'+type)}</p><p className="text-xs text-muted-foreground ">{items?t(type+'.count',{n:items.length}):'…'}</p></div>
  <div className="flex gap-2"><input ref={fileRef} type="file" hidden accept=".csv,.json,.xlsx" onChange={e=>{const f=e.target.files[0];e.target.value='';f&&importFile(f)}}/>
   <Btn variant="outline" icon={Upload} disabled={busy} onClick={()=>fileRef.current.click()}>{t('import')}</Btn><ExportMenu formats={formats} onPick={exportAs} busy={busy}/></div></div>}

export default function Settings({user}){
 const {t}=useT(),toast=useToast(),{s,set,reset}=useSettings(),acc=normAccent(s.accent),cur=ACCENTS.find(a=>a.key===acc),fontKey=FONTS[s.font]?s.font:'system',inst=useInstall(),data=useData(),{projects,accounts,websites,prompts,wcats,pcats,accMap,webCat,promptCat,importRecords}=data
 const [busy,setBusy]=useState(false),[ask,setAsk]=useState(false),[out,setOut]=useState(false),[seeding,setSeeding]=useState(false),fileRef=useRef()
 const ready=projects&&accounts&&websites&&prompts&&wcats&&pcats
 const exportBackup=()=>{if(!ready)return
  dl(new Blob([JSON.stringify({app:'Personal Keep',version:3,exportedAt:new Date().toISOString(),accounts:accounts.map(rec.accounts),projects:projects.map(p=>rec.projects(p,accMap)),websites:websites.map(w=>rec.websites(w,webCat(w))),prompts:prompts.map(p=>rec.prompts(p,promptCat(p))),
   wcategories:wcats.map(c=>({name:c.name,color:c.color})),pcategories:pcats.map(c=>({name:c.name,color:c.color}))},null,2)],{type:'application/json'}),`personal-keep-backup-${new Date().toISOString().slice(0,10)}.json`);toast(t('x.exported'))}
 const seed=async()=>{setSeeding(true);try{toast(t('x.imported',{...await importRecords({websites:SEED}),skipped:0}))}catch(e){toast(t(e.message||'x.err'),'error')}setSeeding(false)}
 const importBackup=async file=>{setBusy(true)
  try{if(!file.name.toLowerCase().endsWith('.json'))throw new Error('x.badfile')
   const j=JSON.parse(await file.text()),a=normalize('accounts',j.accounts||[]),p=normalize('projects',j.projects||[]),w=normalize('websites',j.websites||[]),r=normalize('prompts',j.prompts||[]),cat=x=>(Array.isArray(x)?x:[]).filter(c=>c?.name).map(c=>({name:String(c.name).trim().slice(0,40),color:String(c.color||'indigo')}))
   if(!a.recs.length&&!p.recs.length&&!w.recs.length&&!r.recs.length)throw new Error('x.nodata')
   toast(t('x.imported',{...await importRecords({accounts:a.recs,projects:p.recs,websites:w.recs,prompts:r.recs,wcategories:cat(j.wcategories),pcategories:cat(j.pcategories)}),skipped:a.skipped+p.skipped+w.skipped+r.skipped}))}
  catch(e){toast(t(e.message||'x.err'),'error')}setBusy(false)}
 const modes=[['light',t('theme.light'),Sun],['dark',t('theme.dark'),Moon],['system',t('theme.system'),Monitor]]
 return <div className="mx-auto max-w-3xl space-y-5">
  <h1 className="mb-3 text-3xl font-semibold tracking-tight md:text-[2rem]">{t('nav.settings')}</h1>
  {!inst.done&&<section className="anim-up relative overflow-hidden rounded-2xl bg-primary-container p-6 text-on-primary-container">
   <Smartphone className="absolute -right-4 -top-4 size-36 rotate-12 text-primary/10"/>
   <div className="relative"><h2 className="text-xl font-semibold">{t('st.install')}</h2><p className="mt-1 max-w-md text-sm opacity-80">{t('st.install.desc')}</p>
    {inst.canPrompt?<button type="button" onClick={inst.install} className="btn btn-primary mt-4"><Download className="size-4"/>{t('st.install.btn')}</button>
     :<p className="mt-4 rounded-xl bg-primary/10 p-3 text-sm">{inst.ios?t('st.install.ios'):t('st.install.manual')}</p>}</div></section>}
  <Section icon={Palette} title={t('st.appearance')}>
   <div className="divide-y divide-border ">
    <Row label={t('st.theme')}><Segmented label="theme" value={s.mode} onChange={mode=>set({mode})} options={modes}/></Row>
    <Row label={t('st.lang')}><Segmented label="language" value={s.lang} onChange={l=>set({lang:l})} options={[['vi','Tiếng Việt'],['en','English']]}/></Row>
    <Row label={t('st.fontsize')}><Segmented label="font size" value={normFs(s.fs)} onChange={fs=>set({fs})} options={[[14,t('fs.s')],[16,t('fs.m')],[18,t('fs.l')]]}/></Row>
    <Accordion title={t('st.accent')} summary={<><span className="size-4 shrink-0 rounded-full" style={{background:cur.c}}/><span className="truncate">{cur[s.lang==='en'?'en':'vi']}</span></>}>
     <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">{ACCENTS.map(a=>{const on=a.key===acc;return <button key={a.key} type="button" aria-pressed={on} title={a[s.lang==='en'?'en':'vi']} onClick={()=>set({accent:a.key})}
      className={`flex flex-col items-center gap-2 rounded-2xl p-2 transition-[background-color,box-shadow,transform] duration-300 [transition-timing-function:var(--ease-spring)] hover:bg-accent active:scale-95 last:col-span-2 ${on?'bg-secondary ring-2 ring-primary':''}`}>
       <span className="grid h-12 w-full place-items-center rounded-xl" style={{background:a.bg}}><span className="grid size-8 place-items-center text-white transition-[border-radius] duration-300 [transition-timing-function:var(--ease-spring)]" style={{background:a.c,borderRadius:on?'32%':'9999px'}}>{on&&<Check className="size-4"/>}</span></span>
       <span className="max-w-full truncate text-xs font-medium">{a[s.lang==='en'?'en':'vi']}</span></button>})}</div></Accordion>
    <Accordion title={t('st.font')} summary={<span className="truncate" style={{fontFamily:FONTS[fontKey].css}}>{FONTS[fontKey].label||t('st.font.system')}</span>}>
     <Dropdown label={t('st.font')} placeholder="" value={fontKey} onChange={font=>set({font})} options={Object.entries(FONTS).map(([k,f])=>[k,f.label||t('st.font.system')])}/>
     <p className="-mt-2 rounded-xl bg-muted p-4 text-sm leading-relaxed">{t('st.font.preview')}</p></Accordion>
    <Row label={t('st.home')}><Dropdown compact className="w-64" placeholder="" value={normRoute(s.home)} onChange={home=>set({home})} options={ROUTES.map(r=>{const [m,sb]=r.split('/');return [r,m==='settings'?t('nav.settings'):`${t('mod.'+m)} › ${t(MODS[m].subs.find(x=>x[0]===sb)[1])}`]})}/></Row></div></Section>
  <Section icon={Database} title={t('st.data')} desc={t('st.data.desc')}>
   <input ref={fileRef} type="file" hidden accept=".json" onChange={e=>{const f=e.target.files[0];e.target.value='';f&&importBackup(f)}}/>
   <div className="divide-y divide-border"><Transfer type="projects"/><Transfer type="accounts"/><Transfer type="websites"/><Transfer type="prompts"/>
    <div className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="text-sm font-medium">{t('st.seed')}</p><p className="text-xs text-muted-foreground">{t('st.seed.desc',{n:SEED.length})}</p></div>
     <Btn variant="outline" icon={Download} loading={seeding} disabled={!websites} onClick={seed}>{t('add')}</Btn></div>
    <div className="flex flex-wrap items-center justify-between gap-3 pt-3"><p className="text-sm font-medium">JSON · {t('st.data')}</p>
     <div className="flex gap-2"><Btn variant="outline" icon={Upload} loading={busy} onClick={()=>fileRef.current.click()}>{t('import')}</Btn><Btn variant="outline" icon={Download} onClick={exportBackup} disabled={!ready}>{t('export')}</Btn></div></div></div></Section>
  <Section icon={RotateCcw} title={t('st.reset')} desc={t('st.reset.desc')}><Btn variant="danger-soft" icon={RotateCcw} onClick={()=>setAsk(true)} className="border border-destructive/30">{t('st.reset')}</Btn></Section>
  <Section icon={UserRound} title={t('st.account')}><div className="flex flex-wrap items-center justify-between gap-3"><span className="break-all text-sm">{user.email}</span>
   <Btn variant="outline" icon={LogOut} loading={out} onClick={async()=>{setOut(true);await signOut(auth);setOut(false)}}>{t('st.logout')}</Btn></div></Section>
  <Section icon={Info} title={t('st.about')}><p className="text-sm text-muted-foreground">Personal Keep · {t('st.version')} {__APP_VERSION__}</p><Credit className="mt-2"/>
   <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-secondary p-4 text-secondary-foreground"><p className="min-w-0 flex-1 text-sm">{t('st.landing.desc')}</p>
    <a href="/landing.html" target="_blank" rel="noopener noreferrer" className="btn btn-primary"><ExternalLink className="size-4"/>{t('st.landing')}</a></div></Section>
  {ask&&<Confirm danger={false} icon={RotateCcw} title={t('st.reset')} message={t('st.reset.desc')} confirmLabel={t('st.reset')} onClose={()=>setAsk(false)} onConfirm={()=>{reset();setAsk(false)}}/>}</div>}
