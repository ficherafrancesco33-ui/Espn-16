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
  if(M.length)body+=`<div class="drms">${M.map(([A,B])=>{const a=WS.S[A],b=WS.S[B],la=a>=b;const r=(id,v,l)=>`<div class="drr tint ${l?"slead":"strail"}" style="${tint(id)}"><span class="drlg" style="--tc:${TCOL[id]}"><span class="badge logo lg-${id}"></span></span><span class="drn"><b>${e(TM[id].nome)}</b><small>${WS.off?"punteggio ufficiale ESPN":WS.G[id]+" partite · formazione ESPN"}</small></span><em>${f1(v)}</em></div>`;
   return `<button class="drm" data-du="${A},${B}">${r(A,a,la)}${r(B,b,!la)}<span class="drst ${fin?"":"live"}">${fin?"Finale":"In corso"}</span></button>`}).join("")}</div>`;
  else body+=`<p class="note">Calendario delle sfide non ancora inserito: ecco il punteggio della settimana di ogni squadra (14 titolari della formazione ESPN).</p><div class="drcla">${TEAMS.slice().sort((a,b)=>WS.S[b.id]-WS.S[a.id]).map((t,k)=>`<div class="drcr tint ${k===0?"lead":""}" data-team="${t.id}" style="${tint(t.id)}"><span class="drpos">${k+1}</span><span class="drlg l" style="--tc:${TCOL[t.id]}"><span class="badge logo lg-${t.id}"></span></span><div class="drci"><b>${e(t.nome)}</b><small>${WS.G[t.id]} partite · formazione ESPN · ${t.conf==="E"?"East":"West"}</small></div><div class="drcwl"><b class="avg">${f1(WS.S[t.id])}<small>AVG</small></b></div></div>`).join("")}</div>`}
 if(G.tab==="cal"){/* (30) calendario nel formato Dreamers (drcals/drcal): una card per settimana, sfide casa–ospite con punteggio (vincente evidenziata), "vs" se da giocare; tocca → Settimana */
  const last=Math.max(...Object.keys(MATCHUPS).map(Number));let h="";
  const side=(id,cls,w)=>`<span class="${cls} tint${w?" w":""}" style="--tc:${TCOL[id]}">${cls==="a"?`<b>${e(TM[id].nome)}</b>`:""}<span class="drlg s" style="--tc:${TCOL[id]}"><span class="badge logo lg-${id}" role="img" aria-label="${e(nick(TM[id]))}"></span></span>${cls==="h"?`<b>${e(TM[id].nome)}</b>`:""}</span>`;
  for(let k=1;k<=last;k++){const[a,b]=weekRange(k),M=MATCHUPS[k]||[],WS=k<=wNow?weekScores(k):null,fin=k<wNow;
   h+=`<button class="drcal${k===wNow?" cur":""}" data-lgw="${k}" data-lg2="turno"><span class="drck"><b>${k}</b><small>${dIt(a).slice(0,5)}–${dIt(b).slice(0,5)}</small></span><span class="drcp">${M.map(([A,B])=>{const x=WS?WS.S[A]:null,y=WS?WS.S[B]:null;
    return `<i class="drcm">${side(A,"h",fin&&x>y)}<em>${WS?`${f1(x)}–${f1(y)}`:"vs"}</em>${side(B,"a",fin&&y>x)}</i>`}).join("")}</span></button>`}
  body=`<div class="drcals">${h}</div><p class="note">Squadra in casa a sinistra. Punteggio = ufficiale ESPN per le settimane finite; per quella in corso la somma dei 14 titolari della formazione ESPN del lunedì; in grassetto chi ha vinto. Tocca una settimana per vedere le sfide.</p>`}
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
   (44) In campo = i 14 titolari della formazione ESPN del lunedì (LEGA.line), poi Panchina e IR (non contano). Senza formazione: migliori 14.
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
 /* (44) titolari della formazione ESPN affiancati per posizione in classifica della settimana, poi panchina e IR */
 const rows=(LA,LB,zone,slot)=>{let r="";for(let i=0;i<Math.max(LA.length,LB.length);i++){const a=LA[i],b=LB[i];r+=`<div class="durow">${a?duCard(A,a,zone):"<div></div>"}<span class="duslot ${zone}">${slot(i)}</span>${b?duCard(B,b,zone):"<div></div>"}</div>`}return r};
 const espn=TA.espn||TB.espn,lost=T=>Math.max(0,T.best-T.S);
 h+=`<section class="duz z-campo pqw"><div class="duzt"><span>In campo</span></div><div class="dusec full">${espn?"Formazione ESPN del lunedì · 14 titolari":"Punteggio pieno · migliori 14"}</div>${rows(TA.L.filter(x=>x.on),TB.L.filter(x=>x.on),"full",i=>i+1)}</section>`;
 h+=`<section class="duz z-trib pqw"><div class="duzt"><span>${espn?"Panchina e IR":"Tribuna"}</span></div><div class="dusec trib">${espn?"Non contano":"Fuori dai 14"}</div>${rows(TA.L.filter(x=>!x.on),TB.L.filter(x=>!x.on),"trib",()=>"·")}</section>`;
 if(espn)h+=`<p class="note e16lost"><b>Formazione migliore possibile</b> (i 14 con più punti della settimana): ${e(nick(TM[A]))} ${f1(TA.best)} · lasciati in panchina <b>${f1(lost(TA))}</b> — ${e(nick(TM[B]))} ${f1(TB.best)} · lasciati in panchina <b>${f1(lost(TB))}</b>.</p>`;
 h+=`<p class="note">${TA.espn||TB.espn?"Formazione = quella messa dal GM su ESPN il lunedì prima della prima partita, bloccata fino al lunedì dopo: contano solo i 14 titolari. ":w===wNow?"Formazione ESPN non ancora disponibile: per ora i migliori 14 dei 17. ":""}${WS.off?"Punteggio in alto = risultato ufficiale ESPN. ":""}Ogni giocatore porta la somma dell AVG di tutte le sue partite della settimana. Trattino accanto al nome = ruolo: <i class="rtr G"></i>guardia, <i class="rtr F"></i>ala, <i class="rtr C"></i>centro. Caselle: colorata = partita giocata con il suo AVG, tratteggiata = da giocare (@ = in trasferta), NG = non ha giocato. Proiezione = punteggio se chi deve ancora giocare facesse la sua media; la percentuale di vittoria viene da lì.</p></div>`;
 return h}
/* ---------- ROSTER (come il Roster di Dreamers) ---------- */
const RL=r=>{const a=String(r||"").split(",");return a[0]==="C"?"C":/G/.test(a[0])?"G":"F"};
function vRoster(){const t=TM[G.rt]||TEAMS[0],R0=ROSE[t.id]||[],P=pstats(),r=REC[t.id];
 const li=g=>{const p=P[g[0]],v=p?p.ff/p.gp:null;return `<li class="rrow lc" data-pl="${e(g[0])}"><span class="rnm"><b>${e(g[0])}</b><small>${g[1]} · ${g[3]}${etaOf(g[0])!=null?" · "+etaTxt(g[0]):""}${u25(g[0])?` <i class="fau25">U25</i>`:""}${g[2]==="IR"?" · IR":g[2]==="BE"?" · panchina":""}</small></span><span class="rtags"><span class="rpdk">${v!=null?`<span class="pdkx ${xc(v)}">${f1(v)}</span>`:"–"}</span></span></li>`};
 const tit=R0.filter(g=>g[2]!=="BE"&&g[2]!=="IR"),trib=R0.filter(g=>g[2]==="BE"||g[2]==="IR");
 const sec=(k,lab,L)=>L.length?`<section class="rcg ${k}"><h4><span class="grl ${k}">${k}</span>${lab}<em>${L.length}</em></h4><ul class="gpl" style="grid-template-rows:repeat(${Math.ceil(L.length/2)},auto)">${L.sort((a,b)=>((P[b[0]]||{}).ff/((P[b[0]]||{}).gp||1)||0)-((P[a[0]]||{}).ff/((P[a[0]]||{}).gp||1)||0)).map(li).join("")}</ul></section>`:"";
 const C=CAP[t.id];
 return `<button class="gback" data-go="home">‹ Home</button><div class="chips">${TEAMS.map(x=>`<button class="chip" data-rt="${x.id}" aria-pressed="${x.id===t.id}"><span class="badge logo lg-${x.id}"></span>${e(nick(x))}</button>`).join("")}</div>
 <div class="teamhead" style="background:linear-gradient(115deg,${TCOL[t.id]} 0%,color-mix(in srgb,${TCOL[t.id]} 55%,#000) 100%);color:#ffffff;border-bottom:4px solid #0b0b0b"><img class="hlogo" src="${t.logo}" alt=""><div><h3>${e(nick(t))}</h3><p>${e(city(t))}</p></div><div class="hstats"><div class="rec">${r?r.w+"-"+r.l:"–"}<small>RECORD</small></div><div class="rec">${C&&C.libero!=null?f1(C.libero):"–"}<small>CAP LIBERO</small></div><div class="rec">${window.e16TeamValue?Math.round(e16TeamValue(t.id).tot/1000).toLocaleString("it-IT")+"k":"–"}<small>VALORE</small></div></div></div>
 <div class="sumrow"><span>${R0.length} giocatori · ${tit.length} titolari · ${trib.length} in panchina/IR</span></div>${(()=>{/* (44) regola della lega: almeno 3 under 25 per squadra */const nU=R0.filter(g=>u25(g[0])).length;return `<div class="e16u25 ${nU<3?"ko":"ok"}">Under 25: <b>${nU}</b> · minimo 3${nU<3?" · sotto il minimo!":""}</div>`})()}
 <div class="rostc">${sec("G","Guardie",tit.filter(g=>RL(g[3])==="G"))}${sec("F","Ali",tit.filter(g=>RL(g[3])==="F"))}${sec("C","Centri",tit.filter(g=>RL(g[3])==="C"))}${sec("T","Tribuna e IR",trib.slice())}</div>
 <div class="effpair2" style="margin-top:12px"><button class="cupbtn" data-team="${t.id}" data-tab="cap"><span>Salary cap</span><i>›</i></button><button class="trbtn" data-team="${t.id}" data-tab="pick"><span>Scelte</span><i>›</i></button></div>
 ${window.e16TeamValue?(()=>{const V=e16TeamValue(t.id),S=e16Str();return `<div class="esqk esqk3" style="margin-top:10px"><div><small>Valore squadra</small><b>${Math.round(V.tot).toLocaleString("it-IT")}</b><em>giocatori + scelte</em></div><div><small>Giocatori</small><b>${Math.round(V.pl).toLocaleString("it-IT")}</b><em>${R0.length} in rosa</em></div><div><small>Scelte</small><b>${Math.round(V.pk).toLocaleString("it-IT")}</b><em>forza prevista ${S.rank[t.id]}ª su 16</em></div></div>`})():""}
 <p class="note">AVG = media della stagione in corso. Titolari: i 14 schierati su ESPN. Tribuna: 3 posti (under 25, oppure infortunati).</p>`}
/* ---------- CENTRO MEDICO (infortuni ESPN, letti dal telefono) ---------- */
let INJ=null,INJt=0;
/* (30) CENTRO MEDICO come Dreamers: chip squadre, scegli una squadra → intestazione, conteggi per stato, gruppi
   (Fuori / In dubbio / In forse / Probabile / Giorno per giorno) e per ogni giocatore il MANICHINO con la zona colpita (bodyMap di Dreamers).
   Dati: infortuni ESPN live (se il telefono non li raggiunge, quelli scaricati da GitHub in espn-data.js). Descrizione tradotta in italiano. */
const STATI={out:["Out","Fuori"],dubbio:["Doubtful","In dubbio"],quest:["Questionable","In forse"],prob:["Probable","Probabile"],dtd:["Day-to-day","Giorno per giorno"]};
const stOf=s=>{s=String(s).toLowerCase();return/out|suspen/.test(s)?"out":/doubt/.test(s)?"dubbio":/question/.test(s)?"quest":/probab/.test(s)?"prob":"dtd"};
/* parti del corpo ESPN → italiano (f = femminile, per l aggettivo destro/destra) */
const PARTI={ankle:["Caviglia",1],knee:["Ginocchio"],hamstring:["Bicipite femorale"],calf:["Polpaccio"],foot:["Piede"],toe:["Dito del piede"],back:["Schiena",1],"lower back":["Zona lombare",1],hip:["Anca",1],groin:["Inguine"],
 shoulder:["Spalla",1],wrist:["Polso"],hand:["Mano",1],finger:["Dito della mano"],thumb:["Pollice"],elbow:["Gomito"],achilles:["Tendine d'Achille"],concussion:["Commozione cerebrale",1],illness:["Malattia",1],rest:["Riposo"],
 personal:["Motivi personali"],quadriceps:["Quadricipite"],quad:["Quadricipite"],thigh:["Coscia",1],shin:["Tibia",1],tibia:["Tibia",1],fibula:["Perone"],head:["Testa",1],neck:["Collo"],chest:["Petto"],ribs:["Costole",1],rib:["Costola",1],
 abdomen:["Addome"],abdominal:["Addome"],oblique:["Obliquo"],face:["Viso"],nose:["Naso"],eye:["Occhio"],heel:["Tallone"],"plantar fascia":["Fascia plantare",1],"lower leg":["Gamba",1],leg:["Gamba",1],glute:["Gluteo"],
 adductor:["Adduttore"],pelvis:["Bacino"],suspension:["Squalifica",1],"not injury related":["Non legato a infortunio"],undisclosed:["Non comunicato"],jaw:["Mascella",1],forearm:["Avambraccio"],arm:["Braccio"],
 biceps:["Bicipite"],triceps:["Tricipite"],patella:["Rotula",1],sternum:["Sterno"],spine:["Colonna vertebrale",1],kidney:["Rene"],appendix:["Appendice",1],mouth:["Bocca",1],lisfranc:["Lisfranc"],"g league":["G League (assegnato)"]};
const DETT={sprain:"distorsione",strain:"stiramento",soreness:"fastidio",contusion:"contusione",fracture:"frattura",tear:"lesione",tendinitis:"tendinite",tendinopathy:"tendinopatia",inflammation:"infiammazione",
 surgery:"operazione",bruise:"contusione",spasms:"spasmi",tightness:"rigidità",dislocation:"lussazione",impingement:"conflitto",bursitis:"borsite",laceration:"lacerazione",hyperextension:"iperestensione",
 "torn ligament":"lesione al legamento",rupture:"rottura",injury:"infortunio","general soreness":"indolenzimento",management:"gestione dei carichi",recovery:"recupero",effusion:"versamento"};
function tipoIt(x){const k=String(x.tipo||"").toLowerCase(),P=PARTI[k],side=String(x.side||"").toLowerCase(),d=String(x.det||"").toLowerCase();
 let t=P?P[0]:(x.tipo||"Infortunio");if(P&&/left|right/.test(side)&&!/malattia|riposo|motivi|squalifica|commozione|non /i.test(t))t+=" "+(side==="left"?(P[1]?"sinistra":"sinistro"):(P[1]?"destra":"destro"));
 if(d)t+=" ("+(DETT[d]||d)+")";return t}
/* manichino di Dreamers: evidenzia la zona del corpo letta dalla descrizione (destra = lato sinistro del disegno, vista frontale) */
function bodyMap(tipo,stato){
  const t=(tipo||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
  const Z=[["head",/\b(?:testa|commozione|concussion|naso|nasal|viso|occhi|mascell|faccia)/],["neck",/\b(?:collo|neck)/],["shoulder",/\b(?:spall|shoulder|rotator|cuffia|clavicol)/],
   ["elbow",/\b(?:gomit|elbow)/],["wrist",/\b(?:polso|wrist)/],["hand",/\b(?:mano|dito della mano|finger|thumb|pollic|hand)/],["chest",/\b(?:petto|costol|rib|pettoral|chest|sterno)/],
   ["abs",/\b(?:obliq|addom|abdom|core)/],["back",/\b(?:schiena|back|lomb|sciatic|spina|vertebr)/],["hip",/\b(?:anca|hip|bacino|ingui|groin|addutt|glute)/],
   ["thigh",/\b(?:coscia|quadric|quad|hamstring|bicipite femorale|flessor|femor)/],["knee",/\b(?:ginocch|knee|menisc|rotul|patell|acl|crociat|mcl|lca)/],
   ["shin",/\b(?:polpacc|calf|tibia|shin|perone|stinco|gamba)/],["ankle",/\b(?:caviglia|ankle|achill)/],["foot",/\b(?:piede|foot|tallon|heel|plantar|alluce|toe|lisfranc|metatars)/]];
  const hit=Z.filter(([k,r])=>r.test(t)).map(z=>z[0]);
  /* malattie che colpiscono tutto il corpo (influenza, virus, malattia): manichino interamente colorato */
  const all=!hit.length&&/\b(?:malatti|illness|pots|influenz|flu\b|virus|virale|febbre|fever|malore|gastro|covid|sindrom|disidrat)/.test(t);
  const R=/destr|right/.test(t),L=/sinistr|left/.test(t),sides=R&&!L?["R"]:L&&!R?["L"]:["R","L"];
  const col={out:"#ef4444",dubbio:"#f97316",quest:"#f5b400",prob:"#84cc16",dtd:"#93a3c8",ok:"#22c55e"}[stato]||"#ef4444";
  const X=(x,s)=>s==="R"?x:40-x;
  const shp={head:s=>`<circle cx="20" cy="7" r="5"/>`,neck:s=>`<rect x="18" y="11.5" width="4" height="4"/>`,
   shoulder:s=>`<circle cx="${X(11.5,s)}" cy="17.5" r="3"/>`,elbow:s=>`<circle cx="${X(9,s)}" cy="29" r="3"/>`,wrist:s=>`<circle cx="${X(9,s)}" cy="39.5" r="2.8"/>`,
   hand:s=>`<circle cx="${X(9,s)}" cy="43" r="3"/>`,chest:s=>`<rect x="13.5" y="16" width="13" height="9" rx="2"/>`,abs:s=>`<rect x="${s==="R"?14:20}" y="25" width="6" height="10" rx="1.5"/>`,
   back:s=>`<rect x="14.5" y="27" width="11" height="9" rx="2"/>`,hip:s=>`<rect x="${s==="R"?13.5:20}" y="35" width="6.5" height="6" rx="2"/>`,
   thigh:s=>`<rect x="${X(13.5,s)-(s==="R"?0:5.5)}" y="42" width="5.5" height="14" rx="2.5"/>`,knee:s=>`<circle cx="${X(16.2,s)}" cy="58" r="3.4"/>`,
   shin:s=>`<rect x="${X(14,s)-(s==="R"?0:4.5)}" y="60.5" width="4.5" height="11" rx="2"/>`,ankle:s=>`<circle cx="${X(16.2,s)}" cy="73" r="3.2"/>`,
   foot:s=>`<ellipse cx="${X(15.6,s)}" cy="76.6" rx="3.8" ry="2.4"/>`};
  const bodySide=s=>`<rect x="${s==="R"?7.3:29.3}" y="16" width="3.4" height="13" rx="1.7"/><rect x="${s==="R"?7.6:29.6}" y="29" width="2.8" height="11" rx="1.4"/><circle cx="${X(9,s)}" cy="43" r="2.1"/>
   <rect x="${s==="R"?13.5:21}" y="41" width="5.5" height="17" rx="2.6"/><rect x="${s==="R"?14:21.5}" y="57" width="4.5" height="16" rx="2.2"/><ellipse cx="${X(15.6,s)}" cy="76.6" rx="3" ry="1.6"/>`;
  const base=`<g fill="${all?col:"#55669a"}"${all?` style="filter:drop-shadow(0 0 2.5px ${col})"`:""}><circle cx="20" cy="7" r="4.6"/><rect x="18.2" y="11" width="3.6" height="4.5"/><path d="M11 16 Q20 13.5 29 16 L27.5 36 Q20 39 12.5 36 Z"/>${bodySide("R")}${bodySide("L")}</g>`;
  const hl=hit.length?`<g fill="${col}" style="filter:drop-shadow(0 0 2.5px ${col})" stroke="#fff" stroke-width=".6">${hit.map(k=>["head","neck","chest","back"].includes(k)?shp[k]("R"):sides.map(sd=>shp[k](sd)).join("")).join("")}</g>`:"";
  return `<svg class="bmap" viewBox="0 0 40 80" role="img" aria-label="${hit.length?"Zona: "+e(tipo):all?"Tutto il corpo: "+e(tipo):"Nessuna zona specifica"}">${base}${hl}</svg>`}
const dd=s=>{if(!s)return"";const d=new Date(s);return isNaN(d)?"":d.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",timeZone:"America/New_York"})};
async function injLoad(){if(INJ&&Date.now()-INJt<10*60e3)return;try{const r=await fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/injuries?t="+Date.now(),{cache:"no-store"});if(!r.ok)throw 0;const J=await r.json();const L=[];
 for(const tm of J.injuries||[])for(const x of tm.injuries||[]){const a=x.athlete||{},D=x.details||{};L.push({n:a.displayName||"",nba:(a.team&&a.team.abbreviation)||"",st:x.status||"",d:(x.shortComment||x.longComment||""),date:x.date||"",tipo:D.type||"",rit:D.returnDate||"",side:D.side||"",det:D.detail||""})}
 INJ=L;INJt=Date.now();if(cur==="inf")render()}catch(_){/* se ESPN non risponde dal telefono si usano gli infortuni scaricati da GitHub (espn-data.js) */if(!INJ&&ESPN.inj){INJ=ESPN.inj.map(x=>({n:x[0],nba:x[1],st:x[2],d:x[3],tipo:x[4],rit:x[5],side:x[6]||"",det:x[7]||"",date:x[8]||""}));INJt=Date.now();if(cur==="inf")render()}}}
/* (35) per il profilo giocatore (stats.js): stato e descrizione in italiano dell infortunio, dagli stessi dati del Centro Medico */
window.e16InjOf=n=>{try{injLoad()}catch(_){}const L=INJ||((typeof ESPN!=="undefined"&&ESPN.inj)||[]).map(x=>({n:x[0],nba:x[1],st:x[2],d:x[3],tipo:x[4],rit:x[5],side:x[6]||"",det:x[7]||""}));
 const k=__ownKey(n),x=L.find(y=>__ownKey(y.n)===k);if(!x)return null;const st=stOf(x.st);return{k:st,lab:STATI[st][0],txt:tipoIt(x),rit:x.rit||""}};
function vInf(){injLoad();const all=(INJ||[]).map(x=>({...x,t:own(x.n),k:stOf(x.st)})).filter(x=>x.t);const cnt={};all.forEach(x=>cnt[x.t]=(cnt[x.t]||0)+1);
 const wedge=t=>`<span class="wedge" style="--tc:${TCOL[t]}"><span class="badge logo lg-${t}"></span></span>`;
 const chips=`<div class="chips ichips">${TEAMS.map(x=>`<button class="chip ichip" data-it="${x.id}" aria-pressed="${G.it===x.id}"><span class="badge logo lg-${x.id}"></span>${e(nick(x))}${cnt[x.id]?`<b class="icnt">${cnt[x.id]}</b>`:""}</button>`).join("")}</div>`;
 const head=`<button class="gback" data-go="home">‹ Home</button><h2><span class="t"><span>Centro Medico</span></span><em>${INJ?"Agg. "+new Date(INJt).toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric"})+" · "+new Date(INJt).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"}):"carico…"}</em></h2>`;
 if(!G.it)return head+chips+`<div class="ipick">Scegli una squadra per vedere i suoi giocatori in infermeria.</div><p class="note">Fonte: ESPN – NBA Injuries (aggiornato in automatico).</p>`;
 const t=TM[G.it],L=all.filter(x=>x.t===G.it),groups=Object.keys(STATI).map(k=>[k,L.filter(x=>x.k===k)]).filter(([k,l])=>l.length);
 const row=x=>{const ti=tipoIt(x),rit=dd(x.rit);return `<div class="irow ${x.k}" data-pl="${e(x.n)}">${wedge(x.t)}<div class="ib"><div class="it"><b>${e(x.n)}</b><span class="ipill ${x.k}">${STATI[x.k][0]}</span></div><small>${e(nick(t))} · ${x.nba}</small><p>${e(ti)}${rit?` · <em>ESPN: rientro stimato ${rit}</em>`:""}</p><div class="isrc"><span>ESPN</span>${x.date?`<span>${dd(x.date)}</span>`:""}</div></div>${bodyMap(ti+" "+x.tipo+" "+(x.side||""),x.k)}</div>`};
 return head+chips+`<div class="ihead" style="--tc:${TCOL[G.it]}"><span class="badge logo lg-${G.it}"></span><b>${e(t.nome)}</b></div>
  <div class="isum">${Object.keys(STATI).map(k=>`<span class="ipill ${k}">${STATI[k][0]} <b>${L.filter(x=>x.k===k).length}</b></span>`).join("")}</div>
  ${groups.length?groups.map(([k,l])=>`<section class="igrp"><h4 class="ih ${k}"><span>${STATI[k][1]}</span></h4><div class="tbl-wrap ilist">${l.map(row).join("")}</div></section>`).join(""):`<div class="iok">✓ Nessun giocatore segnalato: rosa al completo.</div>`}
  <p class="note">Fonte: ESPN – NBA Injuries (aggiornato in automatico). Il manichino colora la zona dell infortunio (destra = lato sinistro del disegno, vista frontale); tutto colorato = malattia.</p>`}
/* ---------- REGOLAMENTO ---------- */
function vReg(){const art=(n,t,b)=>`<details class="rart"${n===1?" open":""}><summary><span class="rn">${String(n).padStart(2,"0")}</span><span class="rt">${t}<small>Articolo ${n}</small></span></summary><div class="rbody">${b}</div></details>`;
 return `<button class="gback" data-go="home">‹ Home</button><h2><span class="t"><span>Regolamento</span></span><em>FantaBasket USA due palle</em></h2>
 <div class="rhead"><p>Fanta Dynasty a 16 squadre su ESPN Fantasy · tocca un articolo per aprirlo.</p></div>
 <div class="rlegend"><span><b>AVG</b> punti fantasy ESPN</span><span><b>BE</b> tribuna</span><span><b>IR</b> infortunati</span></div>
 ${art(1,"Squadre e conference",`<p>16 franchigie divise in due conference: <b>East</b> (${TEAMS.filter(t=>t.conf==="E").map(t=>e(nick(t))).join(", ")}) e <b>West</b> (${TEAMS.filter(t=>t.conf==="W").map(t=>e(nick(t))).join(", ")}).</p>`)}
 ${art(2,"Formazione",`<p>Si schierano <b>14 giocatori</b> in campo con <b>punteggio pieno</b>, senza regole di ruolo. La formazione si mette su ESPN il <b>lunedì prima della prima partita</b> e resta bloccata fino al lunedì dopo: l app legge quella formazione da ESPN.</p><p><b>3 posti in tribuna</b>, riservati agli <b>under 25</b>. Solo se ci sono infortunati si possono mettere gli infortunati al posto degli under 25.</p>`)}
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
