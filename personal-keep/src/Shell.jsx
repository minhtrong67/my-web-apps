import {lazy,Suspense,useEffect,useMemo,useRef,useState} from 'react'
import {Cog,Menu,Monitor,Moon,Plus,Search,Sun,X} from 'lucide-react'
import {useT} from './i18n'
import {V0A,V0P,V0R,V0W,useSettings} from './hooks'
import {DataProvider,useData} from './data'
import {MODS,MOD_KEYS,normRoute} from './routes'
import {ErrorBoundary,Logo,ScrollTop,Skeleton} from './ui'
import Projects from './pages/Projects'
import Accounts from './pages/Accounts'
// thử nạp lại module 1 lần khi lỗi mạng / dev server vừa tối ưu lại thư viện
const lazyPage=f=>lazy(()=>f().catch(()=>new Promise(r=>setTimeout(r,500)).then(f)))
const Stats=lazyPage(()=>import('./pages/Stats')),Websites=lazyPage(()=>import('./pages/Websites')),WebStats=lazyPage(()=>import('./pages/WebStats')),Categories=lazyPage(()=>import('./pages/Categories'))
const Prompts=lazyPage(()=>import('./pages/Prompts')),ApiKeys=lazyPage(()=>import('./pages/ApiKeys')),PromptStats=lazyPage(()=>import('./pages/PromptStats')),Settings=lazyPage(()=>import('./pages/Settings'))

const NAV=[...MOD_KEYS.map(k=>[k,MODS[k].icon,'mod.'+k]),['settings',Cog,'nav.settings']]
const MODES=[['system',Monitor],['light',Sun],['dark',Moon]]

function Palette({items,onClose}){
 const {t}=useT(),[q,setQ]=useState(''),[i,setI]=useState(0)
 const list=items.filter(x=>x.label.toLowerCase().includes(q.trim().toLowerCase())).slice(0,8),n=Math.max(list.length,1)
 useEffect(()=>{const k=e=>e.key==='Escape'&&onClose();addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[onClose])
 const run=x=>{onClose();x.run()}
 return <div className="anim-fade fixed inset-0 z-[60] flex items-start justify-center bg-black/55 px-4 pt-[12vh] backdrop-blur-[3px]" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
  <div role="dialog" aria-modal="true" className="anim-up w-full max-w-lg overflow-hidden rounded-2xl bg-popover text-popover-foreground shadow-xl">
   <div className="flex items-center gap-3 pl-5 pr-2"><Search className="size-5 text-muted-foreground"/>
    <input autoFocus value={q} placeholder={t('pal.ph')} aria-label={t('pal.ph')} onChange={e=>{setQ(e.target.value);setI(0)}} className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
     onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setI((i+1)%n)}else if(e.key==='ArrowUp'){e.preventDefault();setI((i+n-1)%n)}else if(e.key==='Enter'&&list[i])run(list[i])}}/>
    <button type="button" aria-label={t('close')} title={t('close')} onClick={onClose} className="icon-btn"><X className="size-5"/></button></div>
   <div className="max-h-80 overflow-auto border-t border-border p-2">{list.map((x,k)=>{const I=x.icon;return <button type="button" key={x.hint+x.label+k} onMouseEnter={()=>setI(k)} onClick={()=>run(x)}
    className={`flex h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-sm ${k===i?'bg-secondary text-secondary-foreground':''}`}><I className="size-5 shrink-0"/><span className="flex-1 truncate">{x.label}</span><span className="text-xs opacity-70">{x.hint}</span></button>})}
    {!list.length&&<p className="p-4 text-sm text-muted-foreground">{t('pal.none')}</p>}</div></div></div>}

function SideNav({mod,go,user,rail}){
 const {t}=useT(),lbl=rail?'hidden lg:inline':'',pad=rail?'md:justify-center md:px-0 lg:justify-start lg:px-5':''
 return <div className="flex h-full flex-col"><div className={`flex h-20 items-center gap-3 px-6 ${rail?'md:justify-center md:px-0 lg:justify-start lg:px-6':''}`}><Logo className="size-10"/><span className={`text-lg font-semibold tracking-tight ${lbl}`}>Personal Keep</span></div>
  <nav className="flex-1 space-y-1 px-3 py-2">{NAV.map(([k,I,l])=><button type="button" key={k} title={t(l)} onClick={()=>go(k)} aria-current={mod===k?'page':undefined} className={`nav-item ${pad} ${mod===k?'nav-active':''}`}><I className="size-6 shrink-0"/><span className={lbl}>{t(l)}</span></button>)}</nav>
  <div className={`p-5 ${rail?'hidden lg:block':''}`}><p className="truncate text-xs text-muted-foreground">{user.email}</p></div></div>}

// Tab con của module đang mở (Dự án / Tài khoản / Thống kê ...), cuộn ngang được trên mobile
function SubTabs({mod,sub,go}){
 const {t}=useT()
 return <div role="tablist" className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">{MODS[mod].subs.map(([k,l,I])=>{const on=sub===k
  return <button key={k} type="button" role="tab" aria-selected={on} onClick={()=>go(mod,k)} className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition-[background-color,color,transform] duration-300 active:scale-95 ${on?'bg-secondary text-secondary-foreground':'text-muted-foreground hover:bg-accent hover:text-foreground'}`}><I className="size-4"/>{t(l)}</button>})}</div>}

function Shell({user}){
 const {t}=useT(),{s,set}=useSettings(),{projects,accounts,websites,prompts}=useData()
 const [[mod,sub],setRoute]=useState(()=>normRoute(s.home).split('/')),[nonce,setNonce]=useState(0),[drawer,setDrawer]=useState(false),[pal,setPal]=useState(false),[pending,setPending]=useState(null)
 const go=(m,sb,reload)=>{setRoute([m,sb||(m==='settings'?'':MODS[m].subs[0][0])]);setDrawer(false);reload&&setNonce(n=>n+1);scrollTo({top:0,behavior:'instant'})}
 const mi=Math.max(0,MODES.findIndex(m=>m[0]===s.mode)),ModeIcon=MODES[mi][1],nextMode=()=>set({mode:MODES[(mi+1)%3][0]})
 // phím tắt: Ctrl+K tìm nhanh, N thêm mới ở trang hiện tại, / tới ô tìm kiếm (bỏ qua khi đang gõ hoặc đang mở dialog)
 const ADD={'projects/list':'project','projects/accounts':'account','websites/list':'website','websites/categories':'wcategory','prompts/list':'prompt','prompts/categories':'pcategory','prompts/keys':'key'}
 const routeRef=useRef();routeRef.current=`${mod}/${sub}`
 useEffect(()=>{const k=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setPal(p=>!p);return}
  const el=e.target;if(e.ctrlKey||e.metaKey||e.altKey||el.closest?.('input,textarea,select,[contenteditable=true]')||document.querySelector('[role=dialog]'))return
  if(e.key==='n'&&ADD[routeRef.current]){e.preventDefault();setPending(ADD[routeRef.current])}
  else if(e.key==='/'){const i=document.querySelector('input.search');if(i){e.preventDefault();i.focus()}}}
  addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[])
 const items=useMemo(()=>{const page=(m,sb,store,v0,q)=>()=>{store&&sessionStorage.setItem(store,JSON.stringify({...v0,q}));go(m,sb,!!store)},add=(m,sb,p)=>()=>{go(m,sb);setPending(p)}
  return [
  ...MOD_KEYS.flatMap(m=>MODS[m].subs.map(([sb,l,I])=>({label:`${t('mod.'+m)} › ${t(l)}`,hint:t('pal.page'),icon:I,run:page(m,sb)}))),
  {label:t('nav.settings'),hint:t('pal.page'),icon:Cog,run:()=>go('settings')},
  {label:t('pal.addProject'),hint:t('pal.action'),icon:Plus,run:add('projects','list','project')},{label:t('pal.addAccount'),hint:t('pal.action'),icon:Plus,run:add('projects','accounts','account')},
  {label:t('pal.addWebsite'),hint:t('pal.action'),icon:Plus,run:add('websites','list','website')},{label:t('pal.addPrompt'),hint:t('pal.action'),icon:Plus,run:add('prompts','list','prompt')},{label:t('pal.addKey'),hint:t('pal.action'),icon:Plus,run:add('prompts','keys','key')},
  {label:t('pal.theme'),hint:t('pal.action'),icon:Sun,run:nextMode},
  ...(projects||[]).map(p=>({label:p.name,hint:t('nav.projects'),icon:MODS.projects.subs[0][2],run:page('projects','list','f:projects',V0P,p.name)})),
  ...(accounts||[]).map(a=>({label:a.name||a.email,hint:t('nav.accounts'),icon:MODS.projects.subs[1][2],run:page('projects','accounts','f:accounts',V0A,a.email)})),
  ...(websites||[]).map(w=>({label:w.name,hint:t('nav.websites'),icon:MODS.websites.icon,run:page('websites','list','f:websites',V0W,w.name)})),
  ...(prompts||[]).map(p=>({label:p.title,hint:t('nav.prompts'),icon:MODS.prompts.icon,run:page('prompts','list','f:prompts',V0R,p.title)}))]},[t,projects,accounts,websites,prompts,s.mode])
 const iconBtn="icon-btn",P={pending,setPending},title=mod==='settings'?t('nav.settings'):t('mod.'+mod)
 const route=`${mod}/${sub}`
 return <div className="md:pl-[5.5rem] lg:pl-72">
  <aside className="fixed inset-y-0 left-0 z-30 hidden bg-sidebar text-sidebar-foreground md:block md:w-[5.5rem] lg:w-72"><SideNav rail mod={mod} go={go} user={user}/></aside>
  <header className="sticky top-0 z-30 bg-background/90 backdrop-blur"><div className="mx-auto flex h-16 max-w-[1520px] items-center gap-1 px-3 sm:px-5 lg:px-8">
   <button type="button" aria-label={t('menu.open')} title={t('menu.open')} onClick={()=>setDrawer(true)} className={`${iconBtn} md:hidden`}><Menu className="size-6"/></button>
   <span className="ml-1 flex-1 text-xl font-medium tracking-tight md:ml-0 lg:hidden">{title}</span><span className="hidden flex-1 lg:block"/>
   <button type="button" onClick={()=>setPal(true)} aria-label={t('search.title')} title={t('search.title')} className={`${iconBtn} md:hidden`}><Search className="size-5"/></button>
   <button type="button" onClick={()=>setPal(true)} className="hidden h-11 items-center gap-3 rounded-full bg-popover px-4 text-sm text-muted-foreground transition-colors hover:bg-card md:flex md:w-48 lg:w-80"><Search className="size-5"/><span className="min-w-0 flex-1 truncate text-left">{t('pal.ph').split('...')[0]}...</span><kbd className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium">Ctrl K</kbd></button>
   <button type="button" onClick={nextMode} aria-label={t('theme.now',{mode:t('theme.'+s.mode)})} title={t('theme.now',{mode:t('theme.'+s.mode)})} className={iconBtn}><ModeIcon className="size-5"/></button></div></header>
  <main className="mx-auto max-w-[1520px] px-4 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-3 sm:px-5 md:pb-12 md:pt-4 lg:px-8">
   {mod!=='settings'&&<SubTabs mod={mod} sub={sub} go={go}/>}
   <div key={`${route}-${nonce}`} className="anim-fade"><ErrorBoundary title={t('err.title')} retry={t('err.retry')} reload={t('err.reload')}><Suspense fallback={<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><Skeleton n={6} className="h-44"/></div>}>
    {route==='projects/list'&&<Projects {...P}/>}{route==='projects/accounts'&&<Accounts {...P}/>}{route==='projects/stats'&&<Stats/>}
    {route==='websites/list'&&<Websites {...P}/>}{route==='websites/categories'&&<Categories kind="website" {...P}/>}{route==='websites/stats'&&<WebStats/>}
    {route==='prompts/list'&&<Prompts {...P}/>}{route==='prompts/categories'&&<Categories kind="prompt" {...P}/>}{route==='prompts/keys'&&<ApiKeys {...P}/>}{route==='prompts/stats'&&<PromptStats/>}
    {mod==='settings'&&<Settings user={user}/>}</Suspense></ErrorBoundary></div></main>
  <ScrollTop/>
  {/* Navigation bar M3 Expressive: chỉ báo hình viên thuốc 64x32 bật lên có độ nảy */}
  <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 bg-sidebar pb-[env(safe-area-inset-bottom)] md:hidden">
   {NAV.map(([k,I,l])=>{const on=mod===k;return <button type="button" key={k} onClick={()=>go(k)} aria-current={on?'page':undefined} className={`flex h-20 flex-col items-center justify-center gap-1 pt-1 text-xs font-medium transition-colors ${on?'text-foreground':'text-muted-foreground'}`}>
    <span className="relative grid h-8 w-16 place-items-center">{on&&<i className="absolute inset-0 rounded-full bg-secondary [animation:indicator_.45s_var(--ease-spring)]"/>}<I className={`relative size-6 transition-colors ${on?'text-secondary-foreground':''}`}/></span>{t(l)}</button>})}</nav>
  <div className={`fixed inset-0 z-50 md:hidden ${drawer?'':'pointer-events-none'}`}>
   <div onClick={()=>setDrawer(false)} className={`absolute inset-0 bg-black/55 backdrop-blur-[3px] transition-opacity duration-300 ${drawer?'opacity-100':'opacity-0'}`}/>
   <aside inert={drawer?undefined:''} className={`absolute inset-y-0 left-0 w-80 max-w-[88%] rounded-r-2xl bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-[400ms] [transition-timing-function:var(--ease-emph)] ${drawer?'translate-x-0':'-translate-x-full'}`}>
    <button type="button" aria-label={t('close')} title={t('close')} onClick={()=>setDrawer(false)} className={`${iconBtn} absolute right-3 top-5`}><X className="size-5"/></button><SideNav mod={mod} go={go} user={user}/></aside></div>
  {pal&&<Palette items={items} onClose={()=>setPal(false)}/>}</div>}

export default function Authed({user}){return <DataProvider uid={user.uid}><Shell user={user}/></DataProvider>}
