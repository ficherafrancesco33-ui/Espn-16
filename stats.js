/* ===== ESPN 16 – STATISTICHE (come la sezione Statistiche di Dreamers, con i punti FFPS) =====
   Pagine: stat (scelta Giocatori / Squadre) · sgioc (tutti i giocatori) · ssq (squadra del fanta) · gioc (profilo con grafici) · comp (comparatore).
   Dati: stagione in corso da espn-data.js (ESPN), stagione 2025/26 da storico-2526.js (caricato solo quando serve, è grande).
   Ogni partita di un giocatore è un oggetto {s:stagione, d:data USA, id, n:nome, t:squadra NBA, o:avversario, m:minuti, r:riga tabellino, f:FFPS}. */
(function(){
const SEASONS=[{k:"2526",l:"25/26",a:"2025-10-21",b:"2026-04-12"},{k:"2627",l:"26/27",a:"2026-10-20",b:"2027-04-30"}];
const MESI=["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];
const today=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York"}).format(new Date());
const nrm=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[.'’]/g,"").replace(/\s+(jr|sr|ii|iii|iv)$/,"").trim();
/* squadra del fanta di ogni giocatore (dalle rose) */
const OWN={};try{for(const t in ROSE)for(const g of ROSE[t])OWN[nrm(g[0])]={t,slot:g[2],ruolo:g[3]}}catch(e){}
const ownOf=n=>OWN[nrm(n)]||null;
const ROLE=r=>{const a=String(r||"").split(",");return a.some(x=>x==="C")&&!a.some(x=>/G/.test(x))?"Centro":a.some(x=>/G/.test(x))&&!a.some(x=>/F|C/.test(x))?"Guardia":a[0]&&/G/.test(a[0])?"Guardia":a[0]==="C"?"Centro":"Ala"};
/* --- caricamento dell archivio 25/26 --- */
let loading=false;
function needOld(){if(window.STORICO&&STORICO["2526"])return true;if(!loading){loading=true;const s=document.createElement("script");s.src="storico-2526.js";s.onload=()=>{ALL=null;render()};s.onerror=()=>{loading=false};document.head.appendChild(s)}return false}
/* --- tutte le partite (cache) --- */
let ALL=null,BYP=null;
function all(){if(ALL)return ALL;ALL=[];
 if(window.STORICO&&STORICO["2526"]){const S=STORICO["2526"];for(const g of S.G)for(const x of g[5]){if(!S.P[x[0]])continue;const r=[S.P[x[0]][0],...x.slice(1),x[0]];ALL.push({s:"2526",d:g[0],id:x[0],n:r[0],t:r[1],o:r[1]===g[1]?g[2]:g[1],m:r[3],r,f:ffps(r)})}}
 if(typeof ESPN!=="undefined")for(const d of Object.keys(ESPN.days).sort())for(const id of ESPN.days[d]){const g=ESPN.games[id],B=ESPN.box[id];if(!B||g[4]==="S")continue;for(const r of B)ALL.push({s:"2627",d,id:r[20],n:r[0],t:r[1],o:r[1]===g[0]?g[1]:g[0],m:r[3],r,f:ffps(r)})}
 ALL.sort((a,b)=>a.d<b.d?-1:1);BYP={};for(const x of ALL){const k=nrm(x.n);(BYP[k]=BYP[k]||[]).push(x)}return ALL}
const gamesOf=n=>{all();return BYP[nrm(n)]||[]};
/* --- stato delle pagine (si ricorda sul telefono) --- */
const ST={a:SEASONS[1].a,b:today(),q:"",sort:"ff",box:0,sq:"QUE",pl:"",pa:"",pb:"",met:"f",per:"g",back:"stat"};
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
/* --- periodo: date + scorciatoie (stagioni e mesi) --- */
function perBox(){const se=SEASONS.find(s=>ST.a>=s.a&&ST.a<=s.b)||SEASONS[1];
 const ms=[],end=se.b<today()?se.b:today();for(let d=new Date(se.a.slice(0,7)+"-01T12:00:00Z");d.toISOString().slice(0,7)<=end.slice(0,7);d.setUTCMonth(d.getUTCMonth()+1))ms.push(d.toISOString().slice(0,7));
 const mon=ST.a.slice(0,7)===ST.b.slice(0,7)?ST.a.slice(0,7):"";
 return `<div class="slab">PERIODO</div><div class="per"><label>📅 <input type="date" data-sp="a" value="${ST.a}"> → <input type="date" data-sp="b" value="${ST.b}"></label></div>
 <div class="chips">${SEASONS.map(s=>`<button class="${ST.a===s.a&&ST.b>=Math.min(s.b,today())?"on":""}" data-pr="${s.a}|${s.b<today()?s.b:today()}">STAGIONE ${s.l}</button>`).join("")}<button class="${ST.a===SEASONS[0].a&&ST.b>=today()?"on":""}" data-pr="${SEASONS[0].a}|${today()}">ULTIMI 2 ANNI</button>
 ${ms.filter(m=>m+"-01"<=today()).map(m=>{const[y,mm]=m.split("-");const last=new Date(Date.UTC(+y,+mm,0)).toISOString().slice(0,10);return`<button class="${mon===m?"on":""}" data-pr="${m}-01|${last}">${MESI[+mm-1].toUpperCase()} ${y.slice(2)}</button>`}).join("")}</div>`}
/* --- aggregato giocatori nel periodo --- */
function agg(L){const P={};for(const x of L){if(!inP(x))continue;const k=nrm(x.n);const p=P[k]||(P[k]={n:x.n,t:x.t,gp:0,m:0,f:0,s:new Array(20).fill(0)});p.t=x.t;p.gp++;p.m+=x.m;p.f+=x.f;for(let j=3;j<20;j++)p.s[j]+=x.r[j]}return P}
/* ===== HUB ===== */
function vHub(){needOld();
 return `<div class="hub"><button class="hubb b1" data-sv="sgioc"><span>👤</span><b>GIOCATORI</b><i>›</i></button><button class="hubb b2" data-sv="ssq"><span>🛡️</span><b>SQUADRE</b><i>›</i></button>
 <button class="hubb b3" data-sv="comp"><span>📈</span><b>COMPARATORE</b><i>›</i></button></div>
 <div class="card"><div class="ttl">PUNTI FFPS</div><div class="rules">Ogni partita: <b>PT +1 · canestro +2 · tiro tentato −1 · tripla +1 · libero +1 · libero tentato −1 · rimb. off. +2,5 · rimb. dif. +2 · assist +2 · recupero +4 · stoppata +4 · persa −2 · fallo −1 · tecnico −1 · flagrante −3</b>.<br>Efficienza = FFPS al minuto. Dati ESPN: stagione 25/26 e stagione in corso.</div></div>`}
/* ===== GIOCATORI ===== */
function vGioc(){const ok=needOld();
 let L=Object.values(agg(all()));const q=nrm(ST.q);if(q)L=L.filter(p=>nrm(p.n).includes(q)||nrm(p.t)===q||(ownOf(p.n)&&nrm(TM[ownOf(p.n).t].nome).includes(q)));
 const key={ff:p=>p.f/p.gp,gp:p=>p.gp,min:p=>p.m/p.gp,eff:p=>p.m?p.f/p.m:0}[ST.sort]||(p=>p.f/p.gp);L.sort((a,b)=>key(b)-key(a));
 const th=(k,l)=>`<th class="${ST.sort===k?"on":""}" data-ss="${k}">${l}${ST.sort===k?" ▼":""}</th>`;
 const row=(p,i)=>{const o=ownOf(p.n),t=o&&TM[o.t],ff=p.f/p.gp,ef=p.m?p.f/p.m:0;
  return `<tr data-pl="${e(p.n)}"><td class="rn">${i+1}</td><td><div class="gn"><b><i class="rb ${o?ROLE(o.ruolo)[0]:"x"}"></i>${e(shortN(p.n))}</b><small>${t?`<img src="${t.logo}" alt="">${e(t.nome.split(" ").slice(-1)[0])} · ${ROLE(o.ruolo)} · `:"Svincolato · "}${p.t}</small></div>${ST.box?boxMini(p):""}</td><td>${p.gp}</td><td>${f1(p.m/p.gp)}</td><td><span class="ffb ${ffCls(ff)}">${f1(ff)}</span></td><td class="ef"><i class="dt ${effCls(ef)}"></i>${f2(ef)}</td></tr>`};
 return `<button class="bk" data-sv="stat">‹ STATISTICHE</button><div class="sh"><span>GIOCATORI</span><em>${L.length} GIOCATORI</em></div>
 ${ok?"":`<div class="note" style="color:#fff">Carico la stagione 25/26…</div>`}
 <label class="srch2">🔍 <input id="sq" type="search" placeholder="Cerca giocatore, squadra NBA o del fanta" value="${e(ST.q)}" autocomplete="off"></label>
 ${perBox()}
 <div class="tg"><button class="${ST.box?"on":""}" data-box="1">BOX</button><button class="${ST.box?"":"on"}" data-box="0">FFPS</button></div>
 <div class="gt"><table><tr><th>#</th><th style="text-align:left">GIOCATORE</th>${th("gp","PG")}${th("min","MIN")}${th("ff","FFPS")}${th("eff","EFF.")}</tr>${L.slice(0,200).map(row).join("")}</table></div>
 <div class="note" style="color:#fff">Primi 200 nel periodo. Tocca un giocatore per il profilo con i grafici.</div>`}
function boxMini(p){const s=p.s,g=p.gp,a=v=>f1(v/g);return `<div class="bxm"><span>${a(s[4])}<i>PT</i></span><span>${a(s[11]+s[12])}<i>RB</i></span><span>${a(s[13])}<i>AS</i></span><span>${a(s[14])}<i>ST</i></span><span>${a(s[15])}<i>BL</i></span><span>${a(s[16])}<i>TO</i></span><span>${s[6]?Math.round(s[5]/s[6]*100):0}%<i>TIRO</i></span></div>`}
/* ===== SQUADRE ===== */
function vSq(){const ok=needOld();const t=TM[ST.sq]||TEAMS[0],R0=(ROSE[t.id]||[]).filter(g=>g[2]!=="IR");
 const P=agg(all());const rows=(ROSE[t.id]||[]).map(g=>{const k=nrm(g[0]),p=P[k],G=gamesOf(g[0]).filter(inP);return{g,p,G}}).sort((a,b)=>(b.p?b.p.f/b.p.gp:-1)-(a.p?a.p.f/a.p.gp:-1));
 const tit=rows.filter(x=>x.g[2]!=="BE"&&x.g[2]!=="IR");const tot=tit.reduce((s,x)=>s+(x.p?x.p.f/x.p.gp:0),0);
 const best=rows.find(x=>x.p);const nG=rows.reduce((s,x)=>s+x.G.length,0);const inj=rows.filter(x=>x.g[2]==="IR").length;
 const ncol=Math.min(8,Math.max(4,...rows.map(x=>x.G.length)));
 const cell=x=>`<span class="cl ${ffCls(x.f)}">${f1(x.f)}<i>${x.o}</i></span>`;
 return `<button class="bk" data-sv="stat">‹ STATISTICHE</button>
 <div class="tchips">${TEAMS.map(x=>`<button class="${x.id===t.id?"on":""}" data-sq="${x.id}"><img src="${x.logo}" alt="">${e(x.nome.split(" ").slice(-1)[0].toUpperCase())}</button>`).join("")}</div>
 <div class="tban"><img src="${t.logo}" alt=""><div><small>${e(t.nome.toUpperCase())} · ${t.conf==="E"?"EAST":"WEST"}</small><b>${e(t.nome.split(" ").slice(-1)[0].toUpperCase())}</b></div></div>
 <div class="kp"><div><small>FFPS TITOLARI</small><b>${f1(tot)}</b><span>somma delle medie dei 14 titolari</span></div><div><small>MIGLIORE</small><b style="font-size:20px">${best?e(best.g[0]):"–"}</b><span>${best?f1(best.p.f/best.p.gp)+" FFPS a partita":""}</span></div></div>
 <div class="kp k3"><div><small>PARTITE</small><b>${nG}</b><span>nel periodo</span></div><div><small>IN IR</small><b>${inj}</b><span>${inj?"infortunati":"tutti disponibili"}</span></div><div><small>RECORD</small><b>${REC[t.id]?REC[t.id].w+"-"+REC[t.id].l:"–"}</b><span>ESPN</span></div></div>
 ${perBox()}
 <button class="cmpb" data-sv="comp">📈 CONFRONTA I GIOCATORI</button>
 <div class="mt2"><table><tr><th>GIOCATORE</th><th>MEDIA</th>${Array.from({length:ncol},(_,i)=>`<th>${i+1}ª</th>`).join("")}</tr>
 ${rows.map(x=>`<tr><td data-pl="${e(x.g[0])}"><div class="gn"><b>${e(x.g[0])} ›</b><small>${x.g[1]} · ${x.g[2]}</small></div></td><td>${x.p?`<span class="ffb ${ffCls(x.p.f/x.p.gp)}">${f1(x.p.f/x.p.gp)}</span>`:"–"}</td>${Array.from({length:ncol},(_,i)=>{const G=x.G.slice(-ncol),y=G[i];return`<td>${y?cell(y):""}</td>`}).join("")}</tr>`).join("")}</table></div>
 <div class="note" style="color:#fff">Le ultime ${ncol} partite di ogni giocatore nel periodo (sotto il valore l avversario). Giocatori in ordine di FFPS medio. <span class="lg v">da 50</span> <span class="lg g">35-50</span> <span class="lg o">20-35</span> <span class="lg r">sotto 20</span>${ok?"":" · carico la stagione 25/26…"}</div>`}
/* ===== GRAFICO (SVG): punti = media del periodo scelto (stagione, mese, partita) ===== */
const MET={f:["FFPS",x=>x.f],m:["MINUTI",x=>x.m],e:["EFFICIENZA",x=>x.m?x.f/x.m:0]};
function groups(G){if(ST.per==="g")return G.map(x=>({k:x.d,lab:fmtD(x.d).slice(0,5),sub:x.o,L:[x]}));
 const key=ST.per==="s"?(x=>x.s):(x=>x.d.slice(0,7));const M=new Map();for(const x of G){const k=key(x);if(!M.has(k))M.set(k,[]);M.get(k).push(x)}
 return [...M].map(([k,L])=>({k,lab:ST.per==="s"?"Stag. "+SEASONS.find(s=>s.k===k).l:MESI[+k.slice(5)-1]+" "+k.slice(2,4),sub:L.length+" part.",L}))}
const val=(L,met)=>met==="e"?(()=>{const m=L.reduce((s,x)=>s+x.m,0);return m?L.reduce((s,x)=>s+x.f,0)/m:0})():L.reduce((s,x)=>s+MET[met][1](x),0)/L.length;
function chart(series,met){/* series: [{n,col,G:groups}] */
 const W=360,H=230,l=34,r=10,t=26,b=40;const pts=series.map(s=>s.G.map(g=>val(g.L,met)));const all=pts.flat();if(!all.length)return`<div class="note">Nessuna partita nel periodo.</div>`;
 const mx=Math.max(...all)*1.12||1,mn=Math.min(0,Math.min(...all)),N=Math.max(...series.map(s=>s.G.length));
 const X=i=>l+(N<2?(W-l-r)/2:i*(W-l-r)/(N-1)),Y=v=>t+(H-t-b)*(1-(v-mn)/(mx-mn));
 const step=met==="e"?(mx>2?1:.5):mx>60?20:mx>30?10:5;let grid="";for(let v=Math.ceil(mn/step)*step;v<=mx;v+=step)grid+=`<line x1="${l}" x2="${W-r}" y1="${Y(v)}" y2="${Y(v)}" stroke="#2a3150"/><text x="${l-5}" y="${Y(v)+3}" text-anchor="end" font-size="9" fill="#8b93b5">${met==="e"?v.toFixed(1):v}</text>`;
 const labEvery=Math.ceil(N/5);let xl="";const G0=series[0].G;for(let i=0;i<N;i+=labEvery){const g=G0[i];if(g)xl+=`<text x="${X(i)}" y="${H-b+16}" text-anchor="middle" font-size="9.5" fill="#cfd5ec">${e(g.lab)}</text><text x="${X(i)}" y="${H-b+28}" text-anchor="middle" font-size="8.5" fill="#7c84a6">${e(g.sub)}</text>`}
 const lines=series.map((s,k)=>{const P=pts[k];const path=P.map((v,i)=>(i?"L":"M")+X(i).toFixed(1)+" "+Y(v).toFixed(1)).join(" ");
  const showLab=P.length<=14;return`<path d="${path}" fill="none" stroke="${s.col}" stroke-width="2.4" stroke-linejoin="round"/>${P.map((v,i)=>`<circle cx="${X(i)}" cy="${Y(v)}" r="${P.length>40?1.8:3.4}" fill="${s.col}"/>${showLab?`<rect x="${X(i)-14}" y="${Y(v)-19}" width="28" height="13" rx="6" fill="${s.col}"/><text x="${X(i)}" y="${Y(v)-9.5}" text-anchor="middle" font-size="8.5" font-weight="700" fill="#06210f">${met==="e"?v.toFixed(2):v.toFixed(1)}</text>`:""}`).join("")}`}).join("");
 return `<svg viewBox="0 0 ${W} ${H}" class="chs"><text x="4" y="12" font-size="9" fill="#8b93b5">${MET[met][0]}</text>${grid}${xl}${lines}</svg>`}
/* tendenza: retta che passa meglio tra i punti, in % sulla media */
function trend(P){const n=P.length;if(n<3)return null;const mx=(n-1)/2,my=P.reduce((a,b)=>a+b,0)/n;let num=0,den=0;P.forEach((v,i)=>{num+=(i-mx)*(v-my);den+=(i-mx)**2});const sl=num/den;return my?sl*(n-1)/Math.abs(my)*100:0}
/* ===== PROFILO GIOCATORE ===== */
function vPl(){const ok=needOld();const n=ST.pl;const G=gamesOf(n).filter(inP);const o=ownOf(n),t=o&&TM[o.t];const last=gamesOf(n).slice(-1)[0];
 const gr=groups(G);const P=gr.map(g=>val(g.L,ST.met));const tr=trend(P);const avg=m=>G.length?val(G,m):0;
 const names=[...new Set(all().map(x=>x.n))].sort();
 return `<div class="pbg"><button class="bk2" data-sv="${ST.back||"sgioc"}">‹ INDIETRO</button>
 <div class="ph">${t?`<img src="${t.logo}" alt="">`:""}<div><small>${t?e(t.nome.toUpperCase())+" · ":""}${last?last.t:""} · GRAFICI</small><b>${e(n.toUpperCase())}</b></div></div>
 <div class="slab w">GIOCATORE</div><select class="psel" data-psel="pl">${names.map(x=>`<option${x===n?" selected":""}>${e(x)}</option>`).join("")}</select>
 ${perBox()}
 <div class="slab w">MEDIA PER</div><div class="mp">${[["s","STAGIONI"],["m","MESI"],["g","PARTITE"]].map(([k,l])=>`<button class="${ST.per===k?"on":""}" data-per="${k}">${l}</button>`).join("")}</div>
 <div class="mt3">${Object.keys(MET).map(k=>`<button class="${ST.met===k?"on":""}" data-met="${k}"><small>${MET[k][0]}</small><b>${G.length?(k==="e"?f2(avg(k)):f1(avg(k))):"–"}</b></button>`).join("")}</div>
 <div class="chw"><div class="chh"><span>— ${G.length?(ST.met==="e"?f2(avg(ST.met)):f1(avg(ST.met))):"–"}</span>${tr!=null?`<span class="${tr>=0?"up":"dn"}">${tr>=0?"▲":"▼"} ${tr>=0?"+":""}${Math.round(tr)}%</span>`:""}</div>${chart([{n,col:"#4ade80",G:gr}],ST.met)}
 <div class="chn">${G.length} partite · ${ST.per==="g"?"ogni partita":ST.per==="m"?"media per mese":"media per stagione"}${ok?"":" · carico la stagione 25/26…"}</div></div>
 <button class="cmpb" data-cmp="${e(n)}">📈 CONFRONTA CON UN ALTRO GIOCATORE</button></div>
 <div class="card" style="margin-top:12px"><div class="ttl">PARTITE NEL PERIODO</div><div class="gt"><table class="glog"><tr><th>DATA</th><th>VS</th><th>MIN</th><th>FFPS</th><th>PT</th><th>RB</th><th>AS</th><th>ST</th><th>BL</th><th>TO</th><th>TIRI</th></tr>
 ${G.slice().reverse().slice(0,120).map(x=>{const r=x.r;return`<tr><td>${fmtD(x.d)}</td><td>${x.o}</td><td>${r[3]}</td><td><span class="ffb ${ffCls(x.f)}">${f1(x.f)}</span></td><td>${r[4]}</td><td>${r[11]+r[12]}</td><td>${r[13]}</td><td>${r[14]}</td><td>${r[15]}</td><td>${r[16]}</td><td>${r[5]}/${r[6]}</td></tr>`}).join("")}</table></div></div>`}
/* ===== COMPARATORE ===== */
function vComp(){const ok=needOld();const names=[...new Set(all().map(x=>x.n))].sort();const A=ST.pa,B=ST.pb;
 const sel=(k,v,c)=>`<div class="csel"><i style="background:${c}"></i><select data-psel="${k}"><option value="">🔍 Cerca il giocatore ${k==="pa"?"A":"B"}</option>${names.map(x=>`<option${x===v?" selected":""}>${e(x)}</option>`).join("")}</select></div>`;
 let body=`<div class="cmpe">Scegli i due giocatori da confrontare.</div>`;
 if(A&&B){const GA=gamesOf(A).filter(inP),GB=gamesOf(B).filter(inP);
  let ga=groups(GA),gb=groups(GB);
  if(ST.per!=="g"){const ks=[...new Set([...ga,...gb].map(g=>g.k))].sort();const m=(gr)=>ks.map(k=>gr.find(g=>g.k===k)||null);const fa=m(ga),fb=m(gb);
   ga=ks.map((k,i)=>fa[i]||{k,lab:(fb[i]||{}).lab,sub:"",L:[]});gb=ks.map((k,i)=>fb[i]||{k,lab:(fa[i]||{}).lab,sub:"",L:[]});ga=ga.filter((g,i)=>g.L.length&&gb[i].L.length);gb=gb.filter(g=>ga.some(x=>x.k===g.k))}
  const va=GA.length?val(GA,ST.met):0,vb=GB.length?val(GB,ST.met):0,fm=v=>ST.met==="e"?f2(v):f1(v);
  body=`<div class="chw"><div class="chh"><span style="color:#4ade80">— ${e(A.split(" ").slice(-1)[0])} ${fm(va)}</span><span style="color:#f472b6">— ${e(B.split(" ").slice(-1)[0])} ${fm(vb)}</span></div>${chart([{n:A,col:"#4ade80",G:ga},{n:B,col:"#f472b6",G:gb}],ST.met)}<div class="chn">${GA.length} e ${GB.length} partite · ${ST.per==="g"?"partita per partita (in ordine)":ST.per==="m"?"media per mese":"media per stagione"}</div></div>`}
 return `<button class="bk" data-sv="${ST.back==="gioc"?"gioc":"stat"}">‹ INDIETRO</button><div class="card cmpc"><small class="up2">CONFRONTO · DUE GIOCATORI SULLO STESSO GRAFICO</small><h3>COMPARATORE</h3>
 ${sel("pa",A,"#4ade80")}${sel("pb",B,"#f472b6")}${perBox()}
 <div class="slab">MEDIA PER</div><div class="mp lt">${[["s","STAGIONI"],["m","MESI"],["g","PARTITE"]].map(([k,l])=>`<button class="${ST.per===k?"on":""}" data-per="${k}">${l}</button>`).join("")}</div>
 <div class="slab">COSA CONFRONTARE</div><div class="mp lt">${Object.keys(MET).map(k=>`<button class="${ST.met===k?"on":""}" data-met="${k}">${MET[k][0]}</button>`).join("")}</div>${body}</div>
 <div class="note" style="color:#fff">Ogni punto è la media del periodo (stagione, mese o singola partita). ${ok?"":"Carico la stagione 25/26…"}</div>`}
/* ===== collegamento con l app ===== */
window.STATV={stat:vHub,sgioc:vGioc,ssq:vSq,gioc:vPl,comp:vComp};
document.addEventListener("click",ev=>{const c=ev.target.closest("[data-sv],[data-pr],[data-ss],[data-box],[data-sq],[data-pl],[data-per],[data-met],[data-cmp]");if(!c||!window.STATV[cur]&&!c.dataset.pl)return;
 const d=c.dataset;
 if(d.sv){cur=d.sv;render();scrollTo(0,0);return}
 if(d.pr){[ST.a,ST.b]=d.pr.split("|");save();render();return}
 if(d.ss){ST.sort=d.ss;save();render();return}
 if(d.box){ST.box=+d.box;save();render();return}
 if(d.sq){ST.sq=d.sq;save();render();return}
 if(d.per){ST.per=d.per;save();render();return}
 if(d.met){ST.met=d.met;save();render();return}
 if(d.cmp){ST.pa=d.cmp;ST.back="gioc";save();cur="comp";render();scrollTo(0,0);return}
 if(d.pl){ST.back=window.STATV[cur]?cur:"sgioc";ST.pl=d.pl;save();curTeam=null;cur="gioc";render();scrollTo(0,0);return}},true);
document.addEventListener("change",ev=>{const t=ev.target;if(t.dataset.sp){ST[t.dataset.sp]=t.value;save();render()}else if(t.dataset.psel){ST[t.dataset.psel]=t.value;save();render()}});
document.addEventListener("input",ev=>{if(ev.target.id==="sq"){ST.q=ev.target.value;save();const p=ev.target.selectionStart;render();const i=document.getElementById("sq");i.focus();try{i.setSelectionRange(p,p)}catch(_){}}});
})();
