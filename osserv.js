/* ===== ESPN 16 – OSSERVATORIO (copia strutturale dell Osservatorio di Dreamers) =====
   Giocatori che «segui» (tasto segnalibro), salvati SOLO su questo dispositivo (localStorage "e16_oss").
   Classifica Live (chi gioca ora) · Notte (tutta la notte NBA in corso o appena finita) · Generale (stagione 26/27),
   ordinabile per AVG o efficienza (AVG per minuto). Si segue/smette di seguire:
   - dal segnalibro accanto al nome nei risultati della ricerca in Home (#hres);
   - dal tasto «Segui» nel profilo del giocatore (stats.js, cur "gioc");
   - dal segnalibro nelle righe dell Osservatorio.
   Notifica (come Dreamers): numero di seguiti che giocano live (lampeggia) o che hanno giocato la notte (fino a mezzogiorno)
   sul tasto segnalibro della Home e sulla voce «Osservatorio» del menu Scambi.
   Tutto si aggiunge da qui (render avvolto e DOM ritoccato): index.html e stats.js non vengono modificati. */
(function(){
const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const f1=v=>(Math.round(v*10)/10).toLocaleString("it-IT",{minimumFractionDigits:1,maximumFractionDigits:1});
const gvC=v=>v>=50?"v":v>=35?"g":v>=20?"y":"r";/* colori AVG come nel resto dell app */
const K=n=>{try{return __ownKey(n)}catch(_){return String(n).toLowerCase()}};
/* ---------- lista dei seguiti ---------- */
let SEGUI=[];try{const a=JSON.parse(localStorage.getItem("e16_oss")||"[]");if(Array.isArray(a))SEGUI=a.filter(x=>typeof x==="string")}catch(_){}
const segHas=n=>SEGUI.includes(n),segSave=()=>{try{localStorage.setItem("e16_oss",JSON.stringify(SEGUI))}catch(_){}};
function segTog(n){const i=SEGUI.indexOf(n);if(i<0){SEGUI.push(n);try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(_){}}else SEGUI.splice(i,1);segSave();return i<0}
const SEG_SVG=on=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" fill="${on?"currentColor":"none"}" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
const segBtn=(n,lab)=>`<span class="segi${segHas(n)?" on":""}" data-seg="${e(n)}" role="button" tabindex="0" aria-pressed="${segHas(n)}" aria-label="Segui ${e(n)}">${SEG_SVG(segHas(n))}${lab?`<em>${segHas(n)?"Seguito":"Segui"}</em>`:""}</span>`;
function segToast(t){try{let el=document.getElementById("segtoast");if(!el){el=document.createElement("div");el.id="segtoast";document.body.appendChild(el)}el.textContent=t;el.classList.add("on");clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove("on"),1800)}catch(_){}}
let OSV={per:"notte",m:"avg"};
/* ---------- dati ---------- */
/* chi lo ha nel fanta e squadra NBA */
function segInfo(n){let t="";try{t=OWNH[K(n)]||""}catch(_){}
 let nba="";try{const g=t&&(ROSE[t]||[]).find(x=>K(x[0])===K(n));if(g)nba=g[1]}catch(_){}
 try{if(!nba&&typeof VAL!=="undefined"&&VAL.p[n])nba=VAL.p[n][3]||""}catch(_){}
 return{t,own:t&&TM[t]?TM[t].nome.split(" ").slice(-1)[0]:"Svincolato",nba}}
/* la notte NBA in corso o appena finita (data USA): oggi se è già iniziata almeno una partita, altrimenti l ultima con tabellini */
function osDay(){try{const t=nyToday(),G=(ESPN.days[t]||[]).map(id=>ESPN.games[id]).filter(Boolean);if(G.some(g=>g[4]!=="S"))return t;const N=nights();return N[N.length-1]||null}catch(_){return null}}
/* righe della notte: nome (chiave) → {p: AVG, min, pt, rb, as, opp, lv, st} */
function osNight(){const o={},d=osDay();if(!d)return o;
 for(const id of ESPN.days[d]||[]){const g=ESPN.games[id],B=ESPN.box[id];if(!g||!B||g[4]==="S")continue;
  for(const r of B){const opp=r[1]===g[0]?g[1]:"@"+g[0];o[K(r[0])]={p:ffps(r),min:+r[3]||0,mt:r[3],pt:r[4],rb:r[11]+r[12],as:r[13],opp,lv:g[4]==="L",st:g[4]==="L"?(g[6]||"Live"):"Finale"}}}
 return o}
/* partite della stagione 26/27 del giocatore, in ordine di data */
function osLog(n){const k=K(n),L=[];try{for(const d of nights())for(const x of rowsOf(d))if(K(x.r[0])===k)L.push({d,f:x.f,min:+x.r[3]||0})}catch(_){}return L}
/* andamento (come grTrend di Dreamers): retta dei minimi quadrati, variazione dall inizio alla fine in % sulla media */
function trend(S){const n=S.length;if(n<3)return null;const mx=(n-1)/2,my=S.reduce((a,v)=>a+v,0)/n;let num=0,den=0;S.forEach((v,i)=>{num+=(i-mx)*(v-my);den+=(i-mx)*(i-mx)});if(!den||!my)return null;return num/den*(n-1)/Math.abs(my)*100}
/* ---------- notifica: seguiti live o della notte (fino a mezzogiorno, ora del telefono) ---------- */
function segStato(){let lv=0,nt=0;if(!SEGUI.length)return{n:0,lv:0};const NI=osNight();SEGUI.forEach(n=>{const N=NI[K(n)];if(!N)return;if(N.lv)lv++;else nt++});const mattina=new Date().getHours()<12;return{n:lv+(mattina?nt:0),lv}}
const segBadgeHtml=()=>{const S=segStato();return S.n?`<b${S.lv?' class="lvb"':""}>${S.n}</b>`:""};
/* ---------- pagina ---------- */
function vOsserv(){const per=OSV.per,mt=OSV.m,NI=osNight(),tg=(k,opts)=>`<span class="cltg" role="group">${opts.map(([v,l])=>`<button data-osv="${k}|${v}" aria-pressed="${OSV[k]===v}">${l}</button>`).join("")}</span>`;
 const rows=SEGUI.map(n=>{const I=segInfo(n),N=NI[K(n)]||null;let v=null,x={};
  if(per==="gen"){const G=osLog(n),mn=G.reduce((a,y)=>a+y.min,0),dk=G.reduce((a,y)=>a+y.f,0),ser=G.map(y=>mt==="eff"?(y.min?y.f/y.min:0):y.f);
   x={g:G.length,mn:G.length?mn/G.length:null,md:G.length?dk/G.length:null,ef:mn?dk/mn:null,last:G.length?G[G.length-1].f:null,tp:trend(ser)};v=mt==="eff"?x.ef:x.md}
  else if(N&&(per==="notte"||N.lv)){x=N;v=mt==="eff"?(N.min>0?N.p/N.min:null):N.p}
  return{n,I,N,x,v,show:per==="gen"||(N&&(per==="notte"||N.lv))}});
 /* prima chi sta giocando, poi gli altri; dentro ogni gruppo per AVG decrescente */
 const vis=rows.filter(r=>r.show),no=rows.filter(r=>!r.show);vis.sort((a,b)=>(per==="gen"?0:((b.N&&b.N.lv?1:0)-(a.N&&a.N.lv?1:0)))||((b.v==null?-1e9:b.v)-(a.v==null?-1e9:a.v)));
 const px=(v,t)=>`<span style="color:#fff!important;-webkit-text-fill-color:#fff!important" class="pdkx ${gvC(v)}">${t}</span>`;
 const pill=r=>r.v==null?`<span class="cev na">—</span>`:mt==="eff"?`<span class="cev ${gvC(r.v*36)}">${r.v.toFixed(2).replace(".",",")}</span>`:px(r.v,f1(r.v));
 const who=r=>`<div class="osn" data-pl="${e(r.n)}" role="button" tabindex="0"><span class="osb">${r.I.t?`<span class="badge logo lg-${r.I.t}" role="img" aria-label="${e(r.I.own)}"></span>`:`<i class="osfa">FA</i>`}</span><span><b>${e(r.n)}</b><small>${per==="gen"?`${r.x.g||0} ${r.x.g===1?"gara":"gare"} · `:""}${e(r.I.own)}${r.I.nba?" · "+r.I.nba:""}${per!=="gen"&&r.N?` · vs ${r.N.opp} · ${r.N.lv?`<b class="clv"><i></i>${e(r.N.st)}</b>`:r.N.st}`:""}</small></span>${segBtn(r.n)}</div>`;
 const hd=per==="gen"?`<th>Giocatore</th><th class="pdkl">${mt==="eff"?"Eff.":"AVG med"}</th><th>Min</th><th>Ultima</th><th>Trend</th>`:`<th>Giocatore</th><th class="pdkl">${mt==="eff"?"Eff.":"AVG"}</th><th>Min</th><th>Pt</th><th>Rb</th><th>As</th>`;
 const tr=r=>per==="gen"?`<tr><td>${who(r)}</td><td class="pdkl">${pill(r)}</td><td>${r.x.mn!=null?r.x.mn.toFixed(1).replace(".",","):"—"}</td><td>${r.x.last!=null?px(r.x.last,f1(r.x.last)):"—"}</td><td>${r.x.tp==null?"—":`<span class="trd ${Math.abs(r.x.tp)<3?"s":r.x.tp>0?"u":"d"}">${Math.abs(r.x.tp)<3?"=":r.x.tp>0?"▲ +":"▼ −"}${Math.abs(r.x.tp)<3?"":Math.abs(r.x.tp).toFixed(0)+"%"}</span>`}</td></tr>`
  :`<tr class="${r.N&&r.N.lv?"lvr":""}"><td>${who(r)}</td><td class="pdkl">${pill(r)}</td><td>${r.x.mt}</td><td class="pts">${r.x.pt}</td><td>${r.x.rb}</td><td>${r.x.as}</td></tr>`;
 const nd=osDay();
 const body=!SEGUI.length?`<p class="note">Non segui ancora nessun giocatore. Cercalo dalla Home e tocca il segnalibro accanto al nome, oppure apri la sua scheda e tocca «Segui».</p>`
  :`${vis.length?`<div class="tbl-wrap"><table class="ptbl tvbox drbox clbox osbox${per==="gen"?" osgen":""}"><thead><tr>${hd}</tr></thead><tbody>${vis.map(tr).join("")}</tbody></table></div>`:`<p class="note">${per==="live"?"Nessuno dei tuoi giocatori seguiti sta giocando adesso.":nd?"Nessuno dei tuoi giocatori seguiti è sceso in campo stanotte.":"Nessuna partita NBA stanotte."}</p>`}
   ${per!=="gen"&&no.length?`<p class="osno">Non in campo: ${no.map(r=>`<span>${e(r.n)}</span>`).join(", ")}</p>`:""}`;
 return`<button class="gback" id="osback">‹ Home</button><h2><span class="t"><span>Osservatorio</span></span><em>${SEGUI.length} seguit${SEGUI.length===1?"o":"i"}</em></h2>
 <div class="cltgw">${tg("per",[["live","Live"],["notte","Notte"],["gen","Generale"]])}</div>
 <div class="cltgw">${tg("m",[["avg","AVG"],["eff","Efficienza"]])}</div>
 ${body}
 <p class="note">${per==="gen"?"Stagione 2026/27: AVG medio ed efficienza (AVG per minuto) di tutte le partite giocate. Trend = andamento della stagione (da almeno 3 partite) sulla misura scelta; = vuol dire stabile.":per==="live"?"Solo chi sta giocando adesso (tabellini ESPN live, AVG provvisorio con la formula ESPN).":"La notte NBA in corso o appena finita (data USA): chi gioca ora è segnato Live."} La lista dei seguiti è salvata solo su questo dispositivo.</p>
 <details class="osbk"><summary>Salva o ripristina la lista</summary><p class="note">Copia il testo per tenerlo da parte o per passarlo a un altro telefono; incollalo sotto per importarlo (si aggiunge ai seguiti che hai già).</p><textarea id="osta" readonly rows="3">${e(JSON.stringify(SEGUI))}</textarea><div class="setrow"><button data-osc="copy">Copia</button></div><textarea id="osin" rows="3" placeholder="Incolla qui la lista"></textarea><div class="setrow"><button data-osc="imp">Importa</button><button data-osc="clr">Smetti di seguire tutti</button></div></details>`}
window.SCAMBIV=window.SCAMBIV||{};SCAMBIV.osserv=vOsserv;
(window.NAVX=window.NAVX||[]).push({k:"os",get:()=>({per:OSV.per,m:OSV.m}),set:o=>{if(o&&o.per)OSV={per:o.per,m:o.m||"avg"}}});
const keepY=()=>{const y=scrollY;render();scrollTo(0,y)};
/* ---------- riquadro «★ SEGUITI» della Home (come Dreamers: sotto il riquadro principale, dentro #hmmain) ----------
   Chi dei seguiti è sceso in campo nella notte (in corso o appena finita): AVG con tabellino (LIVE se gioca adesso).
   Se nessuno ha giocato: i seguiti con la MEDIA AVG di stagione. Si allunga con i giocatori; la maniglia sotto allunga/accorcia l elenco. */
let OSH=0;try{OSH=+localStorage.getItem("e16_osh")||0}catch(_){}
function segPanel(){
 const px=(v)=>`<span style="color:#fff!important;-webkit-text-fill-color:#fff!important" class="pdkx ${gvC(v)}">${f1(v)}</span>`;
 const ch=(v,l,c)=>`<span class="${c||""}"><b>${v}</b><small>${l}</small></span>`,mn=m=>`<span class="mnb${m>=30?" mg":m<=25?" mr":""}">${m} min</span>`;
 const box=r=>{const miss=-((r[6]-r[5])+(r[10]-r[9])),rb=r[11]+r[12];return `<div class="bxs">${ch(r[4],"PT",r[4]>=30?"gb gv":r[4]>=20?"gv":"")}${ch(rb,"RB",rb>=10?"gb gv":"")}${ch(r[13],"AS",r[13]>=10?"gb gv":r[13]>=6?"gv":"")}${ch(r[14],"ST",r[14]>=2?"gv":"")}${ch(r[15],"BL",r[15]>=2?"gv":"")}${ch(r[7],"3P",r[7]>=3?"gv":"")}${ch(r[16],"TO",r[16]>=3?"gr2":"gv")}${ch(miss,"TIRI SBAGL.",miss<=-12?"gr2":"gv")}</div>`};
 /* righe della notte dei seguiti (con il tabellino completo) */
 const d=osDay(),want=new Set(SEGUI.map(K)),seg=[];
 if(d)for(const id of ESPN.days[d]||[]){const g=ESPN.games[id],B=ESPN.box[id];if(!g||!B||g[4]==="S")continue;for(const r of B)if(want.has(K(r[0])))seg.push({r,g,f:ffps(r),opp:r[1]===g[0]?g[1]:"@"+g[0],lv:g[4]==="L"})}
 seg.sort((a,b)=>(b.lv-a.lv)||(b.f-a.f));
 const W=h=>`<div class="hmscroll"${OSH?` style="max-height:${OSH}px"`:""}>${h}</div><div class="hmgrip" data-grip="s" role="separator" aria-label="Trascina per allungare o accorciare l'elenco"><i></i></div>`;
 if(seg.length){const lv=seg.some(x=>x.lv);
  return `<div class="hmcard s oss"><div class="hmh"><span>★ SEGUITI</span><span>AVG${lv?" LIVE":""}</span></div>${W(seg.map(x=>`<div class="hmp lvx" data-pl="${e(x.r[0])}" role="link" tabindex="0"><div class="lvh">${x.lv?'<i class="hmd"></i>':""}<span class="plk">${e(x.r[0])}</span>${px(x.f)}</div><small class="lvs">vs ${x.opp} · ${x.lv?`<b class="hmc">${e(x.g[6]||"Live")}</b>`:"Finale"} · ${mn(x.r[3])}</small>${box(x.r)}</div>`).join(""))}</div>`}
 /* nessuno in campo: media AVG di stagione (come il «media PDK» di Dreamers) */
 const P=pstats(),byK={};for(const n in P)byK[K(n)]=P[n];
 const ph=SEGUI.map(n=>{const p=byK[K(n)];return{n,a:p&&p.gp?p.ff/p.gp:null,I:segInfo(n)}}).filter(x=>x.a!=null).sort((a,b)=>b.a-a.a);
 if(ph.length)return `<div class="hmcard s hmph oss"><div class="hmh"><span>★ SEGUITI</span><span>MEDIA AVG</span></div>${W(ph.map(x=>`<div class="hmp" data-pl="${e(x.n)}" role="link" tabindex="0"><span class="hmn"><span class="plk">${e(x.n)}</span><small>${x.I.nba||""} · media AVG</small></span>${px(x.a)}</div>`).join(""))}</div>`;
 return `<div class="hmcard s oss"><div class="hmh"><span>★ SEGUITI</span><span>AVG</span></div><p class="hmvu">${SEGUI.length?"Nessuno dei tuoi seguiti in campo stanotte.":"Tocca il segnalibro su un giocatore per seguirlo."}</p></div>`}
/* maniglia: trascinando si allunga o accorcia l elenco dei seguiti (salvato su questo telefono) */
document.addEventListener("pointerdown",ev=>{const g=ev.target.closest('.oss [data-grip="s"]');if(!g)return;const sc=g.parentElement.querySelector(".hmscroll");if(!sc)return;ev.preventDefault();
 const y0=ev.clientY,h0=sc.getBoundingClientRect().height;const mv=m=>{const h=Math.max(60,h0+m.clientY-y0);sc.style.maxHeight=h+"px";OSH=Math.round(h)};
 const up=()=>{removeEventListener("pointermove",mv);removeEventListener("pointerup",up);try{localStorage.setItem("e16_osh",OSH)}catch(_){}};addEventListener("pointermove",mv);addEventListener("pointerup",up)});
/* ---------- ritocchi del DOM dopo ogni disegno: segnalibri nella ricerca, «Segui» nel profilo, tasto Osservatorio in Home ---------- */
function decora(){try{
 const hr=document.getElementById("hres");if(hr)hr.querySelectorAll(".hrr[data-pl]").forEach(b=>{if(b.querySelector(".segi"))return;const n=b.dataset.pl,i=b.querySelector(":scope > i");const w=document.createElement("span");w.innerHTML=segBtn(n);i?b.insertBefore(w.firstChild,i):b.appendChild(w.firstChild)});
 /* (35) il «Segui» del profilo ora è nella scheda giocatore (stats.js, segrow come Dreamers): niente più aggiunta qui */
 if(cur==="home"&&!curTeam){const hm=document.getElementById("hmmain");if(hm&&!hm.querySelector(".oss"))hm.insertAdjacentHTML("beforeend",segPanel())}
 const hb=document.querySelector("#main .hbar");if(hb&&!hb.querySelector("#hseg")){const tv=hb.querySelector(".tvgo");const html=`<button class="hseg" id="hseg" aria-label="Apri Osservatorio (giocatori seguiti)">${SEG_SVG(false).replace('fill="none"','fill="currentColor"')}${segBadgeHtml()}</button>`;tv?tv.insertAdjacentHTML("beforebegin",html):hb.insertAdjacentHTML("beforeend",html)}
}catch(_){}}
function segBadge(){const S=segStato(),h=S.n?`<b${S.lv?' class="lvb"':""}>${S.n}</b>`:"";const b=document.getElementById("hseg");if(b){b.querySelector("b")?.remove();if(h)b.insertAdjacentHTML("beforeend",h)}
 const m=document.querySelector('#subnav [data-go="osserv"] span');if(m){m.querySelector("b.osnb")?.remove();if(S.n)m.insertAdjacentHTML("beforeend",`<b class="osnb${S.lv?" lvb":""}">${S.n}</b>`)}}
{const R0=render;render=function(){const r=R0.apply(this,arguments);decora();return r}}
/* menu Scambi: il numero accanto a «Osservatorio» quando si apre il sottomenu */
try{const sn=document.getElementById("subnav");if(sn)new MutationObserver(()=>{if(!sn.querySelector("b.osnb"))segBadge()}).observe(sn,{childList:true})}catch(_){}
/* aggiornamenti live: live.js azzera le statistiche (e16Reset) quando arrivano tabellini nuovi; se sei nell Osservatorio ridisegno */
{const Z=window.e16Reset;window.e16Reset=function(){const r=Z?Z.apply(this,arguments):undefined;setTimeout(()=>{try{if(cur==="osserv"&&!curTeam){const a=document.activeElement;if(!(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)))keepY()}else segBadge()}catch(_){}},50);return r}}
setInterval(()=>{try{if(cur==="home")segBadge()}catch(_){}},60000);
setTimeout(()=>{try{decora();segBadge()}catch(_){}},300);
/* ---------- tocchi (su window in cattura: prima di stats.js, che apre il profilo sulle righe con data-pl) ---------- */
window.addEventListener("click",ev=>{
 const sg=ev.target.closest("[data-seg]");if(sg){ev.preventDefault();ev.stopPropagation();const n=sg.dataset.seg,on=segTog(n);
  document.querySelectorAll(".segi").forEach(x=>{if(x.dataset.seg===n){x.classList.toggle("on",on);x.setAttribute("aria-pressed",on);const em=x.querySelector("em");x.innerHTML=SEG_SVG(on)+(em?`<em>${on?"Seguito":"Segui"}</em>`:"")}});
  segToast(on?`✓ ${n} nei Seguiti`:`${n} tolto dai Seguiti`);segBadge();
  {const o=document.querySelector("#hmmain .oss");if(o){o.outerHTML=segPanel()}}
  if(cur==="osserv")keepY();return}
 const hs=ev.target.closest("#hseg");if(hs){ev.preventDefault();ev.stopPropagation();cur="osserv";curTeam=null;render();scrollTo(0,0);return}
 if(cur!=="osserv")return;
 const ov=ev.target.closest("[data-osv]");if(ov){const[k,v]=ov.dataset.osv.split("|");OSV[k]=v;keepY();return}
 const oc=ev.target.closest("[data-osc]");if(oc){const a=oc.dataset.osc;
  if(a==="copy"){const t=document.getElementById("osta");try{navigator.clipboard.writeText(t.value)}catch(_){t.select();try{document.execCommand("copy")}catch(__){}}oc.textContent="Copiato ✓";setTimeout(()=>oc.textContent="Copia",1500)}
  else if(a==="imp"){try{const arr=JSON.parse(document.getElementById("osin").value.trim());if(!Array.isArray(arr))throw 0;arr.filter(x=>typeof x==="string"&&x.length<80).forEach(x=>{if(!SEGUI.includes(x))SEGUI.push(x)});segSave();keepY()}catch(_){oc.textContent="Testo non valido";setTimeout(()=>oc.textContent="Importa",1800)}}
  else if(a==="clr"){if(SEGUI.length&&confirm("Smettere di seguire tutti i giocatori?")){SEGUI=[];segSave();render()}}}
},true);
window.e16Segui={has:segHas,list:()=>SEGUI.slice()};
window.e16SegBtn=segBtn;/* (35) usato dal profilo giocatore */
})();
