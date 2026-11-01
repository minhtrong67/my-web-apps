import {lazy,Suspense,useEffect,useMemo,useState} from 'react'
import {onAuthStateChanged,signInWithPopup} from 'firebase/auth'
import {Loader2,LogIn} from 'lucide-react'
import {auth,provider,configured} from './firebase'
import {I18n,makeT,useT} from './i18n'
import {DEF,SettingsCtx,useLocal,useThemeEffect} from './hooks'
import {Btn,Credit,Logo,ToastProvider,useToast} from './ui'
const Authed=lazy(()=>import('./Shell'))
// Cùng markup/CSS với splash trong index.html (nền kế thừa từ <html>) nên chuyển cảnh không bị nháy hay nhảy layout
const Splash=()=><div className="splash"><img className="splash-logo" src="/favicon.svg" width="64" height="64" alt="Personal Keep"/></div>

function Gate(){
 const {t}=useT(),toast=useToast(),[user,setUser]=useState(undefined),[busy,setBusy]=useState(false)
 useEffect(()=>configured?onAuthStateChanged(auth,setUser):setUser(null),[])
 if(user===undefined)return <Splash/>
 if(user)return <Suspense fallback={<Splash/>}><Authed user={user}/></Suspense>
 return <div className="grid min-h-dvh place-items-center p-6" style={{backgroundImage:'radial-gradient(56rem 30rem at 50% -8%, color-mix(in oklab, var(--md-primary-container) 85%, transparent), transparent)'}}>
  <div className="anim-up w-full max-w-sm text-center">
   <Logo className="mx-auto mb-6 size-24"/><h1 className="text-4xl font-semibold tracking-tight">Personal Keep</h1><p className="mb-10 mt-3 text-base text-muted-foreground">{t('app.tagline')}</p>
   {configured?<Btn className="w-full !h-14 !text-base" icon={LogIn} loading={busy} onClick={async()=>{setBusy(true);try{await signInWithPopup(auth,provider)}catch(e){if(e.code!=='auth/popup-closed-by-user')toast(e.message,'error')}setBusy(false)}}>{t('login.btn')}</Btn>
    :<p className="rounded-xl bg-error-container p-4 text-sm text-on-error-container">{t('login.noconfig')}</p>}
   <Credit className="mt-10"/></div></div>}

export default function App(){
 const [stored,setStored]=useLocal('settings',DEF),s={...DEF,...stored}
 useThemeEffect(s)
 const ctx=useMemo(()=>({s,set:p=>setStored(x=>({...DEF,...x,...p})),reset:()=>setStored(DEF)}),[stored])
 const i18n=useMemo(()=>({t:makeT(s.lang),lang:s.lang}),[s.lang])
 return <SettingsCtx.Provider value={ctx}><I18n.Provider value={i18n}><ToastProvider><Gate/></ToastProvider></I18n.Provider></SettingsCtx.Provider>}
