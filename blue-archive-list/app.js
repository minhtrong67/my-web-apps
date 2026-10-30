'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const cap=s=>s?s[0].toUpperCase()+s.slice(1):'';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase();
const rd=(k,d)=>{try{return {...d,...JSON.parse(localStorage.getItem(k)||'{}')}}catch(_){return {...d}}},wr=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}};
const S=STUDENTS,GR='DCBAS',B='https://static.wikitide.net/bluearchivewiki/',html=document.documentElement;
const IMG=(p,w)=>`${B}thumb/${p}/${w}px-${p.split('/').pop()}`,ORIG=p=>B+p,fmtD=d=>d?d.split('-').reverse().join('/'):'',fn=s=>s.romaji||s.name;
const P=(d,z=17)=>`<svg viewBox="0 0 24 24" width="${z}" height="${z}">${d}</svg>`;
const GEAR='<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>';
const IC={copy:P('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',17),check:P('<path d="M20 6L9 17l-5-5"/>',17),
 gear:P(GEAR,18),gearL:P(GEAR,22),sun:P('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',16),
 moon:P('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',16),mon:P('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',16),
 prev:P('<path d="M15 6l-6 6 6 6"/>',16),next:P('<path d="M9 6l6 6-6 6"/>',16),ext:P('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',14),
 grid:P('<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>'),
 list:P('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),filter:P('<path d="M3 5h18l-7 8v6l-4 2v-8z"/>'),
 x:P('<path d="M6 6l12 12M18 6L6 18"/>'),x2:P('<path d="M6 6l12 12M18 6L6 18"/>',11),dl:P('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',16)};
const mq=matchMedia('(prefers-color-scheme:dark)'),mo=()=>cfg.motion!==0&&!matchMedia('(prefers-reduced-motion:reduce)').matches;

/* ===== Cài đặt ===== */
const DEF={theme:'system',fs:15,ff:'sans',ac:'#128cff',onac:'#fff',motion:1};
const FF={sans:'Mặc định',round:'Bo tròn',serif:'Serif',mono:'Monospace'},ACS=['#128cff','#ff6b9a','#19b89a','#8a63f0','#ff8a3d','#e5484d'];
let cfg=rd('ba-cfg',DEF);
const onac=h=>{const n=parseInt(h.slice(1),16);return ((n>>16)*.299+(n>>8&255)*.587+(n&255)*.114)>165?'#10223c':'#fff'};
function apply(){const d=cfg.theme==='dark'||(cfg.theme==='system'&&mq.matches);cfg.onac=onac(cfg.ac);
 html.dataset.theme=d?'dark':'light';html.dataset.ff=cfg.ff;cfg.motion===0?html.dataset.motion='off':delete html.dataset.motion;
 html.style.setProperty('--fs',cfg.fs+'px');html.style.setProperty('--ac',cfg.ac);html.style.setProperty('--onac',cfg.onac);
 const m=$('#tc');if(m)m.content=d?'#0b1322':'#eaf3ff';wr('ba-cfg',cfg)}
mq.addEventListener('change',apply);apply();

/* ===== Dữ liệu & tìm kiếm ===== */
S.forEach((s,i)=>{s.i=i;s.month=s.bd?+s.bd.slice(0,2):0;s.nm=norm(s.name);s.rm=norm(s.romaji);s.jp=norm(s.ja);
 s.words=[...new Set((s.nm+' '+s.rm).split(/[\s()]+/).filter(Boolean))];
 s.hay=norm([s.name,s.romaji,s.ja,s.cv,s.hobbies,s.designer,s.illustrator,s.lobby,s.schoolL,s.weaponL,s.roleL,s.atkL,s.armL,s.variant].join(' '))});
const VOC=[...new Set(S.flatMap(s=>s.words))];
const lev=(a,b)=>{if(a===b)return 0;const m=a.length,n=b.length;if(Math.abs(m-n)>2)return 3;let p=Array.from({length:n+1},(_,j)=>j);
 for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]};
const NUM={age:'age',tuoi:'age',height:'height',cao:'height'},TXT={school:'schoolL',truong:'schoolL',role:'roleL',weapon:'weaponL',atk:'atkL',arm:'armL',pool:'pool',cv:'cv',seiyuu:'cv',artist:'illustrator',designer:'designer',pos:'posL',class:'clsL',variant:'variant'};
function parseQ(q){const f=[],t=[];q.trim().split(/\s+/).filter(Boolean).forEach(w=>{let m;
 if(m=w.match(/^(age|tuoi|height|cao)(>=|<=|>|<|=|:)(\d+)$/i))f.push({n:NUM[m[1].toLowerCase()],o:m[2]===':'?'=':m[2],v:+m[3]});
 else if((m=w.match(/^(\w+):(.+)$/))&&TXT[m[1].toLowerCase()])f.push({t:TXT[m[1].toLowerCase()],v:norm(m[2])});else t.push(norm(w))});return {f,t}}
const fm=(s,f)=>{if(f.t)return norm(s[f.t]).includes(f.v);const x=s[f.n];if(x==null)return false;return {'=':x===f.v,'>':x>f.v,'<':x<f.v,'>=':x>=f.v,'<=':x<=f.v}[f.o]};
function scoreTok(s,t){if(s.nm===t)return 100;if(s.nm.startsWith(t))return 70;if(s.words.includes(t))return 60;if(s.words.some(w=>w.startsWith(t)))return 45;
 if(s.nm.includes(t)||s.rm.includes(t))return 32;if(s.jp.includes(t))return 30;if(s.hay.includes(t))return 12;
 if(t.length>3){const d=t.length>6?2:1;if(s.words.some(w=>lev(w,t)<=d))return 8}return 0}

const GROUPS=[{k:'school',t:'Trường',l:'schoolL'},{k:'role',t:'Vai trò',l:'roleL'},{k:'cls',t:'Loại (Striker/Special)',l:'clsL'},{k:'pos',t:'Vị trí',l:'posL'},
 {k:'atk',t:'Loại tấn công',l:'atkL'},{k:'arm',t:'Loại giáp',l:'armL'},{k:'weapon',t:'Vũ khí',l:'weaponL'},{k:'rarity',t:'Độ hiếm',f:v=>'★'.repeat(v)},
 {k:'pool',t:'Nhóm tuyển',f:cap},{k:'variant',t:'Biến thể / Trang phục',f:v=>v==='none'?'Gốc':cap(v)},{k:'cover',t:'Dùng cover',f:v=>v?'Có':'Không'},
 {k:'urban',t:'Địa hình: Đô thị',f:v=>v,grade:1},{k:'outdoor',t:'Địa hình: Ngoài trời',f:v=>v,grade:1},{k:'indoor',t:'Địa hình: Trong nhà',f:v=>v,grade:1},
 {k:'month',t:'Tháng sinh',f:v=>'Tháng '+v,asc:1}];
const SORTS=[['name','Tên'],['rel','Liên quan nhất'],['rarity','Độ hiếm'],['rjp','Ngày ra mắt (JP)'],['rgl','Ngày ra mắt (Global)'],['school','Trường'],['age','Tuổi'],['height','Chiều cao'],['bd','Sinh nhật'],['urban','Địa hình Đô thị'],['outdoor','Địa hình Ngoài trời'],['indoor','Địa hình Trong nhà']];
const ui=rd('ba-ui',{view:'grid',sort:'name',dir:1});
const st={q:'',sort:ui.sort==='rel'?'name':ui.sort,dir:ui.dir,view:ui.view,sel:{}};let cur=[],openI=-1,lastP={f:[],t:[]};
const LBL={};GROUPS.forEach(g=>st.sel[g.k]=new Set());
function options(g){const m=new Map();S.forEach(s=>{const v=s[g.k];if(v===''||v==null||v===0)return;m.set(v,g.l?s[g.l]:g.f(v))});
 const a=[...m].sort((a,b)=>g.grade?GR.indexOf(b[0])-GR.indexOf(a[0]):typeof a[0]==='string'?a[1].localeCompare(b[1]):g.asc?a[0]-b[0]:Number(b[0])-Number(a[0]));
 LBL[g.k]=Object.fromEntries(a.map(([v,l])=>[String(v),l]));return a}
$('#groups').innerHTML=GROUPS.map(g=>`<details ${['school','role','atk','arm'].includes(g.k)?'open':''}><summary>${g.t}<i id="n-${g.k}"></i></summary><div class="chips">${options(g).map(([v,l])=>`<button class="chip" data-g="${g.k}" data-v="${esc(v)}">${esc(l)}</button>`).join('')}</div></details>`).join('');
$('#sort').innerHTML=SORTS.map(([k,l])=>`<option value="${k}">${l}</option>`).join('');$('#sort').value=st.sort;
$('#set').innerHTML=IC.gear;$('#fbtn').innerHTML=IC.filter;

const gv=(s,k)=>{const v=s[k];if(k==='urban'||k==='outdoor'||k==='indoor')return GR.indexOf(v);return typeof v==='string'?v.toLowerCase():v};
const empty=v=>v===''||v==null;
function compute(){lastP=parseQ(st.q);cur=[];
 for(const s of S){if(!GROUPS.every(g=>{const set=st.sel[g.k];return !set.size||set.has(String(s[g.k]))}))continue;
  if(!lastP.f.every(f=>fm(s,f)))continue;let sc=0;for(const t of lastP.t){const x=scoreTok(s,t);if(!x){sc=-1;break}sc+=x}if(sc<0)continue;s.sc=sc;cur.push(s)}
 const rel=st.sort==='rel'&&lastP.t.length;
 cur.sort((a,b)=>{if(rel)return b.sc-a.sc||a.name.localeCompare(b.name);const k=st.sort==='rel'?'name':st.sort,x=gv(a,k),y=gv(b,k);
  if(empty(x)&&empty(y))return a.name.localeCompare(b.name);if(empty(x))return 1;if(empty(y))return -1;return ((x<y?-1:x>y?1:0)*st.dir)||a.name.localeCompare(b.name)})}

/* ===== Render (cache DOM, chỉ sắp xếp lại node) ===== */
const tags=s=>`<span class="b t-${s.atk}">${s.atkL}</span><span class="b t-${s.arm}">${s.armL}</span><span class="b">${s.roleL}</span>`;
const thumb=(s,w)=>`<img decoding="async" loading="lazy" src="${IMG(s.img,w)}" srcset="${IMG(s.img,w)} 1x,${IMG(s.img,w*2)} 2x" data-o="${ORIG(s.img)}" alt="${esc(s.name)}">`;
const copyBtn=(s,c='')=>`<button class="cp ${c}" data-copy="${esc(fn(s))}" title="Sao chép họ tên" aria-label="Sao chép họ tên ${esc(fn(s))}"><span class="c1">${IC.copy}</span><span class="c2">${IC.check}</span>${c.includes('lab')?'<em class="l1">Sao chép</em><em class="l2">Đã chép</em>':''}</button>`;
const cardH=s=>`<article class="card" tabindex="0" data-i="${s.i}"><div class="ph">${thumb(s,200)}${copyBtn(s,'fl')}<div class="stars">${'★'.repeat(s.rarity)}</div></div><div class="ci"><h3 title="${esc(s.name)}">${esc(s.name)}</h3><div class="fn"><span>${esc(fn(s))}</span></div><p class="sub">${s.schoolL} · ${s.weaponL}</p><div class="tags">${tags(s)}</div></div></article>`;
const rowH=s=>`<div class="row" tabindex="0" data-i="${s.i}">${thumb(s,40)}<div><b>${esc(s.name)}</b><div class="fn"><span>${esc(fn(s))}</span>${copyBtn(s)}</div></div><span style="color:#e6a800">${'★'.repeat(s.rarity)}</span><span>${s.schoolL}</span><span>${s.roleL}</span><span>${s.posL}</span><span><span class="b t-${s.atk}">${s.atkL}</span></span><span><span class="b t-${s.arm}">${s.armL}</span></span><span>${s.weaponL}</span></div>`;
const cache={};const build=v=>{const t=document.createElement('template');t.innerHTML=S.map(v==='grid'?cardH:rowH).join('');return [...t.content.children]};
const HEAD='<div class="row h"><span></span><span>Tên</span><span>Độ hiếm</span><span>Trường</span><span>Vai trò</span><span>Vị trí</span><span>Tấn công</span><span>Giáp</span><span>Vũ khí</span></div>';
let holdAnim=true;
function animIn(){if(!mo())return;$$('#list>[data-i]').slice(0,30).forEach((el,n)=>el.animate&&el.animate({opacity:[0,1],transform:['translateY(18px) scale(.97)','none']},{duration:440,delay:n*18,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'}))}
function suggest(){const t=lastP.t[0];if(!t||t.length<3)return '';let b='',d=3;for(const w of VOC){const x=lev(t,w);if(x<d){d=x;b=w}}return d<=2&&b!==t?b:''}
function render(){
 compute();const L=$('#list');
 $('#count').textContent=`Hiển thị ${cur.length} / ${S.length} học sinh`;
 const nf=GROUPS.reduce((n,g)=>n+st.sel[g.k].size,0),fb=$('#fbtn');nf?fb.dataset.n=nf:delete fb.dataset.n;$('#sapply').textContent=cur.length?`Xem ${cur.length} học sinh`:'Không có kết quả';
 $('#dir').classList.toggle('desc',st.dir<0);$('#dir span').textContent=st.dir>0?'Tăng dần':'Giảm dần';$('#view').innerHTML=st.view==='grid'?IC.list:IC.grid;
 GROUPS.forEach(g=>{const n=st.sel[g.k].size;$('#n-'+g.k).textContent=n?`(${n})`:''});
 $$('.chip').forEach(c=>c.classList.toggle('on',st.sel[c.dataset.g].has(c.dataset.v)));
 const a=[];GROUPS.forEach(g=>st.sel[g.k].forEach(v=>a.push(`<button class="achip" data-g="${g.k}" data-v="${esc(v)}">${esc(LBL[g.k][v]||v)} ${IC.x2}</button>`)));
 $('#active').innerHTML=a.length?a.join('')+'<button class="achip clr" data-clr>Xóa tất cả</button>':'';
 if(!cur.length){L.className='';const g=suggest();L.innerHTML=`<div class="empty"><b>Không tìm thấy học sinh phù hợp 😢</b><br>Thử bỏ bớt bộ lọc hoặc đổi từ khóa.${g?`<br>Có phải ý bạn là <button class="btn" data-sug="${esc(g)}">${esc(g)}</button>?`:''}</div>`;return}
 const els=cache[st.view]||(cache[st.view]=build(st.view)),f=document.createDocumentFragment();
 L.className=st.view==='grid'?'grid':'rows';if(st.view==='rows')f.append(document.createRange().createContextualFragment(HEAD));
 cur.forEach(s=>f.append(els[s.i]));L.replaceChildren(f);if(!holdAnim)animIn()}

/* ===== Tiện ích ===== */
/* Toast: nằm trong top-layer (popover) để luôn hiện trên dialog/sheet */
const tbox=$('#toasts'),tl=$('.tl',tbox),pop=typeof tbox.showPopover==='function';if(pop)tbox.setAttribute('popover','manual');
const TI={ok:'<path d="M20 6L9 17l-5-5"/>',err:'<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'};
let dlgAt=0,shownAt=0;
function toast(m,{type='ok',sub='',ms=2600,key=''}={}){
 if(key)$$('.toast',tl).forEach(x=>x.dataset.k===key&&x.remove());
 while(tl.children.length>=3)tl.firstChild.remove();
 const t=document.createElement('div');t.className='toast '+type;t.dataset.k=key;t.style.setProperty('--ms',ms+'ms');
 t.innerHTML=`<span class="ti">${P(TI[type]||TI.ok,18)}</span><div class="tm"><b>${esc(m)}</b>${sub?`<small>${esc(sub)}</small>`:''}</div><i class="tp"></i>`;
 tl.append(t);
 if(pop){const o=tbox.matches(':popover-open');if(!o||dlgAt>shownAt){try{if(o)tbox.hidePopover();tbox.showPopover();shownAt=Date.now()}catch(_){}}}
 const kill=()=>{if(!t.isConnected)return;const done=()=>{t.remove();if(!tl.children.length&&pop)try{tbox.hidePopover()}catch(_){}};if(mo()){t.classList.add('out');setTimeout(done,220)}else done()};
 setTimeout(kill,ms);t.onclick=kill}
async function copy(t,btn){let ok=true;
 try{await navigator.clipboard.writeText(t)}catch(_){try{const a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.cssText='position:fixed;top:0;left:0;opacity:0';(document.querySelector('dialog[open]')||document.body).append(a);a.select();ok=document.execCommand('copy');a.remove()}catch(__){ok=false}}
 if(!ok)return toast('Không sao chép được',{type:'err',sub:'Trình duyệt đang chặn quyền clipboard.',key:'copy'});
 if(btn){btn.classList.add('ok');clearTimeout(btn._t);btn._t=setTimeout(()=>btn.classList.remove('ok'),1500)}
 toast('Đã sao chép',{sub:t,key:'copy',ms:2000})}
function save(name,data){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
const clean=s=>{const {i,hay,month,nm,rm,jp,words,sc,...o}=s;return {...o,fullName:fn(s)}};
const dlg=$('#dlg'),cfgD=$('#cfg');
function closeD(d){if(!d.open||d.classList.contains('out'))return;if(!mo())return d.close();d.classList.add('out');setTimeout(()=>{d.classList.remove('out');d.close()},230)}
[dlg,cfgD].forEach(d=>d.addEventListener('cancel',e=>{e.preventDefault();closeD(d)}));

/* ===== Chi tiết ===== */
const dls=rows=>'<dl>'+rows.filter(r=>r[1]!==''&&r[1]!=null).map(r=>`<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('')+'</dl>';
const sec=(t,h,w,n)=>`<div class="sec ${w?'w':''}" style="animation-delay:${n*70}ms"><h4>${t}</h4>${h}</div>`;
function open(i){const s=S[i];openI=i;const pos=cur.indexOf(s),vars=S.filter(x=>x.base===s.base&&x!==s),bd=s.bd?`${+s.bd.slice(2)}/${+s.bd.slice(0,2)}`:'';
 dlg.innerHTML=`<div class="grip" data-drag></div><button class="btn ic x" data-close aria-label="Đóng">${IC.x}</button><div class="dbody"><div class="d"><div class="art"><img src="${ORIG(s.img)}" data-o="${IMG(s.img,200)}" alt="${esc(s.name)}"><div class="stars">${'★'.repeat(s.rarity)}</div></div>
 <div class="dm"><h2>${esc(s.name)}</h2><p class="ja">${esc(s.ja)}</p><div class="fn idr"><span>${esc(fn(s))}</span>${copyBtn(s,'lab')}</div><div class="tags">${tags(s)}</div><div class="panels">
 ${sec('Chiến đấu',dls([['Trường',s.schoolL],['Loại',s.clsL],['Vai trò',s.roleL],['Vị trí',s.posL],['Vũ khí',s.weaponL],['Cover',s.cover?'Có':'Không'],['Nhóm tuyển',cap(s.pool)],['Biến thể',s.variant==='none'?'Gốc':cap(s.variant)]]),0,0)}
 ${sec('Cá nhân',dls([['Tuổi',s.age],['Sinh nhật',bd],['Chiều cao',s.height&&s.height+' cm'],['Sở thích',esc(s.hobbies)]]),0,1)}
 ${sec('Thích nghi địa hình','<div class="terr">'+[['Đô thị',s.urban],['Ngoài trời',s.outdoor],['Trong nhà',s.indoor]].map(([l,g])=>`<div><b class="g-${g}">${g}</b>${l}</div>`).join('')+'</div>',1,2)}
 ${sec('Ra mắt & Sáng tạo',dls([['Ra mắt (JP)',fmtD(s.rjp)],['Ra mắt (Global)',fmtD(s.rgl)||'Chưa ra mắt'],['Seiyuu',esc(s.cv)],['Thiết kế',esc(s.designer)],['Họa sĩ',esc(s.illustrator)],['Họa sĩ lobby',esc(s.lobby)]]),1,3)}
 ${vars.length?sec('Phiên bản khác của '+esc(s.base),`<div class="tags vars">${vars.map(v=>`<button class="btn" data-i="${v.i}">${esc(v.name)}</button>`).join('')}</div>`,1,4):''}</div></div></div></div>
 <div class="foot"><button class="btn" data-nav="-1" ${pos<1?'disabled':''}>${IC.prev}<span>Trước</span></button><div class="mid">${pos>=0?`<span class="cnt">${pos+1} / ${cur.length}</span>`:''}<a class="btn" href="${s.url}" target="_blank" rel="noopener">Wiki ${IC.ext}</a></div><button class="btn" data-nav="1" ${pos<0||pos>=cur.length-1?'disabled':''}><span>Sau</span>${IC.next}</button></div>`;
 if(!dlg.open){dlgAt=Date.now();dlg.showModal()}document.title=`${s.name} – Blue Archive List`;
 try{history.replaceState(null,'','#'+encodeURIComponent(s.name))}catch(_){}}
const nav=d=>{const p=cur.indexOf(S[openI])+d;if(cur[p])open(cur[p].i)};

/* ===== Cài đặt ===== */
let deferred;addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e});
function openCfg(){
 cfgD.innerHTML=`<div class="grip" data-drag></div><div class="set"><header data-drag><div class="hd"><span class="gi">${IC.gearL}</span><div><h2>Cài đặt</h2><small>Giao diện &amp; dữ liệu</small></div></div><button class="btn ic" data-close aria-label="Đóng">${IC.x}</button></header><div class="sb">
 <section><h4>Chế độ hiển thị</h4><div class="seg" id="segT"><i></i><button data-theme="light">${IC.sun} Sáng</button><button data-theme="dark">${IC.moon} Tối</button><button data-theme="system">${IC.mon} Hệ thống</button></div></section>
 <section><h4>Cỡ chữ <em id="fsv"></em></h4><div class="fsr"><small>A</small><input id="fs" type="range" min="12" max="20" aria-label="Cỡ chữ"><big>A</big></div></section>
 <section><h4>Font chữ</h4><div class="ffs">${Object.entries(FF).map(([k,l])=>`<button data-ff="${k}" style="font-family:var(--ff-${k})"><b>Aa</b>${l}</button>`).join('')}</div></section>
 <section><h4>Màu chủ đạo</h4><div class="swt">${ACS.map(c=>`<button style="--c:${c}" data-ac="${c}" aria-label="Màu ${c}"></button>`).join('')}<label class="cc" title="Chọn màu tùy ý"><input type="color" id="acc" aria-label="Chọn màu tùy ý"></label></div></section>
 <section><button class="tg" id="mo" role="switch"><span class="tl2"><b>Hiệu ứng chuyển động</b><small>Tắt để giảm hiệu ứng khi cuộn và mở hộp thoại</small></span><i></i></button></section>
 <section><h4>Dữ liệu</h4><div class="two"><button class="btn" data-exp="all">${IC.dl} Xuất tất cả (${S.length})</button><button class="btn" data-exp="cur">${IC.dl} Đang lọc (${cur.length})</button></div>${deferred?'<button class="btn pri wide" data-install>Cài đặt ứng dụng</button>':''}</section>
 </div><footer><button class="btn" data-rst>Khôi phục mặc định</button><button class="btn pri" data-close>Xong</button></footer></div>`;
 syncCfg();if(!cfgD.open){dlgAt=Date.now();cfgD.showModal()}}
function syncCfg(){const q=s=>$(s,cfgD);if(!q('#fs'))return;
 q('#segT').style.setProperty('--i',['light','dark','system'].indexOf(cfg.theme));$$('[data-theme]',cfgD).forEach(b=>b.classList.toggle('on',b.dataset.theme===cfg.theme));
 q('#fs').value=cfg.fs;q('#fs').style.setProperty('--p',(cfg.fs-12)/8*100+'%');q('#fsv').textContent=cfg.fs+'px';
 $$('[data-ff]',cfgD).forEach(b=>b.classList.toggle('on',b.dataset.ff===cfg.ff));$$('[data-ac]',cfgD).forEach(b=>b.classList.toggle('on',b.dataset.ac===cfg.ac));
 q('#acc').value=cfg.ac;q('#mo').setAttribute('aria-checked',cfg.motion!==0)}
cfgD.onclick=e=>{const t=e.target;if(t===cfgD||t.closest('[data-close]'))return closeD(cfgD);
 let x;if(x=t.closest('button[data-theme]'))cfg.theme=x.dataset.theme;else if(x=t.closest('button[data-ff]'))cfg.ff=x.dataset.ff;else if(x=t.closest('button[data-ac]'))cfg.ac=x.dataset.ac;
 else if(t.closest('#mo'))cfg.motion=cfg.motion===0?1:0;else if(t.closest('[data-rst]')){cfg={...DEF};toast('Đã khôi phục cài đặt mặc định',{type:'info',key:'rst'})}
 else if(x=t.closest('[data-exp]')){const all=x.dataset.exp==='all',a=all?S:cur;save(`blue-archive-${all?'all':'filtered'}.json`,a.map(clean));return toast('Đã xuất dữ liệu',{sub:`${a.length} học sinh · ${all?'blue-archive-all':'blue-archive-filtered'}.json`,key:'exp'})}
 else if(t.closest('[data-install]')&&deferred){deferred.prompt();deferred=null;return}else return;apply();syncCfg()};
cfgD.oninput=e=>{const t=e.target;if(t.id==='fs')cfg.fs=+t.value;else if(t.id==='acc')cfg.ac=t.value;else return;apply();syncCfg()};

/* ===== Sự kiện ===== */
let dt;function setQ(v){const had=!!st.q.trim(),has=!!v.trim();st.q=v;$('#qc').hidden=!v;
 if(has&&!had&&st.sort!=='rel'){st.prev=st.sort;st.sort='rel';$('#sort').value='rel'}
 if(!has&&had&&st.sort==='rel'){st.sort=st.prev||'name';$('#sort').value=st.sort}render()}
const saveUI=()=>wr('ba-ui',{view:st.view,sort:st.sort==='rel'?'name':st.sort,dir:st.dir});
$('#q').oninput=e=>{clearTimeout(dt);const v=e.target.value;$('#qc').hidden=!v;dt=setTimeout(()=>setQ(v),110)};
$('#q').onkeydown=e=>{if(e.key==='Escape'){e.target.value='';setQ('')}};
$('#qc').onclick=()=>{$('#q').value='';setQ('');$('#q').focus()};
$('#sort').onchange=e=>{st.sort=e.target.value;saveUI();render()};
$('#dir').onclick=()=>{st.dir*=-1;saveUI();render()};
$('#view').onclick=()=>{st.view=st.view==='grid'?'rows':'grid';saveUI();render();animIn()};
const side=$('#side'),scrim=$('#scrim');
const setSide=o=>{side.classList.toggle('open',o);scrim.classList.toggle('on',o);$('#fbtn').setAttribute('aria-expanded',o)};
$('#fbtn').onclick=()=>setSide(!side.classList.contains('open'));
scrim.onclick=()=>setSide(false);
side.addEventListener('click',e=>{if(e.target.closest('[data-sclose]'))setSide(false)});
$('#set').onclick=openCfg;
const clearAll=()=>{GROUPS.forEach(g=>st.sel[g.k].clear());$('#q').value='';setQ('')};
$('#reset').onclick=clearAll;
const toggle=(g,v)=>{const s=st.sel[g];s.has(v)?s.delete(v):s.add(v);render()};
$('#groups').onclick=e=>{const c=e.target.closest('.chip');if(c)toggle(c.dataset.g,c.dataset.v)};
$('#active').onclick=e=>{const c=e.target.closest('.achip');if(!c)return;c.dataset.clr!=null?clearAll():toggle(c.dataset.g,c.dataset.v)};
const L=$('#list');
L.onclick=e=>{const g=e.target.closest('[data-sug]');if(g){$('#q').value=g.dataset.sug;return setQ(g.dataset.sug)}const c=e.target.closest('[data-i]');if(c)open(+c.dataset.i)};
L.onkeydown=e=>{if(e.key==='Enter'&&!e.target.closest('button')){const c=e.target.closest('[data-i]');if(c)open(+c.dataset.i)}};
let raf;L.addEventListener('pointermove',e=>{const c=e.target.closest('.card');if(!c||raf)return;raf=requestAnimationFrame(()=>{raf=0;const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')})},{passive:true});
dlg.onclick=e=>{if(e.target===dlg||e.target.closest('[data-close]'))closeD(dlg);const n=e.target.closest('[data-nav]');if(n)nav(+n.dataset.nav);const v=e.target.closest('.vars [data-i]');if(v)open(+v.dataset.i)};
dlg.onpointermove=e=>{const a=$('.art img',dlg);if(!a||!mo())return;const r=a.getBoundingClientRect(),x=Math.max(-.5,Math.min(.5,(e.clientX-r.left)/r.width-.5)),y=Math.max(-.5,Math.min(.5,(e.clientY-r.top)/r.height-.5));a.style.transform=`scale(1.06) translate(${-x*12}px,${-y*10}px)`};
dlg.onclose=()=>{document.title='Blue Archive List – Danh sách học sinh Blue Archive, tìm kiếm & lọc nhanh';try{history.replaceState(null,'',location.pathname+location.search)}catch(_){}};
document.addEventListener('click',e=>{const c=e.target.closest('[data-copy]');if(c){e.stopPropagation();copy(c.dataset.copy,c)}},true);
document.addEventListener('load',e=>{const t=e.target;if(t.tagName==='IMG'){t.classList.add('ld');t.parentElement.classList.add('ldd')}},true);
document.addEventListener('error',e=>{const t=e.target;if(t.tagName!=='IMG')return;if(!t.dataset.f&&t.dataset.o){t.dataset.f=1;t.removeAttribute('srcset');t.src=t.dataset.o}else t.parentElement.classList.add('ldd')},true);
document.addEventListener('keydown',e=>{const ty=/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
 if(e.key==='Escape'&&side.classList.contains('open')&&!dlg.open&&!cfgD.open)setSide(false);
 if(e.key==='/'&&!ty&&!dlg.open&&!cfgD.open){e.preventDefault();$('#q').focus()}
 if(dlg.open&&!ty){if(e.key==='ArrowLeft')nav(-1);if(e.key==='ArrowRight')nav(1)}});
const up=$('#up');addEventListener('scroll',()=>up.classList.toggle('on',scrollY>700),{passive:true});up.onclick=()=>scrollTo({top:0,behavior:mo()?'smooth':'auto'});

/* ===== Bottom sheet: kéo thanh nắm để đóng ===== */
function dragSheet(el,onDismiss){let y0=0,dy=0,t0=0,on=false,cap=false,pid=0;
 el.addEventListener('pointerdown',e=>{if(!matchMedia('(max-width:860px)').matches||e.button>0||!e.target.closest('[data-drag]')||e.target.closest('button,a,input'))return;on=true;cap=false;y0=e.clientY;dy=0;t0=e.timeStamp;pid=e.pointerId});
 el.addEventListener('pointermove',e=>{if(!on||e.pointerId!==pid)return;const d=e.clientY-y0;
  if(!cap){if(Math.abs(d)<6)return;cap=true;try{el.setPointerCapture(pid)}catch(_){}el.classList.add('drag');el.style.transition='none'}
  dy=Math.max(0,d);el.style.transform=`translateY(${dy}px)`});
 const end=e=>{if(!on||e.pointerId!==pid)return;on=false;if(!cap)return;cap=false;el.classList.remove('drag');
  el._nc=1;setTimeout(()=>el._nc=0,60);
  const v=dy/Math.max(1,e.timeStamp-t0);el.style.transition='transform .28s cubic-bezier(.2,.7,.2,1)';
  if(dy>Math.min(140,el.offsetHeight*.3)||(v>.5&&dy>40))onDismiss(el);else{el.style.transform='';setTimeout(()=>el.style.transition='',300)}};
 el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
 el.addEventListener('click',e=>{if(el._nc){e.stopImmediatePropagation();e.preventDefault()}},true)}
const dismissD=d=>{d.style.transition='transform .22s cubic-bezier(.4,0,1,1)';d.style.transform='translateY(105%)';setTimeout(()=>{d.style.transition=d.style.transform='';d.close()},210)};
dragSheet(dlg,dismissD);dragSheet(cfgD,dismissD);dragSheet(side,a=>{a.style.transition=a.style.transform='';setSide(false)});

/* ===== Khởi động + splash ===== */
const sp=$('#splash'),t0=performance.now();
render();
requestAnimationFrame(()=>{const skip=html.classList.contains('nosplash'),wait=skip?0:Math.max(0,1000-(performance.now()-t0));
 setTimeout(()=>{holdAnim=false;if(sp){sp.classList.add('out');setTimeout(()=>sp.remove(),720)}try{sessionStorage.setItem('ba-s',1)}catch(_){}animIn();
  const h=decodeURIComponent(location.hash.slice(1));if(h){const s=S.find(x=>x.name===h);if(s)open(s.i)}},wait)});
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
