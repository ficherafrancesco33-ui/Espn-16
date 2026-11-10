/* ===== ESPN 16 – (47) FORMAZIONE CONSIGLIATA per il lunedì (pagina «fcons», dal campo di ogni squadra) =====
   Per la settimana scelta (di base la prossima) per ogni giocatore:
   - partite in calendario (ESPN.days/games: tools/espn.mjs scarica il calendario dei prossimi 21 giorni; se mancano giorni il telefono li chiede a ESPN);
   - infortunio (Centro Medico, e16InjOf): Out con data di rientro → salta le partite prima del rientro (giorni di stop = rientro − oggi);
     Out senza data → fuori tutta la settimana («rientro non comunicato»); in dubbio / day-to-day → la prima partita vale il 75%;
   - previsione a partita = 60% media AVG di stagione + 40% media delle ultime 5 (se ha almeno 5 partite; altrimenti la media di stagione,
     o l AVG pesato del calcolatore se non ha ancora giocato) × fattore avversario (AVG concessi a partita da quella squadra NBA rispetto
     alla media della lega, tra −12% e +12%, più vicino a 0 se la squadra ha giocato poco);
   - previsione totale = somma sulle partite previste.
   Formazione: 14 titolari negli slot ESPN (PG, SG, SF, PF, C, G×2, F×2, G/F, UTIL×4) e 3 in tribuna; si provano tutte le terne di tribuna
   (680) e si tiene quella con la previsione più alta. Regola: in tribuna solo under 25, tranne gli infortunati (ogni infortunato fuori
   può prendere il posto di un under 25). Se non c è nessuna terna valida si allenta la regola e lo si scrive. */
(function(){
const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const f1=v=>(Math.round(v*10)/10).toLocaleString("it-IT",{minimumFractionDigits:1,maximumFractionDigits:1});
const K=n=>{try{return __ownKey(n)}catch(_){return String(n).toLowerCase()}};
const GG=["DO","LU","MA","ME","GI","VE","SA"];
const SLOTS=["PG","SG","SF","PF","C","G","G","F","F","G/F","UTIL","UTIL","UTIL","UTIL"];
const ok=(slot,pos)=>{const P=String(pos||"").split(",");const h=x=>P.includes(x);
 return slot==="UTIL"||(slot==="G"?h("PG")||h("SG"):slot==="F"?h("SF")||h("PF"):slot==="G/F"?h("PG")||h("SG")||h("SF")||h("PF"):h(slot))};
const FC={t:"QUE",w:null};
(window.NAVX=window.NAVX||[]).push({k:"fc",get:()=>({t:FC.t,w:FC.w}),set:o=>{FC.t=o.t;FC.w=o.w}});
/* ---------- dati ---------- */
let CACHE=null;
function base(){const n=Object.keys(ESPN.box).length;if(CACHE&&CACHE.n===n)return CACHE;
 /* partite di ogni giocatore in ordine di data, e AVG concessi da ogni squadra NBA */
 const PL={},AL={};
 for(const d of Object.keys(ESPN.days).sort())for(const id of ESPN.days[d]){const g=ESPN.games[id],B=ESPN.box[id];if(!g||!B||!B.length)continue;
  const tot={};for(const r of B){const f=ffps(r);(PL[K(r[0])]=PL[K(r[0])]||{t:r[1],L:[]}).L.push(f);PL[K(r[0])].t=r[1];tot[r[1]]=(tot[r[1]]||0)+f}
  for(const t of [g[0],g[1]]){const o=t===g[0]?g[1]:g[0];if(tot[o]!=null){(AL[t]=AL[t]||[]).push(tot[o])}}}
 const avgT={};let s=0,c=0;for(const t in AL){avgT[t]=AL[t].reduce((a,b)=>a+b,0)/AL[t].length;s+=avgT[t];c++}const lg=c?s/c:1;
 const fac={};for(const t in avgT){const raw=avgT[t]/lg,w=Math.min(1,AL[t].length/10);fac[t]=Math.max(.88,Math.min(1.12,1+(raw-1)*w))}
 return CACHE={n,PL,fac}}
const nbaOf=g=>{const p=base().PL[K(g[0])];return p&&p.t?p.t:g[1]};
function perGame(g){const p=base().PL[K(g[0])];if(p&&p.L.length){const L=p.L,s=L.reduce((a,b)=>a+b,0)/L.length;if(L.length>=5){const l5=L.slice(-5).reduce((a,b)=>a+b,0)/5;return{v:.6*s+.4*l5,s,l5,gp:L.length}}return{v:s,s,l5:null,gp:L.length}}
 const V=typeof VAL!=="undefined"&&VAL.p[g[0]];return{v:V?V[1]:0,s:null,l5:null,gp:0,val:!!V}}
function schedule(nba,w){const[a,b]=weekRange(w),L=[];for(const d of Object.keys(ESPN.days).filter(d=>d>=a&&d<=b).sort())for(const id of ESPN.days[d]){const g=ESPN.games[id];if(!g)continue;if(g[0]===nba||g[1]===nba)L.push({d,id,away:g[0]===nba,opp:g[0]===nba?g[1]:g[0]})}return L}
/* giorni del calendario che mancano (il telefono li chiede a ESPN; da computer ESPN blocca la lettura e si resta con quello che c è) */
const ASKED={};
function fetchMissing(w){const[a,b]=weekRange(w);const miss=[];for(let d=new Date(a+"T12:00:00Z");d.toISOString().slice(0,10)<=b;d.setUTCDate(d.getUTCDate()+1)){const k=d.toISOString().slice(0,10);if(!ESPN.days[k]&&!ASKED[k])miss.push(k)}
 if(!miss.length)return;miss.forEach(k=>ASKED[k]=1);
 Promise.all(miss.map(k=>fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${k.replace(/-/g,"")}`).then(r=>r.ok?r.json():null).catch(()=>null).then(J=>{if(!J)return 0;const ids=[];
  for(const ev of J.events||[]){const c=ev.competitions[0],h=c.competitors.find(x=>x.homeAway==="home"),aw=c.competitors.find(x=>x.homeAway==="away");if(!h||!aw)continue;if(!ESPN.games[ev.id])ESPN.games[ev.id]=[aw.team.abbreviation,h.team.abbreviation,0,0,"S",ev.date,""];ids.push(ev.id)}
  if(ids.length){ESPN.days[k]=ids;return 1}return 0}))).then(R=>{if(R.some(Boolean)&&cur==="fcons"){CACHE=null;const y=scrollY;render();scrollTo(0,y)}})}
function injOf(g){let I=null;try{I=window.e16InjOf?e16InjOf(g[0]):null}catch(_){}return I}
function player(g,w){const nba=nbaOf(g),S=schedule(nba,w),B=base(),pg=perGame(g),I=injOf(g),today=nyToday();
 let miss=0,days=null,risk=false,note="",out=false;const G=S.map(x=>({...x,play:true,risk:1}));
 if(I&&I.k==="out"){out=true;const rit=I.rit?String(I.rit).slice(0,10):"";
  if(rit){days=Math.max(0,Math.ceil((Date.parse(rit+"T12:00:00Z")-Date.parse(today+"T12:00:00Z"))/864e5));G.forEach(x=>{if(x.d<rit){x.play=false;miss++}});note=`rientro previsto ${rit.slice(8,10)}/${rit.slice(5,7)}`}
  else{G.forEach(x=>{x.play=false});miss=G.length;note="rientro non comunicato"}}
 else if(I&&(I.k==="dubbio"||I.k==="quest"||I.k==="dtd")){risk=true;const f=G.find(x=>x.play);if(f)f.risk=.75}
 const ESPNir=g[2]==="IR";
 let tot=0;for(const x of G)if(x.play){x.f=B.fac[x.opp]||1;x.p=pg.v*x.f*x.risk;tot+=x.p}
 const exp=G.filter(x=>x.play).length,fAvg=exp?G.filter(x=>x.play).reduce((a,x)=>a+x.f,0)/exp:1;
 return{g,n:g[0],pos:g[3],nba,G,cal:S.length,exp,miss,days,out:out&&exp===0,outAny:out,risk,I,note,pg,tot,fAvg,u25:typeof u25==="function"?u25(g[0]):false,eta:typeof etaOf==="function"?etaOf(g[0]):null,ir:ESPNir}}
/* slot: abbinamento titolari ↔ slot ESPN (cammini aumentanti) */
function assign(L){const n=SLOTS.length,m=new Array(n).fill(-1);
 const order=L.map((p,i)=>i).sort((a,b)=>SLOTS.filter(s=>ok(s,L[a].pos)).length-SLOTS.filter(s=>ok(s,L[b].pos)).length);
 const tryP=(i,seen)=>{for(let s=0;s<n;s++){if(!ok(SLOTS[s],L[i].pos)||seen[s])continue;seen[s]=1;if(m[s]<0||tryP(m[s],seen)){m[s]=i;return true}}return false};
 for(const i of order)if(!tryP(i,[]))return null;return m.map(i=>L[i])}
function optimize(P){const n=P.length,k=Math.max(0,n-14);let best=null,relaxed=false;
 const combos=[];const rec=(st,acc)=>{if(acc.length===k){combos.push(acc.slice());return}for(let i=st;i<n;i++){acc.push(i);rec(i+1,acc);acc.pop()}};rec(0,[]);
 const run=strict=>{for(const c of combos){const ex=c.map(i=>P[i]);if(strict&&!ex.every(p=>p.u25||p.outAny&&p.exp===0||p.out))continue;
   const st=P.filter((p,i)=>!c.includes(i));const sl=assign(st);if(!sl)continue;const tot=st.reduce((a,p)=>a+p.tot,0);
   if(!best||tot>best.tot+1e-9)best={tot,st,ex,sl}}};
 run(true);if(!best){relaxed=true;run(false)}if(best)best.relaxed=relaxed;return best}
/* ---------- pagina ---------- */
function vFcons(){const t=FC.t&&TM[FC.t]?FC.t:"QUE",T=TM[t],wNow=weekOf(nyToday()<W1?W1:nyToday()),maxW=Math.max(...Object.keys(MATCHUPS).map(Number));
 const w=FC.w&&FC.w>=wNow&&FC.w<=maxW?FC.w:Math.min(maxW,wNow+1);FC.w=w;fetchMissing(w);
 const[wa,wb]=weekRange(w),R0=ROSE[t]||[],P=R0.map(g=>player(g,w)),best=optimize(P);
 const nick=T.nome.split(" ").slice(-1)[0],jer=n=>window.e16Jersey?e16Jersey(t,window.e16Num?e16Num(n):"",nick,n):"";/* (57) col giocatore per le maglie NBA */
 /* formazione ESPN attuale (quella della settimana se c è, altrimenti gli slot di oggi) */
 let curSet=null;try{const L=(LEGA.line||{})[w]&&LEGA.line[w][t];curSet=new Set((L||R0.filter(g=>g[2]!=="BE"&&g[2]!=="IR").map(g=>g[0])).map(K))}catch(_){curSet=new Set(R0.filter(g=>g[2]!=="BE"&&g[2]!=="IR").map(g=>K(g[0])))}
 const curTot=P.filter(p=>curSet.has(K(p.n))).reduce((a,p)=>a+p.tot,0);
 const pill=v=>v>=150?"v":v>=100?"g":v>=60?"y":"r";
 const injB=p=>p.outAny?`<span class="fcinj out">OUT${p.days!=null?` · ${p.days} ${p.days===1?"giorno":"giorni"}`:""} · ${p.miss?`salta ${p.miss} ${p.miss===1?"partita":"partite"}`:"rientra prima delle partite"}</span>`:p.risk?`<span class="fcinj q">In dubbio · 1ª partita al 75%</span>`:p.ir?`<span class="fcinj q">IR su ESPN</span>`:"";
 const chips=p=>p.G.length?p.G.map(x=>`<span class="fcg${x.play?"":" no"}" title="${x.away?"in trasferta":"in casa"}${x.play&&x.f?` · avversario ${x.f>=1?"+":""}${Math.round((x.f-1)*100)}%`:""}"><i>${GG[new Date(x.d+"T12:00:00Z").getUTCDay()]}</i>${x.away?"@":""}${x.opp}${x.play&&x.f&&Math.abs(x.f-1)>=.04?`<b class="${x.f>1?"su":"giu"}">${x.f>1?"▲":"▼"}</b>`:""}</span>`).join(""):`<span class="fcg no"><i>—</i>nessuna partita</span>`;
 const card=(p,slot)=>`<div class="fccard${p.outAny?" inj":""}" data-pl="${e(p.n)}" role="link" tabindex="0"><span class="fcslot">${slot}</span><span class="fcj">${jer(p.n)}</span>
  <div class="fcmid"><b>${e(p.n)}</b><small>${e(p.pos)} · ${p.nba}${p.eta!=null?` · ${p.eta} anni`:""}${p.u25?' · <i class="fcu">U25</i>':""}</small><div class="fcgs">${chips(p)}</div>${injB(p)}</div>
  <div class="fcpr"><span class="fcp ${pill(p.tot)}">${f1(p.tot)}</span><small>${p.exp}/${p.cal} part.</small><small>${f1(p.pg.v)}/part.</small></div></div>`;
 let body="";
 if(!best){body=`<p class="note">Non riesco a costruire una formazione valida (servono 14 giocatori schierabili).</p>`}
 else{const slots=best.sl.map((p,i)=>[SLOTS[i],p]);
  /* motivazioni */
  const M=[];
  for(const p of best.ex){const why=p.out||p.outAny&&p.exp===0?`infortunato (${p.I?e(String(p.I.txt||p.I.lab).replace(/\s*\(not specified\)/i,"")):"out"}${p.note?", "+p.note:""}): non gioca questa settimana`:`${p.exp} ${p.exp===1?"partita":"partite"} previste, previsione ${f1(p.tot)}`;M.push(`<li><b>${e(p.n)}</b> in tribuna: ${why}${p.u25?" · under 25 ✓":p.outAny?" · infortunato, può stare in tribuna al posto di un under 25":" · ⚠ non under 25"}.</li>`)}
  const exMax=Math.max(0,...best.ex.map(p=>p.tot));
  const st=best.st.slice().sort((a,b)=>a.tot-b.tot);
  if(st[0]&&best.ex.length)M.push(`<li><b>${e(st[0].n)}</b> è l ultimo dei titolari: previsione ${f1(st[0].tot)} (${st[0].exp} ${st[0].exp===1?"partita":"partite"}) contro ${f1(exMax)} del migliore in tribuna.</li>`);
  for(const p of best.st.filter(p=>p.exp>=4).sort((a,b)=>b.tot-a.tot).slice(0,3))M.push(`<li><b>${e(p.n)}</b>: ${p.exp} partite in settimana${Math.abs(p.fAvg-1)>=.04?`, contro difese ${p.fAvg>1?"deboli":"forti"} (${p.fAvg>1?"+":""}${Math.round((p.fAvg-1)*100)}%)`:""}: previsione ${f1(p.tot)}.</li>`);
  for(const p of best.st.filter(p=>p.outAny&&p.exp>0))M.push(`<li><b>${e(p.n)}</b> titolare anche se infortunato: ${p.note}, salta ${p.miss} ${p.miss===1?"partita":"partite"} ma ne gioca ${p.exp}.</li>`);
  for(const p of best.st.filter(p=>p.risk))M.push(`<li><b>${e(p.n)}</b> è in dubbio: la sua prima partita conta il 75% nella previsione.</li>`);
  if(best.relaxed)M.unshift(`<li>⚠ Con i giocatori di adesso non c è una tribuna di soli under 25 (o infortunati): ho allentato la regola. Controlla la rosa.</li>`);
  const delta=best.tot-curTot;
  body=`<div class="fctot"><div><small>Previsione formazione consigliata</small><b>${f1(best.tot)}</b></div><div><small>Con la formazione ESPN attuale</small><b class="dim">${f1(curTot)}</b></div><div><small>Differenza</small><b class="${delta>=0?"su":"giu"}">${delta>=0?"+":""}${f1(delta)}</b></div></div>
  <h2><span class="t"><span>Titolari</span></span><em>14 · slot ESPN</em></h2><div class="fclist">${slots.map(([s,p])=>card(p,s)).join("")}</div>
  <h2><span class="t"><span>Tribuna</span></span><em>3 · under 25 o infortunati</em></h2><div class="fclist trib">${best.ex.map(p=>card(p,p.outAny&&p.exp===0?"INF":p.u25?"U25":"TRIB")).join("")}</div>
  <h2><span class="t"><span>Motivazioni</span></span><em>perché questa formazione</em></h2><ul class="fcwhy">${M.join("")}</ul>
  <h2><span class="t"><span>Tutti i giocatori</span></span><em>settimana ${w}</em></h2>
  <div class="tbl-wrap"><table class="fctab"><thead><tr><th>Giocatore</th><th>Cal.</th><th>Prev.</th><th>Infortunio</th><th>AVG</th><th>Prev./p</th><th>Totale</th></tr></thead><tbody>${P.slice().sort((a,b)=>b.tot-a.tot).map(p=>`<tr class="${best.ex.includes(p)?"ex":""}" data-pl="${e(p.n)}"><td><b>${e(p.n)}</b><small>${best.ex.includes(p)?"tribuna":"titolare"}${p.u25?" · U25":""}</small></td><td>${p.cal}</td><td>${p.exp}</td><td>${p.outAny?`OUT${p.days!=null?" "+p.days+"g":""}${p.miss?" · −"+p.miss:""}`:p.risk?"dubbio":"—"}</td><td>${p.pg.s!=null?f1(p.pg.s):"–"}</td><td>${f1(p.pg.v)}</td><td><b>${f1(p.tot)}</b></td></tr>`).join("")}</tbody></table></div>`}
 return `<div class="fcpg"><button class="gback" data-go="campo">‹ Campo ${e(nick)}</button>
 <div class="fchd" style="--tc:${TCOL[t]}"><span class="badge logo lg-${t}"></span><div><small>Formazione consigliata · per lunedì</small><b>${e(T.nome)}</b><em>Settimana ${w} · ${dIt(wa)} → ${dIt(wb)}</em></div></div>
 <div class="fcnav"><button data-fcw="${w-1}" ${w>wNow?"":"disabled"}>‹</button><span>${w===wNow?"Settimana in corso":w===wNow+1?"Prossima settimana":"Settimana "+w}</span><button data-fcw="${w+1}" ${w<maxW?"":"disabled"}>›</button></div>
 <div class="chips fcteams">${TEAMS.map(x=>`<button class="chip" data-fct="${x.id}" aria-pressed="${x.id===t}"><span class="badge logo lg-${x.id}"></span>${e(x.nome.split(" ").slice(-1)[0])}</button>`).join("")}</div>
 ${body}
 <p class="note">Come si calcola: previsione a partita = 60% media AVG della stagione + 40% media delle ultime 5 partite (con meno di 5 partite la media della stagione), per il fattore avversario (AVG concessi a partita da quella squadra NBA rispetto alla media, tra −12% e +12%). Totale = somma sulle partite che dovrebbe giocare: calendario NBA meno quelle saltate per infortunio (Centro Medico ESPN: Out fino alla data di rientro; senza data fuori tutta la settimana; in dubbio = prima partita al 75%). Si schierano i 14 con la previsione più alta che entrano negli slot ESPN; in tribuna solo under 25, tranne gli infortunati.</p></div>`}
window.SCAMBIV=window.SCAMBIV||{};SCAMBIV.fcons=vFcons;
/* tasto nel campo, tra la tribuna e «Live stanotte» */
window.e16FconsBtn=id=>{const wNow=weekOf(nyToday()<W1?W1:nyToday());return `<button class="fcbtn" data-fcopen="${id}"><span class="fci">🧠</span><span><b>Formazione consigliata</b><small>per lunedì · settimana ${wNow+1} · partite, infortuni e previsioni</small></span><i>›</i></button>`};
document.addEventListener("click",ev=>{const b=ev.target.closest("[data-fcopen],[data-fcw],[data-fct]");if(!b||b.disabled)return;const d=b.dataset;
 if(d.fcopen){ev.preventDefault();FC.t=d.fcopen;FC.w=null;cur="fcons";curTeam=null;render();scrollTo(0,0);return}
 if(cur!=="fcons")return;if(d.fcw){FC.w=+d.fcw;render();return}if(d.fct){FC.t=d.fct;render();return}},true);
window.e16Fcons={player,optimize,base,schedule};
})();
