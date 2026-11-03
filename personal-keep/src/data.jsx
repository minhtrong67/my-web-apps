import {createContext,useContext,useEffect,useMemo,useRef,useState} from 'react'
import {collection,onSnapshot,addDoc,setDoc,doc,deleteDoc,writeBatch,arrayRemove,serverTimestamp,Timestamp,query,orderBy} from 'firebase/firestore'
import {getFirestore,initializeFirestore,persistentLocalCache,persistentMultipleTabManager} from 'firebase/firestore'
import {app} from './firebase'
import {DICT,useT,WCAT_KEYS,PCAT_KEYS,WCAT_COLORS,PCAT_COLORS,CAT_COLORS,wcatMatch,pcatMatch} from './i18n'
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
// danh mục: sắp theo thời điểm tạo tăng dần; ready=true khi dữ liệu đã được server xác nhận (tránh tạo mặc định nhầm khi cache còn rỗng)
const subCat=(uid,name,set,ready)=>onSnapshot(query(collection(db,'users',uid,name),orderBy('createdAt')),s=>{set(s.docs.map(d=>({id:d.id,...d.data()})));if(!s.metadata.fromCache)ready(true)},e=>{console.error(e);set([])})
const CATS={website:{col:'wcategories',keys:WCAT_KEYS,pre:'wcat.',colors:WCAT_COLORS,match:wcatMatch},prompt:{col:'pcategories',keys:PCAT_KEYS,pre:'pcat.',colors:PCAT_COLORS,match:pcatMatch}}
const lookup=list=>{const id=Object.fromEntries((list||[]).map(c=>[c.id,c])),key=Object.fromEntries((list||[]).filter(c=>c.key).map(c=>[c.key,c])),name=Object.fromEntries((list||[]).map(c=>[c.name.toLowerCase(),c]))
 return it=>{const v=it?.category;return v?id[v]||key[v]||name[String(v).toLowerCase()]||null:null}}
const chunk=(a,n=400)=>Array.from({length:Math.ceil(a.length/n)},(_,i)=>a.slice(i*n,i*n+n))
export function DataProvider({uid,children}){
 const {lang}=useT()
 const [projects,setP]=useState(null),[accounts,setA]=useState(null),[websites,setW]=useState(null),[prompts,setPr]=useState(null),[apikeys,setK]=useState(null),[wcats,setWC]=useState(null),[pcats,setPC]=useState(null),[ready,setReady]=useState({website:false,prompt:false}),seeded=useRef({})
 useEffect(()=>sub(uid,'projects',setP),[uid]);useEffect(()=>sub(uid,'accounts',setA),[uid]);useEffect(()=>sub(uid,'websites',setW),[uid]);useEffect(()=>sub(uid,'prompts',setPr),[uid]);useEffect(()=>sub(uid,'apikeys',setK),[uid])
 useEffect(()=>subCat(uid,'wcategories',setWC,()=>setReady(r=>({...r,website:true}))),[uid]);useEffect(()=>subCat(uid,'pcategories',setPC,()=>setReady(r=>({...r,prompt:true}))),[uid])
 const accMap=useMemo(()=>Object.fromEntries((accounts||[]).map(a=>[a.id,a])),[accounts])
 const webCat=useMemo(()=>lookup(wcats),[wcats]),promptCat=useMemo(()=>lookup(pcats),[pcats])
 const col=n=>collection(db,'users',uid,n)
 // lần đầu mở module: tạo sẵn các danh mục mặc định (một lần, chỉ khi server xác nhận danh sách đang trống)
 useEffect(()=>{[['website',wcats],['prompt',pcats]].forEach(([kind,list])=>{const c=CATS[kind]
  if(!list||list.length||!ready[kind]||seeded.current[kind])return;seeded.current[kind]=true
  const b=writeBatch(db),t0=Date.now();c.keys.forEach((k,i)=>b.set(doc(col(c.col)),{name:DICT[lang][c.pre+k],key:k,color:c.colors[k],createdAt:Timestamp.fromMillis(t0+i)}));b.commit().catch(console.error)})},[wcats,pcats,ready])
 const put=(type,data,id)=>id?setDoc(doc(col(type),id),data,{merge:true}):addDoc(col(type),{...data,createdAt:serverTimestamp()})
 const bulk=async(ids,fn)=>{for(const part of chunk(ids)){const b=writeBatch(db);part.forEach(id=>fn(b,id));await b.commit()}}
 const rm=type=>id=>deleteDoc(doc(col(type),id))
 const removeAccount=async id=>{const b=writeBatch(db);b.delete(doc(col('accounts'),id))
  projects.filter(p=>p.userIds?.includes(id)).forEach(p=>b.update(doc(col('projects'),p.id),{userIds:arrayRemove(id)}));await b.commit()}
 // Upsert: trùng email (tài khoản) / tên (dự án) / đường dẫn (trang web) / tiêu đề (prompt) thì ghi đè, không tạo bản sao
 const importRecords=async({accounts:ra=[],projects:rp=[],websites:rw=[],prompts:rpr=[],wcategories:rwc=[],pcategories:rpc=[]})=>{
  if(ra.length+rp.length*2+rw.length+rpr.length+rwc.length+rpc.length>430)throw new Error('x.max')
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
  // danh mục: khớp theo khoá mặc định hoặc tên (không phân biệt hoa thường); chưa có thì tự tạo
  const resolver=kind=>{const c=CATS[kind],cats=kind==='website'?wcats||[]:pcats||[]
   const byName=Object.fromEntries(cats.map(x=>[x.name.toLowerCase(),x.id])),byKey=Object.fromEntries(cats.filter(x=>x.key).map(x=>[x.key,x.id]))
   const create=(name,key,color)=>{const ref=doc(col(c.col));b.set(ref,{name,key,color,createdAt:serverTimestamp()});byName[name.toLowerCase()]=ref.id;if(key)byKey[key]=ref.id;return ref.id}
   const res=(txt,color)=>{const s=clean(txt).slice(0,40);if(!s)return ''
    const k=c.match(s);if(k&&byKey[k])return byKey[k]
    if(byName[s.toLowerCase()])return byName[s.toLowerCase()]
    return k?create(DICT[lang][c.pre+k],k,c.colors[k]):create(s,'',color||CAT_COLORS[Object.keys(byName).length%CAT_COLORS.length])}
   return {res,byName,col:c.col}}
  const W=resolver('website'),P=resolver('prompt')
  rwc.forEach(x=>{const ex=W.byName[x.name.toLowerCase()];if(ex)b.set(doc(col(W.col),ex),{color:x.color},{merge:true});else W.res(x.name,x.color)})
  rpc.forEach(x=>{const ex=P.byName[x.name.toLowerCase()];if(ex)b.set(doc(col(P.col),ex),{color:x.color},{merge:true});else P.res(x.name,x.color)})
  // trang web: giữ đúng thứ tự trong file (dòng đầu = mới nhất) bằng cách lệch createdAt từng mili giây
  const u2id=Object.fromEntries((websites||[]).map(w=>[urlKey(w.url),w.id])),t0=Date.now()
  rw.forEach(({category,...r},i)=>{const k=urlKey(r.url),d={...r,category:W.res(category)}
   if(u2id[k]){b.set(doc(col('websites'),u2id[k]),d,{merge:true});st.updated++}
   else{const ref=doc(col('websites'));b.set(ref,{...d,createdAt:Timestamp.fromMillis(t0-i)});u2id[k]=ref.id;st.added++}})
  const t2id=Object.fromEntries((prompts||[]).map(p=>[p.title.toLowerCase(),p.id]))
  rpr.forEach(({category,...r},i)=>{const k=r.title.toLowerCase(),d={...r,category:P.res(category)}
   if(t2id[k]){b.set(doc(col('prompts'),t2id[k]),d,{merge:true});st.updated++}
   else{const ref=doc(col('prompts'));b.set(ref,{...d,createdAt:Timestamp.fromMillis(t0-i)});t2id[k]=ref.id;st.added++}})
  await b.commit();return st}
 const v={projects,accounts,websites,prompts,apikeys,wcats,pcats,accMap,webCat,promptCat,importRecords,removeAccount,
  saveProject:(d,id)=>put('projects',d,id),saveAccount:(d,id)=>put('accounts',d,id),saveWebsite:(d,id)=>put('websites',d,id),savePrompt:(d,id)=>put('prompts',d,id),saveKey:(d,id)=>put('apikeys',d,id),
  saveCategory:(kind,d,id)=>put(CATS[kind].col,d,id),removeCategory:(kind,id)=>rm(CATS[kind].col)(id),
  removeProject:rm('projects'),removeWebsite:rm('websites'),removePrompt:rm('prompts'),removeKey:rm('apikeys'),
  bulkStatus:(ids,status)=>bulk(ids,(b,id)=>b.update(doc(col('projects'),id),{status})),bulkRemove:ids=>bulk(ids,(b,id)=>b.delete(doc(col('projects'),id)))}
 return <Ctx.Provider value={v}>{children}</Ctx.Provider>}
