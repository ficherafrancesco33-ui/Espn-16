/* ===== ESPN 16 – DYNASTY TV (come la Dynasty TV di Dreamers, con AVG al posto dei PDK) =====
   Calendario NBA giorno per giorno (data USA), risultati, tabellino di ogni partita con la squadra del fanta (SQ) e l AVG di ogni giocatore.
   Dati: ESPN (espn-data.js + live.js). Stesse classi di Dreamers: gli stili sono in skin-giorno.css / skin-notte.css. */
(function(){
const TVS={d:null,g:null,side:"a"};
const GG=["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"],GS=["Dom","Lun","Mar","Mer","Gio","Ven","Sab"],MM=["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
const dd=d=>new Date(d+"T12:00:00Z");
const nyDay=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York"}).format(new Date());
const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const f1=v=>(Math.round(v*100)/100).toLocaleString("it-IT",{maximumFractionDigits:2});
const nm=n=>{const p=String(n).split(" ");return p.length>1?p[0][0]+". "+p.slice(1).join(" "):n};
const last=n=>{const p=String(n).split(" ");return p[p.length-1]==="Jr."||p[p.length-1]==="II"||p[p.length-1]==="III"?p[p.length-2]:p[p.length-1]};
const nbaLg=a=>`loghi/nba/${String(a).toLowerCase()}.svg`;
const T=a=>(ESPN.teams&&ESPN.teams[a])||[a,"#333333",""];
const lw=a=>`<span class="tvlw ok" style="background:${T(a)[1]}"><em>${a}</em><img src="${nbaLg(a)}" alt=""></span>`;
const pc=v=>v>=50?"pv":v>=35?"pg":v>=20?"py":"pr";
const xc=v=>v>=50?"v":v>=35?"g":v>=20?"y":"r";
const own=n=>{try{return window.__ownKey&&OWNH[__ownKey(n)]||""}catch(_){return""}};
function stOf(g){return g[4]==="F"?"Finale"+(g[6]==="OT"?" · OT":""):g[4]==="L"?(g[6]||"Live"):new Date(g[5]).toLocaleTimeString("it-IT",{timeZone:"Europe/Rome",hour:"2-digit",minute:"2-digit"})}
function defDay(){const D=Object.keys(ESPN.days).sort(),t=nyDay();if(D.includes(t)&&(ESPN.days[t]||[]).some(id=>ESPN.games[id]&&ESPN.games[id][4]!=="S"))return t;
 const done=D.filter(d=>d<=t&&(ESPN.days[d]||[]).some(id=>ESPN.box[id]));return done[done.length-1]||t}
/* (38) SCONTRI DIRETTI della lega sotto le partite NBA, come «Dreamers» nella Dynasty TV di Dreamers: le sfide della settimana del giorno scelto,
   (44) punteggio = ufficiale ESPN (settimane finite) o somma dei 14 titolari della formazione ESPN del lunedì, quanti dei 14 hanno già giocato, giorni giocati della settimana e i migliori di ogni squadra.
   Tocca una sfida → duello stile Sleeper della Lega (data-du, gestito in gest.js). */
function e16Sfide(d){try{const w=weekOf(d<W1?W1:d),M=MATCHUPS[w]||[];if(!M.length)return"";const[a,b]=weekRange(w),WS=weekScores(w),wNow=weekOf(nyToday()<W1?W1:nyToday());
 const days=Object.keys(ESPN.days).filter(k=>k>=a&&k<=b&&(ESPN.days[k]||[]).length).sort(),done=days.filter(k=>(ESPN.days[k]||[]).every(id=>ESPN.games[id]&&ESPN.games[id][4]==="F")).length;
 const fin=w<wNow||(days.length&&done===days.length),st=fin?"Finale":w>wNow?"Da giocare":"In corso";
 const card=([A,B])=>{const TA=wkTeam(A,w),TB=wkTeam(B,w),sa=WS.S[A],sb=WS.S[B];
  const pl=T=>T.L.filter(x=>x.on&&x.n>0).length,best=T=>T.L[0]&&T.L[0].n?T.L[0]:null;
  const side=(id,sc,T,win)=>`<div class="tvt${win?" win":""}"><span class="drtvl" style="--tc:${TCOL[id]}"><span class="badge logo lg-${id}" role="img" aria-label="${e(TM[id].nome)}"></span></span><span class="tvnm"><b>${e(TM[id].nome.split(" ").slice(-1)[0])}</b><small>${WS.off?"punteggio ufficiale ESPN":pl(T)+"/14 hanno giocato"}</small></span><span class="tvsc">${f1(sc)}</span></div>`;
  const ba=best({L:TA.L.filter(x=>x.on)}),bb=best({L:TB.L.filter(x=>x.on)});
  return `<button class="tvg drtvg" data-du="${A},${B}" data-duw="${w}" aria-label="${e(TM[A].nome)} contro ${e(TM[B].nome)}"><div class="tvteams">${side(A,sa,TA,fin&&sa>sb)}${side(B,sb,TB,fin&&sb>sa)}</div>
  <div class="tvst"><b class="pre">${st}</b><small>${done}/${days.length} giorni · sfida ›</small></div>${ba||bb?`<div class="tvtop"><span>Migliori: ${ba?`<b>${e(last(ba.g[0]))}</b> (${A}) <span class="pdkx ${xc(ba.tot/ba.n)}">${f1(ba.tot)}</span>`:""}${ba&&bb?" · ":""}${bb?`<b>${e(last(bb.g[0]))}</b> (${B}) <span class="pdkx ${xc(bb.tot/bb.n)}">${f1(bb.tot)}</span>`:""}</span></div>`:""}</button>`};
 return `<div class="drtvh"><h2><span class="t"><span>ESPN 16</span></span><em>Settimana ${w} · ${done} su ${days.length} giorni</em></h2></div><div class="tvlist">${M.map(card).join("")}</div>`}catch(_){return""}}
function vList(){const D=Object.keys(ESPN.days).sort();const d=TVS.d&&ESPN.days[TVS.d]?TVS.d:defDay();TVS.d=d;const i=D.indexOf(d);
 const G=(ESPN.days[d]||[]).map(id=>[id,ESPN.games[id]]).filter(x=>x[1]).sort((a,b)=>a[1][5]<b[1][5]?-1:1);
 const nF=G.filter(x=>x[1][4]==="F").length,nL=G.filter(x=>x[1][4]==="L").length;
 const x=dd(d),dl=`${GG[x.getUTCDay()]} ${x.getUTCDate()} ${MM[x.getUTCMonth()]}`;
 const card=([id,g])=>{const B=ESPN.box[id]||[];const top=B.length?B.reduce((m,r)=>ffps(r)>ffps(m)?r:m,B[0]):null;const aw=g[4]==="F"&&g[2]>g[3],hw=g[4]==="F"&&g[3]>g[2];
  const side=(a,sc,w)=>`<div class="tvt${w?" win":""}">${lw(a)}<span class="tvnm"><b>${e(T(a)[0])}</b><small>${a}${T(a)[2]?" · "+T(a)[2]:""}</small></span><span class="tvsc">${g[4]==="S"?"":sc}</span></div>`;
  return `<button class="tvg" data-tvg="${id}"><div class="tvteams">${side(g[0],g[2],aw)}${side(g[1],g[3],hw)}</div>
  <div class="tvst"><b>${g[4]==="L"?`<span class="hmlv">LIVE</span> `:""}${e(stOf(g))}</b><small>${B.length?"tabellino ›":g[4]==="S"?"ora italiana":""}</small></div>${top?`<div class="tvtop"><span>Top: <b>${e(last(top[0]))}</b> (${top[1]}) ${top[4]} pt · ${top[11]+top[12]} rb · ${top[13]} as · <span class="pdkx ${xc(ffps(top))}">${f1(ffps(top))}</span> AVG</span></div>`:""}</button>`};
 return `<button class="gback" data-go="home">‹ Home</button><div class="tvpnl"><div class="tvhero"><b>Dynasty TV <i>NBA</i></b><small>Calendario, risultati e tabellini · AVG della lega</small></div>
 <div class="tvdate"><button ${i>0?`data-tvd="${D[i-1]}"`:"disabled"}>‹</button><div class="tvdl"><b>${dl}</b><small>${G.length} partite · ${nL?nL+" live · ":""}${nF===G.length&&G.length?"tutte finite":nF+" finite"} · data USA</small></div><button ${i<D.length-1?`data-tvd="${D[i+1]}"`:"disabled"}>›</button></div>
 <div class="tvweek" id="tvweek">${D.map(k=>{const y=dd(k),n=(ESPN.days[k]||[]).length;return`<button class="tvday${n?"":" off"}" data-tvd="${k}" aria-pressed="${k===d}"${n?"":" disabled"}><span>${GS[y.getUTCDay()]}</span><b>${y.getUTCDate()}</b><small>${n?n+" part.":"—"}</small></button>`}).join("")}</div>
 <div class="tvlist">${G.map(card).join("")||`<p class="note">Nessuna partita.</p>`}</div>${e16Sfide(d)}</div>
 <p class="note">Dati ESPN · durante le partite si aggiorna da solo ogni 30 secondi.</p>`}
function vGame(){const id=TVS.g,g=ESPN.games[id];if(!g){TVS.g=null;return vList()}const B=ESPN.box[id]||[];const ab=TVS.side==="h"?g[1]:g[0];const R=B.filter(r=>r[1]===ab);
 const x=dd(TVS.d||nyDay()),dl=`${x.getUTCDate()} ${MM[x.getUTCMonth()]}`;const oc=new Set(B.oc||[]);
 const row=r=>{const f=ffps(r),o=own(r[0]);return`<tr><td><div class="tvpn"><div class="plk" data-pl="${e(r[0])}">${g[4]==="L"&&oc.has(r[0])?"● ":""}${e(nm(r[0]))}<small><i class="tvps">${e(r[22]||"")}</i></small></div></div></td><td class="sqc"><span class="tvown">${o?`<span class="tvob logo lg-${o}"></span>`:""}</span></td><td class="pdkl ${pc(f)}"><span class="pdkb">${f1(f)}</span></td><td>${r[3]}</td><td class="pts">${r[4]}</td><td>${r[11]+r[12]}</td><td>${r[13]}</td><td>${r[14]}</td><td>${r[15]}</td><td>${r[16]}</td><td>${r[5]}-${r[6]}</td><td>${r[7]}-${r[8]}</td><td>${r[9]}-${r[10]}</td><td>${r[11]}</td><td>${r[12]}</td><td>${r[17]}${r[18]?` <small>${r[18]}T</small>`:""}${r[19]?` <small>${r[19]}F</small>`:""}</td><td class="${(r[21]||0)>0?"pos":(r[21]||0)<0?"neg":""}">${(r[21]||0)>0?"+":""}${r[21]||0}</td></tr>`};
 const s=k=>R.reduce((a,r)=>a+r[k],0),pct=(a,b)=>b?(a/b*100).toFixed(1).replace(".",",")+"%":"–";
 const tot=R.reduce((a,r)=>a+ffps(r),0);
 const side=(a,lab)=>`<div class="tside">${lw(a)}<b>${e(T(a)[0])}</b><small>${T(a)[2]?T(a)[2]+" · ":""}${lab}</small></div>`;
 return `<button class="gback tvback" data-tvback="1">‹ Partite del ${dl}</button>
 <div class="tvsb">${side(g[0],"trasferta")}<div class="tmid"><div><span class="${g[4]==="F"&&g[2]<g[3]?"lo":""}">${g[2]}</span><i>–</i><span class="${g[4]==="F"&&g[3]<g[2]?"lo":""}">${g[3]}</span></div><small>${g[4]==="L"?`<span class="hmlv">LIVE</span> `:""}${e(stOf(g))}</small></div>${side(g[1],"casa")}</div>
 <div class="tvtabs">${["a","h"].map((k,j)=>`<button class="tvtab" data-tvside="${k}" aria-pressed="${TVS.side===k}">${lw(g[j])}${e(T(g[j])[0])}</button>`).join("")}</div>
 ${R.length?`<div class="tbl-wrap tvw"><table class="ptbl tvbox tvsq"><thead><tr><th>Giocatore</th><th class="sqh">SQ</th><th class="pdkl">AVG</th><th>Min</th><th>Pt</th><th>RIM</th><th>AST</th><th>STL</th><th>BLK</th><th>TOV</th><th>Tiri</th><th>Da 3</th><th>Liberi</th><th>Off</th><th>Dif</th><th>Falli</th><th>+/−</th></tr></thead>
 <tbody><tr class="grp"><td>Quintetto</td><td colspan="16"></td></tr>${R.filter(r=>r[2]).map(row).join("")}<tr class="grp"><td>Panchina</td><td colspan="16"></td></tr>${R.filter(r=>!r[2]).sort((a,b)=>b[3]-a[3]).map(row).join("")}
 <tr class="tot"><td>Totale squadra</td><td class="sqc"></td><td class="pdkl">${f1(tot)}</td><td></td><td>${s(4)}</td><td>${s(11)+s(12)}</td><td>${s(13)}</td><td>${s(14)}</td><td>${s(15)}</td><td>${s(16)}</td><td>${s(5)}-${s(6)}</td><td>${s(7)}-${s(8)}</td><td>${s(9)}-${s(10)}</td><td>${s(11)}</td><td>${s(12)}</td><td>${s(17)}</td><td></td></tr>
 <tr class="pct"><td>Percentuali</td><td class="sqc"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>${pct(s(5),s(6))}</td><td>${pct(s(7),s(8))}</td><td>${pct(s(9),s(10))}</td><td></td><td></td><td></td><td></td></tr></tbody></table></div>`:`<p class="note">Tabellino non ancora disponibile${g[4]==="S"?": la partita non è iniziata":""}.</p>`}
 <p class="note">Tabellino ESPN. AVG = punti della lega (vedi Statistiche). SQ = squadra del fanta. Pt punti, RIM rimbalzi, AST assist, STL palle rubate, BLK stoppate, TOV palle perse, Off/Dif rimbalzi offensivi/difensivi, T tecnico, F flagrante${g[4]==="L"?", ● in campo adesso":""}.</p>`}
window.vTv=()=>TVS.g?vGame():vList();
window.TVS=TVS;
(window.NAVX=window.NAVX||[]).push({k:"tv",get:()=>({d:TVS.d,g:TVS.g,side:TVS.side}),set:o=>Object.assign(TVS,o)});
document.addEventListener("click",ev=>{if(cur!=="tv")return;const c=ev.target.closest("[data-tvd],[data-tvg],[data-tvback],[data-tvside]");if(!c)return;const d=c.dataset;
 if(d.tvd){TVS.d=d.tvd;TVS.g=null;render();const w=document.getElementById("tvweek"),b=w&&w.querySelector('[aria-pressed="true"]');if(b)w.scrollLeft=b.offsetLeft-w.clientWidth/2+b.clientWidth/2;return}
 if(d.tvg){TVS.g=d.tvg;TVS.side="a";render();scrollTo(0,0);return}
 if(d.tvback){TVS.g=null;render();return}
 if(d.tvside){TVS.side=d.tvside;render();return}},true);
})();
