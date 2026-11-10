/* ===== ESPN 16 – VALORI, CALCOLATORE TRADE, IA TRADE, PREVISIONE DELLE SCELTE =====
   Valori dei giocatori: valori-data.js (tools/valori.mjs, ogni domenica alle 18): AVG degli ultimi 2 anni (più peso all ultimo), presenza, età.
   Forza di una squadra = 70% somma dei valori dei suoi 14 giocatori migliori + 30% percentuale vittorie → classifica prevista 1–16.
   Scelte: la squadra più debole sceglie per prima. Valore della scelta in base a giro e numero previsto; più l anno è lontano
   più la previsione torna verso il centro (non si sa come sarà la squadra) e il valore si sconta un po'. */
(function(){
const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const nk=n=>String(n||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[.'’]/g,"").replace(/\s+(jr|sr|ii|iii|iv)$/,"").trim();
const VK={};if(typeof VAL!=="undefined")for(const n in VAL.p)VK[nk(n)]=n;
const vRow=n=>{const k=VK[nk(n)];return k?VAL.p[k]:null};
const val=n=>{const r=vRow(n);return r?r[0]:0};
const nick=t=>t.nome.split(" ").slice(-1)[0];
const fmt=v=>Math.round(v).toLocaleString("it-IT");
const f1=v=>(Math.round(v*10)/10).toLocaleString("it-IT",{minimumFractionDigits:1,maximumFractionDigits:1});
/* stipendio 26/27 dal file della lega (per il controllo del cap) */
const SAL={};try{for(const t in CAP)for(const p of CAP[t].pl)SAL[t+"|"+nk(p[0])]=p[1][0]||0}catch(_){}
const sal=(t,n)=>SAL[t+"|"+nk(n)]||0;
/* ---------- forza squadre e scelte ---------- */
function strength(){const S={};let mx=0;for(const t of TEAMS){const v=(ROSE[t.id]||[]).map(g=>val(g[0])).sort((a,b)=>b-a).slice(0,14).reduce((a,b)=>a+b,0);S[t.id]=v;mx=Math.max(mx,v)}
 const R={};for(const t of TEAMS){const r=REC[t.id]||{w:0,l:0},g=r.w+r.l,wp=g?r.w/g:.5;R[t.id]=.7*(S[t.id]/mx)+.3*wp}
 const ord=TEAMS.slice().sort((a,b)=>R[b.id]-R[a.id]);const rank={};ord.forEach((t,i)=>rank[t.id]=i+1);return{S,rank}}
let STR=null;const str=()=>STR||(STR=strength());
const PICKV=(r,slot)=>r===1?1500*Math.exp(-.11*(slot-1)):r===2?280*Math.exp(-.075*(slot-1)):60*Math.exp(-.06*(slot-1));
function pickInfo(p){/* p = [anno, giro, squadra d origine, nota] */const R=str().rank[p[2]]||8.5,slot0=17-R,k=Math.min(.75,Math.max(0,(p[0]-2027)*.25)),slot=slot0*(1-k)+8.5*k;
 const v=PICKV(p[1],slot)*Math.pow(.92,Math.max(0,p[0]-2027));const s=Math.max(1,Math.min(16,Math.round(slot)));
 const q=slot<=4?"alta":slot<=10?"media":"bassa";return{slot:s,q,v:Math.round(v/5)*5}}
window.e16Pick=pickInfo;
function teamValue(id){const pl=(ROSE[id]||[]).reduce((a,g)=>a+val(g[0]),0),pk=((CAP[id]||{}).pk||[]).reduce((a,p)=>a+pickInfo(p).v,0);return{pl,pk,tot:pl+pk}}
window.e16TeamValue=teamValue;window.e16Val=val;window.e16Str=()=>str();
/* ---------- stato ---------- */
const T={a:"QUE",b:null,sa:[],sb:[],me:"QUE",tg:"",q:"",vt:""};
try{Object.assign(T,JSON.parse(localStorage.getItem("e16_trade")||"{}"))}catch(_){}
const save=()=>{try{localStorage.setItem("e16_trade",JSON.stringify(T))}catch(_){}};
const assets=id=>[...(ROSE[id]||[]).map(g=>({k:"p|"+g[0],n:g[0],v:val(g[0]),s:sal(id,g[0]),sub:`${g[1]} · ${(vRow(g[0])||[])[2]?Math.floor(vRow(g[0])[2])+" anni":""}`})),
 ...((CAP[id]||{}).pk||[]).map((p,i)=>{const I=pickInfo(p),o=TM[p[2]];return{k:"k|"+i,n:`${p[1]}° giro ${p[0]}${p[2]!==id?" (da "+(o?nick(o):p[2])+")":""}`,v:I.v,s:0,pick:1,sub:`prev. scelta n° ${I.slot} · ${I.q}`}})];
const capAfter=(id,out,inn)=>{const C=CAP[id];const base=C?(C.occ[0]||0)+(C.tagli||0):0;return base-out.reduce((a,x)=>a+x.s,0)+inn.reduce((a,x)=>a+x.s,0)};
const verdict=(va,vb)=>{const d=va-vb,m=Math.max(va,vb)||1,pc=Math.abs(d)/m*100;return pc<8?["Equo","g"]:pc<20?[d>0?"Leggero vantaggio a chi riceve il lato A":"Leggero vantaggio a chi riceve il lato B","y"]:[d>0?"Sbilanciato: il lato A vale molto di più":"Sbilanciato: il lato B vale molto di più","r"]};
const chips=(sel,attr)=>`<div class="chips">${TEAMS.map(x=>`<button class="chip" ${attr}="${x.id}" aria-pressed="${sel===x.id}"><span class="badge logo lg-${x.id}"></span>${e(nick(x))}</button>`).join("")}</div>`;
const xc=v=>v>=2000?"v":v>=1200?"g":v>=600?"y":"r";
/* ---------- VALORI GIOCATORI ---------- */
function vVal(){if(typeof VAL==="undefined")return`<p class="note">Valori non disponibili.</p>`;const q=nk(T.q);
 const own=n=>{try{return OWNH[__ownKey(n)]||""}catch(_){return""}};
 let L=Object.entries(VAL.p).map(([n,r])=>({n,r,o:own(n)}));if(T.vt)L=L.filter(x=>x.o===T.vt);if(q)L=L.filter(x=>nk(x.n).includes(q)||nk(x.r[3])===q);
 L.sort((a,b)=>b.r[0]-a.r[0]);const h=VAL.h||{};
 const tr=n=>{const H=h[n]||[];if(H.length<2)return"";const d=H[H.length-1]-H[H.length-2];return d?`<small style="color:${d>0?"#16a34a":"#dc2626"}">${d>0?"▲":"▼"} ${fmt(Math.abs(d))}</small>`:""};
 return `<button class="gback" data-go="home">‹ Home</button><h2><span class="t"><span>Valori giocatori</span></span><em>agg. ${e(VAL.upd)}</em></h2>
 <input id="tvq" class="vtq" type="search" placeholder="🔍 Cerca giocatore o squadra NBA" autocomplete="off" value="${e(T.q)}">
 <div class="chips"><button class="chip" data-vt="" aria-pressed="${!T.vt}">Tutti</button>${TEAMS.map(x=>`<button class="chip" data-vt="${x.id}" aria-pressed="${T.vt===x.id}"><span class="badge logo lg-${x.id}"></span>${e(nick(x))}</button>`).join("")}</div>
 <div class="tbl-wrap"><table class="fatbl"><thead><tr><th>#</th><th>Giocatore</th><th>Età</th><th>AVG</th><th>Valore</th></tr></thead><tbody>
 ${L.slice(0,250).map((x,i)=>`<tr class="farow" data-pl="${e(x.n)}"><td class="fark">${i+1}</td><td class="fanm"><b>${e(x.n)}</b><small>${x.o?`<span class="fagl"><span class="faglb logo lg-${x.o}"></span></span>${e(nick(TM[x.o]))} · `:"Svincolato · "}${x.r[3]||""}</small></td><td>${x.r[2]!=null?Math.floor(x.r[2]):"–"}</td><td>${f1(x.r[1])}</td><td class="fapdk"><span class="pdkx ${xc(x.r[0])}">${fmt(x.r[0])}</span>${tr(x.n)}</td></tr>`).join("")}</tbody></table></div>
 <p class="note">Valore = AVG degli ultimi 2 anni (più peso alla stagione in corso), presenze ed età (i giovani valgono di più). Si aggiorna ogni domenica alle 18; la freccia è la differenza con la settimana prima.</p>`}
/* ---------- CALCOLATORE TRADE ---------- */
function side(id,selK,attr){const A=assets(id),S=new Set(selK);return `<div class="tbl-wrap"><table class="fatbl"><tbody>${A.map(x=>`<tr class="farow" ${attr}="${e(x.k)}" style="cursor:pointer${S.has(x.k)?";background:rgba(124,58,237,.18)":""}"><td class="fark">${S.has(x.k)?"✓":""}</td><td class="fanm"><b>${e(x.n)}</b><small>${e(x.sub)}${x.s?` · stip. ${f1(x.s)}`:""}</small></td><td class="fapdk"><span class="pdkx ${xc(x.v)}">${fmt(x.v)}</span></td></tr>`).join("")}</tbody></table></div>`}
function vCalc(){const A=T.a,B=T.b&&T.b!==A?T.b:null;const LA=assets(A).filter(x=>T.sa.includes(x.k)),LB=B?assets(B).filter(x=>T.sb.includes(x.k)):[];
 const va=LA.reduce((a,x)=>a+x.v,0),vb=LB.reduce((a,x)=>a+x.v,0);
 let res="";if(B&&(LA.length||LB.length)){const[t,c]=verdict(va,vb);const ca=capAfter(A,LA,LB),cb=capAfter(B,LB,LA);
  res=`<div class="esqs v4"><div class="esqk esqk2"><div><small>${e(nick(TM[A]))} dà</small><b>${fmt(va)}</b><em>${LA.length} pezzi</em></div><div><small>${e(nick(TM[B]))} dà</small><b>${fmt(vb)}</b><em>${LB.length} pezzi</em></div></div>
  <div class="esqk esqk2"><div class="${ca>CAP_TOT?"dn":""}"><small>Cap ${e(nick(TM[A]))} dopo</small><b>${f1(ca)}</b><em>${ca>CAP_TOT?"oltre il cap!":"su "+CAP_TOT}</em></div><div class="${cb>CAP_TOT?"dn":""}"><small>Cap ${e(nick(TM[B]))} dopo</small><b>${f1(cb)}</b><em>${cb>CAP_TOT?"oltre il cap!":"su "+CAP_TOT}</em></div></div></div>
  <div class="snemb"><h2><span class="t"><span>Verdetto</span></span></h2><p style="padding:6px 4px;font:800 18px 'Barlow Condensed'"><span class="pdkx ${c}">${t}</span> <small>(lato A = ciò che dà ${e(nick(TM[A]))})</small></p></div>`}
 return `<button class="gback" data-go="home">‹ Home</button><h2><span class="t"><span>Calcolatore trade</span></span><em>valori AVG + età</em></h2>${res}
 <h4 class="drplh">Lato A · squadra che dà</h4>${chips(A,"data-ta")}${side(A,T.sa,"data-sa")}
 <h4 class="drplh">Lato B · squadra che dà</h4>${chips(B,"data-tb")}${B?side(B,T.sb,"data-sb"):`<p class="note">Scegli la seconda squadra.</p>`}
 <p class="note">Tocca giocatori e scelte per metterli nello scambio. Le scelte hanno un valore previsto in base a quanto è forte la squadra d'origine. Controllo del cap 26/27 (${CAP_TOT}).</p>`}
/* ---------- IA TRADE: proposte per arrivare a un giocatore ---------- */
function proposals(me,target){const tg=TEAMS.find(t=>(ROSE[t.id]||[]).some(g=>g[0]===target));if(!tg||tg.id===me)return{tg,P:[]};
 const vt=val(target),st=sal(tg.id,target),pool=assets(me).filter(x=>x.v>0).sort((a,b)=>b.v-a.v).slice(0,22),out=[];
 const tgIn={v:vt,s:st};
 const tryC=c=>{const v=c.reduce((a,x)=>a+x.v,0);if(v<vt*.92||v>vt*1.18)return;const ca=capAfter(me,c,[tgIn]),cb=capAfter(tg.id,[tgIn],c);if(ca>CAP_TOT||cb>CAP_TOT)return;
  const score=Math.abs(v-vt)/vt+.04*c.length+(c.some(x=>x.pick)?0:.01);out.push({c,v,ca,cb,score})};
 for(let i=0;i<pool.length;i++){tryC([pool[i]]);for(let j=i+1;j<pool.length;j++){tryC([pool[i],pool[j]]);for(let k=j+1;k<pool.length;k++)tryC([pool[i],pool[j],pool[k]])}}
 out.sort((a,b)=>a.score-b.score);const seen=new Set(),P=[];for(const o of out){const key=o.c.map(x=>x.k).sort().join();if(seen.has(key))continue;seen.add(key);P.push(o);if(P.length>=6)break}return{tg,P}}
function vIa(){const me=T.me||"QUE";const own=n=>{try{return OWNH[__ownKey(n)]||""}catch(_){return""}};
 const all=TEAMS.filter(t=>t.id!==me).flatMap(t=>(ROSE[t.id]||[]).map(g=>g[0])).sort((a,b)=>val(b)-val(a));
 let body=`<p class="note">Scegli il giocatore che vuoi: l'IA cerca nella tua squadra i pacchetti (1–3 pezzi, giocatori e scelte) che valgono quanto lui e rispettano il cap di tutte e due le squadre.</p>`;
 if(T.tg){const{tg,P}=proposals(me,T.tg);if(tg){const vt=val(T.tg);
  body=`<div class="esqhead" style="background:linear-gradient(115deg,${TCOL[tg.id]} 0%,color-mix(in srgb,${TCOL[tg.id]} 60%,#000) 100%);color:#fff;border-bottom:4px solid #0b0b0b"><span class="badge logo lg-${tg.id}"></span><div class="esqt"><small>Obiettivo · da ${e(tg.nome)}</small><h3>${e(T.tg)}</h3></div></div>
  <div class="esqs v4"><div class="esqk esqk2"><div><small>Valore</small><b>${fmt(vt)}</b><em>AVG ${f1((vRow(T.tg)||[])[1]||0)} · ${(vRow(T.tg)||[])[2]?Math.floor(vRow(T.tg)[2])+" anni":""}</em></div><div><small>Stipendio 26/27</small><b>${f1(sal(tg.id,T.tg))}</b><em>cap ${CAP_TOT}</em></div></div></div>
  ${P.length?P.map((o,i)=>`<div class="snemb"><h2><span class="t"><span>Proposta ${i+1}</span></span><em>${fmt(o.v)} contro ${fmt(vt)}</em></h2>${o.c.map(x=>`<div class="snrow"><div class="sninfo"><b>${e(x.n)}</b><small>${e(x.sub)}</small></div><span class="snp p${xc(x.v)}">${fmt(x.v)}</span></div>`).join("")}<p class="note">Cap dopo lo scambio: ${e(nick(TM[me]))} ${f1(o.ca)} · ${e(nick(tg))} ${f1(o.cb)}</p></div>`).join(""):`<p class="note">Nessun pacchetto valido trovato (valore o cap).</p>`}`}}
 return `<button class="gback" data-go="home">‹ Home</button><h2><span class="t"><span>IA trade</span></span><em>proposte automatiche</em></h2>
 <h4 class="drplh">La mia squadra</h4>${chips(me,"data-me")}
 <h4 class="drplh">Giocatore che voglio</h4><select class="vtq" data-tg="1"><option value="">Scegli il giocatore…</option>${all.map(n=>`<option${n===T.tg?" selected":""} value="${e(n)}">${e(n)} · ${e(nick(TM[own(n)]||{nome:""}))} · ${fmt(val(n))}</option>`).join("")}</select>${body}`}
window.TRADEV={val:vVal,calc:vCalc,ia:vIa};
document.addEventListener("click",ev=>{const c=ev.target.closest("[data-ta],[data-tb],[data-sa],[data-sb],[data-me],[data-vt]");if(!c)return;const d=c.dataset;
 if(d.ta!=null){T.a=d.ta;T.sa=[];if(T.b===T.a){T.b=null;T.sb=[]}}else if(d.tb!=null){T.b=d.tb;T.sb=[]}
 else if(d.sa!=null){T.sa=T.sa.includes(d.sa)?T.sa.filter(x=>x!==d.sa):[...T.sa,d.sa]}else if(d.sb!=null){T.sb=T.sb.includes(d.sb)?T.sb.filter(x=>x!==d.sb):[...T.sb,d.sb]}
 else if(d.me!=null){T.me=d.me;T.tg=""}else if(d.vt!=null){T.vt=d.vt}
 save();const y=scrollY;render();scrollTo(0,y)},true);
document.addEventListener("change",ev=>{if(ev.target.dataset.tg){T.tg=ev.target.value;save();render()}});
document.addEventListener("input",ev=>{if(ev.target.id==="tvq"){T.q=ev.target.value;save();const p=ev.target.selectionStart;render();const i=document.getElementById("tvq");i.focus();try{i.setSelectionRange(p,p)}catch(_){}}});
})();
