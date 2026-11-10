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
/* (41) STAGIONI PASSATE SOLO PER I DUCKS: nella versione ufficiale si vede solo la stagione in corso; 24/25 e 25/26 si accendono
   con il tasto dell area riservata Ducks (dax.js, localStorage e16_dax2 = "1") e valgono solo su quel telefono. */
const DAXS=()=>{try{return localStorage.getItem("e16_dax2")==="1"}catch(_){return false}};
const OLD0=["2425","2526"];let OLD=DAXS()?OLD0:[];/* stagioni passate: un file per stagione (tools/storico.mjs) */
const SEAS=()=>DAXS()?SEASONS:SEASONS.slice(-1);
window.e16DaxStats=on=>{try{localStorage.setItem("e16_dax2",on?"1":"0")}catch(_){}OLD=on?OLD0:[];ALL=null;BYP=null;if(!on){if(ST.a<SEASONS[2].a)ST.a=SEASONS[2].a;if(ST.psz&&ST.psz!=="2627")ST.psz="2627";save()}};
function needOld(){if(!OLD.length)return true;/* (44) senza stagioni passate non c è niente da caricare */if(window.STORICO&&OLD.every(k=>STORICO[k]))return true;if(!loading){loading=true;let n=0;for(const k of OLD){const s=document.createElement("script");s.src="storico-"+k+".js";s.onload=()=>{if(++n===OLD.length){ALL=null;render()}};document.head.appendChild(s)}}return false}
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
if(!DAXS()){if(ST.a<SEASONS[2].a)ST.a=SEASONS[2].a;if(ST.psz&&ST.psz!=="2627")ST.psz="2627"}
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
function perBox(){const SE=SEAS(),se=SE.find(s=>ST.a>=s.a&&ST.a<=s.b)||SE[SE.length-1];
 const ms=[],end=se.b<today()?se.b:today();for(let d=new Date(se.a.slice(0,7)+"-01T12:00:00Z");d.toISOString().slice(0,7)<=end.slice(0,7);d.setUTCMonth(d.getUTCMonth()+1))ms.push(d.toISOString().slice(0,7));
 const mon=ST.a.slice(0,7)===ST.b.slice(0,7)?ST.a.slice(0,7):"";const t=today();
 const sz=SE.map(s=>`<option value="${s.a}|${s.b<t?s.b:t}"${se.k===s.k&&!mon&&ST.a===s.a?" selected":""}>Stagione ${s.l}</option>`).join("")+(SE.length<2?"":`<option value="${SEASONS[1].a}|${t}"${ST.a===SEASONS[1].a&&ST.b>=t?" selected":""}>Ultimi 2 anni</option><option value="${SEASONS[0].a}|${t}"${ST.a===SEASONS[0].a&&ST.b>=t?" selected":""}>Tutto</option>`);
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
 return `<button class="gback" data-go="home">‹ Home</button><button class="effbig pl" data-sv="sgioc">${SV.pl}<span>Giocatori</span><i>›</i></button> <button class="effbig sq" data-sv="ssql">${SV.sq}<span>Squadre</span><i>›</i></button>
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
/* (40) SQUADRE: prima l elenco delle 16 squadre con logo e colori (come «Squadre · scegli una squadra» di Dreamers), poi la pagina della squadra scelta */
function vSqList(){return `<button class="gback esqback" data-sv="stat">‹ Statistiche</button><h2><span class="t"><span>Squadre</span></span><em>scegli una squadra</em></h2>
 <div class="sqpklist">${TEAMS.map(t=>`<div class="sqpk" data-sqpick="${t.id}" role="button" tabindex="0" aria-label="Statistiche ${e(t.nome)}"><span class="sqpkw" style="--tc:${TCOL[t.id]}"><span class="badge logo lg-${t.id}" role="img" aria-label="${e(t.nome)}"></span></span><span class="sqpkn"><b>${e(t.nome.split(" ").slice(-1)[0])}</b><small>${e(t.nome.split(" ").slice(0,-1).join(" "))}</small></span><i>›</i></div>`).join("")}</div>`}
document.addEventListener("click",ev=>{const c=ev.target.closest("[data-sqpick]");if(!c||cur!=="ssql")return;ST.sq=c.dataset.sqpick;save();cur="ssq";render();scrollTo(0,0)});
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
/* ===== GRAFICO DEL GIOCATORE (come il Grafico di Dreamers: si apre dal tasto «📈 Grafico» del profilo) ===== */
function vGraf(){/* (35) dal profilo: il tasto indietro torna al profilo */const ok=needOld();const n=ST.pl;const G=gamesOf(n).filter(inP);const o=ownOf(n),t=o&&TM[o.t];const last=gamesOf(n).slice(-1)[0];
 const gr=groups(G);const P=gr.map(g=>val(g.L,ST.met));const tr=trend(P);const av=m=>G.length?val(G,m):0;
 const names=[...new Set(all().map(x=>x.n))].sort();
 return `<div class="grroom" style="--tc:${t?TCOL[t.id]:"#1747c9"};--tf:#ffffff"><button class="grback" data-sv="gioc">‹ Indietro</button>
 <div class="grhd"><span class="grlg">${t?`<span class="badge logo lg-${t.id}"></span>`:""}</span><div><small>${t?e(t.nome)+" · ":""}${last?last.t:""}${etaOf(n)!=null?" · "+etaTxt(n)+" (nato il "+nascOf(n).split("-").reverse().join("/")+")":""}</small><b>${e(n)}</b></div></div>
 <div class="grtop"><div class="grctl"><label class="grsel"><span>Giocatore</span><select data-psel="pl">${names.map(x=>`<option${x===n?" selected":""}>${e(x)}</option>`).join("")}</select></label> <button class="perbtn" data-peropen="1"><span>Periodo</span><b>${SV.cal}${fmtD(ST.a)} → ${fmtD(ST.b)}</b></button></div><div class="grjs e16js">${t?`<img src="${t.logo}" alt="">`:""}</div></div>
 ${PEROPEN?perBox():""}
 <div class="pergr"><span>Media per</span><div>${[["s","Stagioni"],["m","Mesi"],["g","Giorni"]].map(([k,l])=>`<button data-per="${k}" aria-pressed="${ST.per===k}">${l}</button>`).join("")}</div></div>
 <div class="grtgs">${Object.keys(MET).map(k=>`<button class="grtg ${MET[k][2]}" data-met="${k}" aria-pressed="${ST.met===k}"><i></i>${MET[k][0]}<b>${G.length?fmV(av(k),k):"–"}</b></button>`).join("")}</div>
 <div class="grcard grshc"><div class="grtrs"><div class="grtr ${MET[ST.met][2]}"><i></i><b>${G.length?fmV(av(ST.met),ST.met):"–"}</b>${tr!=null?`<em class="${tr>=0?"up":"dn"}">${tr>=0?"▲ +":"▼ "}${Math.round(tr)}%</em>`:""}</div></div>${chart([{n,col:"#22c55e",G:gr}],ST.met)}<div class="grfoot">${G.length} partite · ${ST.per==="g"?"ogni partita":ST.per==="m"?"media per mese":"media per stagione"}${ok?"":" · carico le stagioni passate…"}</div></div>
 <div class="esqctl"><button class="advbtn ggy grbtn" data-cmp="${e(n)}">📈 Confronta con un altro giocatore</button></div>
 <div class="tbl-wrap"><table class="fatbl e16log"><thead><tr><th>Data</th><th>Vs</th><th>Min</th><th>AVG</th><th>PT</th><th>RB</th><th>AS</th><th>ST</th><th>BL</th><th>TO</th><th>Tiri</th></tr></thead><tbody>
 ${G.slice().reverse().slice(0,120).map(x=>{const r=x.r;return`<tr><td>${fmtD(x.d)}</td><td>${x.o}</td><td>${r[3]}</td><td class="fapdk"><span class="pdkx ${gvC(x.f)}">${f1(x.f)}</span></td><td>${r[4]}</td><td>${r[11]+r[12]}</td><td>${r[13]}</td><td>${r[14]}</td><td>${r[15]}</td><td>${r[16]}</td><td>${r[5]}/${r[6]}</td></tr>`}).join("")}</tbody></table></div></div>`}
/* ===== (35) PROFILO GIOCATORE come la scheda giocatore di Dreamers (vGiocatore) =====
   Banner con i colori della squadra del fanta e la maglia (campo.js), nome, «Segui» (Osservatorio) e «Condividi» (immagine),
   ruolo · squadra NBA · numero, età con i mesi, infortunio dal Centro Medico; tasti «📈 Grafico» e «⚖ Confronta»;
   scelta della stagione; AVG medio ed efficienza (AVG al minuto) con le barre rispetto alla media della squadra;
   partite, minuti, proiezione 36', ultima partita, posizione in lega; partita per partita divisa per mese; pagella con le stelline. */
const SZP0=[["2627","Stagione 26/27"],["2526","Stagione 25/26"],["2425","Stagione 24/25"]];const SZPf=()=>DAXS()?SZP0:SZP0.slice(0,1);
const effLv=v=>v==null?"na":evC(v);/* pallino efficienza: verde da 1,40 · giallo 1,00–1,40 · rosso sotto 1,00 (AVG al minuto) */
const evB=v=>v==null?'<span class="ev na">—</span>':`<span class="ev ${effLv(v)}"><i></i>${f2(v)}</span>`;
const pdkB=(v,txt)=>v==null||isNaN(v)?'<span class="dash">—</span>':`<span style="color:#fff!important;-webkit-text-fill-color:#fff!important" class="pdkx ${gvC(v)}">${txt??f1(v)}</span>`;
const n1=v=>v==null?"—":v.toLocaleString("it-IT",{minimumFractionDigits:1,maximumFractionDigits:1});
const H2=(t,sub="")=>`<h2><span class="t"><span>${t}</span></span>${sub}</h2>`;
function etaMesi(n){const d=typeof nascOf==="function"?nascOf(n):null;if(!d)return"";const b=new Date(d+"T00:00:00Z"),t=new Date();let m=(t.getUTCFullYear()-b.getUTCFullYear())*12+t.getUTCMonth()-b.getUTCMonth();if(t.getUTCDate()<b.getUTCDate())m--;if(m<0)return"";const a=Math.floor(m/12),mm=m%12;return`${a} anni${mm?` ${mm} ${mm===1?"mese":"mesi"}`:""}`}
const nkOf=t=>TM[t]?TM[t].nome.split(" ").slice(-1)[0]:"";
/* medie di una lista di partite: partite, minuti medi, AVG medio, efficienza */
const aggG=L=>{if(!L.length)return null;const m=L.reduce((a,x)=>a+x.m,0),f=L.reduce((a,x)=>a+x.f,0);return{g:L.length,min:m/L.length,avg:f/L.length,eff:m?f/m:null}};
/* stelline della pagella (stesso disegno di Dreamers) */
const STAR_P="M6 .6l1.6 3.5 3.8.4-2.9 2.6.8 3.8L6 9 2.7 10.9l.8-3.8L.6 4.5l3.8-.4z";let PGID=0;
const pgI=(x,P)=>{if(x<=P[0][0])return P[0][1];for(let i=1;i<P.length;i++)if(x<=P[i][0]){const[a,b]=P[i-1],[c,d]=P[i];return b+(d-b)*(x-a)/(c-a)}return P[P.length-1][1]};
function pgStars(v,col){if(v==null)return`<span class="pgnd">n.d.</span>`;const id="e16pg"+(PGID++),w=64;const row=Array.from({length:5},(_,k)=>`<path d="${STAR_P}" transform="translate(${k*13} 0)"/>`).join("");
 return`<span class="pgsw"><svg viewBox="0 0 ${w} 12" width="${Math.round(w*1.2)}" height="14" aria-label="${String(Math.round(v*10)/10).replace(".",",")} stelle"><defs><clipPath id="${id}"><rect width="${v*13}" height="12"/></clipPath></defs><g fill="rgba(255,255,255,.14)">${row}</g><g fill="${col}" clip-path="url(#${id})">${row}</g></svg><b>${(Math.round(v*10)/10).toLocaleString("it-IT",{minimumFractionDigits:1})}</b></span>`}
const PG_COL={pdk:"#facc15",gio:"#22c55e",inj:"#ef4444",min:"#f97316",effe:"#818cf8",spa:"#ec4899"};
/* pagella: valore e AVG pesato del Calcolatore (VAL), stelline per AVG, giovinezza, infortuni, minutaggio, efficienza, spazio in squadra (come Dreamers).
   (36) INFORTUNI: inf-data.js (INF_STELLE: come Dreamers per gli stessi giocatori, gli altri stimati dalle partite saltate; più stelle = più sano).
   SPAZIO IN SQUADRA (criteri di Dreamers): gerarchia nella sua squadra NBA ordinata per AVG medio + 0,3 × minuti medi (stagione in corso, tutti i
   giocatori della squadra dai tabellini ESPN): 1° = 5 · 2° = 4 · 3° = 3 · poi ≥24 minuti = 2 · in rotazione (≥12 minuti) = 1 · fondo = ½. */
const nnP=x=>String(x).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/ş/g,"s").replace(/[.'’]/g,"").replace(/\s+(jr|sr|ii|iii|iv)$/,"").replace(/\s+/g," ").trim();
let INFN=null;const infOf=n=>{if(typeof INF_STELLE==="undefined")return null;if(!INFN){INFN={};for(const k in INF_STELLE)INFN[nnP(k)]=[INF_STELLE[k],(typeof INF_SRC!=="undefined"?INF_SRC:{})[k]]}return INFN[nnP(n)]||null};
let SPZ=null;function spazio(n){if(!SPZ){const P={};for(const d of nights())for(const x of rowsOf(d)){const k=x.r[0];const o=P[k]||(P[k]={n:k,t:x.r[1],f:0,m:0,g:0,last:""});o.f+=x.f;o.m+=x.r[3];o.g++;if(d>=o.last){o.last=d;o.t=x.r[1]}}
  SPZ={};for(const k in P){const o=P[k];o.s=o.f/o.g+.3*o.m/o.g;o.mn=o.m/o.g;(SPZ[o.t]=SPZ[o.t]||[]).push(o)}for(const t in SPZ)SPZ[t].sort((a,b)=>b.s-a.s)}
 for(const t in SPZ){const i=SPZ[t].findIndex(o=>nnP(o.n)===nnP(n));if(i>=0){const mn=SPZ[t][i].mn;return{v:i===0?5:i===1?4:i===2?3:mn>=24?2:mn>=12?1:.5,pos:i+1,t}}}return null}
function pagellaHTML(n,A){const V=(typeof VAL!=="undefined"&&VAL.p&&VAL.p[n])||null,age=etaOf(n);
 const s={avg:A?pgI(A.avg,[[5,0],[10,.5],[20,1.5],[30,2.5],[40,3.5],[50,4.5],[60,5]]):null,gio:age==null?null:pgI(age,[[20,5],[22,4.5],[24,4],[26,3.5],[28,3],[30,2.5],[32,2],[34,1.5],[36,1],[38,.5],[40,0]]),
  min:A?pgI(A.min,[[0,0],[4,1],[7,1.5],[15,2],[20,2.5],[25,3],[29,3.5],[31,4],[34,4.5],[36,5]]):null,eff:A&&A.eff!=null?pgI(A.eff,[[.5,.5],[.7,1],[.85,1.5],[1,2],[1.1,2.5],[1.2,3],[1.3,3.5],[1.4,4],[1.55,4.5],[1.7,5]]):null};
 const c=(lab,sub,val,col)=>`<div class="pgc"><small>${lab}${sub?` <em>${sub}</em>`:""}</small>${pgStars(val,col)}</div>`;
 return`<div class="pgbox"><div class="pgvp"><div><small>Valore</small><b>${V?V[0]:"n.d."}</b></div><div><small>AVG pesato</small><b class="pr">${V?n1(V[1]):"—"}</b></div><div class="pgag"><small>Agg.</small><span>${typeof VAL!=="undefined"&&VAL.upd?e(VAL.upd.split(",")[0])+" (automatico)":"—"}</span></div></div>
 <div class="pgg">${c("AVG",A?n1(A.avg):"",s.avg,PG_COL.pdk)}${c("Giovinezza",age!=null?age+" anni":"",s.gio,PG_COL.gio)}${(()=>{const I=infOf(n);return c("Infortuni",I&&I[1]==="S"?"stima":"",I?I[0]:null,PG_COL.inj)})()}${c("Minutaggio",A?n1(A.min)+"'":"",s.min,PG_COL.min)}${c("Efficienza",A&&A.eff!=null?f2(A.eff):"",s.eff,PG_COL.effe)}${(()=>{const S=spazio(n);return c("Spazio in squadra",S?S.pos+"° in "+S.t:"",S?S.v:null,PG_COL.spa)})()}</div>
 <p class="pgnote">Più stelle = meglio (Infortuni: più stelle = più sano; «stima» = calcolata dalle partite saltate nelle ultime due stagioni). Spazio in squadra = posto nella gerarchia della sua squadra NBA (AVG e minuti). Valore e AVG pesato del Calcolatore scambi (aggiornati ogni domenica).</p></div>`}
let SHR_PL=null;
function vPl(){const ok=needOld();const n=ST.pl;const o=ownOf(n),t=o&&TM[o.t]?o.t:null,T=t?TM[t]:null;
 const SZP=SZPf(),sz=SZP.some(x=>x[0]===ST.psz)?ST.psz:"2627",GLall=gamesOf(n),GL=GLall.filter(x=>x.s===sz),A=aggG(GL),last=GLall.slice(-1)[0];
 const nba=last?last.t:"",num=window.e16Num?e16Num(n):"",ruolo=o?ROLE(o.ruolo):(last&&last.r[22]?({G:"Guardia",F:"Ala",C:"Centro"})[String(last.r[22])[0]]||"":"");
 const bg=T?TCOL[t]:"#334155";
 /* media efficienza della squadra del fanta nella stagione scelta */
 const ts=t?aggG((ROSE[t]||[]).flatMap(g=>gamesOf(g[0]).filter(x=>x.s===sz))):null;
 /* posizione in lega: giocatori delle 16 rose con almeno una partita nella stagione */
 const LG=[];for(const tt in ROSE)for(const g of ROSE[tt]){const a=aggG(gamesOf(g[0]).filter(x=>x.s===sz));if(a)LG.push([g[0],a])}
 const rA=A?[...LG].sort((a,b)=>b[1].avg-a[1].avg).findIndex(x=>nrm(x[0])===nrm(n))+1:0,rE=A?[...LG].sort((a,b)=>(b[1].eff||0)-(a[1].eff||0)).findIndex(x=>nrm(x[0])===nrm(n))+1:0;
 const inj=window.e16InjOf?e16InjOf(n):null;
 SHR_PL={n,t,num,r:ruolo||"—",nba,sz,GL,a:A,rk:rA?[rA,LG.length]:null};
 const pct=v=>Math.max(3,Math.min(100,(v||0)/2*100));
 const stat=(lab,val,sub="")=>`<div class="gst"><small>${lab}</small><b>${val}</b>${sub?`<em>${sub}</em>`:""}</div>`;
 const SEG=window.e16SegBtn?e16SegBtn(n,1):"";
 const SH=`<span class="segi shpl" data-plsh="1" role="button" tabindex="0" aria-label="Condividi la scheda del giocatore">${SH_ICO}<em>Condividi</em></span>`;
 const jer=window.e16Jersey?(t?e16Jersey(t,num,nkOf(t)):e16Jersey("FA",num,"Free Agent")):(nba?`<img src="loghi/nba/${String(nba).toLowerCase()}.svg" alt="" style="width:96px;height:96px;object-fit:contain;display:block;margin:auto">`:"");/* (45) svincolati: maglia bianca FREE AGENT */
 const MESI=["","Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
 const by={};GL.forEach(x=>{const k=x.d.slice(0,7);(by[k]=by[k]||[]).push(x)});const ms=Object.keys(by).sort().reverse();
 return `<button class="gback" data-sv="${ST.back||"sgioc"}">‹ Indietro</button>
 <div class="ghead" style="background:linear-gradient(115deg,${bg} 0%,color-mix(in srgb,${bg} 60%,#000) 100%);color:#ffffff;border-bottom:4px solid #0b0b0b">
  <div class="gjer">${jer}</div>
  <div class="gtit"><small>${T?e(T.nome):"Svincolato"}</small><h3>${e(n)}</h3><div class="segrow">${SEG}${SH}</div><p>${[ruolo,nba,num!==""?"#"+num:""].filter(Boolean).join(" · ")}${etaMesi(n)?`<span style="display:block">${etaMesi(n)}</span>`:""}</p>${inj?`<div class="injtag ${inj.k}">${e(inj.lab)} · ${e(inj.txt)}</div>`:""}</div>
 </div>
 ${window.e16ContrBox?e16ContrBox(n):""}
 <button class="advbtn ggrbtn ggy" data-plgr="1">📈 Grafico</button>
 <button class="advbtn ggrbtn ggy" data-cmp="${e(n)}">⚖ Confronta con un altro giocatore</button>
 <div class="gszn"><label for="gseason">Stagione</label><select id="gseason" data-psz="1">${SZPf().map(([k,l])=>`<option value="${k}"${k===sz?" selected":""}>${l}</option>`).join("")}</select></div>
 ${!A?`<p class="note">${sz!=="2627"?(ok?"Nessuna partita NBA in questa stagione: non era in NBA o non ha giocato.":"Carico le stagioni passate…"):"Nessuna partita giocata finora: i dati compariranno dopo la prima gara."}</p>`:`
 <div class="gbig g2"><div><b class="gpdk"><span style="color:#fff!important;-webkit-text-fill-color:#fff!important" class="pdkx big ${gvC(A.avg)}">${f2(A.avg)}</span></b><small>AVG medi a partita</small></div><div>${evB(A.eff)}<small>Efficienza media</small></div></div>
 <div class="gbars">
  <div><span>${e(n.split(" ").slice(-1)[0])}</span><i><b style="width:${pct(A.eff)}%;background:${bg}"></b></i><em>${A.eff==null?"—":f2(A.eff)}</em></div>
  ${ts&&ts.eff!=null?`<div><span>Media ${e(nkOf(t))}</span><i><b style="width:${pct(ts.eff)}%;background:#5b6b95"></b></i><em>${f2(ts.eff)}</em></div>`:""}
 </div>
 <div class="gstats">
  ${stat("Partite",A.g)}${stat("Minuti medi",n1(A.min))}${stat("Proiezione 36'",A.eff==null?"—":n1(A.eff*36),"AVG")}${stat("Ultima partita",n1(GL[GL.length-1].f),"AVG")}
  ${stat("Lega · AVG",rA?rA+"°":"—",rA?"su "+LG.length:"fuori dalle rose")}${stat("Lega · efficienza",rE?rE+"°":"—",rE?"su "+LG.length:"fuori dalle rose")}
 </div>`}
 ${GL.length?`${H2("Partita per partita",`<em>${GL.length} ${GL.length===1?"gara":"gare"}</em>`)}
 ${ms.map((m,i)=>{const l=by[m],a=aggG(l);return `<details class="gmese"${i===0?" open":""}><summary><span class="gmn">${MESI[+m.slice(5)]}</span><span class="gmesi">${l.length} ${l.length===1?"gara":"gare"} · media</span>${evB(a.eff)}</summary>
  <div class="tbl-wrap"><table class="gtab"><thead><tr><th>Data</th><th>Min</th><th>AVG</th><th>Eff.</th><th>Proj 36'</th></tr></thead><tbody>${l.slice().reverse().map(x=>{const r=x.r,ef=x.m?x.f/x.m:null;return `<tr><td class="gd"><b>${fmtD(x.d).slice(0,5)} <i>vs ${e(x.o)}</i></b><small>${r[4]} pt · ${r[11]+r[12]} rb · ${r[13]} as</small></td><td>${n1(x.m)}</td><td class="gdk">${pdkB(x.f,f1(x.f))}</td><td>${evB(ef)}</td><td class="gpj">${ef==null?"—":n1(ef*36)}</td></tr>`}).join("")}</tbody></table></div></details>`}).join("")}`:""}
 ${H2("Pagella")}
 ${pagellaHTML(n,A)}
 <p class="note">Lega · AVG e Lega · efficienza: posizione tra tutti i giocatori delle 16 rose con almeno una partita nella stagione scelta, per <b>AVG</b> (punti medi a partita con la formula ESPN della lega) e per <b>efficienza</b> (AVG fatti per ogni minuto giocato). Dati ESPN, stagioni passate solo regular season. Pallino: verde da 1,40 · giallo 1,00–1,40 · rosso sotto 1,00.</p>`}
/* ===== CONDIVIDI SCHEDA GIOCATORE (come Dreamers): foglio con «Condividi profilo» e «Condividi ultima partita», immagini come quelle di Dreamers ===== */
const SH_ICO='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
function shRR(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
const SH_F=(w,s,it)=>`${it?"italic ":""}${w} ${s}px "Barlow Condensed","Arial Narrow",Arial,sans-serif`,SH_B=(w,s)=>`${w} ${s}px Barlow,Arial,sans-serif`;
function shImg(src){return new Promise(r=>{if(!src)return r(null);const i=new Image();if(/^https?:/.test(src))i.crossOrigin="anonymous";i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src})}
const SH_PK={r:["#ef4444","#fff"],y:["#f5b400","#111"],g:["#22c55e","#06240f"],v:["#8b5cf6","#fff"],na:["#334155","#cbd5e1"]};
function shPill(c,v,x,y,w,h,fs,txt){const[bg,fg]=SH_PK[v==null?"na":gvC(v)];shRR(c,x,y,w,h,h*.28);c.fillStyle=bg;c.fill();c.fillStyle=fg;c.font=SH_F(800,fs||h*.62,1);c.textAlign="center";c.textBaseline="middle";c.fillText(txt??(v==null?"—":f2(v)),x+w/2,y+h/2+1);c.textBaseline="alphabetic"}
/* di giorno sfondo parquet (come Dreamers con lo stile Parquet), di notte viola galassia */
const isNight=()=>typeof E16N!=="undefined"&&E16N;
async function shBase(H,W){try{await Promise.all([document.fonts.load(SH_F(800,40,1)),document.fonts.load(SH_F(700,40)),document.fonts.load(SH_B(500,30))])}catch(e){}
 const cv=document.createElement("canvas");cv.width=W;cv.height=H;const c=cv.getContext("2d");let g;
 if(!isNight()){g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,"#b9763a");g.addColorStop(1,"#9b5f2c");c.fillStyle=g;c.fillRect(0,0,W,H);c.save();c.strokeStyle="rgba(0,0,0,.07)";c.lineWidth=26;c.beginPath();for(let x=0;x<W;x+=60){c.moveTo(x,0);c.lineTo(x,H)}c.stroke();c.restore()}
 else{g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,"#2a1260");g.addColorStop(.45,"#160a38");g.addColorStop(1,"#0a0618");c.fillStyle=g;c.fillRect(0,0,W,H);
  g=c.createRadialGradient(200,0,0,200,0,760);g.addColorStop(0,"rgba(168,85,247,.55)");g.addColorStop(1,"rgba(168,85,247,0)");c.fillStyle=g;c.fillRect(0,0,W,H);
  let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<Math.round(H/14);i++){c.globalAlpha=.25+rnd()*.6;c.fillStyle=rnd()<.3?"#e9d5ff":"#fff";c.beginPath();c.arc(rnd()*W,rnd()*H,.8+rnd()*1.8,0,7);c.fill()}c.globalAlpha=1}
 const lg=await shImg("logo-app.png");c.save();shRR(c,56,56,76,76,16);c.clip();if(lg)c.drawImage(lg,56,56,76,76);else{c.fillStyle="#ea580c";c.fillRect(56,56,76,76)}c.restore();
 c.textBaseline="alphabetic";c.textAlign="left";c.font=SH_F(800,48,1);c.letterSpacing="6px";c.fillStyle="#fff";c.shadowColor="rgba(0,0,0,.35)";c.shadowBlur=12;c.fillText("ESPN 16",150,102);c.shadowBlur=0;c.letterSpacing="3px";c.font=SH_F(700,19,1);c.fillStyle="rgba(255,240,220,.85)";c.fillText("FANTABASKET USA · AVG",153,128);c.letterSpacing="0px";
 return{cv,c,W}}
const PAN=()=>isNight()?"rgba(15,8,40,.55)":"rgba(48,25,10,.55)",BRD=()=>isNight()?"rgba(196,181,253,.3)":"rgba(255,184,108,.35)",LAB=()=>isNight()?"rgba(196,181,253,.9)":"rgba(255,214,170,.95)";
function shFoot(c,W,H,txt){const PQ=!isNight();if(PQ){shRR(c,40,H-92,W-80,72,18);c.fillStyle="#fdf3e1";c.fill()}else{c.strokeStyle="rgba(196,181,253,.25)";c.lineWidth=2;c.beginPath();c.moveTo(56,H-96);c.lineTo(W-56,H-96);c.stroke()}
 const d=new Date(),p=v=>String(v).padStart(2,"0");c.font=SH_B(500,24);c.fillStyle=PQ?"#b8410a":"rgba(226,232,240,.6)";c.textAlign="left";c.textBaseline="middle";c.fillText(txt,56,H-56);c.textAlign="right";c.fillText(`${p(d.getDate())}/${p(d.getMonth()+1)} · ${p(d.getHours())}:${p(d.getMinutes())}`,W-56,H-56);c.textBaseline="alphabetic"}
const fit=(c,t,w)=>{if(c.measureText(t).width<=w)return t;while(t.length>1&&c.measureText(t+"…").width>w)t=t.slice(0,-1);return t+"…"};
/* intestazione dell immagine: banner con i colori della squadra, maglia (o logo NBA per gli svincolati), nome, ruolo, età, squadra */
async function shHead(c,W,S,y0,hh){const T=S.t?TM[S.t]:null,bg=T?TCOL[S.t]:"#334155";
 c.save();shRR(c,56,y0,W-112,hh,28);c.clip();const dk=(h,k)=>{const v=parseInt(h.slice(1),16),q=x=>Math.round(x*(1-k)).toString(16).padStart(2,"0");return"#"+q(v>>16)+q((v>>8)&255)+q(v&255)};
 const gg=c.createLinearGradient(56,y0,W-56,y0+hh);gg.addColorStop(0,bg);gg.addColorStop(1,dk(bg,.4));c.fillStyle=gg;c.fillRect(56,y0,W-112,hh);
 c.strokeStyle="rgba(255,255,255,.07)";c.lineWidth=18;c.beginPath();for(let x=-hh;x<W;x+=44){c.moveTo(x+56,y0+hh);c.lineTo(x+56+hh,y0)}c.stroke();c.fillStyle="#0b0b0b";c.fillRect(56,y0+hh-10,W-112,10);c.restore();
 let ic=null;try{if(window.e16Jersey){const s=S.t?e16Jersey(S.t,S.num,nkOf(S.t)):e16Jersey("FA",S.num,"Free Agent");ic=await shImg("data:image/svg+xml;charset=utf-8,"+encodeURIComponent(s.includes("xmlns=")?s:s.replace("<svg",'<svg xmlns="http://www.w3.org/2000/svg"')))}else if(S.nba)ic=await shImg(`loghi/nba/${String(S.nba).toLowerCase()}.svg`)}catch(e){}
 if(ic){const bx=230,r=Math.min(bx/ic.width,bx/ic.height),w=ic.width*r,h=ic.height*r;c.drawImage(ic,56+20+(bx-w)/2,y0+(hh-h)/2,w,h)}
 const tx=56+20+250+16,tw=W-56-24-tx;c.textAlign="left";c.fillStyle="#fff";const nm=S.n.toUpperCase();let fs=92;c.font=SH_F(800,fs,1);while(fs>44&&c.measureText(nm).width>tw){fs-=2;c.font=SH_F(800,fs,1)}c.fillText(nm,tx,y0+112);
 c.font=SH_F(700,38,1);c.globalAlpha=.85;c.fillText(fit(c,[S.r.toUpperCase(),S.nba||null,S.num!==""?"#"+S.num:null].filter(Boolean).join(" · "),tw),tx,y0+170);c.globalAlpha=1;
 const eta=etaOf(S.n);c.font=SH_F(800,38,1);c.fillStyle="#fde68a";if(eta!=null)c.fillText(eta+" ANNI",tx,y0+222);
 c.font=SH_F(700,30,1);c.fillStyle="#fff";c.globalAlpha=.8;c.fillText(fit(c,T?T.nome.toUpperCase():"SVINCOLATO",tw-(eta!=null?190:0)),tx+(eta!=null?190:0),y0+222);c.globalAlpha=1}
/* scheda giocatore 1080×1350: AVG ed efficienza medi, minuti, partite, ultima gara, proiezione 36', trend AVG partita per partita */
async function shPlayer(){const S=SHR_PL;if(!S)return null;const H=1350,W=1080,{cv,c}=await shBase(H,W),a=S.a,GL=S.GL||[];
 c.font=SH_F(700,28,1);c.textAlign="right";c.fillStyle="rgba(255,240,220,.8)";c.fillText((SZP0.find(x=>x[0]===S.sz)||["",""])[1].toUpperCase(),W-56,100);
 const y0=170,hh=260;await shHead(c,W,S,y0,hh);
 if(!a){c.textAlign="center";c.font=SH_F(800,46,1);c.fillStyle="#fff";c.fillText("NESSUNA PARTITA NBA",W/2,y0+hh+190);c.fillText("IN QUESTA STAGIONE",W/2,y0+hh+250);shFoot(c,W,H,"Dati ESPN");return cv}
 const yb=y0+hh+28,bh=216,bw=(W-112-30)/2;
 [[0,"AVG MEDI A PARTITA"],[1,"EFFICIENZA MEDIA"]].forEach(([i,lab])=>{const x=56+i*(bw+30);shRR(c,x,yb,bw,bh,28);c.fillStyle=PAN();c.fill();c.strokeStyle=BRD();c.lineWidth=2;c.stroke();
  c.textAlign="center";c.font=SH_F(700,30,1);c.fillStyle=LAB();c.letterSpacing="3px";c.fillText(lab,x+bw/2,yb+54);c.letterSpacing="0px";
  if(i===0)shPill(c,a.avg,x+bw/2-150,yb+72,300,114,90,f2(a.avg));
  else{const ev=a.eff,col=ev==null?"#94a3b8":ev>=1.4?"#22c55e":ev>=1?"#f5b400":"#ef4444";c.fillStyle=col;c.beginPath();c.arc(x+bw/2-128,yb+132,16,0,7);c.fill();c.font=SH_F(800,116,1);c.fillStyle="#fff";c.textAlign="center";c.fillText(ev==null?"—":f2(ev),x+bw/2+22,yb+174)}});
 const ys=yb+bh+22,sh=132,sw=(W-112-3*20)/4,lst=GL.length?GL[GL.length-1].f:null;
 [["MINUTI MEDI",n1(a.min)],["PARTITE",String(a.g)],["ULTIMA GARA",n1(lst)],["PROIEZ. 36'",a.eff==null?"—":n1(a.eff*36)]].forEach(([l,v],i)=>{const x=56+i*(sw+20);shRR(c,x,ys,sw,sh,22);c.fillStyle=PAN();c.fill();c.strokeStyle=BRD();c.lineWidth=2;c.stroke();
  c.textAlign="center";c.font=SH_F(700,24,1);c.fillStyle=LAB();c.letterSpacing="2px";c.fillText(l,x+sw/2,ys+40);c.letterSpacing="0px";c.font=SH_F(800,64,1);c.fillStyle="#fff";c.fillText(v,x+sw/2,ys+102)});
 const yt=ys+sh+22,th=H-96-24-yt;shRR(c,56,yt,W-112,th,28);c.fillStyle=PAN();c.fill();c.strokeStyle=BRD();c.lineWidth=2;c.stroke();
 c.textAlign="left";c.font=SH_F(800,36,1);c.fillStyle="#fff";c.letterSpacing="3px";c.fillText("TREND AVG",90,yt+56);c.letterSpacing="0px";
 if(GL.length>=2){const v=GL.map(g=>g.f),av=v.reduce((p,q)=>p+q,0)/v.length,kn=Math.max(1,Math.min(3,Math.floor(v.length/2))),k3=v.slice(-kn),l3=k3.reduce((p,q)=>p+q,0)/k3.length,d=l3-av;
  c.textAlign="right";c.font=SH_F(800,34,1);c.fillStyle=d>=0?"#4ade80":"#f87171";c.fillText(`${kn===1?"ULTIMA GARA":"ULTIME "+kn}: ${n1(l3)}  ${Math.abs(d)<.05?"= IN LINEA":(d>=0?"▲ +":"▼ −")+n1(Math.abs(d))+" VS MEDIA"}`,W-90,yt+56);
  const gx=110,gy=yt+100,gw=W-220,gh=th-100-70,lo=Math.min(...v,av),hi=Math.max(...v,av),pad=(hi-lo||1)*.15,mn=lo-pad,mx=hi+pad,px=i=>gx+i*gw/(v.length-1),py=q=>gy+gh-(q-mn)/(mx-mn)*gh;
  c.strokeStyle="rgba(255,255,255,.15)";c.lineWidth=2;for(let i=0;i<4;i++){const yy=gy+gh*i/3;c.beginPath();c.moveTo(gx,yy);c.lineTo(gx+gw,yy);c.stroke()}
  c.setLineDash([14,10]);c.strokeStyle="#facc15";c.lineWidth=3;c.beginPath();c.moveTo(gx,py(av));c.lineTo(gx+gw,py(av));c.stroke();c.setLineDash([]);
  c.textAlign="left";c.font=SH_F(700,26,1);c.fillStyle="#facc15";c.fillText("MEDIA "+n1(av),gx+6,py(av)-12);
  const up=d>=0,lc=up?"#22c55e":"#ef4444",lr=up?"34,197,94":"239,68,68",gr=c.createLinearGradient(0,gy,0,gy+gh);gr.addColorStop(0,`rgba(${lr},.5)`);gr.addColorStop(1,`rgba(${lr},0)`);c.beginPath();v.forEach((q,i)=>i?c.lineTo(px(i),py(q)):c.moveTo(px(i),py(q)));c.lineTo(px(v.length-1),gy+gh);c.lineTo(px(0),gy+gh);c.closePath();c.fillStyle=gr;c.fill();
  c.strokeStyle=lc;c.lineWidth=7;c.lineJoin="round";c.beginPath();v.forEach((q,i)=>i?c.lineTo(px(i),py(q)):c.moveTo(px(i),py(q)));c.stroke();
  v.forEach((q,i)=>{const L=i===v.length-1;c.fillStyle=L?"#fff":lc;c.beginPath();c.arc(px(i),py(q),L?12:v.length>25?4:7,0,7);c.fill();if(L){c.strokeStyle=lc;c.lineWidth=5;c.stroke()}});
  const bi=v.indexOf(Math.max(...v)),LI=v.length-1;c.font=SH_F(800,34,1);c.textAlign="center";c.fillStyle="#fff";
  [...new Set([bi,LI])].forEach(i=>{const x=Math.min(Math.max(px(i),gx+30),gx+gw-30);c.lineWidth=9;c.strokeStyle="#140c33";c.strokeText(n1(v[i]),x,py(v[i])-24);c.fillText(n1(v[i]),x,py(v[i])-24)});
  c.font=SH_F(700,26,1);c.fillStyle=LAB();c.textAlign="left";c.fillText(fmtD(GL[0].d).slice(0,5),gx,gy+gh+46);c.textAlign="right";c.fillText(fmtD(GL[GL.length-1].d).slice(0,5),gx+gw,gy+gh+46);c.textAlign="center";c.fillText(`${v.length} PARTITE`,gx+gw/2,gy+gh+46)}
 else{c.textAlign="center";c.font=SH_F(700,40,1);c.fillStyle=LAB();c.fillText(GL.length?"Il trend compare dopo la seconda partita":"Partite non ancora disponibili",W/2,yt+th/2+20)}
 shFoot(c,W,H,S.rk?`Lega · AVG ${S.rk[0]}° su ${S.rk[1]} · dati ESPN`:"Dati ESPN");return cv}
/* immagine dell ultima partita giocata: intestazione, AVG della partita e tabellino */
async function shUltima(){const S=SHR_PL;const L=gamesOf(S.n),x=L[L.length-1];if(!x)return null;const H=1080,W=1080,{cv,c}=await shBase(H,W),r=x.r;
 c.font=SH_F(700,28,1);c.textAlign="right";c.fillStyle="rgba(255,240,220,.8)";c.fillText(`ULTIMA PARTITA · ${fmtD(x.d)} · VS ${x.o}`,W-56,100);
 await shHead(c,W,S,170,260);const yb=470;shRR(c,56,yb,W-112,200,28);c.fillStyle=PAN();c.fill();c.strokeStyle=BRD();c.lineWidth=2;c.stroke();
 c.textAlign="center";c.font=SH_F(700,30,1);c.fillStyle=LAB();c.letterSpacing="3px";c.fillText("AVG DELLA PARTITA",W/2,yb+50);c.letterSpacing="0px";shPill(c,x.f,W/2-150,yb+68,300,110,86,f1(x.f));
 const st=[["MIN",r[3]],["PT",r[4]],["RB",r[11]+r[12]],["AS",r[13]],["ST",r[14]],["BL",r[15]],["TO",r[16]],["TIRI",r[5]+"/"+r[6]]],sw=(W-112-3*16)/4,sh=130;
 st.forEach(([l,v],i)=>{const x0=56+(i%4)*(sw+16),y=yb+230+Math.floor(i/4)*(sh+16);shRR(c,x0,y,sw,sh,22);c.fillStyle=PAN();c.fill();c.strokeStyle=BRD();c.lineWidth=2;c.stroke();c.textAlign="center";c.font=SH_F(700,26,1);c.fillStyle=LAB();c.fillText(l,x0+sw/2,y+42);c.font=SH_F(800,62,1);c.fillStyle="#fff";c.fillText(String(v),x0+sw/2,y+104)});
 shFoot(c,W,H,"Dati ESPN · formula AVG della lega");return cv}
/* foglio di condivisione come Dreamers: anteprima, Chiudi, Salva, Condividi */
async function shOpen(k){const sh=document.createElement("div");sh.className="shsheet";sh.innerHTML='<div class="shbox"><p class="shwait">Preparo l\'immagine…</p></div>';document.body.appendChild(sh);
 sh.addEventListener("click",ev=>{if(ev.target===sh||ev.target.closest(".shx"))sh.remove()});
 let cv=null;try{cv=await(k==="nt"?shUltima():shPlayer())}catch(err){console.error(err)}
 if(!cv){sh.querySelector(".shbox").innerHTML='<p class="shwait">Niente da condividere adesso.</p><button class="shx">Chiudi</button>';return}
 const name=(SHR_PL.n||"giocatore").toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g,"-")+".png";let blob=null;try{blob=await new Promise(r=>cv.toBlob(r,"image/png"))}catch(_){}
 if(!blob){sh.querySelector(".shbox").innerHTML='<p class="shwait">Immagine non disponibile.</p><button class="shx">Chiudi</button>';return}
 const file=new File([blob],name,{type:"image/png"}),url=URL.createObjectURL(blob);
 sh.querySelector(".shbox").innerHTML=`<img src="${url}" alt="Anteprima da condividere"><div class="shfoot"><div class="shbar"><button class="shx">Chiudi</button><a class="shsv" href="${url}" download="${name}">Salva</a><button class="shgo">${SH_ICO} Condividi</button></div></div>`;
 const go=sh.querySelector(".shgo");if(!(navigator.canShare&&navigator.canShare({files:[file]})))go.remove();else go.addEventListener("click",async()=>{try{await navigator.share({files:[file],title:"ESPN 16 · "+SHR_PL.n})}catch(_){}})}
/* foglio di scelta come Dreamers (plShAsk): profilo o ultima partita */
function plShAsk(){const S=SHR_PL;if(!S)return;const old=document.querySelector(".shsheet");if(old)old.remove();const L=gamesOf(S.n),U=L[L.length-1];
 const sh=document.createElement("div");sh.className="shsheet shch";
 sh.innerHTML=`<div class="shchb" role="dialog" aria-label="Cosa vuoi condividere"><div class="shchh"><b>Condividi</b><small>${e(S.n)}</small></div>
  <button class="shco" data-shc="pl"><span class="shci">👤</span><span><b>Condividi profilo</b><small>Scheda con età, AVG, efficienza e andamento</small></span></button>
  <button class="shco" data-shc="nt"${U?"":" disabled"}><span class="shci">🌙</span><span><b>Condividi ultima partita</b><small>${U?`vs ${e(U.o)} · ${fmtD(U.d).slice(0,5)} · ${f1(U.f)} AVG`:"Nessuna partita giocata"}</small></span></button>
  <button class="shchx" data-shc="x">Annulla</button></div>`;
 document.body.appendChild(sh);
 sh.addEventListener("click",ev=>{const b=ev.target.closest("[data-shc]");if(ev.target===sh||(b&&b.dataset.shc==="x")){sh.remove();return}if(!b||b.disabled)return;sh.remove();shOpen(b.dataset.shc)})}
window.e16PlShare={shPlayer,shUltima,plShAsk,shOpen};
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
window.e16ResetStats=()=>{ALL=null;SPZ=null};
(window.NAVX=window.NAVX||[]).push({k:"st",get:()=>({pl:ST.pl,back:ST.back,pa:ST.pa,pb:ST.pb,psz:ST.psz}),set:o=>Object.assign(ST,o)});
/* ===== (44) FREE AGENT (Centro gestione › Free agent): i giocatori liberi della lega ESPN (LEGA.fa, i più posseduti nelle leghe ESPN)
   con AVG, partite e minuti della stagione scelta, prezzo di listino (listino-data.js) e se entra nel cap libero dei Ducks.
   Come il resto delle Statistiche: di base solo la stagione in corso; 24/25 e 25/26 solo con il tasto segreto Ducks (DAXS). */
const FA={sz:"2627",sort:"avg",q:"",u25:false};/* (44) età e filtro «solo under 25»: la lega impone almeno 3 under 25 per squadra */
function vFa(){const ok=needOld(),dax=DAXS(),SZ=dax?[["2627","26/27"],["2526","25/26"],["2425","24/25"]]:[["2627","26/27"]];if(!SZ.some(x=>x[0]===FA.sz))FA.sz="2627";
 const L0=(typeof LEGA!=="undefined"&&LEGA.fa)||[],LI={};try{for(const k in LISTINO)LI[nrm(k)]=LISTINO[k][0]}catch(_){}
 const lib=(()=>{try{const C=CAP.QUE;return C.libero!=null?C.libero:CAP_TOT-(C.occ[0]||0)-(C.tagli||0)}catch(_){return null}})();
 let L=L0.filter(x=>!ownOf(x[0])).map(x=>{const G=gamesOf(x[0]).filter(y=>y.s===FA.sz),gp=G.length,f=G.reduce((a,y)=>a+y.f,0),m=G.reduce((a,y)=>a+y.m,0);const a=typeof etaOf==="function"?etaOf(x[0]):null;return{n:x[0],t:x[1],pos:x[2],own:x[3],inj:x[4],gp,avg:gp?f/gp:0,min:gp?m/gp:0,pr:LI[nrm(x[0])],age:a,u:a!=null&&a<25}});
 if(FA.u25)L=L.filter(x=>x.u);
 const q=nrm(FA.q);if(q)L=L.filter(x=>nrm(x.n).includes(q)||nrm(x.t)===q);
 const K={avg:x=>x.avg,own:x=>x.own,pr:x=>x.pr==null?-1:x.pr,age:x=>x.age==null?-99:-x.age}[FA.sort];L.sort((a,b)=>K(b)-K(a)||b.avg-a.avg);
 const inj=v=>/OUT/i.test(v)?`<span class="fainj o">OUT</span>`:/DAY|QUESTION|DOUBT|GTD/i.test(v)?`<span class="fainj q">DTD</span>`:"";
 const row=(x,i)=>`<tr class="farow" data-pl="${e(x.n)}"><td class="fark">${i+1}</td><td class="fanm"><b>${e(shortN(x.n).replace(". ","."))}</b>${inj(x.inj)}<small><img class="fanba" src="loghi/nba/${String(x.t).toLowerCase()}.svg" alt="">${x.t} · ${e(x.pos)} · ${String(x.own).replace(".",",")}% · ${x.gp?x.gp+" part. · "+f1(x.min)+"′":"0 partite"}${x.age!=null?" · "+(etaMesi(x.n)||x.age+" anni"):""}</small></td><td class="faage">${x.age!=null?x.age:"–"}${x.u?`<i class="fau25">U25</i>`:""}</td><td class="fapdk">${x.gp?`<span class="pdkx ${gvC(x.avg)}">${f1(x.avg)}</span>`:"–"}</td><td class="fapr">${x.pr!=null?`${f1(x.pr)}<i class="${lib!=null&&x.pr<=lib?"ok":"no"}">${lib!=null&&x.pr<=lib?"✓":"✕"}</i>`:"–"}</td></tr>`;
 return `<button class="gback" data-go="home">‹ Home</button><h2><span class="t"><span>Free agent</span></span><em>${L.length} liberi · ESPN ${typeof LEGA!=="undefined"?e(LEGA.upd):""}</em></h2>
 <input id="faq" class="vtq" type="search" placeholder="🔍 Cerca un free agent o una squadra NBA" autocomplete="off" value="${e(FA.q)}">
 <div class="chips esqm">${[["avg","AVG"],["own","% posseduto"],["pr","Prezzo"],["age","Più giovani"]].map(([k,l])=>`<button class="chip" data-fas="${k}" aria-pressed="${FA.sort===k}">${l}</button>`).join("")}<button class="chip" data-fau="1" aria-pressed="${FA.u25}">Solo under 25</button>${dax?`<label class="szchip" aria-pressed="true"><select data-fasz="1">${SZ.map(([k,l])=>`<option value="${k}"${k===FA.sz?" selected":""}>Stagione ${l}</option>`).join("")}</select></label>`:""}</div>
 ${ok?"":`<p class="note">Carico le stagioni passate…</p>`}
 <div class="tbl-wrap"><table class="fatbl e16fa"><thead><tr><th>#</th><th>Giocatore</th><th>Età</th><th>AVG</th><th>Prezzo</th></tr></thead><tbody>${L.slice(0,200).map(row).join("")||`<tr><td colspan="5">Nessun free agent.</td></tr>`}</tbody></table></div>
 <p class="note">Free agent della lega ESPN (aggiornati in automatico). AVG, partite e minuti della stagione ${SZ.find(x=>x[0]===FA.sz)[1]}. Prezzo = listino della lega (costo all anno per firmarlo); ✓ = entra nel cap libero dei Ducks (${lib!=null?f1(lib):"–"} cr). U25 = sotto i 25 anni oggi (la lega chiede almeno 3 under 25 per squadra). Tocca un nome per il profilo.</p>`}
document.addEventListener("click",ev=>{if(cur!=="fag")return;const u=ev.target.closest("[data-fau]");if(u){FA.u25=!FA.u25;render();return}const b=ev.target.closest("[data-fas]");if(!b)return;FA.sort=b.dataset.fas;render()});
document.addEventListener("change",ev=>{if(ev.target.dataset&&ev.target.dataset.fasz&&cur==="fag"){FA.sz=ev.target.value;render()}});
document.addEventListener("input",ev=>{if(ev.target.id!=="faq")return;FA.q=ev.target.value;const p=ev.target.selectionStart;render();const i=document.getElementById("faq");if(i){i.focus();try{i.setSelectionRange(p,p)}catch(_){}}});
window.STATV={fag:vFa,stat:vHub,sgioc:vGioc,ssq:vSq,ssql:vSqList,gioc:vPl,grafico:vGraf,comp:vComp};
document.addEventListener("click",ev=>{/* (35) profilo: «Condividi» apre il foglio di scelta, «📈 Grafico» apre la pagina del grafico */const sh=ev.target.closest("[data-plsh]");if(sh&&cur==="gioc"){ev.preventDefault();ev.stopPropagation();plShAsk();return}
 const gr=ev.target.closest("[data-plgr]");if(gr&&cur==="gioc"){ev.preventDefault();ev.stopPropagation();cur="grafico";PEROPEN=false;render();scrollTo(0,0);return}
 const c=ev.target.closest("[data-sv],[data-pr],[data-ss],[data-box],[data-sq],[data-pl],[data-per],[data-met],[data-cmp],[data-peropen],[data-snd],[data-avgr]");if(!c||!window.STATV[cur]&&!c.dataset.pl)return;
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
document.addEventListener("change",ev=>{const t=ev.target;if(t.dataset.psz){ST.psz=t.value;save();render();return}if(t.dataset.szsel){[ST.a,ST.b]=t.value.split("|");save();render();return}if(t.dataset.sp){ST[t.dataset.sp]=t.value;save();render()}else if(t.dataset.psel){ST[t.dataset.psel]=t.value;save();render()}});
document.addEventListener("input",ev=>{if(ev.target.id==="sq"){ST.q=ev.target.value;save();const p=ev.target.selectionStart;render();const i=document.getElementById("sq");i.focus();try{i.setSelectionRange(p,p)}catch(_){}}});
})();
