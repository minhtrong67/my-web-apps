import {createContext,useCallback,useContext,useEffect,useState} from 'react'
import {FONTS} from './i18n'
const read=(s,k,d)=>{try{const v=s.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}}
function useStored(store,key,def){
 const [v,setV]=useState(()=>read(store,key,def))
 const set=useCallback(p=>setV(x=>{const n=typeof p==='function'?p(x):p;try{store.setItem(key,JSON.stringify(n))}catch{/* storage full/blocked */}return n}),[store,key])
 return [v,set]}
export const useSession=(k,d)=>useStored(sessionStorage,k,d)
export const useLocal=(k,d)=>useStored(localStorage,k,d)
export const V0P={q:'',status:'all',cat:'',sort:'new'}
export const V0A={q:'',part:'all',sort:'new'}
export const V0W={q:'',cat:'',sort:'new'}
export const V0R={q:'',cat:'',sort:'new'}
export const V0K={q:'',prov:'',sort:'new'}
export const DEF={mode:'system',lang:'vi',fs:16,accent:'indigo',font:'system',home:'projects/list'}
export const ACCENTS=['indigo','violet','sky','teal','emerald','amber','orange','rose']
export const SettingsCtx=createContext()
export const useSettings=()=>useContext(SettingsCtx)
// nạp Google Fonts khi người dùng chọn (chỉ font đang dùng), font hệ thống / Arial không cần tải
function applyFont(k){const f=FONTS[k]||FONTS.system,r=document.documentElement
 r.style.setProperty('--app-font',f.css)
 if(f.gf&&!document.getElementById('gf-'+k)){const l=document.createElement('link');l.id='gf-'+k;l.rel='stylesheet';l.href=`https://fonts.googleapis.com/css2?family=${f.gf}&display=swap`;document.head.appendChild(l)}}
export function useThemeEffect(s){
 useEffect(()=>{const mq=matchMedia('(prefers-color-scheme: dark)')
  const apply=()=>{const d=s.mode==='dark'||(s.mode==='system'&&mq.matches),r=document.documentElement
   r.classList.toggle('dark',d);r.dataset.accent=ACCENTS.includes(s.accent)?s.accent:'indigo';r.style.fontSize=s.fs+'px';r.lang=s.lang;r.style.background='';applyFont(s.font)
   // thanh trạng thái / thanh địa chỉ trên mobile khớp màu bề mặt của theme hiện tại
   const c=getComputedStyle(r).getPropertyValue('--md-surface').trim();c&&document.getElementById('tc')?.setAttribute('content',c)}
  apply();mq.addEventListener('change',apply);return()=>mq.removeEventListener('change',apply)},[s.mode,s.accent,s.fs,s.lang,s.font])}
let deferred=null
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;dispatchEvent(new Event('pt-install'))})
export function useInstall(){
 const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true
 const [,tick]=useState(0),[done,setDone]=useState(standalone)
 useEffect(()=>{const f=()=>tick(n=>n+1),a=()=>setDone(true);addEventListener('pt-install',f);addEventListener('appinstalled',a)
  return()=>{removeEventListener('pt-install',f);removeEventListener('appinstalled',a)}},[])
 return {done,canPrompt:!!deferred,ios:/iphone|ipad|ipod/i.test(navigator.userAgent),
  install:async()=>{if(!deferred)return;deferred.prompt();const r=await deferred.userChoice;deferred=null;if(r.outcome==='accepted')setDone(true);tick(n=>n+1)}}}
