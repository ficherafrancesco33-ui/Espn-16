/* ===== ESPN 16 – STATISTICHE (come la sezione Statistiche di Dreamers, con i punti AVG) =====
   Pagine: stat (scelta Giocatori / Squadre) · sgioc (tutti i giocatori) · ssq (squadra del fanta) · gioc (profilo con grafici) · comp (comparatore).
   Dati: stagione in corso da espn-data.js (ESPN), stagione 2025/26 da storico-2526.js (caricato solo quando serve, è grande).
   Ogni partita di un giocatore è un oggetto {s:stagione, d:data USA, id, n:nome, t:squadra NBA, o:avversario, m:minuti, r:riga tabellino, f:AVG}. */
(function(){
const SEASONS=[{k:"2425",l:"24/25",a:"2024-10-22",b:"2025-04-13"},{k:"2526",l:"25/26",a:"2025-10-21",b:"2026-04-12"},{k:"2627",l:"26/27",a:"2026-10-20",b:"2027-04-30"}];
const MESI=["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];
const today=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York"}).format(new Date());
const nrm=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[.'’]/g,"").replace(/\s+(jr|sr|ii|iii|iv)$/,"").trim();
/* squadra del fanta di ogni giocatore (dalle rose) */
const OWN={};try{for(const t in ROSE)for(const g of ROSE[t])OWN[nrm(g[0])]={t,slot:g[2],ruolo:g[3]}}catch(e){}
const ownOf=n=>OWN[nrm(n)]||null;
const ROLE=r=>{const a=String(r||"").split(",");return a.some(x=>x==="C")&&!a.some(x=>/G/.test(x))?"Centro":a.some(x=>/G/.test(x))&&!a.some(x=>/F|C/.test(x))?"Guardia":a[0]&&/G/.test(a[0])?"Guardia":a[0]==="C"?"Centro":"Ala"};
/* --- caricamento dell archivio 25/26 --- */
let loading=false;
const OLD=["2425","2526"];/* stagioni passate: un file per stagione (tools/storico.mjs) */
function needOld(){if(window.STORICO&&OLD.every(k=>STORICO[k]))return true;if(!loading){loading=true;let n=0;for(const k of OLD){const s=document.createElement("script");s.src="storico-"+k+".js";s.onload=()=>{if(++n===OLD.length){ALL=null;render()}};document.head.appendChild(s)}}return false}
/* --- tutte le partite (cache) --- */
let ALL=null,BYP=null;
function all(){if(ALL)return ALL;ALL=[];
 for(const k of OLD)if(window.STORICO&&STORICO[k]){const S=STORICO[k];for(const g of S.G)for(const x of g[5]){if(!S.P[x[0]])continue;const r=[S.P[x[0]][0],...x.slice(1),x[0]];ALL.push({s:k,d:g[0],id:x[0],n:r[0],t:r[1],o:r[1]===g[1]?g[2]:g[1],m:r[3],r,f:ffps(r)})}}
 if(typeof ESPN!=="undefined")for(const d of Object.keys(ESPN.days).sort())for(const id of ESPN.days[d]){const g=ESPN.games[id],B=ESPN.box[id];if(!B||g[4]==="S")continue;for(const r of B)ALL.push({s:"2627",d,id:r[20],n:r[0],t:r[1],o:r[1]===g[0]?g[1]:g[0],m:r[3],r,f:ffps(r)})}
 ALL.sort((a,b)=>a.d<b.d?-1:1);BYP={};for(const x of ALL){const k=nrm(x.n);(BYP[k]=BYP[k]||[]).push(x)}return ALL}
const gamesOf=n=>{all();return BYP[nrm(n)]||[]};
/* --- stato delle pagine (si ricorda sul telefono) --- */
const ST={a:SEASONS[SEASONS.length-1].a,b:today(),q:"",sort:"ff",box:0,sq:"QUE",pl:"",pa:"",pb:"",met:"f",per:"g",back:"stat"};
try{Object.assign(ST,JSON.parse(localStorage.getItem("e16_stat")||"{}"))}catch(e){}
const save=()=>{try{localStorage.setItem("e16_stat",JSON.stringify(ST))}catch(e){}};
const inP=x=>x.d>=ST.a&&x.d<=ST.b;
const fmtD=d=>{const[y,m,g]=d.split("-");return g+"/"+m+"/"+y.slice(2)};
const ffCls=v=>v>=50?"v":v>=35?"g":v>=20?"o":"r";
const effCls=v=>v>=1.4?"g":v>=1?"o":"r";
const f1=v=>(Math.round(v*10)/10).toLocaleString("it-IT",{minimumFractionDigits:1,maximumFractionDigits:1});
const f2=v=>v.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2});
const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const shortN=n=>{const p=n.split(" ");return p.length>1?(p[0][0]+"."+p.slice(1).join(" ")).toUpperCase():n.toUpperCase()};
/* (6) Le pagine usano la stessa struttura (classi) delle Statistiche di Dreamers: gli stili sono in skin-giorno.css / skin-notte.css */
const SV={pl:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.6" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="M4.5 20a7.5 7.5 0 0 1 15 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>',
 sq:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 3v5.5c0 4.6-3.2 8-8 9.5-4.8-1.5-8-4.9-8-9.5V6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path></svg>',
 cup:'<svg class="cupt" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v4a5 5 0 0 1-10 0V4zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 13v4M8.5 20h7M10 17h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
 tr:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8M15 7h6v6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
 cal:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"></rect><path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>',
 fil:'<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 5h18l-7 8v6l-4-2v-4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path></svg>'};
const gvC=v=>v>=50?"v":v>=35?"g":v>=20?"y":"r";/* colori come Dreamers: viola, verde, giallo, rosso */
const evC=v=>v>=1.4?"g":v>=1?"y":"r";
let PEROPEN=false;
/* periodo: pulsante «Periodo» come Dreamers; toccandolo si aprono le date e le scorciatoie (stagioni e mesi) */
function perBox(){const se=SEASONS.find(s=>ST.a>=s.a&&ST.a<=s.b)||SEASONS[SEASONS.length-1];
 const ms=[],end=se.b<today()?se.b:today();for(let d=new Date(se.a.slice(0,7)+"-01T12:00:00Z");d.toISOString().slice(0,7)<=end.slice(0,7);d.setUTCMonth(d.getUTCMonth()+1))ms.push(d.toISOString().slice(0,7));
 const mon=ST.a.slice(0,7)===ST.b.slice(0,7)?ST.a.slice(0,7):"";const t=today();
 const sz=SEASONS.map(s=>`<option value="${s.a}|${s.b<t?s.b:t}"${se.k===s.k&&!mon&&ST.a===s.a?" selected":""}>Stagione ${s.l}</option>`).join("")+`<option value="${SEASONS[1].a}|${t}"${ST.a===SEASONS[1].a&&ST.b>=t?" selected":""}>Ultimi 2 anni</option><option value="${SEASONS[0].a}|${t}"${ST.a===SEASONS[0].a&&ST.b>=t?" selected":""}>Tutto</option>`;
 return `<div class="fabar"><button class="perbtn" data-peropen="1"><span>Periodo</span><b>${SV.cal}${fmtD(ST.a)} → ${fmtD(ST.b)}</b></button><button class="fafil" data-peropen="1" aria-expanded="${PEROPEN}">${SV.fil}Date</button></div>
 ${PEROPEN?`<div class="fbxrow e16dt"><label>Dal <input type="date" data-sp="a" value="${ST.a}"></label><label>al <input type="date" data-sp="b" value="${ST.b}"></label></div>`:""}
 <div class="chips esqm"><label class="szchip" aria-pressed="${!mon}"><select data-szsel="1">${sz}</select></label>${ms.filter(m=>m+"-01"<=t).map(m=>{const[y,mm]=m.split("-");const last=new Date(Date.UTC(+y,+mm,0)).toISOString().slice(0,10);return`<button class="chip" data-pr="${m}-01|${last}" aria-pressed="${mon===m}">${["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"][+mm-1]}</button>`}).join("")}</div>`}
/* --- aggregato giocatori nel periodo --- */
function agg(L){const P={};for(const x of L){if(!inP(x))continue;const k=nrm(x.n);const p=P[k]||(P[k]={n:x.n,t:x.t,gp:0,m:0,f:0,s:new Array(20).fill(0)});p.t=x.t;p.gp++;p.m+=x.m;p.f+=x.f;for(let j=3;j<20;j++)p.s[j]+=x.r[j]}return P}
const bxsHtml=r=>{const ch=(v,l,c)=>`<span class="${c||""}"><b>${v}</b><small>${l}</small></span>`,miss=-((r[6]-r[5])+(r[10]-r[9])),rb=r[11]+r[12];
 return `<div class="bxs">${ch(r[4],"PT",r[4]>=30?"gb gv":r[4]>=20?"gv":"")}${ch(rb,"RB",rb>=10?"gb gv":"")}${ch(r[13],"AS",r[13]>=10?"gb gv":r[13]>=6?"gv":"")}${ch(r[14],"ST",r[14]>=2?"gv":"")}${ch(r[15],"BL",r[15]>=2?"gv":"")}${ch(r[7],"3P",r[7]>=3?"gv":"")}${ch(r[16],"TO",r[16]>=3?"gr2":"gv")}${ch(miss,"TIRI SBAGL.",miss<=-12?"gr2":"gv")}</div>`};
/* ===== HUB (come la pagina Statistiche di Dreamers) ===== */
let SND=null;
function vHub(){needOld();
 const N=nights(),d=SND&&N.includes(SND)?SND:N[N.length-1],i=N.indexOf(d);let rows=d?rowsOf(d):[];rows.sort((a,b)=>b.f-a.f);
 const avg=rows.length?rows.reduce((a,x)=>a+x.f,0)/rows.length:0;
 const[y,m,g]=(d||"--").split("-");const dl=d?`Notte del ${+g} ${["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"][+m-1]}`:"—";
 const row=(x,k)=>{const o=ownOf(x.r[0]);return `<div class="snrow bxm" data-pl="${e(x.r[0])}"><span class="wedge" style="--tc:${o?TCOL[o.t]:"#334155"}">${o?`<span class="badge logo lg-${o.t}"></span>`:""}</span><div class="sninfo"><b><i>${k+1}</i><i class="rtr ${o?ROLE(o.ruolo)[0].replace("A","F"):"F"}"></i>${e(x.r[0])}</b><small>vs ${x.opp} · <span class="mnb">${x.r[3]} min</span></small>${bxsHtml(x.r)}<em class="bxt">${x.r[5]}/${x.r[6]} tiri · ${x.r[7]}/${x.r[8]} da 3 · ${x.r[9]}/${x.r[10]} tl${x.r[18]||x.r[19]?` · ${x.r[18]} tec. ${x.r[19]} flagr.`:""}</em></div><span class="snp p${gvC(x.f)}">${f1(x.f)}</span></div>`};
 return `<button class="gback" data-go="home">‹ Home</button><button class="effbig pl" data-sv="sgioc">${SV.pl}<span>Giocatori</span><i>›</i></button> <button class="effbig sq" data-sv="ssq">${SV.sq}<span>Squadre</span><i>›</i></button>
 <div class="effpair2"><button class="cupbtn" data-sv="comp">${SV.cup}<span>Comparatore</span><i>›</i></button><button class="trbtn" data-avgr="1">${SV.tr}<span>Regole AVG</span><i>›</i></button></div>
 ${AVGR?`<div class="snemb"><p class="rules" style="margin:0;padding:10px 4px">Ogni partita: <b>PT +1 · canestro +2 · tiro tentato −1 · tripla +1 · libero +1 · libero tentato −1 · rimb. off. +2,5 · rimb. dif. +2 · assist +2 · recupero +4 · stoppata +4 · persa −2 · fallo −1 · tecnico −1 · flagrante −3</b>. Efficienza = AVG al minuto. Dati ESPN: stagioni 24/25, 25/26 e stagione in corso.</p></div>`:""}
 <div class="snemb"><h2><span class="t"><span>Statistiche notte</span></span><em>${rows.length} giocatori</em></h2>
 <div class="sndate"><button ${i>0?`data-snd="${N[i-1]}"`:"disabled"}>‹</button><div><b>${dl}</b><small>data USA · media ${f2(avg)} AVG</small></div><button ${i>=0&&i<N.length-1?`data-snd="${N[i+1]}"`:"disabled"}>›</button></div>
 <div class="snlist">${rows.slice(0,60).map(row).join("")}</div></div>`}
let AVGR=false;
/* ===== GIOCATORI (tabella come Dreamers) ===== */
function vGioc(){const ok=needOld();
 let L=Object.values(agg(all()));const q=nrm(ST.q);if(q)L=L.filter(p=>nrm(p.n).includes(q)||nrm(p.t)===q||(ownOf(p.n)&&nrm(TM[ownOf(p.n).t].nome).includes(q)));
 const key={ff:p=>p.f/p.gp,gp:p=>p.gp,min:p=>p.m/p.gp,eff:p=>p.m?p.f/p.m:0}[ST.sort]||(p=>p.f/p.gp);L.sort((a,b)=>key(b)-key(a));
 const th=(k,l)=>`<th class="fasrt${ST.sort===k?" on":""}" data-ss="${k}">${l}${ST.sort===k?" ▼":""}</th>`;
 const row=(p,i)=>{const o=ownOf(p.n),t=o&&TM[o.t],ff=p.f/p.gp,ef=p.m?p.f/p.m:0,rl=o?ROLE(o.ruolo):"";
  return `<tr class="farow${o?" faoth":""}" data-pl="${e(p.n)}"><td class="fark">${i+1}</td><td class="fanm"><b><i class="rtr ${rl?rl[0].replace("A","F"):"F"}"></i>${e(shortN(p.n).replace(". ","."))}</b><small>${t?`<span class="fagl"><span class="faglb logo lg-${t.id}"></span></span>${e(t.nome.split(" ").slice(-1)[0])} · ${rl} · `:"Svincolato · "}${p.t}</small>${ST.box?boxMini(p):""}</td><td>${p.gp}</td><td>${f1(p.m/p.gp)}</td><td class="fapdk"><span class="pdkx ${gvC(ff)}">${f1(ff)}</span></td><td><span class="ev ${evC(ef)}"><i></i>${f2(ef)}</span></td></tr>`};
 return `<button class="gback" data-sv="stat">‹ Statistiche</button><h2><span class="t"><span>Giocatori</span></span><em>${L.length} giocatori</em></h2>
 <input id="sq" class="vtq" type="search" placeholder="🔍 Cerca giocatore, squadra NBA o del fanta" autocomplete="off" value="${e(ST.q)}">
 ${perBox()}${ok?"":`<p class="note" style="color:#fff">Carico le stagioni passate…</p>`}
 <div class="fbxrow"><span class="fbxt"><button data-box="1" aria-pressed="${!!ST.box}">Box</button><button data-box="0" aria-pressed="${!ST.box}">AVG</button></span></div>
 <div class="tbl-wrap"><table class="fatbl"><thead><tr><th>#</th><th>Giocatore</th>${th("gp","PG")}${th("min","Min")}${th("ff","AVG")}${th("eff","Eff.")}</tr></thead><tbody>${L.slice(0,200).map(row).join("")}</tbody></table></div>`}
function boxMini(p){const s=p.s,g=p.gp,a=v=>f1(v/g);return `<div class="bxs" style="margin-top:4px"><span><b>${a(s[4])}</b><small>PT</small></span><span><b>${a(s[11]+s[12])}</b><small>RB</small></span><span><b>${a(s[13])}</b><small>AS</small></span><span><b>${a(s[14])}</b><small>ST</small></span><span><b>${a(s[15])}</b><small>BL</small></span><span><b>${a(s[16])}</b><small>TO</small></span></div>`}
/* ===== SQUADRE (come la pagina squadra delle Statistiche Dreamers) ===== */
function vSq(){const ok=needOld();const t=TM[ST.sq]||TEAMS[0];
 const P=agg(all());const rows=(ROSE[t.id]||[]).map(g=>{const k=nrm(g[0]),p=P[k],G=gamesOf(g[0]).filter(inP);return{g,p,G}}).sort((a,b)=>(b.p?b.p.f/b.p.gp:-1)-(a.p?a.p.f/a.p.gp:-1));
 const tit=rows.filter(x=>x.g[2]!=="BE"&&x.g[2]!=="IR");const tot=tit.reduce((s,x)=>s+(x.p?x.p.f/x.p.gp:0),0);
 const best=rows.find(x=>x.p);const nG=rows.reduce((s,x)=>s+x.G.length,0);const inj=rows.filter(x=>x.g[2]==="IR").length;
 const ncol=Math.min(8,Math.max(4,...rows.map(x=>x.G.length)));const R=REC[t.id];
 return `<button class="gback esqback" data-sv="stat">‹ Statistiche</button>
 <div class="chips">${TEAMS.map(x=>`<button class="chip" data-sq="${x.id}" aria-pressed="${x.id===t.id}"><span class="badge logo lg-${x.id}"></span>${e(x.nome.split(" ").slice(-1)[0])}</button>`).join("")}</div>
 <div class="esqhead" style="background:linear-gradient(115deg,${TCOL[t.id]} 0%,color-mix(in srgb,${TCOL[t.id]} 60%,#000) 100%);color:#ffffff;border-bottom:4px solid #0b0b0b"><span class="badge logo lg-${t.id}"></span><div class="esqt"><small>${e(t.nome)}</small><h3>${e(t.nome.split(" ").slice(-1)[0])}</h3></div></div>
 <div class="esqs v4"><div class="esqk esqk3"><div class="${inj?"dn":""}"><small>Infortunati (IR)</small><b>${inj}</b><em>${inj?"in IR":"tutti disponibili"}</em></div><div><small>Partite</small><b>${nG}</b><em>nel periodo</em></div><div><small>Record</small><b>${R?R.w+"-"+R.l:"–"}</b><em>ESPN</em></div></div>
 <div class="esqk esqk2"><div><small>AVG titolari</small><b>${f1(tot)}</b><em>somma delle medie dei 14 titolari</em></div><div><small>Migliore</small><b><span class="rcbx">${best?f1(best.p.f/best.p.gp):"–"}</span></b><em>${best?e(best.g[0]):""}</em></div></div></div>
 ${perBox()}
 <div class="esqctl"><button class="advbtn ggy grbtn" data-sv="comp">📈 Confronta i giocatori</button></div>
 <div class="tbl-wrap esqwrap"><table class="ptbl esqtbl esqg"><thead><tr><th>Giocatore</th><th class="gcol"><b>Media</b></th>${Array.from({length:ncol},(_,i)=>`<th class="gcol"><b>${i+1}ª</b></th>`).join("")}</tr></thead><tbody>
 ${rows.map(x=>{const G=x.G.slice(-ncol);return `<tr class="plink" data-pl="${e(x.g[0])}"><td class="pnm">${e(x.g[0])} <span class="plgo">›</span><small>${x.g[1]} · ${x.g[2]}</small></td><td class="gcell">${x.p?`<span class="gv ${gvC(x.p.f/x.p.gp)}">${f1(x.p.f/x.p.gp)}</span><small class="gd">${x.p.gp} part.</small>`:""}</td>${Array.from({length:ncol},(_,i)=>{const y=G[i];return`<td class="gcell">${y?`<span class="gv ${gvC(y.f)}">${f1(y.f)}</span><small class="gd">${y.o}</small>`:""}</td>`}).join("")}</tr>`}).join("")}</tbody></table></div>
 <p class="esqnote">Ultime ${ncol} partite di ogni giocatore nel periodo (sotto il valore l avversario). Giocatori in ordine di AVG medio. <span class="gv v">da 50</span> <span class="gv g">35-50</span> <span class="gv y">20-35</span> <span class="gv r">sotto 20</span>${ok?"":" · carico le stagioni passate…"}</p>`}
/* ===== GRAFICO (stesso disegno del grafico Dreamers: griglia, etichette, punti con valore) ===== */
const MET={f:["AVG",x=>x.f,"pdk"],m:["Minuti",x=>x.m,"min"],e:["Efficienza",x=>x.m?x.f/x.m:0,"eff"]};
const GG=["Dom","Lun","Mar","Mer","Gio","Ven","Sab"];
function groups(G){if(ST.per==="g")return G.map(x=>({k:x.d,lab:GG[new Date(x.d+"T12:00:00Z").getUTCDay()]+" "+fmtD(x.d).slice(0,5),sub:x.o,L:[x]}));
 const key=ST.per==="s"?(x=>x.s):(x=>x.d.slice(0,7));const M=new Map();for(const x of G){const k=key(x);if(!M.has(k))M.set(k,[]);M.get(k).push(x)}
 return [...M].map(([k,L])=>({k,lab:ST.per==="s"?"Stag. "+SEASONS.find(s=>s.k===k).l:MESI[+k.slice(5)-1]+" "+k.slice(2,4),sub:L.length+" part.",L}))}
const val=(L,met)=>met==="e"?(()=>{const m=L.reduce((s,x)=>s+x.m,0);return m?L.reduce((s,x)=>s+x.f,0)/m:0})():L.reduce((s,x)=>s+MET[met][1](x),0)/L.length;
function chart(series,met){
 const W=340,H=246,l=32,r=14,t=28,b=32;const pts=series.map(s=>s.G.map(g=>val(g.L,met)));const all=pts.flat();if(!all.length)return`<div class="grfoot">Nessuna partita nel periodo.</div>`;
 const mx0=Math.max(...all),mn=Math.min(0,Math.min(...all));const step=met==="e"?(mx0>2?1:.5):mx0>60?20:mx0>30?20:10;const mx=Math.ceil(mx0*1.05/step)*step||step;
 const N=Math.max(...series.map(s=>s.G.length)),X=i=>l+12+(N<2?(W-l-r-24)/2:i*(W-l-r-24)/(N-1)),Y=v=>t+(H-t-b)*(1-(v-mn)/(mx-mn));
 let o="";for(let v=Math.ceil(mn/step)*step;v<=mx+1e-9;v+=step)o+=`<line x1="${l}" x2="${W-r}" y1="${Y(v)}" y2="${Y(v)}" class="grg"></line><text x="${l-5}" y="${Y(v)+3}" class="gry l">${met==="e"?String(v).replace(".",","):v}</text>`;
 const ev=Math.ceil(N/4);const G0=series[0].G;for(let i=0;i<N;i+=ev){const g=G0[i];if(!g)continue;o+=`<line x1="${X(i)}" x2="${X(i)}" y1="${t}" y2="${H-b}" class="grv"></line><text x="${X(i)}" y="${H-b+15}" class="grx big">${e(g.lab)}</text><text x="${X(i)}" y="${H-b+26}" class="grx">${e(g.sub)}</text>`}
 o+=`<text x="4" y="10" class="gry ax" text-anchor="start">${MET[met][0].toUpperCase()}</text>`;
 series.forEach((s,k)=>{const P=pts[k];o+=`<polyline points="${P.map((v,i)=>X(i).toFixed(1)+","+Y(v).toFixed(1)).join(" ")}" fill="none" stroke="${s.col}" stroke-width="2.6" stroke-linejoin="miter" stroke-linecap="round"></polyline>`;
  const big=P.length<=40;P.forEach((v,i)=>{o+=`<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="${big?4:2.2}" fill="${s.col}" stroke="#0b1022" stroke-width="${big?2:1}"></circle>`});
  if(P.length<=14)P.forEach((v,i)=>{const tx=met==="e"?v.toFixed(2).replace(".",","):f1(v),w=tx.length*5.4+8;o+=`<g class="grtag"><rect x="${(X(i)-w/2).toFixed(1)}" y="${(Y(v)-20).toFixed(1)}" width="${w.toFixed(1)}" height="12" rx="6" fill="${s.col}"></rect><text x="${X(i).toFixed(1)}" y="${(Y(v)-10.5).toFixed(1)}">${tx}</text></g>`})});
 return `<svg class="grsvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Andamento">${o}</svg>`}
function trend(P){const n=P.length;if(n<3)return null;const mx=(n-1)/2,my=P.reduce((a,b)=>a+b,0)/n;let num=0,den=0;P.forEach((v,i)=>{num+=(i-mx)*(v-my);den+=(i-mx)**2});const sl=num/den;return my?sl*(n-1)/Math.abs(my)*100:0}
const fmV=(v,m)=>m==="e"?f2(v):f1(v);
/* ===== PROFILO GIOCATORE (come il Grafico di Dreamers) ===== */
function vPl(){const ok=needOld();const n=ST.pl;const G=gamesOf(n).filter(inP);const o=ownOf(n),t=o&&TM[o.t];const last=gamesOf(n).slice(-1)[0];
 const gr=groups(G);const P=gr.map(g=>val(g.L,ST.met));const tr=trend(P);const av=m=>G.length?val(G,m):0;
 const names=[...new Set(all().map(x=>x.n))].sort();
 return `<div class="grroom" style="--tc:${t?TCOL[t.id]:"#1747c9"};--tf:#ffffff"><button class="grback" data-sv="${ST.back||"sgioc"}">‹ Indietro</button>
 <div class="grhd"><span class="grlg">${t?`<span class="badge logo lg-${t.id}"></span>`:""}</span><div><small>${t?e(t.nome)+" · ":""}${last?last.t:""} · grafici</small><b>${e(n)}</b></div></div>
 <div class="grtop"><div class="grctl"><label class="grsel"><span>Giocatore</span><select data-psel="pl">${names.map(x=>`<option${x===n?" selected":""}>${e(x)}</option>`).join("")}</select></label> <button class="perbtn" data-peropen="1"><span>Periodo</span><b>${SV.cal}${fmtD(ST.a)} → ${fmtD(ST.b)}</b></button></div><div class="grjs e16js">${t?`<img src="${t.logo}" alt="">`:""}</div></div>
 ${PEROPEN?perBox():""}
 <div class="pergr"><span>Media per</span><div>${[["s","Stagioni"],["m","Mesi"],["g","Giorni"]].map(([k,l])=>`<button data-per="${k}" aria-pressed="${ST.per===k}">${l}</button>`).join("")}</div></div>
 <div class="grtgs">${Object.keys(MET).map(k=>`<button class="grtg ${MET[k][2]}" data-met="${k}" aria-pressed="${ST.met===k}"><i></i>${MET[k][0]}<b>${G.length?fmV(av(k),k):"–"}</b></button>`).join("")}</div>
 <div class="grcard grshc"><div class="grtrs"><div class="grtr ${MET[ST.met][2]}"><i></i><b>${G.length?fmV(av(ST.met),ST.met):"–"}</b>${tr!=null?`<em class="${tr>=0?"up":"dn"}">${tr>=0?"▲ +":"▼ "}${Math.round(tr)}%</em>`:""}</div></div>${chart([{n,col:"#22c55e",G:gr}],ST.met)}<div class="grfoot">${G.length} partite · ${ST.per==="g"?"ogni partita":ST.per==="m"?"media per mese":"media per stagione"}${ok?"":" · carico le stagioni passate…"}</div></div>
 <div class="esqctl"><button class="advbtn ggy grbtn" data-cmp="${e(n)}">📈 Confronta con un altro giocatore</button></div>
 <div class="tbl-wrap"><table class="fatbl e16log"><thead><tr><th>Data</th><th>Vs</th><th>Min</th><th>AVG</th><th>PT</th><th>RB</th><th>AS</th><th>ST</th><th>BL</th><th>TO</th><th>Tiri</th></tr></thead><tbody>
 ${G.slice().reverse().slice(0,120).map(x=>{const r=x.r;return`<tr><td>${fmtD(x.d)}</td><td>${x.o}</td><td>${r[3]}</td><td class="fapdk"><span class="pdkx ${gvC(x.f)}">${f1(x.f)}</span></td><td>${r[4]}</td><td>${r[11]+r[12]}</td><td>${r[13]}</td><td>${r[14]}</td><td>${r[15]}</td><td>${r[16]}</td><td>${r[5]}/${r[6]}</td></tr>`}).join("")}</tbody></table></div></div>`}
/* ===== COMPARATORE (due giocatori sullo stesso grafico) ===== */
function vComp(){const ok=needOld();const names=[...new Set(all().map(x=>x.n))].sort();const A=ST.pa,B=ST.pb;
 const sel=(k,v,c)=>`<label class="grsel"><span><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${c};margin-right:5px"></i>Giocatore ${k==="pa"?"A":"B"}</span><select data-psel="${k}"><option value="">🔍 Cerca il giocatore ${k==="pa"?"A":"B"}</option>${names.map(x=>`<option${x===v?" selected":""}>${e(x)}</option>`).join("")}</select></label>`;
 let body=`<div class="grcard"><div class="grfoot" style="text-align:center;padding:30px 0">Scegli i due giocatori da confrontare.</div></div>`;
 if(A&&B){const GA=gamesOf(A).filter(inP),GB=gamesOf(B).filter(inP);let ga=groups(GA),gb=groups(GB);
  if(ST.per!=="g"){const ks=[...new Set([...ga,...gb].map(g=>g.k))].sort();ga=ks.map(k=>ga.find(g=>g.k===k)).filter((g,i)=>g&&gb.find(x=>x.k===ks[i]));gb=ga.map(g=>gb.find(x=>x.k===g.k))}
  const va=GA.length?val(GA,ST.met):0,vb=GB.length?val(GB,ST.met):0;
  body=`<div class="grcard grshc"><div class="grtrs"><div class="grtr pdk"><i style="background:#22c55e"></i><b>${fmV(va,ST.met)}</b><em>${e(A.split(" ").slice(-1)[0])}</em></div><div class="grtr min"><i style="background:#f472b6"></i><b>${fmV(vb,ST.met)}</b><em>${e(B.split(" ").slice(-1)[0])}</em></div></div>${chart([{n:A,col:"#22c55e",G:ga},{n:B,col:"#f472b6",G:gb}],ST.met)}<div class="grfoot">${GA.length} e ${GB.length} partite · ${ST.per==="g"?"partita per partita":ST.per==="m"?"media per mese":"media per stagione"}</div></div>`}
 return `<div class="grroom" style="--tc:#1747c9;--tf:#ffffff"><button class="grback" data-sv="${ST.back==="gioc"?"gioc":"stat"}">‹ Indietro</button><div class="grhd"><span class="grlg"></span><div><small>Confronto · due giocatori sullo stesso grafico</small><b>Comparatore</b></div></div>
 <div class="grctl">${sel("pa",A,"#22c55e")}${sel("pb",B,"#f472b6")}<button class="perbtn" data-peropen="1"><span>Periodo</span><b>${SV.cal}${fmtD(ST.a)} → ${fmtD(ST.b)}</b></button></div>${PEROPEN?perBox():""}
 <div class="pergr"><span>Media per</span><div>${[["s","Stagioni"],["m","Mesi"],["g","Giorni"]].map(([k,l])=>`<button data-per="${k}" aria-pressed="${ST.per===k}">${l}</button>`).join("")}</div></div>
 <div class="grtgs">${Object.keys(MET).map(k=>`<button class="grtg ${MET[k][2]}" data-met="${k}" aria-pressed="${ST.met===k}"><i></i>${MET[k][0]}</button>`).join("")}</div>${body}
 ${ok?"":`<div class="grfoot">Carico le stagioni passate…</div>`}</div>`}
/* ===== collegamento con l app ===== */
window.e16ResetStats=()=>{ALL=null};
window.STATV={stat:vHub,sgioc:vGioc,ssq:vSq,gioc:vPl,comp:vComp};
document.addEventListener("click",ev=>{const c=ev.target.closest("[data-sv],[data-pr],[data-ss],[data-box],[data-sq],[data-pl],[data-per],[data-met],[data-cmp],[data-peropen],[data-snd],[data-avgr]");if(!c||!window.STATV[cur]&&!c.dataset.pl)return;
 const d=c.dataset;
 if(d.peropen){PEROPEN=!PEROPEN;render();return}
 if(d.snd){SND=d.snd;render();return}
 if(d.avgr){AVGR=!AVGR;render();return}
 if(d.sv){cur=d.sv;PEROPEN=false;render();scrollTo(0,0);return}
 if(d.pr){[ST.a,ST.b]=d.pr.split("|");save();render();return}
 if(d.ss){ST.sort=d.ss;save();render();return}
 if(d.box){ST.box=+d.box;save();render();return}
 if(d.sq){ST.sq=d.sq;save();render();return}
 if(d.per){ST.per=d.per;save();render();return}
 if(d.met){ST.met=d.met;save();render();return}
 if(d.cmp){ST.pa=d.cmp;ST.back="gioc";save();cur="comp";render();scrollTo(0,0);return}
 if(d.pl){ST.back=window.STATV[cur]?cur:"sgioc";ST.pl=d.pl;save();curTeam=null;cur="gioc";render();scrollTo(0,0);return}},true);
document.addEventListener("change",ev=>{const t=ev.target;if(t.dataset.szsel){[ST.a,ST.b]=t.value.split("|");save();render();return}if(t.dataset.sp){ST[t.dataset.sp]=t.value;save();render()}else if(t.dataset.psel){ST[t.dataset.psel]=t.value;save();render()}});
document.addEventListener("input",ev=>{if(ev.target.id==="sq"){ST.q=ev.target.value;save();const p=ev.target.selectionStart;render();const i=document.getElementById("sq");i.focus();try{i.setSelectionRange(p,p)}catch(_){}}});
})();
