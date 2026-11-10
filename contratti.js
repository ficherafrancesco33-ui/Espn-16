/* ===== ESPN 16 – CONTRATTI (43) =====
   Dati: cap-data.js (CAP[squadra].pl = [giocatore, [stipendio 26/27 … 30/31], rookie], occ, tagli, libero; CAP_TOT = 190)
   e listino-data.js (LISTINO: prezzo Cr di ogni giocatore NBA dal «Listone Dunkest»; ipotesi: è il costo all anno per firmare uno svincolato,
   la durata dei nuovi contratti non è nota).
   - Riquadro «Contratto» nel profilo giocatore (e16ContrBox): stipendio anno per anno, totale, anni rimasti, scadenza, rookie,
     qualità/prezzo = AVG di stagione per credito con giudizio affare / giusto / caro (quartili della lega: migliore 25% affare, peggiore 25% caro).
     Per gli svincolati: prezzo di listino e se entra nel cap libero dei Ducks.
   - Pagina Salary cap della squadra (e16CapPage): indicatore del cap, stagioni 26/27→30/31, card dei contratti, simulatore tagli,
     «Chi posso permettermi» (svincolati del listino che entrano nel cap libero) e scadenze.
   - Pagina Cap & scelte della lega (e16CapLeague): spazio nel cap quest anno e il prossimo, contratti d oro e contratti pesanti.
   Regola dei tagli (foglio «Tagli» del file della lega): costo = 10% del totale del contratto che resta, minimo 1, arrotondato a 0,1;
   se il costo viene spalmato sugli anni del contratto si aggiunge 1. La simulazione non si salva da nessuna parte. */
/* (43) nomi scritti diversamente nel file della lega rispetto alle rose dell app: si correggono qui, all avvio, così contratti, cap
   e calcolatore trovano il giocatore. Solo grafia: le differenze vere di rosa (giocatori in squadre diverse) restano come nel file. */
const CAP_ALIAS={"Micheal Porter Jr":"Michael Porter Jr.","Terrence Shannon Jr.":"Terrence Shannon Jr.","Bennett Stirz":"Bennett Stirtz","Ron Holland II":"Ronald Holland II","Yanic Niederhauser":"Yanic Konan Niederhauser",
 "Jerace Walker":"Jarace Walker","Scottie Pippen Jr":"Scotty Pippen Jr.","Julian Champeigne":"Julian Champagnie","Precius Achiuwa":"Precious Achiuwa","Kyle Filipowsky":"Kyle Filipowski",
 "Gregory Jackson":"GG Jackson","Mithcell Robinson":"Mitchell Robinson","Paskal Siakam":"Pascal Siakam","Dennis Jenkins":"Daniss Jenkins","Miles Turner":"Myles Turner"};
try{for(const t in CAP)for(const p of CAP[t].pl)if(CAP_ALIAS[p[0]])p[0]=CAP_ALIAS[p[0]]}catch(_){}
(function(){
const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const f1=v=>(Math.round((v+1e-9)*10)/10).toLocaleString("it-IT",{minimumFractionDigits:1,maximumFractionDigits:1});
const f2=v=>v.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2});
const r1=v=>Math.round(v*10)/10;
const YL=["26/27","27/28","28/29","29/30","30/31"],YF=["2026/27","2027/28","2028/29","2029/30","2030/31"];
const nk=n=>{try{return __ownKey(n)}catch(_){return String(n).toLowerCase()}};
const sur=n=>{const p=String(n).replace(/\s+(jr\.?|sr\.?|ii|iii|iv)$/i,"").split(" ");return p.length>1?p.slice(1).join(" "):p[0]};
const nick=t=>TM[t]?TM[t].nome.split(" ").slice(-1)[0]:t;
const RL=r=>{const a=String(r||"").split(",");return a[0]==="C"?"Centro":/G/.test(a[0])?"Guardia":"Ala"};
/* contratti per nome normalizzato */
let CT=null;function ct(){if(CT)return CT;CT={};if(typeof CAP==="undefined")return CT;
 for(const t in CAP)for(const p of CAP[t].pl||[]){const y=(p[1]||[]).filter(v=>v!=null);if(!y.length)continue;CT[nk(p[0])]={n:p[0],t,y,rk:!!p[2],tot:y.reduce((a,b)=>a+b,0)}}return CT}
const contr=n=>ct()[nk(n)]||null;
/* (48) stipendio di mercato con la formula della lega (stipendi-data.js, aggiornato ogni domenica) */
let SN=null;const stipOf=n=>{if(typeof STIP==='undefined')return null;if(!SN){SN={};for(const k in STIP.p)SN[nk(k)]=STIP.p[k]}return SN[nk(n)]||null};/* (51) durata dei contratti secondo lo stipendio (regola della lega): 4–9,9 cr = solo 1 anno; 10–14,9 = 1 o 2 anni; da 15 = da 1 a 3 anni */
const durMax=v=>v>=15?3:v>=10?2:1;const durTxt=v=>{const m=durMax(v);return m===1?"contratto di 1 anno":`contratto da 1 a ${m} anni`};window.e16DurMax=durMax;
/* (52) ROOKIE (primo anno NBA, presi al Draft o in free agency): contratto da 1 a 5 anni, +10% ogni anno */
const isRk=n=>{/* rookie 26/27 = nessuna partita NBA nelle stagioni prima e al massimo 24 anni (il segno rookie del listino è della stagione scorsa) */const x=stipOf(n);if(!x||x[3]||x[4]||x[5])return false;const a=typeof etaOf==="function"?etaOf(n):null;return a!=null&&a<=24};
const rkTxt=v=>`contratto da rookie da 1 a 5 anni, +10% ogni anno (${[0,1,2,3,4].map(i=>f1(v*Math.pow(1.1,i))).join(" → ")})`;window.e16IsRookie=isRk;
window.e16Stip=n=>{const x=stipOf(n);return x?x[0]:null};
const trend=x=>!x||x[6]==null||x[6]===x[0]?'':x[0]>x[6]?` <i class="stup">▲ ${f1(x[0]-x[6])}</i>`:` <i class="stdn">▼ ${f1(x[6]-x[0])}</i>`;
let LI=null;const listino=n=>{if(typeof LISTINO==="undefined")return null;if(!LI){LI={};for(const k in LISTINO)LI[nk(k)]=[k,...LISTINO[k]]}return LI[nk(n)]||null};
/* AVG di stagione per nome normalizzato (dai tabellini) */
let PS=null,PSk=null;function st(n){const P=pstats();if(PS!==P){PS=P;PSk={};for(const k in P)PSk[nk(k)]=P[k]}const p=PSk[nk(n)];return p&&p.gp?{avg:p.ff/p.gp,gp:p.gp,min:p.min/p.gp}:null}
/* rapporto qualità/prezzo: AVG per credito; soglie dai quartili dei contratti della lega con almeno 3 partite */
let QQ=null;function quart(){const P=pstats();if(QQ&&QQ.P===P)return QQ;const R=[];for(const k in ct()){const c=ct()[k],s=st(c.n);if(s&&s.gp>=3&&c.y[0]>0)R.push(s.avg/c.y[0])}R.sort((a,b)=>a-b);
 const q=x=>R.length?R[Math.min(R.length-1,Math.floor(x*R.length))]:0;return QQ={P,lo:q(.25),hi:q(.75),n:R.length}}
function verd(n,sal){const s=st(n);if(!s||!sal)return null;const r=s.avg/sal,Q=quart();return{r,s,k:s.gp<3?"nd":r>=Q.hi?"affare":r<=Q.lo?"caro":"giusto"}}
const VL={affare:"Affare",giusto:"Giusto",caro:"Caro",nd:"Poche partite"};
const pill=v=>v?`<span class="ctrv ${v.k}">${VL[v.k]} · ${f2(v.r)} AVG/cr</span>`:"";
/* costo del taglio (regola del foglio «Tagli») */
const cutCost=c=>{const tot=c.y.reduce((a,b)=>a+b,0);return Math.max(1,r1(tot*.1))};
const capLib=id=>{const C=CAP[id];if(!C)return 0;return C.libero!=null?C.libero:CAP_TOT-(C.occ[0]||0)-(C.tagli||0)};
const own=n=>{try{return OWNH[nk(n)]||null}catch(_){return null}};

/* ---------- PROFILO: riquadro Contratto ---------- */
window.e16ContrBox=function(n){const c0=contr(n),c=c0&&own(n)?c0:null;/* (45) contratto solo se è ancora in una rosa della lega ESPN: uno svincolato (es. tagliato) mostra il listino */
 if(c){const left=c.y.length,v=verd(n,c.y[0]);
  return `<div class="ctrbox"><div class="ctrh"><b>Contratto</b>${c.rk?`<span class="ctrrk">R · rookie</span>`:""}${pill(v)}</div>
  <div class="ctry">${YL.map((y,i)=>`<div class="cy${c.y[i]!=null?" on":""}${i===0?" now":""}"><small>${y}</small><b>${c.y[i]!=null?f1(c.y[i]):"–"}</b></div>`).join("")}</div>
  ${(()=>{/* (49) il contratto firmato NON cambia: lo stipendio della formula è solo la previsione del RINNOVO alla scadenza */const SX=stipOf(n);if(!SX)return"";const left=c.y.length;return `<p class="ctrs ctrmk">Rinnovo previsto (contratto in scadenza a fine ${YF[left-1]}, nuovo dal ${YF[left]||"2031/32"}): <b>${f1(SX[0])} cr/anno</b>${trend(SX)}, ${durTxt(SX[0])} · ${SX[0]>c.y[0]+.05?`<b class="stup">+${f1(SX[0]-c.y[0])}</b> rispetto a oggi`:SX[0]<c.y[0]-.05?`<b class="stdn">−${f1(c.y[0]-SX[0])}</b> rispetto a oggi`:"come oggi"}. Il contratto firmato resta questo fino alla scadenza; la previsione si aggiorna ogni domenica con la formula della lega.</p>`})()}<p class="ctrs">Totale <b>${f1(c.tot)} cr</b> · ${left===1?"<b>scade a fine stagione</b>":`${left} anni · fino al ${YF[left-1]}`}${TM[c.t]?` · ${e(TM[c.t].nome)}`:""}</p></div>`}
 const SX=stipOf(n),L=listino(n),pr=SX?SX[0]:L?L[1]:null;if(!own(n)&&pr!=null){/* svincolato: prezzo = stipendio di mercato con la formula della lega (o il listino se manca) */const lib=capLib("QUE"),ok=pr<=lib;
  return `<div class="ctrbox fa"><div class="ctrh"><b>Libero</b><span class="ctrrk">${SX?"stipendio":"listino"} ${f1(pr)} cr${trend(SX)}</span>${pill(verd(n,pr))}</div>
  <p class="ctrs">${ok?`Entra nel cap dei Ducks: libero ${f1(lib)} → resterebbero <b>${f1(lib-pr)} cr</b>.`:`Non entra nel cap dei Ducks: libero ${f1(lib)} cr, servono ${f1(pr-lib)} cr in più.`} ${SX?`Firma possibile: <b>${isRk(n)?rkTxt(pr):durTxt(pr)}</b>. `:""}${SX?"Stipendio di mercato calcolato con la formula della lega (AVG e partite delle ultime 4 stagioni, età, stella, crescita), aggiornato ogni domenica.":"Prezzo di listino (manca lo stipendio calcolato)."}</p></div>`}
 return ""};

/* ---------- PAGINA SALARY CAP DELLA SQUADRA ---------- */
const SIM={id:null,cut:{},open:null};
function capPage(id){const C=CAP[id];if(!C)return`<div class="note">Contratti non disponibili.</div>`;
 if(SIM.id!==id){SIM.id=id;SIM.cut={};SIM.open=null}
 const L=C.pl.map(p=>contr(p[0])&&contr(p[0]).t===id?contr(p[0]):{n:p[0],t:id,y:(p[1]||[]).filter(v=>v!=null),rk:!!p[2]}).sort((a,b)=>(b.y[0]||0)-(a.y[0]||0));
 /* stagioni: occupato (con tagli nel 26/27) meno i contratti tagliati in simulazione più il costo dei tagli */
 const com=YL.map((y,i)=>(C.occ[i]||0)+(i===0?(C.tagli||0):0));const simc=YL.map(()=>0);
 for(const n in SIM.cut){const c=L.find(x=>x.n===n);if(!c)continue;const cost=cutCost(c),N=c.y.length;
  c.y.forEach((v,i)=>{com[i]-=v});if(SIM.cut[n]==="s"){simc[0]+=cost}else{const per=(cost+1)/N;for(let i=0;i<N;i++)simc[i]+=per}}
 const occ=C.occ[0]||0,tg=C.tagli||0,cutY=L.filter(c=>SIM.cut[c.n]).reduce((a,c)=>a+c.y[0],0),lib=CAP_TOT-com[0]-simc[0];
 const pc=x=>Math.max(0,Math.min(100,x/CAP_TOT*100)),ns=Object.keys(SIM.cut).length;
 const gauge=`<div class="ccg"><div class="ccgn"><div class="ccgl"><small>Libero 26/27</small><b>${f1(lib)}</b><em>su ${CAP_TOT}</em></div>
  <div class="ccgs"><span><i class="o"></i>Occupato <b>${f1(occ-cutY)}</b></span><span><i class="t"></i>Tagli <b>${f1(tg+simc[0])}</b></span>${ns?`<span><i class="x"></i>Liberato <b>${f1(cutY-simc[0])}</b></span>`:""}</div></div>
  <div class="ccgbar"><i class="o" style="width:${pc(occ-cutY)}%"></i><i class="t" style="width:${pc(tg+simc[0])}%"></i><i class="l" style="width:${pc(lib)}%"></i></div>
  ${ns?`<div class="ccsim">✂ Simulazione: ${Object.keys(SIM.cut).map(n=>`${e(sur(n))} (${SIM.cut[n]==="s"?"subito":"spalmato"})`).join(", ")} <button data-creset="1">Annulla</button></div>`:""}</div>`;
 const seas=`<div class="ccseas">${YL.map((y,i)=>{const c=com[i]+simc[i],fr=CAP_TOT-c;return`<div class="ccs"><div class="ccsb"><i style="height:${pc(c)}%"></i></div><b>${y}</b><small>libero</small><em class="${fr<0?"neg":""}">${f1(fr)}</em></div>`}).join("")}</div>`;
 const card=c=>{const g=(ROSE[id]||[]).find(x=>nk(x[0])===nk(c.n)),v=verd(c.n,c.y[0]),eta=typeof etaOf==="function"?etaOf(c.n):null,cut=SIM.cut[c.n],op=SIM.open===c.n,cost=cutCost(c),N=c.y.length;
  return `<div class="ccard${c.y.length===1?" exp":""}${cut?" cutd":""}"><div class="ccr"><div class="ccn" data-pl="${e(c.n)}"><b>${e(c.n)}</b><small>${g?RL(g[3])+" · ":""}${eta!=null?eta+" anni · ":""}${f1(c.tot)} cr in ${N} ${N===1?"anno":"anni"}</small></div>
   <div class="ccb">${c.rk?`<span class="ctrrk">R</span>`:""}${c.y.length===1?`<span class="ccx">Scade quest'anno</span>`:""}${pill(v)}</div></div>
  <div class="ctry sm">${YL.map((y,i)=>`<div class="cy${c.y[i]!=null?" on":""}${i===0?" now":""}"><small>${y}</small><b>${c.y[i]!=null?f1(c.y[i]):"–"}</b></div>`).join("")}</div>
  <div class="cccut"><button data-ccut="${e(c.n)}" aria-expanded="${op}">${cut?"✂ Tagliato in simulazione":"✂ Taglia"}</button></div>
  ${op?`<div class="ccpan"><p>Costo del taglio: 10% di ${f1(c.tot)} cr che restano = <b>${f1(cost)} cr</b>${cost===1&&c.tot*.1<1?" (minimo 1)":""}.</p>
   <div class="ccopt"><button data-csim="s" data-cn="${e(c.n)}" aria-pressed="${cut==="s"}"><b>Subito</b><small>${f1(cost)} cr nel 26/27 · libero ${f1(lib+(cut?0:c.y[0]-cost))}</small></button>
   ${N>1?`<button data-csim="p" data-cn="${e(c.n)}" aria-pressed="${cut==="p"}"><b>Spalmato</b><small>${f1(cost+1)} cr in ${N} anni (${f1((cost+1)/N)}/anno) · libero ${f1(lib+(cut?0:c.y[0]-(cost+1)/N))}</small></button>`:""}</div>
   ${cut?`<button class="ccund" data-csim="x" data-cn="${e(c.n)}">Togli dalla simulazione</button>`:""}</div>`:""}</div>`};
 /* svincolati del listino che entrano nel cap libero (dopo i tagli simulati) */
 const fa=[];if(typeof STIP!=="undefined")for(const k in STIP.p){const pr=STIP.p[k][0];if(own(k)||pr>lib)continue;const s=st(k);if(!s)continue;const Li=listino(k);fa.push({n:k,pr,s,t:Li?Li[4]:""})}else if(typeof LISTINO!=="undefined")for(const k in LISTINO){const pr=LISTINO[k][0];if(own(k)||contr(k)||pr>lib)continue;const s=st(k);if(!s)continue;fa.push({n:k,pr,s,t:LISTINO[k][3]})}
 fa.sort((a,b)=>b.s.avg-a.s.avg);
 const exp=L.filter(c=>c.y.length===1),freed=exp.reduce((a,c)=>a+c.y[0],0);
 /* (44) regola della lega: almeno 3 under 25 per squadra (età di oggi) */
 const nU=(ROSE[id]||[]).filter(g=>{const a=typeof etaOf==="function"?etaOf(g[0]):null;return a!=null&&a<25}).length;
 const u25b=`<div class="e16u25 ${nU<3?"ko":"ok"}">Under 25: <b>${nU}</b> · minimo 3${nU<3?" · sotto il minimo!":""}</div>`;
 return gauge+u25b+seas+
 `<div class="ccsec">Contratti <small>${L.length} · dal più pagato</small></div><div class="cclist">${L.map(card).join("")}</div>
 <div class="ccsec">Chi posso permettermi <small>svincolati con prezzo ≤ ${f1(lib)} cr</small></div>
 ${fa.length?`<div class="ccfa">${fa.slice(0,15).map(x=>{const v=verd(x.n,x.pr);return`<div class="ccfr" data-pl="${e(x.n)}"><div><b>${e(x.n)}</b><small>${e(x.t)} · ${x.s.gp} part.${(()=>{/* (44) età e under 25 */const a=typeof etaOf==="function"?etaOf(x.n):null;return a!=null?` · ${a} anni${a<25?` <i class="fau25">U25</i>`:""}`:""})()}</small></div><span class="ccfv"><b>${f1(x.s.avg)}</b><small>AVG</small></span><span class="ccfv"><b>${f1(x.pr)}</b><small>cr</small></span>${v?`<span class="ctrv ${v.k} sm">${f2(v.r)}</span>`:""}</div>`}).join("")}</div>`:`<p class="note">Nessuno svincolato con prezzo di listino entro ${f1(lib)} cr.</p>`}
 <div class="ccsec">Scadenze <small>fine stagione 26/27</small></div>
 ${exp.length?`<div class="ccexp">${exp.map(c=>{const SX=stipOf(c.n);return `<span data-pl="${e(c.n)}">${e(c.n)} <b>${f1(c.y[0])}</b>${SX?` → rinnovo <b>${f1(SX[0])}</b> (max ${durMax(SX[0])} ${durMax(SX[0])===1?"anno":"anni"})`:""}</span>`}).join("")}</div>${exp.some(c=>stipOf(c.n))?`<p class="note">→ rinnovo = stipendio previsto alla rifirma con la formula della lega (si aggiorna ogni domenica); il contratto attuale non cambia.</p>`:""}<p class="note">Nel 27/28 si liberano <b>${f1(freed)} cr</b>: il cap libero passa a ${f1(CAP_TOT-(C.occ[1]||0))} cr (senza nuovi contratti).</p>`:`<p class="note">Nessun contratto in scadenza quest'anno.</p>`}
 <div class="note">Cifre in crediti dal file della lega. <span class="ctrrk">R</span> = contratto da rookie. AVG/cr = AVG medio di stagione per credito di stipendio: affare = tra il 25% migliore della lega, caro = tra il 25% peggiore. Taglio: 10% di quello che resta del contratto (minimo 1), +1 se spalmato sugli anni; è solo una simulazione. Listino: prezzo per firmare uno svincolato (all anno, ipotesi).</div>`}
window.e16CapPage=capPage;
document.addEventListener("click",ev=>{const b=ev.target.closest("[data-ccut],[data-csim],[data-creset]");if(!b)return;ev.preventDefault();ev.stopPropagation();const d=b.dataset,y=scrollY;
 if(d.ccut)SIM.open=SIM.open===d.ccut?null:d.ccut;
 else if(d.csim){if(d.csim==="x")delete SIM.cut[d.cn];else SIM.cut[d.cn]=d.csim}
 else if(d.creset){SIM.cut={};SIM.open=null}
 render();scrollTo(0,y)},true);

/* ---------- LEGA: spazio nel cap, contratti d oro e pesanti ---------- */
window.e16CapLeague=function(){if(typeof CAP==="undefined")return"";
 const rows=TEAMS.map(t=>{const C=CAP[t.id]||{occ:[0,0]};return{t,a:capLib(t.id),b:CAP_TOT-(C.occ[1]||0)}});
 const mx=Math.max(...rows.map(r=>r.b),1);
 const rank=(k,lab)=>`<div class="card ccl"><div class="ttl">${lab}</div><div class="ccrank">${rows.slice().sort((x,y)=>y[k]-x[k]).map((r,i)=>`<div class="ccrr" data-team="${r.t.id}" data-tab="cap"><i>${i+1}</i><img src="${r.t.logo}" alt=""><span>${e(nick(r.t.id))}</span><div class="ccrb"><em style="width:${Math.max(2,r[k]/mx*100)}%;background:${TCOL[r.t.id]}"></em></div><b>${f1(r[k])}</b></div>`).join("")}</div></div>`;
 const all=[];for(const k in ct()){const c=ct()[k];const v=verd(c.n,c.y[0]);if(v&&v.s.gp>=3)all.push({c,v})}
 const gold=all.slice().sort((a,b)=>b.v.r-a.v.r).slice(0,10),Q=quart(),heavy=all.filter(x=>x.c.y[0]>=10&&x.v.r<=Q.lo).sort((a,b)=>b.c.y[0]-a.c.y[0]).slice(0,10);
 const li=x=>`<div class="ccfr" data-pl="${e(x.c.n)}"><img src="${TM[x.c.t]?TM[x.c.t].logo:""}" alt=""><div><b>${e(x.c.n)}</b><small>${e(nick(x.c.t))} · ${x.c.y.length} ${x.c.y.length===1?"anno":"anni"}${x.c.rk?" · R":""}</small></div><span class="ccfv"><b>${f1(x.v.s.avg)}</b><small>AVG</small></span><span class="ccfv"><b>${f1(x.c.y[0])}</b><small>cr</small></span><span class="ctrv ${x.v.k} sm">${f2(x.v.r)}</span></div>`;
 return rank("a","SPAZIO NEL CAP · 26/27")+rank("b","SPAZIO NEL CAP · 27/28 (contratti già firmati)")+
  `<div class="card ccl"><div class="ttl">🏅 CONTRATTI D'ORO</div><div class="ccfa">${gold.map(li).join("")}</div><div class="note">Il miglior AVG per credito di stipendio (almeno 3 partite).</div></div>
  <div class="card ccl"><div class="ttl">🏋️ CONTRATTI PESANTI</div><div class="ccfa">${heavy.map(li).join("")||`<p class="note">Nessuno.</p>`}</div><div class="note">Stipendi da 10 cr in su con AVG per credito tra il 25% peggiore della lega.</div></div>`};
})();
