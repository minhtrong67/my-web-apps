import {createContext,useContext,useEffect,useMemo,useState} from 'react'
import {collection,onSnapshot,addDoc,setDoc,doc,deleteDoc,writeBatch,arrayRemove,serverTimestamp,Timestamp,query,orderBy} from 'firebase/firestore'
import {getFirestore,initializeFirestore,persistentLocalCache,persistentMultipleTabManager} from 'firebase/firestore'
import {app} from './firebase'
// cache IndexedDB: mở lại app là có dữ liệu ngay, dùng được cả khi mất mạng
let db
try{db=initializeFirestore(app,{localCache:persistentLocalCache({tabManager:persistentMultipleTabManager()})})}catch{db=getFirestore(app)}
const Ctx=createContext()
export const useData=()=>useContext(Ctx)
export const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// Chuẩn hoá đường dẫn: tự thêm https:// nếu thiếu, chỉ nhận http/https (chặn javascript:, data:...)
export const normUrl=raw=>{let u=String(raw??'').trim();if(!u||/\s/.test(u))return ''
 if(!/^[a-z][a-z0-9+.-]*:\/\//i.test(u)){if(/^[a-z][a-z0-9+.-]*:/i.test(u)&&!/^[^/]+:\d+(\/|$)/.test(u))return '';u='https://'+u}
 try{const x=new URL(u);return /^https?:$/.test(x.protocol)&&x.hostname.includes('.')?x.href:''}catch{return ''}}
export const urlKey=u=>normUrl(u).toLowerCase().replace(/\/$/,'')
export const hostOf=u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch{return u||''}}
export const clean=s=>String(s??'').replace(/\s+/g,' ').trim()
const sub=(uid,name,set)=>onSnapshot(query(collection(db,'users',uid,name),orderBy('createdAt','desc')),s=>set(s.docs.map(d=>({id:d.id,...d.data()}))),e=>{console.error(e);set([])})
export function DataProvider({uid,children}){
 const [projects,setP]=useState(null),[accounts,setA]=useState(null),[websites,setW]=useState(null)
 useEffect(()=>sub(uid,'projects',setP),[uid]);useEffect(()=>sub(uid,'accounts',setA),[uid]);useEffect(()=>sub(uid,'websites',setW),[uid])
 const accMap=useMemo(()=>Object.fromEntries((accounts||[]).map(a=>[a.id,a])),[accounts])
 const col=n=>collection(db,'users',uid,n)
 const put=(type,data,id)=>id?setDoc(doc(col(type),id),data,{merge:true}):addDoc(col(type),{...data,createdAt:serverTimestamp()})
 const removeProject=id=>deleteDoc(doc(col('projects'),id))
 const removeWebsite=id=>deleteDoc(doc(col('websites'),id))
 const removeAccount=async id=>{const b=writeBatch(db);b.delete(doc(col('accounts'),id))
  projects.filter(p=>p.userIds?.includes(id)).forEach(p=>b.update(doc(col('projects'),p.id),{userIds:arrayRemove(id)}));await b.commit()}
 // Upsert: trùng email (tài khoản) / trùng tên (dự án) / trùng đường dẫn (trang web) thì ghi đè, không tạo bản sao
 const importRecords=async({accounts:ra=[],projects:rp=[],websites:rw=[]})=>{
  if(ra.length+rp.length*2+rw.length>450)throw new Error('x.max')
  const b=writeBatch(db),st={added:0,updated:0}
  const e2id=Object.fromEntries((accounts||[]).map(a=>[a.email.toLowerCase(),a.id]))
  ra.forEach(r=>{const k=r.email.toLowerCase()
   if(e2id[k]){b.set(doc(col('accounts'),e2id[k]),r,{merge:true});st.updated++}
   else{const ref=doc(col('accounts'));b.set(ref,{...r,createdAt:serverTimestamp()});e2id[k]=ref.id;st.added++}})
  const n2id=Object.fromEntries((projects||[]).map(p=>[p.name.toLowerCase(),p.id]))
  rp.forEach(({accounts:em=[],...r})=>{
   const userIds=[...new Set(em.map(e=>{const k=e.toLowerCase()
    if(!e2id[k]){const ref=doc(col('accounts'));b.set(ref,{name:'',email:e,note:'',createdAt:serverTimestamp()});e2id[k]=ref.id;st.added++}return e2id[k]}))]
   const k=r.name.toLowerCase()
   if(n2id[k]){b.set(doc(col('projects'),n2id[k]),{...r,userIds},{merge:true});st.updated++}
   else{const ref=doc(col('projects'));b.set(ref,{...r,userIds,createdAt:serverTimestamp()});n2id[k]=ref.id;st.added++}})
  // trang web: giữ đúng thứ tự trong file (dòng đầu = mới nhất) bằng cách lệch createdAt từng mili giây
  const u2id=Object.fromEntries((websites||[]).map(w=>[urlKey(w.url),w.id])),t0=Date.now()
  rw.forEach((r,i)=>{const k=urlKey(r.url)
   if(u2id[k]){b.set(doc(col('websites'),u2id[k]),r,{merge:true});st.updated++}
   else{const ref=doc(col('websites'));b.set(ref,{...r,createdAt:Timestamp.fromMillis(t0-i)});u2id[k]=ref.id;st.added++}})
  await b.commit();return st}
 return <Ctx.Provider value={{projects,accounts,websites,accMap,saveProject:(d,id)=>put('projects',d,id),saveAccount:(d,id)=>put('accounts',d,id),saveWebsite:(d,id)=>put('websites',d,id),removeProject,removeAccount,removeWebsite,importRecords}}>{children}</Ctx.Provider>}
