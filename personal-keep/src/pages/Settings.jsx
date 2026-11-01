import {useRef,useState} from 'react'
import {Check,Download,LogOut,Monitor,Moon,RotateCcw,Smartphone,Sun,Upload,Palette,Database,UserRound,Info} from 'lucide-react'
import {signOut} from 'firebase/auth'
import {auth} from '../firebase'
import {useT} from '../i18n'
import {useData} from '../data'
import {ACCENTS,useInstall,useSettings} from '../hooks'
import {dl} from '../io'
import {normalize,rec,useTransfer} from '../transfer'
import {useFormats} from '../components/Toolbar'
import {Btn,Confirm,Cookie,Credit,Dropdown,ExportMenu,Segmented,useToast} from '../ui'
import SEED from '../seed-websites.json'

// màu primary (tông 40) của từng bảng màu M3 Expressive, khớp theme.css
const SWATCH={indigo:'#4f52ba',violet:'#6a4ab3',sky:'#006591',teal:'#006b5f',emerald:'#006c49',amber:'#855300',orange:'#9d4300',rose:'#a43947'}
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
 const {t}=useT(),toast=useToast(),{s,set,reset}=useSettings(),inst=useInstall(),{projects,accounts,websites,accMap,importRecords}=useData()
 const [busy,setBusy]=useState(false),[ask,setAsk]=useState(false),[out,setOut]=useState(false),[seeding,setSeeding]=useState(false),fileRef=useRef()
 const exportBackup=()=>{if(!projects||!accounts||!websites)return
  dl(new Blob([JSON.stringify({app:'Personal Keep',version:2,exportedAt:new Date().toISOString(),accounts:accounts.map(rec.accounts),projects:projects.map(p=>rec.projects(p,accMap)),websites:websites.map(rec.websites)},null,2)],{type:'application/json'}),`personal-keep-backup-${new Date().toISOString().slice(0,10)}.json`);toast(t('x.exported'))}
 const seed=async()=>{setSeeding(true);try{toast(t('x.imported',{...await importRecords({websites:SEED}),skipped:0}))}catch(e){toast(t(e.message||'x.err'),'error')}setSeeding(false)}
 const importBackup=async file=>{setBusy(true)
  try{if(!file.name.toLowerCase().endsWith('.json'))throw new Error('x.badfile')
   const j=JSON.parse(await file.text()),a=normalize('accounts',j.accounts||[]),p=normalize('projects',j.projects||[]),w=normalize('websites',j.websites||[])
   if(!a.recs.length&&!p.recs.length&&!w.recs.length)throw new Error('x.nodata')
   toast(t('x.imported',{...await importRecords({accounts:a.recs,projects:p.recs,websites:w.recs}),skipped:a.skipped+p.skipped+w.skipped}))}
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
    <Row label={t('st.accent')}><div className="flex flex-wrap gap-2">{ACCENTS.map(c=><button key={c} type="button" title={t('accent.'+c)} aria-label={t('accent.'+c)} aria-pressed={s.accent===c} onClick={()=>set({accent:c})} style={{background:SWATCH[c]}}
     className={`grid size-10 place-items-center text-white transition-[border-radius,transform,box-shadow] duration-300 [transition-timing-function:var(--ease-spring)] active:scale-90 ${s.accent===c?'rounded-[14px] ring-2 ring-foreground ring-offset-2 ring-offset-card':'rounded-full'}`}>{s.accent===c&&<Check className="size-5"/>}</button>)}</div></Row>
    <div className="py-3"><Row label={`${t('st.fontsize')}: ${s.fs}px`}><input type="range" aria-label={t('st.fontsize')} min="14" max="20" step="1" value={s.fs} style={{'--p':`${(s.fs-14)/6*100}%`}} onChange={e=>set({fs:+e.target.value})} className="slider w-48"/></Row><p className="mt-2 text-sm text-muted-foreground ">{t('st.preview')}</p></div>
    <Row label={t('st.home')}><Dropdown compact className="w-48" label={undefined} placeholder="" value={s.home} onChange={home=>set({home})} options={['projects','accounts','websites','stats','settings'].map(k=>[k,t('nav.'+k)])}/></Row></div></Section>
  <Section icon={Database} title={t('st.data')} desc={t('st.data.desc')}>
   <input ref={fileRef} type="file" hidden accept=".json" onChange={e=>{const f=e.target.files[0];e.target.value='';f&&importBackup(f)}}/>
   <div className="divide-y divide-border"><Transfer type="projects"/><Transfer type="accounts"/><Transfer type="websites"/>
    <div className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="text-sm font-medium">{t('st.seed')}</p><p className="text-xs text-muted-foreground">{t('st.seed.desc',{n:SEED.length})}</p></div>
     <Btn variant="outline" icon={Download} loading={seeding} disabled={!websites} onClick={seed}>{t('add')}</Btn></div>
    <div className="flex flex-wrap items-center justify-between gap-3 pt-3"><p className="text-sm font-medium">JSON · {t('st.data')}</p>
     <div className="flex gap-2"><Btn variant="outline" icon={Upload} loading={busy} onClick={()=>fileRef.current.click()}>{t('import')}</Btn><Btn variant="outline" icon={Download} onClick={exportBackup} disabled={!projects||!accounts||!websites}>{t('export')}</Btn></div></div></div></Section>
  <Section icon={RotateCcw} title={t('st.reset')} desc={t('st.reset.desc')}><Btn variant="danger-soft" icon={RotateCcw} onClick={()=>setAsk(true)} className="border border-destructive/30">{t('st.reset')}</Btn></Section>
  <Section icon={UserRound} title={t('st.account')}><div className="flex flex-wrap items-center justify-between gap-3"><span className="break-all text-sm">{user.email}</span>
   <Btn variant="outline" icon={LogOut} loading={out} onClick={async()=>{setOut(true);await signOut(auth);setOut(false)}}>{t('st.logout')}</Btn></div></Section>
  <Section icon={Info} title={t('st.about')}><p className="text-sm text-muted-foreground">Personal Keep · {t('st.version')} {__APP_VERSION__}</p><Credit className="mt-2"/></Section>
  {ask&&<Confirm danger={false} title={t('st.reset')} message={t('st.reset.desc')} confirmLabel={t('st.reset')} onClose={()=>setAsk(false)} onConfirm={()=>{reset();setAsk(false);toast(t('st.reset.done'))}}/>}</div>}
