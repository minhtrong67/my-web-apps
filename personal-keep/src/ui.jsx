import {createContext,useCallback,useContext,useEffect,useId,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import {AlertCircle,Bookmark,Check,CheckCircle2,ChevronDown,Info,Loader2,Pencil,Plus,Trash2,X,Download} from 'lucide-react'
import {useT} from './i18n'

let locks=0
function useScrollLock(on=true){useEffect(()=>{if(!on)return;const b=document.body;if(!locks++)b.style.overflow='hidden';return()=>{if(!--locks)b.style.overflow=''}},[on])}

const ToastCtx=createContext()
export const useToast=()=>useContext(ToastCtx)
const TI={success:[CheckCircle2,'text-inverse-primary'],error:[AlertCircle,'text-[var(--inverse-error)]'],info:[Info,'text-inverse-primary']}
export function ToastProvider({children}){
 const [list,setList]=useState([])
 const push=useCallback((msg,type='success')=>{const id=Math.random();setList(x=>[...x.slice(-2),{id,msg,type}]);setTimeout(()=>setList(x=>x.filter(i=>i.id!==id)),type==='error'?4500:3000)},[])
 return <ToastCtx.Provider value={push}>{children}
  <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:pr-6">
   {list.map(i=>{const [I,c]=TI[i.type]||TI.info;return <div key={i.id} role="status" className="anim-pop pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl bg-inverse-surface px-4 py-3.5 text-sm text-inverse-on-surface shadow-lg"><I className={`mt-0.5 size-5 shrink-0 ${c}`}/><span>{i.msg}</span></div>})}
  </div></ToastCtx.Provider>}

export function Btn({variant='primary',icon:I,loading,disabled,children,className='',...p}){
 return <button type="button" disabled={loading||disabled} className={`btn btn-${variant} ${className}`} {...p}>
  {loading?<Loader2 className="size-4 animate-spin"/>:I&&<I className="size-4"/>}{children}</button>}
export const Field=({label,children})=><label className="field"><span className="lbl">{label}</span>{children}</label>
export const Input=({invalid,className='',...p})=><input {...p} aria-invalid={!!invalid} className={`input ${invalid?'input-bad':''} ${className}`}/>
export const Textarea=({invalid,className='',...p})=><textarea {...p} aria-invalid={!!invalid} className={`input ${invalid?'input-bad':''} ${className}`}/>
export const Skeleton=({n=3,className='h-32'})=>Array.from({length:n},(_,i)=><div key={i} className={`skeleton ${className}`}/>)
export const Avatar=({a})=><span title={a.name||a.email} className="avatar -ml-2 first:ml-0">{(a.name||a.email||'?')[0]}</span>

export function Segmented({value,onChange,options,label,iconOnly,className=''}){
 // nhóm nút kết nối (M3): viền outline, mục đang chọn đổ secondary container và có dấu tick
 return <div role="group" aria-label={label} className={`inline-flex h-10 shrink-0 items-center gap-0.5 rounded-full border border-input p-0.5 ${className}`}>{options.map(([k,l,I])=>{const on=value===k
  return <button key={k} type="button" aria-pressed={on} aria-label={l} title={l} onClick={()=>onChange(k)}
   className={`flex h-full items-center justify-center gap-1.5 rounded-full text-sm font-medium transition-[background-color,color,transform] duration-300 active:scale-95 ${iconOnly?'aspect-square':'px-3.5'} ${on?'bg-secondary text-secondary-foreground':'text-muted-foreground hover:bg-accent hover:text-foreground'}`}>
   {on&&!I&&!iconOnly?<Check className="size-4"/>:I&&<I className="size-4"/>}{l&&!iconOnly&&<span className={I?'hidden sm:inline':''}>{l}</span>}</button>})}</div>}

export function Dialog({title,onClose,footer,full,children}){
 const {t}=useT(),closeRef=useRef(onClose);closeRef.current=onClose
 useScrollLock()
 useEffect(()=>{const prev=document.activeElement,k=e=>e.key==='Escape'&&closeRef.current();addEventListener('keydown',k)
  return()=>{removeEventListener('keydown',k);prev?.isConnected&&prev.focus?.({preventScroll:true})}},[])
 const head=<div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-4 md:px-6 md:pt-6"><h2 className="text-2xl font-medium leading-8 tracking-tight">{title}</h2>
  <button type="button" aria-label={t('close')} title={`${t('close')} (Esc)`} onClick={onClose} className="icon-btn -mr-1"><X className="size-5"/></button></div>
 const bar="flex gap-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 [&>*]:flex-1 md:[&>*]:flex-none md:justify-end"
 // render qua portal để không bị bottom bar / header (z-30) của trang che
 return createPortal(full
  ?<div role="dialog" aria-modal="true" aria-label={title} className="anim-up fixed inset-0 z-50 flex h-dvh flex-col bg-background">
    {head}<div className="min-h-0 flex-1 overflow-y-auto"><div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-6">{children}</div></div>
    {footer&&<div className="shrink-0 bg-background"><div className={`mx-auto max-w-2xl px-4 md:px-6 ${bar}`}>{footer}</div></div>}</div>
  :<div className="anim-fade fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <div role="dialog" aria-modal="true" aria-label={title} style={{'--notch':'var(--popover)'}} className="anim-up flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-popover shadow-xl sm:max-w-lg sm:rounded-2xl">
     {head}<div className="min-h-0 overflow-y-auto px-4 pb-2 pt-5 md:px-6">{children}</div>
     {footer&&<div className={`shrink-0 px-4 md:px-6 ${bar}`}>{footer}</div>}</div></div>,document.body)}

// Dropdown render qua portal + position:fixed nên không bao giờ làm dài/xê dịch form.
// Desktop: popover bám theo ô chọn (tự lật lên nếu thiếu chỗ). Mobile: bottom sheet. multi: chọn nhiều.
export function Dropdown({label,value,onChange,options,placeholder,multi,compact,className=''}){
 const {t}=useT(),uid=useId(),[open,setOpen]=useState(false),[pos,setPos]=useState({}),[hi,setHi]=useState(0),btn=useRef(),box=useRef()
 const vals=multi?value:[value],sel=options.filter(o=>o[0]!==''&&vals.includes(o[0]))
 const text=sel.length?sel[0][1]+(sel.length>1?` +${sel.length-1}`:''):''
 const close=useCallback(()=>{setOpen(false);btn.current?.focus({preventScroll:true})},[])
 const show=()=>{const r=btn.current.getBoundingClientRect(),sheet=matchMedia('(max-width:639px)').matches
  const below=innerHeight-r.bottom-12,above=r.top-12,up=below<220&&above>below,room=Math.max(up?above:below,140)
  setPos(sheet?{sheet:true}:{left:r.left,width:r.width,up,maxHeight:Math.min(288,room),[up?'bottom':'top']:up?innerHeight-r.top+6:r.bottom+6})
  setHi(Math.max(0,options.findIndex(o=>vals.includes(o[0]))));setOpen(true)}
 const pick=k=>{if(multi)onChange(vals.includes(k)?vals.filter(x=>x!==k):[...vals,k]);else{onChange(k);close()}}
 useScrollLock(open)
 useEffect(()=>{if(!open)return;let w=innerWidth
  const k=e=>{if(e.key==='Escape'){e.stopPropagation();close()}},r=()=>{if(innerWidth!==w)setOpen(false)}
  addEventListener('keydown',k,true);addEventListener('resize',r);box.current?.focus({preventScroll:true})
  return()=>{removeEventListener('keydown',k,true);removeEventListener('resize',r)}},[open,close])
 useEffect(()=>{if(open)box.current?.querySelector('[data-hi=true]')?.scrollIntoView({block:'nearest'})},[open,hi])
 const kd=e=>{const n=options.length,go=i=>{e.preventDefault();setHi(i)}
  if(e.key==='ArrowDown')go((hi+1)%n);else if(e.key==='ArrowUp')go((hi+n-1)%n);else if(e.key==='Home')go(0);else if(e.key==='End')go(n-1)
  else if(e.key==='Enter'||e.key===' '){e.preventDefault();options[hi]&&pick(options[hi][0])}else if(e.key==='Tab')setOpen(false)}
 const list=<ul ref={box} role="listbox" aria-multiselectable={multi||undefined} aria-label={label||placeholder} tabIndex={-1} onKeyDown={kd}
  style={pos.sheet?undefined:{left:pos.left,width:pos.width,top:pos.top,bottom:pos.bottom,maxHeight:pos.maxHeight,'--o':pos.up?'bottom':'top'}}
  className={pos.sheet?'min-h-0 flex-1 overflow-auto overscroll-contain px-3 py-2 outline-none':'anim-pop fixed overflow-auto overscroll-contain rounded-xl bg-popover p-2 text-popover-foreground shadow-lg outline-none ring-1 ring-black/5 dark:ring-white/10'}>
  {options.map(([k,l],i)=>{const on=vals.includes(k)
   return <li key={k||'none'} role="option" aria-selected={on} data-hi={i===hi} onMouseEnter={()=>setHi(i)} onClick={()=>pick(k)}
    className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 text-sm transition-colors ${pos.sheet?'min-h-12 text-base':'min-h-11'} ${on?'bg-secondary font-medium text-secondary-foreground':i===hi?'bg-accent':''}`}>
    <span className="truncate">{l}</span>{on&&<Check className="size-4 shrink-0"/>}</li>})}</ul>
 return <div className={compact?className:`field up ${className}`}>
  {label&&<span id={uid+'l'} className="lbl">{label}</span>}
  <button ref={btn} type="button" aria-haspopup="listbox" aria-expanded={open} aria-labelledby={label?`${uid}l ${uid}`:undefined} onClick={()=>open?close():show()} className={`input flex items-center justify-between gap-2 text-left ${compact?'h-10 rounded-full pl-4':''}`}>
   <span id={uid} className={`truncate ${text?'':'text-muted-foreground'}`}>{text||placeholder}</span>
   <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open?'rotate-180':''}`}/></button>
  {open&&createPortal(pos.sheet
   ?<div className="fixed inset-0 z-[80]"><div className="anim-fade absolute inset-0 bg-black/40" onClick={close}/>
     <div className="anim-sheet absolute inset-x-0 bottom-0 flex max-h-[75dvh] flex-col rounded-t-2xl bg-popover text-popover-foreground shadow-xl">
      <div className="mx-auto mt-3 h-1 w-8 shrink-0 rounded-full bg-muted-foreground/40"/>
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-1 pt-2"><span className="truncate text-base font-semibold">{label||placeholder}</span>
       <button type="button" aria-label={t('close')} onClick={close} className="icon-btn -mr-2"><X className="size-5"/></button></div>
      {list}
      <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">{multi&&<Btn className="w-full" onClick={close}>{t('done')}</Btn>}</div></div></div>
   :<div className="fixed inset-0 z-[80]" onMouseDown={e=>e.target===e.currentTarget&&close()}>{list}</div>,document.body)}</div>}

export function Confirm({title,message,confirmLabel,busy,onConfirm,onClose,danger=true}){
 const {t}=useT()
 return <Dialog title={title} onClose={()=>!busy&&onClose()} footer={<>
  <Btn variant="ghost" icon={X} disabled={busy} onClick={onClose}>{t('cancel')}</Btn>
  <Btn variant={danger?'danger':'primary'} icon={danger?Trash2:undefined} loading={busy} onClick={onConfirm}>{confirmLabel}</Btn></>}>
  <p className="text-muted-foreground ">{message}</p></Dialog>}

export function ExportMenu({formats,onPick,busy}){
 const {t}=useT(),[open,setOpen]=useState(false),[up,setUp]=useState(false)
 return <div className="relative">
  <Btn variant="outline" icon={Download} loading={busy} aria-expanded={open} onClick={e=>{setUp(e.currentTarget.getBoundingClientRect().bottom>innerHeight*.6);setOpen(!open)}}>{t('export')}</Btn>
  {open&&<><div className="fixed inset-0 z-30" onClick={()=>setOpen(false)}/>
   <div className={`anim-pop absolute right-0 z-40 w-60 ${up?'bottom-full mb-2':'top-full mt-2'} rounded-xl bg-popover p-2 text-popover-foreground shadow-lg ring-1 ring-black/5 dark:ring-white/10`} style={{'--o':up?'bottom':'top'}}>
    {formats.map(([k,l,I])=><button key={k} type="button" className="menu-item" onClick={()=>{setOpen(false);onPick(k)}}><I className="size-5 text-muted-foreground"/>{l}</button>)}</div></>}</div>}

export function PageHead({title,sub,onAdd,addLabel,children}){
 return <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-[2rem]">{title}</h1>{sub&&<p className="mt-1 text-sm text-muted-foreground">{sub}</p>}</div>
  <div className="flex items-center gap-2">{children}{onAdd&&<Btn icon={Plus} onClick={onAdd} className="hidden md:inline-flex">{addLabel}</Btn>}</div></div>}
// FAB M3 Expressive: container primary, bo góc 24px, nhấn thì co về 16px
export const Fab=({onClick,label})=><button type="button" aria-label={label} title={label} onClick={onClick} className="anim-pop fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] right-4 z-20 grid size-16 place-items-center rounded-[24px] bg-primary-container text-on-primary-container shadow-lg transition-[border-radius,transform,box-shadow] duration-300 [transition-timing-function:var(--ease-spring)] hover:shadow-xl active:scale-95 active:rounded-[16px] md:hidden"><Plus className="size-7"/></button>
// Hình "cookie" 9 thuỳ trong bộ shape của Material 3 Expressive
const COOKIE=(()=>{let d='';for(let i=0;i<=180;i++){const t=i/180*Math.PI*2,r=46*(1+.05*Math.cos(9*t));d+=(i?'L':'M')+(50+r*Math.cos(t-Math.PI/2)).toFixed(1)+' '+(50+r*Math.sin(t-Math.PI/2)).toFixed(1)}return d+'Z'})()
export const Cookie=({className='size-10 text-secondary',children})=><span className={`relative grid shrink-0 place-items-center ${className}`}><svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 size-full fill-current"><path d={COOKIE}/></svg><span className="absolute inset-0 grid place-items-center">{children}</span></span>
export const Empty=({icon:I,text,action})=><div className="anim-fade flex flex-col items-center gap-4 rounded-2xl bg-card px-6 py-14 text-center"><Cookie className="size-20 text-primary-container"><I className="size-8 text-on-primary-container"/></Cookie><p className="max-w-sm text-sm text-muted-foreground">{text}</p>{action}</div>
export const Acts=({onEdit,onDelete})=>{const {t}=useT();return <div className="flex shrink-0 items-center gap-0.5">
 <button type="button" aria-label={t('edit')} title={t('edit')} onClick={onEdit} className="icon-btn"><Pencil className="size-4"/></button>
 <button type="button" aria-label={t('delete')} title={t('delete')} onClick={onDelete} className="icon-btn icon-btn-danger"><Trash2 className="size-4"/></button></div>}
export const Credit=({className=''})=>{const {t}=useT();return <p className={`text-xs leading-6 text-muted-foreground ${className}`}>{t('credit.by')} <b className="rounded-md bg-primary-container px-1.5 py-0.5 font-semibold text-on-primary-container">minhtrong67</b> · {t('credit.with')} <b className="rounded-md bg-tertiary-container px-1.5 py-0.5 font-semibold text-on-tertiary-container">Claude</b></p>}

export const Logo=({className='size-9'})=><Cookie className={`${className} text-primary`}><Bookmark className="size-[44%] text-primary-foreground" fill="currentColor" strokeWidth={0}/></Cookie>
export const CardSkeleton=({n=6,lines=3})=>Array.from({length:n},(_,i)=><div key={i} aria-hidden="true" className="card flex flex-col gap-3 p-4 sm:p-5">
 <div className="flex items-start justify-between gap-3"><div className="space-y-2"><div className="skeleton h-5 w-40"/><div className="skeleton h-3 w-28"/></div><div className="skeleton h-6 w-20 !rounded-full"/></div>
 <div className="flex gap-1.5"><div className="skeleton h-6 w-20"/><div className="skeleton h-6 w-16"/></div>
 {Array.from({length:Math.max(lines-2,1)},(_,k)=><div key={k} className={`skeleton h-4 ${k?'w-1/2':'w-full'}`}/>)}
 <div className="mt-1 flex items-center gap-3 pt-3"><div className="skeleton size-9 !rounded-full"/><div className="flex-1 space-y-1.5"><div className="skeleton h-3.5 w-1/2"/><div className="skeleton h-3 w-2/3"/></div><div className="skeleton size-10 !rounded-full"/><div className="skeleton size-10 !rounded-full"/></div></div>)
