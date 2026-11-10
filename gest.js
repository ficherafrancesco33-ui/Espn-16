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
const G={tab:"turno",wk:null,rt:"QUE",it:null};
try{Object.assign(G,JSON.parse(localStorage.getItem("e16_gest")||"{}"))}catch(_){}
const save=()=>{try{localStorage.setItem("e16_gest",JSON.stringify({tab:G.tab,rt:G.rt}))}catch(_){}};
/* ---------- LEGA ---------- */
function vLega(){
 const wNow=weekOf(nyToday()<W1?W1:nyToday()),w=G.wk&&G.wk<=wNow+20?G.wk:wNow,[wa,wb]=weekRange(w);
 const tabs=`<div class="drtabs">${[["turno","Settimana"],["cal","Calendario"],["cla","Classifica"],["po","Playoff"]].map(([k,l])=>`<button data-lg2="${k}" aria-pressed="${G.tab===k}">${l}</button>`).join("")}</div>`;
 const head=`<div class="drroom" data-th="3"><button class="drexit" data-go="home">‹ Torna all'app</button><div class="drhd"><span class="drlogo">ESPN 16</span><small>FantaBasket USA · AVG · stagione 26/27</small></div>${tabs}`;
 let body="";
 if(G.tab==="turno"){const WS=weekScores(w),M=MATCHUPS[w]||[],fin=w<wNow,live=w===wNow;
  body=`<div class="drnav"><button data-lgw="${w-1}" ${w>1?"":"disabled"}>‹</button><div><b>Settimana ${w}</b><small>${dIt(wa)} → ${dIt(wb)}${fin?" · finita":live?" · in corso":""}</small></div><button data-lgw="${w+1}" ${w<wNow?"":"disabled"}>›</button></div>`;
  if(M.length)body+=`<div class="drms">${M.map(([A,B])=>{const a=WS.S[A],b=WS.S[B],la=a>=b;const r=(id,v,l)=>`<div class="drr tint ${l?"slead":"strail"}" style="${tint(id)}"><span class="drlg" style="--tc:${TCOL[id]}"><span class="badge logo lg-${id}"></span></span><span class="drn"><b>${e(TM[id].nome)}</b><small>${WS.G[id]} partite dei titolari</small></span><em>${f1(v)}</em></div>`;
   return `<button class="drm" data-team="${A}">${r(A,a,la)}${r(B,b,!la)}<span class="drst ${fin?"":"live"}">${fin?"Finale":"In corso"}</span></button>`}).join("")}</div>`;
  else body+=`<p class="note">Calendario delle sfide non ancora inserito: ecco il punteggio della settimana di ogni squadra (14 titolari, punteggio pieno).</p><div class="drcla">${TEAMS.slice().sort((a,b)=>WS.S[b.id]-WS.S[a.id]).map((t,k)=>`<div class="drcr tint ${k===0?"lead":""}" data-team="${t.id}" style="${tint(t.id)}"><span class="drpos">${k+1}</span><span class="drlg l" style="--tc:${TCOL[t.id]}"><span class="badge logo lg-${t.id}"></span></span><div class="drci"><b>${e(t.nome)}</b><small>${WS.G[t.id]} partite dei titolari · ${t.conf==="E"?"East":"West"}</small></div><div class="drcwl"><b class="avg">${f1(WS.S[t.id])}<small>AVG</small></b></div></div>`).join("")}</div>`}
 if(G.tab==="cal"){const last=Math.max(wNow+2,...Object.keys(MATCHUPS).map(Number));let h="";
  for(let k=1;k<=last;k++){const[a,b]=weekRange(k),M=MATCHUPS[k]||[];h+=`<h4 class="drplh">Settimana ${k}<span>${dIt(a)} → ${dIt(b)}${k===wNow?" · in corso":k<wNow?" · finita":""}</span></h4>${M.length?`<div class="drms">${M.map(([A,B])=>`<button class="drm" data-lgw="${k}" data-lg2="turno"><div class="drr tint" style="${tint(A)}"><span class="drlg"><span class="badge logo lg-${A}"></span></span><span class="drn"><b>${e(TM[A].nome)}</b></span></div><div class="drr tint" style="${tint(B)}"><span class="drlg"><span class="badge logo lg-${B}"></span></span><span class="drn"><b>${e(TM[B].nome)}</b></span></div></button>`).join("")}</div>`:`<p class="note">Sfide da inserire.</p>`}`}
  body=h}
 if(G.tab==="cla"){const WS=weekScores(wNow);body=["E","W"].map(c=>{const L=standings(c);return `<h4 class="drplh drplsh">${c==="E"?"Eastern":"Western"} Conference<span></span></h4><div class="drcla">${L.map((t,k)=>`<div class="drcr tint ${k===0?"lead":""}" data-team="${t.id}" style="${tint(t.id)}"><span class="drpos">${k+1}</span><span class="drlg l" style="--tc:${TCOL[t.id]}"><span class="badge logo lg-${t.id}"></span></span><div class="drci"><b>${e(t.nome)}</b><small>${e(t.gm)}${k<4?" · zona titolo":" · 5ª–8ª"}</small></div><div class="drcwl"><b>${t.w}<small>V</small></b><b class="l">${t.l}<small>P</small></b><b class="avg">${f1(WS.S[t.id])}<small>SETT.</small></b></div></div>`).join("")}</div>`}).join("")+`<p class="note">V-P dalla lega ESPN. SETT. = punteggio della settimana in corso.</p>`}
 if(G.tab==="po"){const bk=(L,a,lab,sub,fin)=>{const m=(x,y,l)=>`<div class="bkm"><span class="bklab">${l}</span>${[x,y].map(i=>`<div class="bkt tint" style="--tc:${TCOL[L[i].id]}"><i>${i+1}</i><span class="bklg" style="--tc:${TCOL[L[i].id]}"><span class="badge logo lg-${L[i].id}"></span></span><b>${e(nick(L[i]))}</b><em></em></div>`).join("")}</div>`;
   return `<section class="pob ${a?"b":"a"}"><div class="pobh"><span><b>${lab}</b><small>${sub}</small></span></div><div class="pobt2"><span>Semifinali<small></small></span><span>${fin}<small></small></span></div>
   <div class="pobk pobk2 pobx"><div class="pk s1">${m(a,a+3,`${a+1}ª vs ${a+4}ª`)}</div><div class="pk s2">${m(a+1,a+2,`${a+2}ª vs ${a+3}ª`)}</div><div class="pk f1"><div class="bkm tbd fin"><span class="bklab">${fin}</span><div class="bkt"><b>Vincente ${a+1}ª vs ${a+4}ª</b></div><div class="bkt"><b>Vincente ${a+2}ª vs ${a+3}ª</b></div></div></div></div></section>`};
  body=`<p class="note" style="margin-top:0">Tabelloni provvisori con le regole Dreamers, uno per conference, in base alla classifica attuale (in attesa delle regole della lega).</p>`+["E","W"].map(c=>{const L=standings(c);return `<h4 class="drplh drplsh">Playoff ${c==="E"?"East":"West"}<span></span></h4>${bk(L,0,"Tabellone titolo","1ª–4ª · si gioca il titolo","Finale "+(c==="E"?"East":"West"))}${bk(L,4,"Tabellone 5ª–8ª","posizioni dal 5° all'8°","Finale 5°–6°")}`}).join("")}
 return head+body+`</div>`}
/* ---------- ROSTER (come il Roster di Dreamers) ---------- */
const RL=r=>{const a=String(r||"").split(",");return a[0]==="C"?"C":/G/.test(a[0])?"G":"F"};
function vRoster(){const t=TM[G.rt]||TEAMS[0],R0=ROSE[t.id]||[],P=pstats(),r=REC[t.id];
 const li=g=>{const p=P[g[0]],v=p?p.ff/p.gp:null;return `<li class="rrow lc" data-pl="${e(g[0])}"><span class="rnm"><b>${e(g[0])}</b><small>${g[1]} · ${g[3]}${g[2]==="IR"?" · IR":g[2]==="BE"?" · tribuna":""}</small></span><span class="rtags"><span class="rpdk">${v!=null?`<span class="pdkx ${xc(v)}">${f1(v)}</span>`:"–"}</span></span></li>`};
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
 ${art(6,"Playoff",`<p>Provvisorio: regole Dreamers per ogni conference (1ª–4ª tabellone titolo, 5ª–8ª l'altro), in attesa delle regole della lega.</p>`)}`}
window.GESTV={lega:vLega,roster:vRoster,inf:vInf,reg:vReg};
window.e16Roster=t=>{G.rt=t;save()};window.e16RT=()=>G.rt;
(window.NAVX=window.NAVX||[]).push({k:"g",get:()=>({tab:G.tab,rt:G.rt,it:G.it,wk:G.wk}),set:o=>Object.assign(G,o)});
document.addEventListener("click",ev=>{const c=ev.target.closest("[data-lg2],[data-lgw],[data-rt],[data-it]");if(!c)return;const d=c.dataset;
 if(d.lgw){G.wk=+d.lgw;if(d.lg2)G.tab=d.lg2;save();render();return}
 if(d.lg2){G.tab=d.lg2;save();render();return}
 if(d.rt){G.rt=d.rt;save();render();return}
 if(d.it){G.it=G.it===d.it?null:d.it;render();return}},true);
})();
