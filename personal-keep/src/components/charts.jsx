import {useState} from 'react'
import {useT} from '../i18n'
// Biểu đồ tròn (donut) + thanh tiến độ %: bộ biểu đồ duy nhất của các trang thống kê
export const COLORS=['var(--chart-4)','var(--chart-2)','var(--chart-5)','var(--chart-1)','var(--chart-3)']
// 5 màu chính của theme; từ phần tử thứ 6 trở đi pha sáng / tối để vẫn phân biệt được
export const col=i=>i<5?COLORS[i]:i<10?`color-mix(in oklab,${COLORS[i%5]} 55%,var(--md-surface))`:`color-mix(in oklab,${COLORS[i%5]} 65%,var(--md-on-surface))`
// gộp các phần nhỏ thành "Khác" để biểu đồ gọn
export const top=(arr,n,other)=>arr.length<=n?arr:[...arr.slice(0,n),{label:other,value:arr.slice(n).reduce((s,d)=>s+d.value,0)}]
export const pct=(v,total)=>total?Math.round(v/total*100):0

export function PieChart({data,center,caption}){
 const {t}=useT(),[hov,setHov]=useState(null)
 const total=data.reduce((s,d)=>s+d.value,0),R=56,C=2*Math.PI*R,gap=data.length>1?1.5:0,topItem=data.reduce((a,d)=>d.value>a.value?d:a,data[0]);let acc=0
 const dim=i=>hov!==null&&hov!==i
 // luôn xếp dọc: biểu đồ ở trên, chú thích đầy đủ bên dưới, không bị cắt khi thẻ hẹp
 return <div className="flex min-w-0 flex-col items-center gap-5">
  <div className="relative size-52 shrink-0"><svg viewBox="0 0 160 160" className="anim-pie size-full" role="img">
   <circle cx="80" cy="80" r={R} fill="none" strokeWidth="26" className="stroke-muted"/>
   <g transform="rotate(-90 80 80)">{data.map((d,i)=>{const len=d.value/total*C,o=-acc;acc+=len
    return <circle key={d.label+i} cx="80" cy="80" r={R} fill="none" strokeWidth={hov===i?30:26} stroke={col(i)} strokeDasharray={`${Math.max(len-gap,0.5)} ${C-len+gap}`} strokeDashoffset={o} opacity={dim(i)?.3:1}
     onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)} style={{transition:'stroke-width .25s,opacity .25s,stroke-dasharray .6s var(--ease-emph)'}}><title>{`${d.label}: ${d.value} (${pct(d.value,total)}%)`}</title></circle>})}</g></svg>
   <div className="pointer-events-none absolute inset-0 grid place-items-center text-center"><div className="px-10"><b className="block text-3xl font-semibold leading-none tabular-nums">{hov!==null?data[hov].value:center??total}</b>
    <span className="mt-1 block text-xs leading-tight text-muted-foreground">{hov!==null?`${pct(data[hov].value,total)}%`:caption||t('s.total')}</span></div></div></div>
  <p className="text-center text-xs text-muted-foreground">{t('s.groups',{n:data.length})} · {t('s.top')}: <b className="text-foreground">{topItem.label}</b> ({pct(topItem.value,total)}%)</p>
  <ul className="w-full space-y-3" aria-label={t('s.legend')}>{data.map((d,i)=><li key={d.label+i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)} className={`text-sm transition-opacity ${dim(i)?'opacity-40':''}`}>
   <div className="flex items-start gap-2.5"><i className="mt-1 size-3 shrink-0 rounded-[4px]" style={{background:col(i)}}/>
    <span className="min-w-0 flex-1 break-words">{d.label}</span><b className="tabular-nums">{d.value}</b><span className="w-11 text-right tabular-nums text-muted-foreground">{pct(d.value,total)}%</span></div>
   <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="anim-bar h-full rounded-full" style={{width:`${pct(d.value,total)}%`,background:col(i)}}/></div></li>)}</ul></div>}

// Một dòng tiến độ: nhãn, giá trị / tổng, phần trăm và thanh tiến độ
export const Progress=({label,value,total,color='var(--primary)',cls='',hint})=>{const p=pct(value,total)
 return <div className={`text-sm ${cls}`}><div className="mb-1.5 flex items-center justify-between gap-3"><span className="min-w-0 truncate font-medium">{label}</span><span className="shrink-0 tabular-nums text-muted-foreground">{hint??`${value}/${total}`} · <b className="text-foreground">{p}%</b></span></div>
  <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="anim-bar h-full rounded-full" style={{width:`${p}%`,background:color}}/></div></div>}
// Thẻ tiến độ lớn: số % to + thanh
export const Meter=({label,value,total,color='var(--primary)'})=>{const p=pct(value,total)
 return <div><div className="flex items-end justify-between gap-3"><p className="text-sm text-muted-foreground">{label}</p><p className="text-4xl font-semibold leading-none tabular-nums">{p}<span className="text-xl text-muted-foreground">%</span></p></div>
  <div className="mt-3 h-4 overflow-hidden rounded-full bg-muted"><div className="anim-bar h-full rounded-full" style={{width:`${p}%`,background:color}}/></div>
  <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">{value}/{total}</p></div>}
