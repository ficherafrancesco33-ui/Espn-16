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
 /* (81) quarti come da tabellone ufficiale (locandina, sorteggio degli admin). (82) semifinali e finale: sorteggio automatico a fine turno (fill) */
 {k:"qf",n:"Quarti di finale",w:4,m:[["BOS","ALA"],["LVA","CLE"],["HOU","HON"],["NYP","DET"]]/* (84) accoppiamenti veri del sorteggio dei quarti (Francesco 10/11): Boston–Alaska, Las Vegas–Cleveland, Houston–Honolulu, Pandas–Pythons */},
 {k:"sf",n:"Semifinali",w:6,m:[]},
 {k:"f",n:"Finale",w:8,m:[]}];
window.COPPA=COPPA;
/* (82) DOPO OGNI TURNO NUOVO SORTEGGIO (regola corretta da Francesco): quando la settimana di un turno è finita, le vincenti si accoppiano
   a caso per il turno dopo (semifinali, poi finale). Il sorteggio è «a seme fisso» (dipende solo da turno e qualificate), così è uguale
   su tutti i telefoni e non cambia a ogni apertura. Gli accoppiamenti scritti a mano in COPPA (es. dagli admin) hanno la precedenza.
   Prima della fine del turno: «Sorteggio a fine turno» con le squadre ancora in corsa. */
function seedRnd(str){let h=2166136261;for(const c of str){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function fill(){for(let i=1;i<COPPA.length;i++){const r=COPPA[i],p=COPPA[i-1];if(!r.auto&&r.m.length)continue;r.auto=1;r.m=[];r.draw=null;
 if(stato(p)!=="fin"||!p.m.length||p.m.some(m=>m[0].startsWith("?"))){r.pend=1;continue}r.pend=0;
 const W=winners(p);if(W.length!==p.m.length){r.pend=1;continue}
 const rnd=seedRnd("mcgee-2627-"+r.k+"-"+W.slice().sort().join(",")),A=W.slice();for(let k=A.length-1;k>0;k--){const j=Math.floor(rnd()*(k+1));[A[k],A[j]]=[A[j],A[k]]}
 for(let k=0;k+1<A.length;k+=2)r.m.push([A[k],A[k+1]]);r.draw=1}}
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
/* (83) TABELLONE stile playoff, a specchio come la locandina: quarti ai lati, semifinali, al centro la finale con sopra il trofeo.
   Ogni casella = logo + punteggio; vincente in oro, perdente spenta; «?» finché la squadra non è decisa. Le semifinali sono sorteggiate:
   i quarti si dispongono ai lati in base al sorteggio (così le linee portano davvero alla semifinale giusta). */
function bracket(alive){const qf=COPPA[1],sf=COPPA[2],fi=COPPA[3];
 const win=(r,m)=>{if(stato(r)!=="fin"||!m||m[0].startsWith("?")||m[1].startsWith("?"))return null;const s=score(r,m);return s.a==null||s.b==null?null:s.a>=s.b?m[0]:m[1]};
 const slot=(r,m,i)=>{const t=m&&m[i];if(!t||t.startsWith("?"))return`<div class="mcb-s tbd"><i>?</i></div>`;const s=score(r,m),v=i?s.b:s.a,w=win(r,m),st=stato(r);
  return`<div class="mcb-s${w===t?" w":w?" l":""}${st==="live"?" lv":""}">${lg(t)}<b>${st==="next"?"":f1(v)}</b></div>`};
 const mt=(r,m,cls)=>`<div class="mcb-m ${cls||""}"${m&&!m[0].startsWith("?")&&!m[1].startsWith("?")?` data-cpm="${m[0]},${m[1]},${r.w}" role="button" tabindex="0"`:""}>${slot(r,m,0)}${slot(r,m,1)}</div>`;
 let Q=qf.m.slice();if(sf.draw&&sf.m.length===2){const side=m=>{const w=win(qf,m);return sf.m[0].includes(w)?0:1};Q=[...qf.m.filter(m=>side(m)===0),...qf.m.filter(m=>side(m)===1)]}
 const S=[sf.m[0]||["?","?"],sf.m[1]||["?","?"]],F=fi.m[0]||["?","?"],champ=alive.length===1?alive[0]:win(fi,fi.m[0]);
 return`<div class="mcb"><div class="mcb-h"><span>Quarti</span><span>Semi</span><span>Finale</span><span>Semi</span><span>Quarti</span></div>
 <div class="mcb-g"><div class="mcb-c q l">${mt(qf,Q[0])}${mt(qf,Q[1])}</div><div class="mcb-c s l">${mt(sf,S[0])}</div>
 <div class="mcb-c f"><div class="mcb-tro">${window.mcgeeTrofeo?mcgeeTrofeo("bkt"):""}</div>${champ?`<div class="mcb-ch">${lg(champ)}<b>${e(nick(champ))}</b><small>Campione</small></div>`:""}${mt(fi,F,"fin")}</div>
 <div class="mcb-c s r">${mt(sf,S[1])}</div><div class="mcb-c q r">${mt(qf,Q[2])}${mt(qf,Q[3])}</div></div>
 <p class="mcb-n">${sf.draw?"Semifinali sorteggiate a fine quarti.":"Semifinali sorteggiate a fine quarti."}</p></div>`}
function vCoppa(){const n=wNow();try{fill()}catch(_){}
 const cur_=COPPA.find(r=>r.w>=n)||COPPA[COPPA.length-1];
 const alive=(()=>{let L=TEAMS.map(t=>t.id);for(const r of COPPA){if(stato(r)!=="fin")break;const W=winners(r);if(W.length)L=W}return L})();
 const sec=r=>{const st=stato(r);let body;
  if(r.m.length)body=`<div class="cpgrid">${r.m.map(m=>card(r,m)).join("")}</div>`;
  else{const prev=COPPA[COPPA.indexOf(r)-1],W=prev?(stato(prev)==="fin"?winners(prev):prev.m.flat().filter(t=>!t.startsWith("?"))):[];body=`<div class="cpwait"><b>${prev&&prev.m.length&&!prev.m.some(m=>m[0].startsWith("?"))?"Sorteggio a fine "+prev.n.toLowerCase():"In attesa del turno prima"}</b><small>${W.length?`${stato(prev)==="fin"?"Qualificate":"Ancora in corsa"}: ${W.map(nick).join(" · ")}`:`Si gioca nella settimana ${r.w}`}</small>${W.length?`<div class="cpq">${W.map(lg).join("")}</div>`:""}</div>`}
  return `<section class="cpsec ${st}"><h3><span>${r.n}</span><em>${r.draw?"sorteggiate · ":""}settimana ${r.w}${st==="live"?" · in corso":st==="fin"?" · chiuso":""}</em></h3>${body}</section>`};
 return `<button class="gback" data-go="home">‹ Home</button>
 <div class="cphero"><img src="img/mcgee.png" alt="McGee Cup"><div><small>Fanta Due Palle · stagione 26/27</small><b>McGEE CUP</b><em>${alive.length===1?"Vincitrice: "+e(TM[alive[0]].nome):cur_.n+" · settimana "+cur_.w}</em></div></div>
 ${bracket(alive)}
 <div class="cpbar">${COPPA.map(r=>`<span class="${stato(r)}"><b>${r.k==="r16"?"8°":r.k==="qf"?"4°":r.k==="sf"?"SF":"F"}</b><small>sett. ${r.w}</small></span>`).join("")}</div>
 ${COPPA.slice().reverse().filter(r=>r.m.length||stato(r)!=="fin").sort((a,b)=>{const o={live:0,next:1,fin:2};return o[stato(a)]-o[stato(b)]||a.w-b.w}).map(sec).join("")}
 <details class="cpreg"><summary>Regolamento della coppa</summary><ul>
  <li>Coppa a eliminazione diretta: <b>ottavi</b> (settimana 2), <b>quarti</b> (settimana 4), <b>semifinali</b> (settimana 6) e <b>finale</b> (settimana 8). Una partita, dentro o fuori.</li>
  <li>Punteggio = punti fatti dalla squadra in quella settimana di campionato.</li>
  <li>Ottavi: sorteggio casuale con un solo vincolo, <b>Est contro Ovest</b> (8 squadre dell Est contro 8 dell Ovest).</li>
  <li>Dopo ogni turno <b>nuovo sorteggio</b> di tutti gli accoppiamenti del turno dopo, libero (Est–Est e Ovest–Ovest possibili), fino alla finale. In app il sorteggio si fa da solo appena finisce la settimana del turno.</li><li>Formazioni: la stessa formazione messa su ESPN il lunedì, valida sia per il campionato sia per la coppa.</li>
  <li>La coppa si gioca in parallelo al campionato e fuori da ESPN: risultati e passaggi del turno li ufficializzano gli admin.</li></ul></details>
 <p class="note">Tocca una sfida per vedere il tabellino della settimana (Dynasty TV). Turni chiusi: punteggi ufficiali degli admin; turno in corso: punteggi ESPN della settimana, aggiornati da soli.</p>`}
window.SCAMBIV=window.SCAMBIV||{};SCAMBIV.coppa=vCoppa;
/* tocca una sfida → box score della settimana in Dynasty TV (stessa pagina delle sfide di campionato) */
document.addEventListener("click",ev=>{if(typeof cur==="undefined"||cur!=="coppa")return;const b=ev.target.closest("[data-cpm]");if(!b)return;ev.preventDefault();
 try{const[A,B,w]=b.dataset.cpm.split(",");window.TVS.dr=A+","+B+","+w;window.TVS.drs="a";window.TVS.g=null;const[a]=weekRange(+w);if(!TVS.d||TVS.d<a)TVS.d=a}catch(_){}cur="tv";render();scrollTo(0,0)});
})();
