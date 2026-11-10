/* ===== ESPN 16 – McGEE CUP (79) =====
   (80) sotto l intestazione il trofeo JaVale McGee Cup (coppa-trofeo.js) con la vincitrice quando la coppa è finita.
   Coppa a eliminazione diretta di Fanta Due Palle, giocata in parallelo al campionato (fuori da ESPN: i risultati li gestiscono gli admin).
   Turni: OTTAVI = settimana 2 · QUARTI = settimana 4 · SEMIFINALI = settimana 6 · FINALE = settimana 8. Una partita, dentro o fuori.
   Sorteggio: agli ottavi sempre EST contro OVEST; dai quarti sorteggio libero (Est–Est e Ovest–Ovest possibili).
   Punteggio di ogni sfida = punti della squadra in quella settimana di campionato. I turni già chiusi usano i punteggi ufficiali degli admin
   (locandina «Round of 16 – Results»); quelli in corso o futuri si calcolano dai punteggi della settimana (sfidaScores) e si aggiornano da soli.
   Per aggiornare la coppa: scrivere qui sotto in COPPA gli accoppiamenti del nuovo sorteggio (e, a turno chiuso, i punteggi ufficiali in «sc»). */
(function(){
const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const f1=v=>v==null?"—":(Math.round(v*10)/10).toLocaleString("it-IT",{maximumFractionDigits:1});
/* turni: k chiave, n nome, w settimana di campionato, m sfide [squadra A, squadra B, (punti ufficiali A, B)] */
const COPPA=[
 {k:"r16",n:"Ottavi di finale",w:2,m:[
  ["CAN","ALA",651,1309.5],["WIC","CLE",1024.5,1407],["BOS","SRO",1420.5,755],["ALB","DET",1374,1631],
  ["LVA","QUE",1530,1107.5],["FAL","NYP",1064,1301],["HOU","CHA",1741.5,1323.5],["HON","NYS",1361,964]]},
 /* (81) quarti come da tabellone ufficiale (locandina): a sinistra Whales–Cadavers e TeaBags–Pythons, a destra Aliens–Pandas e Lions–Monk Seals.
    Da qui niente più sorteggi: semifinali = vincente QF1 contro vincente QF2 e vincente QF3 contro vincente QF4; finale = lato sinistro contro lato destro. */
 {k:"qf",n:"Quarti di finale",w:4,m:[["ALA","CLE"],["BOS","DET"],["LVA","NYP"],["HOU","HON"]]},
 {k:"sf",n:"Semifinali",w:6,m:[]},
 {k:"f",n:"Finale",w:8,m:[]}];
window.COPPA=COPPA;
/* (81) semifinali e finale si riempiono da sole dal tabellone: accoppiamenti a due a due nell ordine del turno prima.
   Finché il turno prima non è chiuso la sfida mostra «Vincente X / Y». */
function fill(){for(let i=1;i<COPPA.length;i++){const r=COPPA[i],p=COPPA[i-1];if(r.fix)continue;if(!r.auto&&r.m.length)continue;r.auto=1;r.m=[];
 for(let j=0;j<p.m.length;j+=2){const w=k=>{const m=p.m[k];if(!m)return null;if(stato(p)!=="fin")return null;const s=score(p,m);return s.a==null||s.b==null?null:s.a>=s.b?m[0]:m[1]};
  const lab=k=>{const m=p.m[k];return m?(m[0].startsWith("?")||m[1].startsWith("?")?"Vincente semifinale "+(k+1):"Vincente "+nick(m[0])+"/"+nick(m[1])):"?"};
  const A=w(j),B=w(j+1);r.m.push([A||"?"+lab(j),B||"?"+lab(j+1)])}}}
const nick=t=>TM[t]?TM[t].nome.split(" ").slice(-1)[0]:t;
const lg=t=>`<span class="cplg" style="--tc:${TCOL[t]||"#333"}"><span class="badge logo lg-${t}" role="img" aria-label="${e(TM[t]?TM[t].nome:t)}"></span></span>`;
const wNow=()=>{try{return weekOf(nyToday()<W1?W1:nyToday())}catch(_){return 1}};
/* punteggi di una sfida: ufficiali se scritti, altrimenti quelli della settimana */
function score(r,m){if(m[2]!=null)return{a:m[2],b:m[3],off:1};try{const S=sfidaScores(r.w).S;return{a:S[m[0]],b:S[m[1]],off:0}}catch(_){return{a:null,b:null,off:0}}}
function stato(r){const n=wNow();return r.w<n?"fin":r.w===n?"live":"next"}
/* vincitori del turno (solo se chiuso) */
const winners=r=>stato(r)!=="fin"?[]:r.m.map(m=>{const s=score(r,m);return s.a==null||s.b==null?null:s.a>=s.b?m[0]:m[1]}).filter(Boolean);
function card(r,m){if(m[0].startsWith("?")||m[1].startsWith("?")){const row=t=>t.startsWith("?")?`<div class="cpr tbd"><span class="cplg"><i>?</i></span><b>${e(t.slice(1))}</b><small></small><span class="cps"></span></div>`:`<div class="cpr">${lg(t)}<b>${e(nick(t))}</b><small>${TM[t].conf==="E"?"Est":"Ovest"}</small><span class="cps"></span></div>`;
  return `<div class="cpm next">${row(m[0])}${row(m[1])}<span class="cpst">Da giocare · settimana ${r.w}</span></div>`}
 const s=score(r,m),st=stato(r),fin=st==="fin",wa=fin&&s.a>s.b,wb=fin&&s.b>s.a;
 const row=(t,v,w,l)=>`<div class="cpr${w?" win":""}${l?" lo":""}">${lg(t)}<b>${e(nick(t))}</b><small>${TM[t]&&TM[t].conf==="E"?"Est":"Ovest"}</small><span class="cps">${f1(v)}</span>${w?'<i class="cpok">✓</i>':""}</div>`;
 return `<button class="cpm ${st}" data-cpm="${m[0]},${m[1]},${r.w}" aria-label="${e(nick(m[0]))} contro ${e(nick(m[1]))}">${row(m[0],s.a,wa,fin&&!wa)}${row(m[1],s.b,wb,fin&&!wb)}<span class="cpst">${fin?"Finale":st==="live"?'<span class="hmlv">LIVE</span> In corso':"Da giocare"}${s.off?" · ufficiale":""}</span></button>`}
function vCoppa(){const n=wNow();try{fill()}catch(_){}
 const cur_=COPPA.find(r=>r.w>=n)||COPPA[COPPA.length-1];
 const alive=(()=>{let L=TEAMS.map(t=>t.id);for(const r of COPPA){if(stato(r)!=="fin")break;const W=winners(r);if(W.length)L=W}return L})();
 const sec=r=>{const st=stato(r);let body;
  if(r.m.length)body=`<div class="cpgrid">${r.m.map(m=>card(r,m)).join("")}</div>`;
  else{const prev=COPPA[COPPA.indexOf(r)-1],W=prev?winners(prev):[];body=`<div class="cpwait"><b>${W.length?"Sorteggio in arrivo":"In attesa del turno prima"}</b><small>${W.length?`Qualificate: ${W.map(nick).join(" · ")}`:`Si gioca nella settimana ${r.w}`}</small>${W.length?`<div class="cpq">${W.map(lg).join("")}</div>`:""}</div>`}
  return `<section class="cpsec ${st}"><h3><span>${r.n}</span><em>settimana ${r.w}${st==="live"?" · in corso":st==="fin"?" · chiuso":""}</em></h3>${body}</section>`};
 return `<button class="gback" data-go="home">‹ Home</button>
 <div class="cphero"><img src="img/mcgee.png" alt="McGee Cup"><div><small>Fanta Due Palle · stagione 26/27</small><b>McGEE CUP</b><em>${alive.length===1?"Vincitrice: "+e(TM[alive[0]].nome):cur_.n+" · settimana "+cur_.w}</em></div></div>
 <div class="cptro">${window.mcgeeTrofeo?mcgeeTrofeo("cpt"):""}<div class="cptw">${alive.length===1?`<small>Campione</small>${lg(alive[0])}<b>${e(TM[alive[0]].nome)}</b>`:`<small>In palio</small><b>JaVale McGee Cup</b><em>${alive.length} squadre ancora in corsa</em>`}</div></div>
 <div class="cpbar">${COPPA.map(r=>`<span class="${stato(r)}"><b>${r.k==="r16"?"8°":r.k==="qf"?"4°":r.k==="sf"?"SF":"F"}</b><small>sett. ${r.w}</small></span>`).join("")}</div>
 ${COPPA.slice().reverse().filter(r=>r.m.length||stato(r)!=="fin").sort((a,b)=>{const o={live:0,next:1,fin:2};return o[stato(a)]-o[stato(b)]||a.w-b.w}).map(sec).join("")}
 <details class="cpreg"><summary>Regolamento della coppa</summary><ul>
  <li>Coppa a eliminazione diretta: <b>ottavi</b> (settimana 2), <b>quarti</b> (settimana 4), <b>semifinali</b> (settimana 6) e <b>finale</b> (settimana 8). Una partita, dentro o fuori.</li>
  <li>Punteggio = punti fatti dalla squadra in quella settimana di campionato.</li>
  <li>Ottavi: sorteggio casuale con un solo vincolo, <b>Est contro Ovest</b> (8 squadre dell Est contro 8 dell Ovest).</li>
  <li>Dai quarti: sorteggio libero, nessun vincolo di conference.</li>
  <li>La coppa si gioca in parallelo al campionato e fuori da ESPN: risultati e passaggi del turno li ufficializzano gli admin.</li></ul></details>
 <p class="note">Tocca una sfida per vedere il tabellino della settimana (Dynasty TV). Turni chiusi: punteggi ufficiali degli admin; turno in corso: punteggi ESPN della settimana, aggiornati da soli.</p>`}
window.SCAMBIV=window.SCAMBIV||{};SCAMBIV.coppa=vCoppa;
/* tocca una sfida → box score della settimana in Dynasty TV (stessa pagina delle sfide di campionato) */
document.addEventListener("click",ev=>{if(typeof cur==="undefined"||cur!=="coppa")return;const b=ev.target.closest("[data-cpm]");if(!b)return;ev.preventDefault();
 try{const[A,B,w]=b.dataset.cpm.split(",");window.TVS.dr=A+","+B+","+w;window.TVS.drs="a";window.TVS.g=null;const[a]=weekRange(+w);if(!TVS.d||TVS.d<a)TVS.d=a}catch(_){}cur="tv";render();scrollTo(0,0)});
})();
