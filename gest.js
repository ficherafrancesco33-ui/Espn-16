/* ===== ESPN 16 – LEGA, ROSTER, CENTRO MEDICO, REGOLAMENTO (come le stesse pagine di Dreamers) =====
   Stesse classi di Dreamers (drroom, drcla, pob, teamhead, rostc, igrp, rart): gli stili sono in skin-giorno.css / skin-notte.css.
   Pagine: lega (Settimana · Calendario · Classifica · Playoff), roster, inf (Centro Medico, infortuni ESPN live), reg (Regolamento). */
(function(){
const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const f1=v=>(Math.round(v*10)/10).toLocaleString("it-IT",{minimumFractionDigits:1,maximumFractionDigits:1});
const nick=t=>t.nome.split(" ").slice(-1)[0];
const city=t=>t.nome.split(" ").slice(0,-1).join(" ");
const tint=id=>`--tc:${TCOL[id]};--tf:#fff`;
const xc=v=>v>=50?"v":v>=35?"g":v>=20?"y":"r";
const own=n=>{try{return OWNH[__ownKey(n)]||""}catch(_){return""}};
const G={tab:"turno",wk:null,rt:"QUE",it:null,du:null};
try{Object.assign(G,JSON.parse(localStorage.getItem("e16_gest")||"{}"))}catch(_){}
const save=()=>{try{localStorage.setItem("e16_gest",JSON.stringify({tab:G.tab,rt:G.rt}))}catch(_){}};
/* ---------- LEGA ---------- */
function vLega(){
 const wNow=weekOf(nyToday()<W1?W1:nyToday()),w=G.wk&&G.wk<=wNow+20?G.wk:wNow,[wa,wb]=weekRange(w);
 const tabs=`<div class="drtabs">${[["turno","Settimana"],["cal","Calendario"],["cla","Classifica"],["po","Playoff"]].map(([k,l])=>`<button data-lg2="${k}" aria-pressed="${G.tab===k}">${l}</button>`).join("")}</div>`;
 const head=`<div class="drroom" data-th="3"><button class="drexit" data-go="home">‹ Torna all'app</button><div class="drhd"><span class="drlogo">ESPN 16</span><small>FantaBasket USA · AVG · stagione 26/27</small></div>${tabs}`;
 let body="";
 if(G.tab==="turno"&&G.du)body=vDuel(w,wNow);
 else if(G.tab==="turno"){const WS=weekScores(w),M=MATCHUPS[w]||[],fin=w<wNow,live=w===wNow;
  body=`<div class="drnav"><button data-lgw="${w-1}" ${w>1?"":"disabled"}>‹</button><div><b>Settimana ${w}</b><small>${dIt(wa)} → ${dIt(wb)}${fin?" · finita":live?" · in corso":""}</small></div><button data-lgw="${w+1}" ${w<wNow?"":"disabled"}>›</button></div>`;
  if(M.length)body+=`<div class="drms">${M.map(([A,B])=>{const a=WS.S[A],b=WS.S[B],la=a>=b;const r=(id,v,l)=>`<div class="drr tint ${l?"slead":"strail"}" style="${tint(id)}"><span class="drlg" style="--tc:${TCOL[id]}"><span class="badge logo lg-${id}"></span></span><span class="drn"><b>${e(TM[id].nome)}</b><small>${WS.off?"punteggio ufficiale ESPN":WS.G[id]+" partite · migliori 14"}</small></span><em>${f1(v)}</em></div>`;
   return `<button class="drm" data-du="${A},${B}">${r(A,a,la)}${r(B,b,!la)}<span class="drst ${fin?"":"live"}">${fin?"Finale":"In corso"}</span></button>`}).join("")}</div>`;
  else body+=`<p class="note">Calendario delle sfide non ancora inserito: ecco il punteggio della settimana di ogni squadra (14 titolari, punteggio pieno).</p><div class="drcla">${TEAMS.slice().sort((a,b)=>WS.S[b.id]-WS.S[a.id]).map((t,k)=>`<div class="drcr tint ${k===0?"lead":""}" data-team="${t.id}" style="${tint(t.id)}"><span class="drpos">${k+1}</span><span class="drlg l" style="--tc:${TCOL[t.id]}"><span class="badge logo lg-${t.id}"></span></span><div class="drci"><b>${e(t.nome)}</b><small>${WS.G[t.id]} partite · migliori 14 · ${t.conf==="E"?"East":"West"}</small></div><div class="drcwl"><b class="avg">${f1(WS.S[t.id])}<small>AVG</small></b></div></div>`).join("")}</div>`}
 if(G.tab==="cal"){const last=Math.max(wNow+2,...Object.keys(MATCHUPS).map(Number));let h="";
  for(let k=1;k<=last;k++){const[a,b]=weekRange(k),M=MATCHUPS[k]||[];h+=`<h4 class="drplh">Settimana ${k}<span>${dIt(a)} → ${dIt(b)}${k===wNow?" · in corso":k<wNow?" · finita":""}</span></h4>${M.length?`<div class="drms">${M.map(([A,B])=>`<button class="drm" data-lgw="${k}" data-lg2="turno"><div class="drr tint" style="${tint(A)}"><span class="drlg"><span class="badge logo lg-${A}"></span></span><span class="drn"><b>${e(TM[A].nome)}</b></span></div><div class="drr tint" style="${tint(B)}"><span class="drlg"><span class="badge logo lg-${B}"></span></span><span class="drn"><b>${e(TM[B].nome)}</b></span></div></button>`).join("")}</div>`:`<p class="note">Sfide da inserire.</p>`}`}
  body=h}
 if(G.tab==="cla"){const WS=weekScores(wNow);body=["E","W"].map(c=>{const L=standings(c);return `<h4 class="drplh drplsh">${c==="E"?"Eastern":"Western"} Conference<span></span></h4><div class="drcla">${L.map((t,k)=>`<div class="drcr tint ${k===0?"lead":""}" data-team="${t.id}" style="${tint(t.id)}"><span class="drpos">${k+1}</span><span class="drlg l" style="--tc:${TCOL[t.id]}"><span class="badge logo lg-${t.id}"></span></span><div class="drci"><b>${e(t.nome)}</b><small>${e(t.gm)}${k<4?" · zona titolo":" · 5ª–8ª"}</small></div><div class="drcwl"><b>${t.w}<small>V</small></b><b class="l">${t.l}<small>P</small></b><b class="avg">${f1(WS.S[t.id])}<small>SETT.</small></b></div></div>`).join("")}</div>`}).join("")+`<p class="note">V-P dalla lega ESPN. SETT. = punteggio della settimana in corso.</p>`}
 if(G.tab==="po"){/* (23) tabellone come ESPN: 10 squadre, 1ª-6ª saltano il primo turno */const S=seeds();
  const tm=(i,lab)=>{const t=S[i];return t?`<div class="bkt tint" style="--tc:${TCOL[t.id]}"><i>${i+1}</i><span class="bklg" style="--tc:${TCOL[t.id]}"><span class="badge logo lg-${t.id}"></span></span><b>${e(nick(t))}</b><em>${t.w}-${t.l}</em></div>`:`<div class="bkt"><b>${lab}</b></div>`};
  const tbd=l=>`<div class="bkt"><b>${l}</b></div>`;
  const box=(lab,a,b)=>`<div class="bkm"><span class="bklab">${lab}</span>${a}${b}</div>`;
  const rnd=(t,d,h)=>`<section class="pob a"><div class="pobh"><span><b>${t}</b><small>${d}</small></span></div><div class="e16po">${h}</div></section>`;
  body=`<p class="note" style="margin-top:0">Tabellone provvisorio in base alla classifica attuale. Si qualificano 10 squadre su 16: le prime di ogni conference sono teste di serie 1 e 2, poi le altre per vittorie e punti fatti. Dalla 1ª alla 6ª saltano il primo turno.</p>
  <h4 class="drplh drplsh">Playoff<span></span></h4>
  ${rnd("Turno 1","8 – 14 febbraio",box("8ª vs 9ª",tm(7),tm(8))+box("7ª vs 10ª",tm(6),tm(9))+`<p class="note">Riposano: ${S.slice(0,6).map((t,i)=>`${i+1}ª ${e(nick(t))}`).join(" · ")}</p>`)}
  ${rnd("Turno 2 · quarti","15 febbraio – 7 marzo",box("1ª vs vinc. 8/9",tm(0),tbd("Vincente 8ª/9ª"))+box("4ª vs 5ª",tm(3),tm(4))+box("3ª vs 6ª",tm(2),tm(5))+box("2ª vs vinc. 7/10",tm(1),tbd("Vincente 7ª/10ª")))}
  ${rnd("Turno 3 · semifinali","8 – 21 marzo",box("Semifinale 1",tbd("Vincente 1ª / 8-9"),tbd("Vincente 4ª / 5ª"))+box("Semifinale 2",tbd("Vincente 3ª / 6ª"),tbd("Vincente 2ª / 7-10")))}
  ${rnd("Finale","dopo il 21 marzo",box("Finale",tbd("Vincente semifinale 1"),tbd("Vincente semifinale 2")))}
  ${S.length>10?`<p class="note">Fuori dai playoff: ${S.slice(10).map((t,i)=>`${i+11}ª ${e(nick(t))}`).join(" · ")}</p>`:""}`}
 return head+body+`</div>`}
/* ---------- (24) SFIDA: duello come quello di Dreamers ----------
   Due colonne affiancate: i 17 di ogni squadra in ordine di punteggio della settimana (somma di TUTTE le partite).
   1–14 = "In campo · punteggio pieno" (formazione automatica, i migliori 14), 15–17 = "Tribuna · fuori dai 14".
   Caselle: partita giocata con il suo AVG, NG = non ha giocato, tratteggiata = da giocare (@ = in trasferta).
   Proiezione = punteggio + media stagionale × partite ancora da giocare (migliori 14 proiettati); la % di vittoria viene da lì. */
const RLd=r=>{const a=String(r||"").split(",");return a[0]==="C"?"C":/G/.test(a[0])?"G":"F"};
const RN={G:"Guardia",F:"Ala",C:"Centro"},RI={G:"G",F:"A",C:"C"};
const shortN=n=>{const p=String(n).split(" ");return p.length>1?p[0][0]+".&nbsp;"+e(p.slice(1).join(" ")):e(n)};
const Phi=z=>{const t=1/(1+.2316419*Math.abs(z)),d=.3989423*Math.exp(-z*z/2),p=d*t*(.3193815+t*(-.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return z>0?1-p:p};
function duCard(t,x,zone){const g=x.g,rl=RLd(g[3]),fin=x.rem===0&&!x.G.some(y=>y.lv),pl=x.n>0;
 const cls=zone==="trib"?"trib":(!pl&&x.G.length?"wait":"full");
 const chip=y=>{const lab=WKD[new Date(y.d+"T12:00:00Z").getUTCDay()];
  if(y.f!=null)return `<span class="duw dug ${xc(y.f)}" title="${y.opp}${y.lv?" · in corso":""}"><i>${lab}</i><b>${f1(y.f)}</b></span>`;
  if(y.ng)return `<span class="duw dun0" title="${y.opp} · non ha giocato"><i>${lab}</i><b>NG</b></span>`;
  return `<span class="duw duu"><i>${lab}</i><b>${y.opp}</b></span>`};
 const sc=pl?`<span style="color:#fff!important;-webkit-text-fill-color:#fff!important" class="pdkx ${xc(x.tot/x.n)} dubig"><b>${f1(x.tot)}</b>${zone==="trib"?"<i>tribuna</i>":""}</span>`
  :`<span style="color:#fff!important;-webkit-text-fill-color:#fff!important" class="pdkx na dubig"><b>—</b><i>${x.G.length?(x.rem?"attesa":"NG"):"0 partite"}</i></span>`;
 const nk=TM[t].nome.split(" ").slice(-1)[0];
 return `<div class="du ${cls} ru-${rl}${fin?" fin":""}" data-rn="${RN[rl]}"><div class="duh"><div class="dul"><span class="duj" data-pl="${e(g[0])}" role="link" tabindex="0" style="cursor:pointer" aria-label="Apri il profilo di ${e(g[0])}">${window.e16Jersey?e16Jersey(t,e16Num(g[0]),nk):""}</span><span class="dufl"></span></div><div class="dur"><div class="dun"><b title="${e(g[0])}">${shortN(g[0])}</b><small>${RI[rl]} · ${x.team}</small></div>
  <div class="dus">${fin&&x.G.length?`<i class="fin-b" title="Punteggio definitivo"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg></i>`:""}${sc}</div></div></div>
  <div class="duwk">${x.G.map(chip).join("")||`<span class="duw duu"><i>—</i><b>riposo</b></span>`}</div><div class="duf">${x.G.filter(y=>!y.up).length}/${x.G.length} partite giocate</div></div>`}
function vDuel(w,wNow){const[A,B]=G.du,M=MATCHUPS[w]||[],WS=weekScores(w),TA=wkTeam(A,w),TB=wkTeam(B,w);
 const sa=WS.off?WS.S[A]:TA.S,sb=WS.off?WS.S[B]:TB.S,pa=WS.off?sa:TA.PR,pb=WS.off?sb:TB.PR,rem=TA.rem+TB.rem;
 const pA=WS.off||!rem?(sa===sb?.5:sa>sb?1:0):Phi((pa-pb)/(12*Math.sqrt(rem))),pct=WS.off||!rem?Math.round(pA*100):Math.min(99,Math.max(1,Math.round(pA*100))),la=sa>=sb;
 const lg=id=>`<span class="drlg " style="--tc:${TCOL[id]}"><span class="badge logo lg-${id}" role="img" aria-label="${e(nick(TM[id]))}"></span></span>`;
 let h=`<div style="--ca:${TCOL[A]};--cb:${TCOL[B]}"><div class="dutop"><button class="gback" data-du="close">‹ Settimana ${w}</button><button class="shbtn dunav first" data-duk="-1" aria-label="Settimana precedente" title="Settimana precedente" ${w>1?"":"disabled"}>‹</button><button class="shbtn dunav" data-duk="1" aria-label="Settimana successiva" title="Settimana successiva" ${w<Math.max(...Object.keys(MATCHUPS).map(Number))?"":"disabled"}>›</button></div>
 <div class="dustrip" role="tablist" aria-label="Altre sfide della settimana">${M.map(([a,b])=>{const x=WS.S[a],y=WS.S[b];return `<button class="dumini${a===A&&b===B?" on":""}" data-du="${a},${b}" aria-label="${e(nick(TM[a]))} contro ${e(nick(TM[b]))}"><span class="${x>=y?"w":""}">${lg(a)}<b>${f1(x)}</b></span><span class="${y>x?"w":""}">${lg(b)}<b>${f1(y)}</b></span></button>`}).join("")}</div>
 <div class="duhd"><div class="dut${la?" lead":""}"><span class="dulg">${lg(A)}</span><div><b>${f1(sa)}</b><small>${WS.off?"ufficiale ESPN":"proiez. "+f1(pa)}</small></div></div><span class="duvs">VS</span><div class="dut r${la?"":" lead"}"><span class="dulg">${lg(B)}</span><div><b>${f1(sb)}</b><small>${WS.off?"ufficiale ESPN":"proiez. "+f1(pb)}</small></div></div>
  <div class="dunm"><span>${e(nick(TM[A]))}</span><span>${e(nick(TM[B]))}</span></div>
  <div class="dubar"><i style="width:${pct}%"></i></div><div class="dupct"><span>${pct}% vittoria</span><span>${100-pct}%</span></div></div>`;
 const rows=(i0,i1,zone,slot)=>{let r="";for(let i=i0;i<i1;i++){const a=TA.L[i],b=TB.L[i];if(!a&&!b)continue;r+=`<div class="durow">${a?duCard(A,a,zone):"<div></div>"}<span class="duslot ${zone}">${slot(i)}</span>${b?duCard(B,b,zone):"<div></div>"}</div>`}return r};
 h+=`<section class="duz z-campo pqw"><div class="duzt"><span>In campo</span></div><div class="dusec full">Punteggio pieno · migliori 14</div>${rows(0,14,"full",i=>i+1)}</section>`;
 h+=`<section class="duz z-trib pqw"><div class="duzt"><span>Tribuna</span></div><div class="dusec trib">Fuori dai 14</div>${rows(14,17,"trib",()=>"·")}</section>`;
 h+=`<p class="note">${w===wNow?"Settimana in corso: la formazione si aggiorna a ogni partita (sempre i migliori 14 dei 17). ":""}${WS.off?"Punteggio in alto = risultato ufficiale ESPN; sotto, il calcolo dell app con i migliori 14. ":""}Ogni giocatore porta la somma dell AVG di tutte le sue partite della settimana. Trattino accanto al nome = ruolo: <i class="rtr G"></i>guardia, <i class="rtr F"></i>ala, <i class="rtr C"></i>centro. Caselle: colorata = partita giocata con il suo AVG, tratteggiata = da giocare (@ = in trasferta), NG = non ha giocato. Proiezione = punteggio se chi deve ancora giocare facesse la sua media; la percentuale di vittoria viene da lì.</p></div>`;
 return h}
/* ---------- ROSTER (come il Roster di Dreamers) ---------- */
const RL=r=>{const a=String(r||"").split(",");return a[0]==="C"?"C":/G/.test(a[0])?"G":"F"};
function vRoster(){const t=TM[G.rt]||TEAMS[0],R0=ROSE[t.id]||[],P=pstats(),r=REC[t.id];
 const li=g=>{const p=P[g[0]],v=p?p.ff/p.gp:null;return `<li class="rrow lc" data-pl="${e(g[0])}"><span class="rnm"><b>${e(g[0])}</b><small>${g[1]} · ${g[3]}${etaOf(g[0])!=null?" · "+etaTxt(g[0]):""}${g[2]==="IR"?" · IR":g[2]==="BE"?" · tribuna":""}</small></span><span class="rtags"><span class="rpdk">${v!=null?`<span class="pdkx ${xc(v)}">${f1(v)}</span>`:"–"}</span></span></li>`};
 const tit=R0.filter(g=>g[2]!=="BE"&&g[2]!=="IR"),trib=R0.filter(g=>g[2]==="BE"||g[2]==="IR");
 const sec=(k,lab,L)=>L.length?`<section class="rcg ${k}"><h4><span class="grl ${k}">${k}</span>${lab}<em>${L.length}</em></h4><ul class="gpl" style="grid-template-rows:repeat(${Math.ceil(L.length/2)},auto)">${L.sort((a,b)=>((P[b[0]]||{}).ff/((P[b[0]]||{}).gp||1)||0)-((P[a[0]]||{}).ff/((P[a[0]]||{}).gp||1)||0)).map(li).join("")}</ul></section>`:"";
 const C=CAP[t.id];
 return `<button class="gback" data-go="home">‹ Home</button><div class="chips">${TEAMS.map(x=>`<button class="chip" data-rt="${x.id}" aria-pressed="${x.id===t.id}"><span class="badge logo lg-${x.id}"></span>${e(nick(x))}</button>`).join("")}</div>
 <div class="teamhead" style="background:linear-gradient(115deg,${TCOL[t.id]} 0%,color-mix(in srgb,${TCOL[t.id]} 55%,#000) 100%);color:#ffffff;border-bottom:4px solid #0b0b0b"><img class="hlogo" src="${t.logo}" alt=""><div><h3>${e(nick(t))}</h3><p>${e(city(t))}</p></div><div class="hstats"><div class="rec">${r?r.w+"-"+r.l:"–"}<small>RECORD</small></div><div class="rec">${C&&C.libero!=null?f1(C.libero):"–"}<small>CAP LIBERO</small></div><div class="rec">${window.e16TeamValue?Math.round(e16TeamValue(t.id).tot/1000).toLocaleString("it-IT")+"k":"–"}<small>VALORE</small></div></div></div>
 <div class="sumrow"><span>${R0.length} giocatori · ${tit.length} titolari · ${trib.length} in tribuna/IR</span></div>
 <div class="rostc">${sec("G","Guardie",tit.filter(g=>RL(g[3])==="G"))}${sec("F","Ali",tit.filter(g=>RL(g[3])==="F"))}${sec("C","Centri",tit.filter(g=>RL(g[3])==="C"))}${sec("T","Tribuna e IR",trib.slice())}</div>
 <div class="effpair2" style="margin-top:12px"><button class="cupbtn" data-team="${t.id}" data-tab="cap"><span>Salary cap</span><i>›</i></button><button class="trbtn" data-team="${t.id}" data-tab="pick"><span>Scelte</span><i>›</i></button></div>
 ${window.e16TeamValue?(()=>{const V=e16TeamValue(t.id),S=e16Str();return `<div class="esqk esqk3" style="margin-top:10px"><div><small>Valore squadra</small><b>${Math.round(V.tot).toLocaleString("it-IT")}</b><em>giocatori + scelte</em></div><div><small>Giocatori</small><b>${Math.round(V.pl).toLocaleString("it-IT")}</b><em>${R0.length} in rosa</em></div><div><small>Scelte</small><b>${Math.round(V.pk).toLocaleString("it-IT")}</b><em>forza prevista ${S.rank[t.id]}ª su 16</em></div></div>`})():""}
 <p class="note">AVG = media della stagione in corso. Titolari: i 14 schierati su ESPN. Tribuna: 3 posti (under 25, oppure infortunati).</p>`}
/* ---------- CENTRO MEDICO (infortuni ESPN, letti dal telefono) ---------- */
let INJ=null,INJt=0;
async function injLoad(){if(INJ&&Date.now()-INJt<10*60e3)return;try{const r=await fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/injuries?t="+Date.now(),{cache:"no-store"});if(!r.ok)return;const J=await r.json();const L=[];
 for(const tm of J.injuries||[])for(const x of tm.injuries||[]){const a=x.athlete||{};L.push({n:a.displayName||"",nba:(a.team&&a.team.abbreviation)||"",st:x.status||"",d:(x.shortComment||x.longComment||""),date:x.date||"",tipo:(x.details&&x.details.type)||"",rit:(x.details&&x.details.returnDate)||""})}
 INJ=L;INJt=Date.now();if(cur==="inf")render()}catch(_){/* se ESPN non risponde dal telefono si usano gli infortuni scaricati da GitHub (espn-data.js) */if(!INJ&&ESPN.inj){INJ=ESPN.inj.map(x=>({n:x[0],nba:x[1],st:x[2],d:x[3],tipo:x[4],rit:x[5]}));INJt=Date.now();if(cur==="inf")render()}}}
function vInf(){injLoad();const all=(INJ||[]).map(x=>({...x,t:own(x.n)})).filter(x=>x.t);const cnt={};all.forEach(x=>cnt[x.t]=(cnt[x.t]||0)+1);
 const L=G.it?all.filter(x=>x.t===G.it):all;const out=L.filter(x=>/out/i.test(x.st)),dub=L.filter(x=>!/out/i.test(x.st));
 const row=x=>`<div class="irow ${/out/i.test(x.st)?"out":"q"}" data-pl="${e(x.n)}"><span class="wedge" style="--tc:${/out/i.test(x.st)?"#dc2626":"#f59e0b"}"><span class="badge logo lg-${x.t}"></span></span><div class="ib"><div class="it"><b>${e(x.n)}</b><span class="ipill ${/out/i.test(x.st)?"out":"q"}">${e(x.st)}</span></div><small>${e(nick(TM[x.t]))} · ${x.nba}${x.tipo?" · "+e(x.tipo):""}${x.rit?" · rientro "+e(new Date(x.rit).toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit"})):""}</small><p>${e(x.d)}</p></div></div>`;
 return `<button class="gback" data-go="home">‹ Home</button><h2><span class="t"><span>Centro Medico</span></span><em>${INJ?"ESPN · agg. "+new Date(INJt).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"}):"carico…"}</em></h2>
 <div class="chips ichips">${TEAMS.map(x=>`<button class="chip ichip" data-it="${x.id}" aria-pressed="${G.it===x.id}"><span class="badge logo lg-${x.id}"></span>${e(nick(x))}${cnt[x.id]?`<b class="icnt">${cnt[x.id]}</b>`:""}</button>`).join("")}</div>
 ${G.it?"":`<div class="ipick">Tocca una squadra per vedere solo i suoi giocatori.</div>`}
 ${out.length?`<section class="igrp"><h4 class="ih out"><span>Out</span></h4><div class="tbl-wrap ilist">${out.map(row).join("")}</div></section>`:""}
 ${dub.length?`<section class="igrp"><h4 class="ih q"><span>In dubbio · giorno per giorno</span></h4><div class="tbl-wrap ilist">${dub.map(row).join("")}</div></section>`:""}
 ${INJ&&!L.length?`<p class="note">Nessun infortunato.</p>`:""}`}
/* ---------- REGOLAMENTO ---------- */
function vReg(){const art=(n,t,b)=>`<details class="rart"${n===1?" open":""}><summary><span class="rn">${String(n).padStart(2,"0")}</span><span class="rt">${t}<small>Articolo ${n}</small></span></summary><div class="rbody">${b}</div></details>`;
 return `<button class="gback" data-go="home">‹ Home</button><h2><span class="t"><span>Regolamento</span></span><em>FantaBasket USA due palle</em></h2>
 <div class="rhead"><p>Fanta Dynasty a 16 squadre su ESPN Fantasy · tocca un articolo per aprirlo.</p></div>
 <div class="rlegend"><span><b>AVG</b> punti fantasy ESPN</span><span><b>BE</b> tribuna</span><span><b>IR</b> infortunati</span></div>
 ${art(1,"Squadre e conference",`<p>16 franchigie divise in due conference: <b>East</b> (${TEAMS.filter(t=>t.conf==="E").map(t=>e(nick(t))).join(", ")}) e <b>West</b> (${TEAMS.filter(t=>t.conf==="W").map(t=>e(nick(t))).join(", ")}).</p>`)}
 ${art(2,"Formazione",`<p>Si schierano <b>14 giocatori</b> in campo con <b>punteggio pieno</b>, senza regole di ruolo.</p><p><b>3 posti in tribuna</b>, riservati agli <b>under 25</b>. Solo se ci sono infortunati si possono mettere gli infortunati al posto degli under 25.</p>`)}
 ${art(3,"Punteggio (AVG)",`<p>Ogni partita NBA di un giocatore vale:</p><p><b>PT +1 · canestro dal campo +2 · tiro tentato −1 · tripla +1 · libero segnato +1 · libero tentato −1 · rimbalzo offensivo +2,5 · rimbalzo difensivo +2 · assist +2 · recupero +4 · stoppata +4 · palla persa −2 · fallo −1 · tecnico −1 · flagrante −3</b>.</p><p>Esempio: 20 pt, 7/14 dal campo, 2 triple, 4/5 ai liberi, 2+5 rimbalzi, 4 assist, 1 recupero, 1 stoppata, 3 perse, 2 falli = <b>44</b>.</p>`)}
 ${art(4,"Sfide e classifica",`<p>Sfide testa a testa settimanali (da lunedì a domenica; la 1ª settimana dal 20 al 25 ottobre): vince chi somma più AVG con i titolari.</p>`)}
 ${art(5,"Salary cap",`<p>Cap di <b>${CAP_TOT}</b> per squadra. Contratti, tagli e spazio libero nella sezione Cap & Scelte.</p>`)}
 ${art(6,"Playoff",`<p>10 squadre qualificate: teste di serie 1 e 2 alle prime di ogni conference, poi per vittorie e punti fatti. 1ª–6ª saltano il primo turno. Turno 1 (8–14 feb): 7ª–10ª e 8ª–9ª. Quarti (15 feb–7 mar), semifinali (8–21 mar), finale.</p>`)}`}
window.GESTV={lega:vLega,roster:vRoster,inf:vInf,reg:vReg};
window.e16Roster=t=>{G.rt=t;save()};window.e16RT=()=>G.rt;
(window.NAVX=window.NAVX||[]).push({k:"g",get:()=>({tab:G.tab,rt:G.rt,it:G.it,wk:G.wk,du:G.du}),set:o=>Object.assign(G,o)});
document.addEventListener("click",ev=>{const c=ev.target.closest("[data-lg2],[data-lgw],[data-rt],[data-it],[data-du],[data-duk]");if(!c)return;const d=c.dataset;
 /* (26) sfida toccata da qualunque pagina (Lega, Home, banner, tabellone del campo) → duello stile Sleeper */
 if(d.du){ev.stopPropagation();if(d.du==="close")G.du=null;else{G.du=d.du.split(",");G.tab="turno";if(d.duw)G.wk=+d.duw;cur="lega";curTeam=null}render();scrollTo(0,0);setTimeout(()=>{const o=document.querySelector(".dumini.on"),st=o&&o.parentElement;if(st)st.scrollLeft=o.offsetLeft-(st.clientWidth-o.offsetWidth)/2},30);return}
 if(d.duk){const wNow=weekOf(nyToday()<W1?W1:nyToday()),w=(G.wk||wNow)+ +d.duk,m=(MATCHUPS[w]||[]).find(x=>x.includes(G.du[0]));if(!m)return;G.wk=w;G.du=m[0]===G.du[0]?m:[m[1],m[0]];render();return}
 if(d.lgw){G.wk=+d.lgw;G.du=null;if(d.lg2)G.tab=d.lg2;save();render();return}
 if(d.lg2){G.tab=d.lg2;G.du=null;save();render();return}
 if(d.rt){G.rt=d.rt;save();render();return}
 if(d.it){G.it=G.it===d.it?null:d.it;render();return}},true);
})();
