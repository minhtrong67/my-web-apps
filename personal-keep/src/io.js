import {fmtDate} from './i18n'
// Màu theo theme hiện tại (CSS variable dạng hex) để file xuất khớp màu chủ đề của app
const token=(n,d)=>{const v=getComputedStyle(document.documentElement).getPropertyValue(n).trim();return /^#[0-9a-f]{6}$/i.test(v)?v:d}
export const dl=(blob,name)=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))
// CSV có BOM UTF-8 để Excel hiển thị đúng tiếng Việt
export const toCSV=(cols,rows)=>'\uFEFF'+[cols.map(c=>c[1]),...rows.map(r=>cols.map(c=>r[c[0]]))].map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\r\n')
export function parseCSV(t){
 t=t.replace(/^\uFEFF/,'');const l=t.split(/\r?\n/)[0],d=l.split(';').length>l.split(',').length?';':','
 const rows=[];let row=[],f='',q=false
 for(let i=0;i<t.length;i++){const c=t[i]
  if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++}else q=false}else f+=c}
  else if(c==='"')q=true
  else if(c===d){row.push(f);f=''}
  else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;row.push(f);rows.push(row);row=[];f=''}
  else f+=c}
 if(f||row.length){row.push(f);rows.push(row)}
 const [h,...b]=rows.filter(r=>r.some(x=>x.trim()))
 return b.map(r=>Object.fromEntries(h.map((k,i)=>[k.trim(),r[i]??''])))}
// PNG/PDF: render bằng trình duyệt nên không lỗi font tiếng Việt
const toImg=async(node,bg)=>(await import('html-to-image')).toPng(node,{pixelRatio:2,backgroundColor:bg,cacheBust:true})
async function toPDF(img,name,bg){
 const {jsPDF}=await import('jspdf'),im=new Image();im.src=img;await im.decode()
 const pdf=new jsPDF({unit:'mm',format:'a4'}),W=210,H=297,h=im.height*W/im.width
 for(let y=0,p=0;y<h-0.5;y+=H,p++){if(p)pdf.addPage();if(bg){pdf.setFillColor(bg);pdf.rect(0,0,W,H,'F')}pdf.addImage(img,'PNG',0,-y,W,h)}
 pdf.save(name)}
const save=async(img,kind,name,bg)=>kind==='png'?dl(await (await fetch(img)).blob(),name+'.png'):toPDF(img,name+'.pdf',bg)
export async function exportNode(node,kind,name){const bg=token('--md-surface','#ffffff');await save(await toImg(node,bg),kind,name,bg)}
export async function exportReport(kind,title,cols,rows,name){
 const el=document.createElement('div')
 el.style.cssText='position:fixed;left:-99999px;top:0;width:1000px;padding:40px;background:#fff;color:#0a0a0a;font-family:system-ui,sans-serif'
 const pc=token('--md-primary','#4f52ba'),th=`background:${pc};color:${token('--md-on-primary','#fff')};text-align:left;padding:10px;font-weight:600`
 el.innerHTML=`<h1 style="margin:0 0 4px;font-size:28px;color:${pc}">${esc(title)}</h1><p style="margin:0 0 20px;color:#737373;font-size:13px">Personal Keep · ${fmtDate(new Date())} · ${rows.length} mục</p>
<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr>${cols.map(c=>`<th style="${th}">${esc(c[1])}</th>`).join('')}</tr></thead>
<tbody>${rows.map((r,i)=>`<tr style="background:${i%2?'#fafafa':'#fff'}">${cols.map(c=>`<td style="padding:9px 10px;border-bottom:1px solid #e5e5e5;vertical-align:top">${esc(r[c[0]])}</td>`).join('')}</tr>`).join('')}</tbody></table>
<p style="margin-top:24px;font-size:11px;color:#737373">minhtrong67 · Claude</p>`
 document.body.appendChild(el)
 try{await save(await toImg(el,'#fff'),kind,name)}finally{el.remove()}}
