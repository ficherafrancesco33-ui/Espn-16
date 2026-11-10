/* ===== ESPN 16 – ALLENAMENTO IA TRADE (copia strutturale dell'Allenamento IA Trade di Dreamers) =====
   Pagina cur="allena" (menu Scambi). Prima «dimmi chi sei» (squadra del GM), poi il menu dei tre allenamenti:
   - Proposte di scambio: l'IA propone scambi sulla squadra del GM; Accetto / Rifiuto / Tratto (togli giocatori + nota).
   - Valutazione giocatori: voto 1-10 e domande a scelta multipla, senza vedere i valori.
   - Confronto giocatori: due giocatori senza valori, chi vale di più (poco / meglio / molto) oppure pari.
   Ogni allenamento ha «Annulla l'ultima risposta», «Ricomincia da capo» e «Stampa report» da copiare e girare a Claude:
   dal report delle proposte si calcola il profilo del GM in gusti-data.js (role, age, req, sc, pl, n, agg).
   Adattato a ESPN 16: 16 squadre (TEAMS/TM), rose ROSE da 17, valori VAL.p (Calcolatore trade), età etaOf, AVG al posto del PDK,
   niente crediti, cassa o slot, niente regole di compensazione dei ruoli. Le scelte non entrano negli scambi (come in Dreamers).
   Tutto è salvato solo su questo telefono (localStorage, chiavi e16_at…). Stili: classi Dreamers (at*, av*, cf*). */
(function(){
window.SCAMBIV=window.SCAMBIV||{};
const atEsc=s=>String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
const H=(t,sub="")=>`<h2><span class="t"><span>${t}</span></span>${sub}</h2>`;
const TID=()=>TEAMS.map(t=>t.id);
const nickOf=t=>TM[t]?TM[t].nome.split(" ").slice(-1)[0]:t;
const nomeOf=t=>TM[t]?TM[t].nome:t;
/* valori del Calcolatore trade (stessa ricerca del nome di trade.js) */
const nk=n=>String(n||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[.'’]/g,"").replace(/\s+(jr|sr|ii|iii|iv)$/,"").trim();
let VK=null;const vRow=n=>{if(!VK){VK={};try{for(const k in VAL.p)VK[nk(k)]=k}catch(_){}}const k=VK[nk(n)];return k?VAL.p[k]:null};
const valOf=n=>{const r=vRow(n);return r?r[0]:0};
const eta=n=>{let a=null;try{a=etaOf(n)}catch(_){}if(a==null){const r=vRow(n);a=r&&r[2]!=null?r[2]:26}return a};
/* ruolo dalla posizione ESPN della rosa: G guardia, F ala, C centro */
const RL=r=>{const a=String(r||"").split(",");return a[0]==="C"?"C":/G/.test(a[0])?"G":"F"};
let RLM=null;const ruoloDi=n=>{if(!RLM){RLM={};for(const t in ROSE)for(const g of ROSE[t])RLM[g[0]]=RL(g[3])}return RLM[n]||"F"};
const vtPts=v=>Math.pow(Math.max(0,v)/1000,1.4)*1000;

/* ---------- stato e salvataggio ---------- */
const AT_K="e16_at_log",AT_P="e16_at_prof";
let AT={c:null,chg:false,rem:new Set(),note:"",rep:false,nm:"",tm:"",mode:null,edit:false,t0:0};
const atLoad=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||d)}catch(e){return JSON.parse(d)}};
let AT_LOG=atLoad(AT_K,"[]"),AT_PR=atLoad(AT_P,"null");
const atSave=()=>{try{localStorage.setItem(AT_K,JSON.stringify(AT_LOG));localStorage.setItem(AT_P,JSON.stringify(AT_PR))}catch(e){}};

/* FOCUS DEGLI ALLENAMENTI (come Dreamers): etichette dei giocatori su cui servono risposte (OUT, in trend, rookie).
   Le domande pescano questi giocatori ~70% delle volte; le etichette finiscono nel log e nei report. */
let ATFX={},ATFX_T=0;
function injOut(n){try{const k=nk(n);return(ESPN.inj||[]).some(x=>nk(x[0])===k&&/out/i.test(x[2]))}catch(e){return false}}
function atFx(n){if(Date.now()-ATFX_T>60000){ATFX={};ATFX_T=Date.now()}if(ATFX[n])return ATFX[n];const o=[],r=vRow(n);
 try{if(injOut(n))o.push("OUT")}catch(e){}
 /* trend: AVG della stagione in corso rispetto alla scorsa (servono almeno 4 partite) */
 try{if(r&&r[6]>=4&&r[5]>0){const p=(r[7]-r[5])/r[5]*100;if(Math.abs(p)>=15)o.push(`trend ${p>0?"+":""}${Math.round(p)}%`)}}catch(e){}
 try{if(r&&!r[4]&&eta(n)<=22)o.push("rookie")}catch(e){}
 return ATFX[n]=o}
const atFk=t=>/^OUT/.test(t)?"OUT (infortunati ora)":/^trend \+/.test(t)?"in salita (trend)":/^trend/.test(t)?"in calo (trend)":t==="rookie"?"rookie":t;
const atFxs=f=>f&&f.length?` [${f.join(", ")}]`:"";
const atHm=ts=>{try{const d=new Date(ts);return d.toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit"})+" "+d.toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})}catch(e){return""}};
const atInfo=n=>({n,v:valOf(n)||0,e:Math.round(eta(n)),r:ruoloDi(n),f:atFx(n)});
const atSum=a=>a.reduce((s,x)=>s+x.v,0),atDf=(x,y)=>(y-x)/Math.max(x,y,1);
/* VALORE DI UN PACCHETTO (Dreamers): un giocatore forte vale molto più di tanti medi; i minori pesano (punti/punti del migliore)^k,
   k = 3 × (valore del più forte − 1000) / 300 tra 0 e 3. */
const pkK=vtop=>3*Math.min(1,Math.max(0,(vtop-1000)/300));
const pkgPts=(ps,vtop)=>{ps=ps.filter(p=>p>0).sort((a,b)=>b-a);if(!ps.length)return 0;const m=ps[0],k=vtop==null?2:pkK(vtop);return ps.reduce((s,p)=>s+p*Math.pow(p/m,k),0)};
const atPk=(a,vtop)=>pkgPts(a.map(x=>vtPts(x.v)),vtop);
function atSample(a,k){const b=a.slice(),o=[];while(o.length<k&&b.length)o.push(b.splice(Math.random()*b.length|0,1)[0]);return o}
/* proposta: scambi equilibrati (3 su 4 entro ±5%, le altre entro ±10%), solo a 2 squadre, giocatori del GM contro quelli di un'altra squadra */
function atGen(){const me=AT_PR&&AT_PR.t;if(!me)return null;const pool=t=>(ROSE[t]||[]).map(p=>p[0]).filter(n=>valOf(n)>0),mine=pool(me),others=TID().filter(t=>t!==me);
  const rec=new Set(AT_LOG.slice(-10).map(x=>x.give.map(g=>g.n).join()+"|"+x.get.map(g=>g.n).join()));
  const tol=[.03,.05,.05,.1][Math.random()*4|0],tg=(Math.random()*2-1)*tol*100;let best=null,bs=9;
  const FOC=Math.random()<.7,KK=[1,1,2,2,3][Math.random()*5|0];
  for(let i=0;i<600;i++){const ot=atSample(others,1)[0];if(!mine.length)break;
    const g=atSample(mine,KK).map(atInfo);if(g.length<KK)break;const th=pool(ot),r=atSample(th,KK).map(atInfo);if(r.length<KK)continue;
    /* (44) regola dei 3 under 25: non si propongono scambi che lascerebbero una delle due squadre sotto i 3 under 25 */
    if(window.e16U25Fail){const I=[...g.map(x=>({ty:"pl",n:x.n,from:me,to:ot})),...r.map(x=>({ty:"pl",n:x.n,from:ot,to:me}))];if(e16U25Fail(I,me)!=null||e16U25Fail(I,ot)!=null)continue}
    const vt=Math.max(...g.concat(r).map(x=>x.v)),vg=atPk(g,vt),vr=atPk(r,vt),d=atDf(vg,vr),gi=gustoIdx(g,r);
    const sc=(Math.abs(gi-tg)/100)+(Math.abs(d)>.12?3:0)+Math.abs(d)*.5+(rec.has(g.map(x=>x.n).join()+"|"+r.map(x=>x.n).join())?5:0)+(FOC&&!g.concat(r).some(x=>x.f&&x.f.length)?.3:0);
    if(sc<bs){bs=sc;best={t:me,ot,give:g,get:r,d,g:gi,mid:null}}}
  return best}
/* INDICE GUSTO: Δ valore % corretto per età (punti per anno di differenza media pesata sul valore; ricevuti più vecchi = peggio) */
const GUSTO={age:1,pack:0};
const gustoAge=P=>P.length?P.reduce((s,p)=>s+p.e*(p.v+1),0)/P.reduce((s,p)=>s+p.v+1,0):0;
function gustoIdx(give,get){const vt=Math.max(0,...give.concat(get).map(x=>x.v)),vg=atPk(give,vt),vr=atPk(get,vt);return atDf(vg,vr)*100-GUSTO.age*(gustoAge(get)-gustoAge(give))-GUSTO.pack*Math.max(0,get.length-1)}
const atWho=()=>AT_PR&&TM[AT_PR.t]?nomeOf(AT_PR.t):"";

/* ---------- report delle proposte (da girare a Claude: serve a calcolare GM_GUSTI) ---------- */
function atReport(){const L=AT_LOG,N=L.length,pc=x=>(x*100>0?"+":"")+(x*100).toFixed(0)+"%",avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null,f1=x=>x==null?"n.d.":x.toFixed(1);
  const Y=L.filter(x=>x.res==="y"),Nn=L.filter(x=>x.res==="n"),C=L.filter(x=>x.res==="c"),dd=a=>avg(a.map(x=>x.d));
  const age=(a,k)=>avg(a.flatMap(x=>x[k].map(p=>p.e))),o=[];
  o.push(`ESPN 16 · ALLENAMENTO IA TRADE · report del ${new Date().toLocaleDateString("it-IT")}`,`Squadra: ${atWho()} (${AT_PR&&AT_PR.t})`,`Risposte: ${N} (accettati ${Y.length}, rifiutati ${Nn.length}, da cambiare ${C.length})`,`Valori = Calcolatore trade ESPN 16 (aggiornati ${typeof VAL!=="undefined"?VAL.upd:"n.d."}); ruoli G guardia, F ala, C centro; età in anni.`,"");
  o.push("SBILANCIAMENTO (valore ricevuto − dato, in % sul maggiore; + = ricevo di più)",`- media accettati: ${dd(Y)==null?"n.d.":pc(dd(Y))}`,`- media rifiutati: ${dd(Nn)==null?"n.d.":pc(dd(Nn))}`,`- media da cambiare: ${dd(C)==null?"n.d.":pc(dd(C))}`);
  const worst=Y.length?Math.min(...Y.map(x=>x.d)):null;o.push(`- peggior scambio che ho accettato: ${worst==null?"n.d.":pc(worst)}`,"");
  o.push("ETÀ MEDIA (ricevuti / dati)",`- accettati: ${f1(age(Y,"get"))} / ${f1(age(Y,"give"))}`,`- rifiutati: ${f1(age(Nn,"get"))} / ${f1(age(Nn,"give"))}`,"");
  o.push("RUOLO RICEVUTO: % accettati");["G","F","C"].forEach(r=>{const s=L.filter(x=>x.get.some(p=>p.r===r));o.push(`- ${r}: ${s.length?Math.round(s.filter(x=>x.res==="y").length/s.length*100)+"% su "+s.length:"n.d."}`)});o.push("");
  const sz=(a,k)=>{const s=L.filter(x=>x[k].length===a);return s.length?Math.round(s.filter(x=>x.res==="y").length/s.length*100)+"% su "+s.length:"n.d."};
  o.push("NUMERO DI GIOCATORI RICEVUTI: % accettati",`- 1: ${sz(1,"get")} · 2: ${sz(2,"get")} · 3: ${sz(3,"get")}`,"");
  const cnt=(res,k)=>{const m={};L.filter(x=>x.res===res).forEach(x=>x[k].forEach(p=>{(m[p.n]=m[p.n]||[]).push(x.d)}));return Object.entries(m).sort((a,b)=>b[1].length-a[1].length).slice(0,6).map(([n,ds])=>`${n} (${ds.length}, Δ medio ${pc(ds.reduce((a,b)=>a+b,0)/ds.length)})`).join(", ")||"—"};
  o.push("GIOCATORI (Δ medio = quanto ci guadagnavo in quegli scambi: un sì con Δ alto NON vuol dire che lo cedo volentieri, vuol dire che l'offerta era buona)",`- accettato di riceverlo: ${cnt("y","get")}`,`- rifiutato di riceverlo: ${cnt("n","get")}`,`- accettato di cederlo: ${cnt("y","give")}`,`- rifiutato di cederlo: ${cnt("n","give")}`,"");
  {const E=L.filter(x=>Math.abs(x.d)<=.06),m={};E.forEach(x=>x.give.forEach(p=>{const r=m[p.n]=m[p.n]||[0,0];r[0]++;if(x.res==="y")r[1]++}));const R=Object.entries(m).filter(([n,r])=>r[0]>=2).sort((a,b)=>b[1][1]/b[1][0]-a[1][1]/a[1][0]||b[1][0]-a[1][0]);
   o.push(`SCAMBI ALLA PARI (Δ tra −6% e +6%: ${E.length} risposte, ${E.length?Math.round(E.filter(x=>x.res==="y").length/E.length*100):0}% accettati) · chi cede davvero e chi no`);
   if(R.length){o.push(`- li cede anche alla pari: ${R.filter(([n,r])=>r[1]/r[0]>=.5).map(([n,r])=>`${n} (${r[1]} su ${r[0]})`).join(", ")||"—"}`,`- alla pari non li cede: ${R.filter(([n,r])=>r[1]/r[0]<.5).map(([n,r])=>`${n} (${r[1]} su ${r[0]})`).join(", ")||"—"}`)}else o.push("- ancora troppo poche risposte alla pari per giocatore");o.push("")}
  const ch=C.filter(x=>(x.rem&&x.rem.length)||x.note);if(ch.length){o.push("MODIFICHE RICHIESTE (controproposte)");ch.forEach(x=>o.push(`- ${x.rem&&x.rem.length?"toglierei "+x.rem.join(", ")+" · ":""}${x.note||""} [su: dà ${x.give.map(p=>p.n).join(" + ")} / riceve ${x.get.map(p=>p.n).join(" + ")}]`));o.push("")}
  const TT=L.filter(x=>x.ms!=null&&x.ms<=120000);if(TT.length>=6){const sd=x=>x.ms/1000,ts=TT.map(sd).sort((a,b)=>a-b),md=ts[Math.floor(ts.length/2)],m=avg(ts),w=x=>{const t=sd(x);return t<=2?1:t<=3?.8:.8/(1+((t-3)/6)**2)},wa=(a,f)=>{const sw=a.reduce((s,x)=>s+w(x),0);return sw?a.reduce((s,x)=>s+w(x)*f(x),0)/sw:null};
    const I=TT.filter(x=>sd(x)<=3),R2=TT.filter(x=>sd(x)>3),I2=TT.filter(x=>sd(x)<=2),ya=a=>a.length?Math.round(a.filter(x=>x.res==="y").length/a.length*100)+"%":"n.d.",dm=a=>a.length?pc(avg(a.map(x=>x.d))):"n.d.",tm=a=>a.length?f1(avg(a.map(sd)))+"s":"n.d.";
    const dI=I.length&&R2.length?avg(I.map(x=>x.d))-avg(R2.map(x=>x.d)):null,wy=wa(TT,x=>x.res==="y"?1:0),wd=wa(TT,x=>x.d);
    o.push("TEMPI DI RISPOSTA (1-3 secondi = risposta istintiva, peso massimo sotto i 2s; le lente pesano molto meno, possibili distrazioni; escluse le pause oltre 2 minuti)",`- media: ${f1(m)}s · mediana ${f1(md)}s · accettati ${tm(TT.filter(x=>x.res==="y"))} · rifiutati ${tm(TT.filter(x=>x.res==="n"))}`,`- lampo (fino a 2s, ${I2.length}): ${ya(I2)} accettati, Δ medio ${dm(I2)}`,`- istintive (fino a 3s, ${I.length}): ${ya(I)} accettati, Δ medio ${dm(I)}, Δ medio degli accettati ${dm(I.filter(x=>x.res==="y"))}, rifiutati ${dm(I.filter(x=>x.res==="n"))}`,`- più lente (oltre 3s, ${R2.length}): ${ya(R2)} accettati, Δ medio ${dm(R2)}`,`- ponderate (gli istinti contano di più): ${wy==null?"n.d.":Math.round(wy*100)+"%"} accettati, Δ medio ${wd==null?"n.d.":pc(wd)}`,`- lettura: ${dI==null||I.length<3?"troppe poche risposte istintive per concludere":Math.abs(dI)<.02?"le risposte istintive non si distinguono per favorevolezza dello scambio":dI>0?"le risposte istintive riguardano scambi più favorevoli ("+pc(dI)+" di Δ rispetto alle altre)":"le risposte istintive riguardano scambi più svantaggiosi ("+pc(dI)+" di Δ rispetto alle altre)"}`,"")}
  const ps=p=>`${p.n} (${p.v}, ${p.e}a, ${p.r})${atFxs(p.f)}`;
  const GI=x=>gustoIdx(x.give,x.get),bins=[[-99,-15],[-15,-5],[-5,5],[5,15],[15,99]];
  o.push(`INDICE GUSTO (Δ valore corretto per età: ${GUSTO.age} punti/anno)`,`- medio accettati: ${Y.length?pc(avg(Y.map(GI))/100):"n.d."} · rifiutati: ${Nn.length?pc(avg(Nn.map(GI))/100):"n.d."}`);
  bins.forEach(([a,b])=>{const s2=L.filter(x=>{const g=GI(x);return x.res!=="c"&&g>=a&&g<b});o.push(`- da ${a<=-99?"meno":a} a ${b>=99?"più":b}: ${s2.length?Math.round(s2.filter(x=>x.res==="y").length/s2.length*100)+"% accettati su "+s2.length:"n.d."}`)});o.push("");
  {const K={};L.forEach(x=>["get","give"].forEach(k=>x[k].forEach(p=>(p.f||[]).forEach(t=>{const g=atFk(t);(K[g]=K[g]||{get:new Set(),give:new Set()})[k].add(x)}))));const ks=Object.keys(K);
   if(ks.length){o.push("FOCUS (stato del giocatore al momento della risposta)");ks.forEach(g=>{const f=a=>{const s2=[...a].filter(x=>x.res!=="c");return s2.length?`${Math.round(s2.filter(x=>x.res==="y").length/s2.length*100)}% accettati su ${s2.length}, Δ medio ${pc(avg(s2.map(x=>x.d)))}`:"n.d."};o.push(`- ${g}: quando li ricevo ${f(K[g].get)} · quando li cedo ${f(K[g].give)}`)});o.push("")}}
  o.push("ELENCO COMPLETO");L.forEach((x,i)=>o.push(`${i+1}. [${x.res==="y"?"SÌ":x.res==="n"?"NO":"MOD"}] ${nickOf(x.t)} dà ${x.give.map(ps).join(" + ")} → riceve ${x.get.map(ps).join(" + ")} (da ${nickOf(x.ot)}) · Δ ${pc(x.d)} · gusto ${pc(GI(x)/100)}${x.ms!=null?" · "+Math.round(x.ms/1000)+"s":""}${x.rem&&x.rem.length?" · toglie "+x.rem.join(", "):""}${x.note?" · «"+x.note+"»":""}${x.ts?" · "+atHm(x.ts):""}`));
  /* dati grezzi in una riga per risposta: per ricalcolare il profilo GM_GUSTI (role, age, req, sc, pl, n) di gusti-data.js */
  o.push("","DATI PER IL PROFILO GM_GUSTI (una risposta per riga: esito y/n/c, Δ, dà [nome|valore|età|ruolo], riceve [...], tolti, nota)");
  L.forEach(x=>o.push(JSON.stringify({r:x.res,d:Math.round(x.d*1000)/1000,da:x.give.map(p=>[p.n,p.v,p.e,p.r]),riceve:x.get.map(p=>[p.n,p.v,p.e,p.r]),da_squadra:x.ot,tolti:x.rem||[],nota:x.note||"",s:x.ms!=null?Math.round(x.ms/100)/10:null})));
  o.push(`n=${N} · agg ${new Date().toLocaleDateString("it-IT")}`);
  return o.join("\n")}

/* ---------- pagina: chi sei + proposte di scambio ---------- */
function vAtrT(){
  if(!AT_PR||!AT_PR.t||AT.edit){const ok=!!AT.tm;return`${H("Allenamento IA Trade","")}<div class="atpres"><p class="atwel">Prima di iniziare dimmi chi sei.</p>${AT.mode==="cmp"?`<p class="note">Ti mostrerò due giocatori alla volta, senza valori: tu mi dici chi vale di più, di poco o di molto, oppure se sono pari. La tua squadra mi serve per sapere di chi sono le risposte.</p>`:AT.mode==="val"?`<p class="note">Ti mostrerò dei giocatori della lega: dai un voto da 1 a 10 e rispondi a qualche domanda. La tua squadra mi serve per sapere di chi sono le risposte.</p>`:`<p class="note">Ti proporrò scambi sulla <b>tua squadra</b>, quella che conosci meglio: tu mi dici subito se accetti, rifiuti o vuoi trattare. Così capisco i tuoi gusti e correggo i valori dei giocatori.</p>`}<select class="atnote" id="attm" aria-label="La tua squadra"><option value="">Scegli la tua squadra</option>${TID().map(t=>`<option value="${t}"${t===AT.tm?" selected":""}>${atEsc(nomeOf(t))}</option>`).join("")}</select><div class="atbtns"><button class="atb ok" data-at="start" ${ok?"":"disabled"}>Inizia l'allenamento</button></div></div>`}
  if(AT.rep){const T=atReport();return`${H("Allenamento IA Trade",`<em>Report</em>`)}<p class="note">Copia il testo e mandalo a Claude: ricalibro valori e algoritmi sulle tue risposte (profilo dei gusti nell'IA Trade).</p><textarea class="atrep" readonly>${atEsc(T)}</textarea><div class="atbtns two"><button class="atb" data-at="copy">Copia report</button><button class="atb" data-at="back">‹ Torna alle proposte</button></div><div class="atbtns"><button class="atb ko" data-at="reset">Azzera sessione</button></div>`}
  if(!AT.c){AT.c=atGen();AT.t0=0}const c=AT.c;if(c&&!AT.t0)AT.t0=Date.now();if(!c)return`${H("Allenamento IA Trade","")}<p class="note">Non ci sono abbastanza giocatori con un valore per proporre scambi.</p>`;
  const row=p=>`<button type="button" class="atp${AT.rem.has(p.n)?" rm":""}" data-at="tg" data-n="${atEsc(p.n)}"><span class="atn">${atEsc(p.n)}</span><small>${p.r} · ${p.e} anni</small><b>${p.v}</b></button>`,vg=atSum(c.give),vr=atSum(c.get),dp=Math.round(c.d*100);
  return`${H("Allenamento IA Trade",`<em>${AT_LOG.length} risposte</em>`)}<p class="atwho">${atEsc(nomeOf(AT_PR.t))} <button type="button" class="atlk" data-at="edit">cambia</button> · <button type="button" class="atlk" data-at="menu">menu</button></p><div class="atrst"><button type="button" class="atb" data-at="undo-t">↶ Annulla l'ultima risposta</button><button type="button" class="atb ko" data-at="reset">Ricomincia da capo</button></div>
  <div class="atc"><div class="atside get"><div class="athd"><b>TI OFFRO</b><span>${vr}</span></div>${c.get.map(row).join("")}</div>
  <div class="atmid">⇅</div>
  <div class="atside"><div class="athd"><b>RICEVO</b><span>${vg}</span></div>${c.give.map(row).join("")}</div>
  <div class="atdiff ${dp>=0?"up":"dn"}">Differenza di valore per te <b>${dp>0?"+":""}${dp}%</b></div></div>
  ${AT.chg?`<p class="note">Tocca i giocatori che toglieresti, poi scrivi cosa cambieresti.</p><input class="atnote" id="atn" placeholder="Es. al posto suo vorrei un lungo più giovane" value="${atEsc(AT.note)}"><div class="atbtns two"><button class="atb ok" data-at="send">Invia</button><button class="atb" data-at="cancel">Annulla</button></div>`:`<div class="atbtns"><button class="atb ko" data-at="n">✕ Rifiuto</button><button class="atb mod" data-at="chg">✎ Tratto</button><button class="atb ok" data-at="y">✓ Accetto</button></div>`}
  <div class="atbtns"><button class="atb rp" data-at="rep"${AT_LOG.length?"":" disabled"}>🖨 Stampa report (${AT_LOG.length})</button></div>
  <p class="note">Valori = quelli del Calcolatore trade (basati sull'AVG). Le scelte non sono incluse: contano solo i giocatori.</p>`}
function atAns(res){const c=AT.c;if(!c)return;const ms=AT.t0?Date.now()-AT.t0:null;AT.t0=0;AT_LOG.push({ts:Date.now(),ms,g:c.g,t:c.t,ot:c.ot,give:c.give,get:c.get,d:c.d,mid:null,res,rem:[...AT.rem],note:(res==="c"?AT.note:"").trim()});atSave();AT.c=null;AT.chg=false;AT.rem=new Set();AT.note="";render();window.scrollTo(0,0)}

/* ---------- VALUTAZIONE GIOCATORI: voto 1-10 e domande a scelta multipla ---------- */
const AV_Q=[
 {k:"v",t:"Da 1 a 10, quanto vale questo giocatore? (1 = non serve a nessuno · 10 = tra i migliori della lega)",req:1,sc:10},
 {k:"d",m:1,t:"Cosa ne determina di più il valore? (puoi scegliere più risposte)",o:[["Produzione di oggi"],["Potenziale / crescita"],["Anni di contratto e durata"],["Ruolo scarso"],["Nome e appeal"],["È sopravvalutato"]]},
 {k:"h",dyn:1},
 {k:"c",t:"Se un GM lo chiede, tu…",req:1,o:[["È intoccabile"],["Solo con grosso sovrapprezzo"],["A prezzo giusto"],["Lo cedo volentieri"]]},
 {k:"w",t:"A chi serve di più?",o:[["Squadra da titolo"],["Squadra in ricostruzione"],["Va bene a tutti"]]},
 {k:"i",t:"INFORTUNI · da 1 a 10, quanto lo vedi a rischio? (1 = di ferro, non si ferma mai · 10 = sempre rotto)",req:1,sc:10},
 {k:"s",t:"Di quanto abbassa il suo valore per te questo rischio? Fai scorrere la livella sulla percentuale (100% = non lo vorresti a nessun prezzo)",req:1,sl:100},
 {k:"y",t:"Che tipo di problema ti preoccupa?",o:[["Infortuni gravi e lunghi"],["Tanti stop brevi"],["Minuti gestiti / riposi"],["Nessuno in particolare"]]}];
/* la domanda successiva cambia con la risposta su «cosa ne determina il valore» */
const AV_H=[
 {t:"Per quanto tempo pensi che mantenga questa produzione?",o:[["Già in calo"],["1–2 anni"],["3–4 anni"],["5 anni o più"]]},
 {t:"Quando pensi che raggiunga il suo massimo?",o:[["Ci è già arrivato"],["Tra 1–2 anni"],["Tra 3–4 anni"],["Forse non ci arriverà mai"]]},
 {t:"Per quanti anni lo terresti volentieri in squadra?",o:[["1–2 anni"],["3–4 anni"],["5 anni o più"],["Finché rende"]]},
 {t:"Quanto è difficile sostituire un giocatore così nel suo ruolo?",o:[["Facile"],["Non troppo"],["Difficile"],["Quasi impossibile"]]},
 {t:"Quanto dura secondo te il suo appeal sul mercato?",o:[["Già in calo"],["1–2 anni"],["3–4 anni"],["A lungo"]]},
 {t:"Di quanto lo ritieni sopravvalutato?",o:[["Di poco"],["Parecchio"],["Moltissimo"]]}],
 AV_H0={t:"Per quanto tempo resta a questo livello?",o:[["Già in calo"],["1–2 anni"],["3–4 anni"],["5 anni o più"]]},
 avH=d=>(d!=null&&AV_H[d])||AV_H0;
const avD=a=>Array.isArray(a.d)?a.d:(a.d!=null?[a.d]:[]),avHm=a=>(a.h&&typeof a.h==='object')?a.h:{};
let AV={c:null,a:{},t0:0,rep:false};
let AV_LOG=atLoad("e16_atv","[]");
const avSave=()=>{try{localStorage.setItem("e16_atv",JSON.stringify(AV_LOG))}catch(e){}};
/* nostra scala 1-10 = decile del valore nel Calcolatore tra i giocatori delle 16 rose */
const avSc=v=>{const a=[];TID().forEach(t=>(ROSE[t]||[]).forEach(p=>{const x=valOf(p[0]);if(x>0)a.push(x)}));if(!a.length)return 5;const r=a.filter(x=>x<v).length/a.length;return Math.max(1,Math.min(10,Math.ceil(r*10+1e-9)))};
function avGen(){const done=new Set(AV_LOG.map(x=>x.n));let L=[];TID().forEach(t=>(ROSE[t]||[]).forEach(p=>{const v=valOf(p[0]);if(v>0&&!done.has(p[0]))L.push({n:p[0],t,v,e:Math.round(eta(p[0])),r:ruoloDi(p[0]),f:atFx(p[0])})}));
 if(!L.length)return null;/* prima i giocatori della squadra del GM, dal più importante: così si capisce come valuta i suoi */{const me=AT_PR&&AT_PR.t,O=L.filter(x=>x.t===me).sort((a,b)=>b.v-a.v);if(O.length)return O[0]}{const F=L.filter(x=>x.f.length);if(F.length&&Math.random()<.7)L=F}const w=L.map(x=>Math.sqrt(x.v)),S=w.reduce((a,b)=>a+b,0);let r=Math.random()*S;for(let i=0;i<L.length;i++){r-=w[i];if(r<=0)return L[i]}return L[L.length-1]}
function vAv(){const hd=`${H("Valutazione giocatori",`<em>${AV_LOG.length} risposte</em>`)}<p class="atwho">${atEsc(atWho())} <button type="button" class="atlk" data-at="menu">menu</button></p><div class="atrst"><button type="button" class="atb" data-at="undo-v">↶ Annulla l'ultima risposta</button><button type="button" class="atb ko" data-at="vreset">Ricomincia da capo</button></div>`;
 if(AV.rep)return`${H("Valutazione giocatori",`<em>Report</em>`)}<p class="note">Copia il testo e mandalo a Claude: peso i valori sulle tue risposte.</p><textarea class="atrep" readonly>${atEsc(avReport())}</textarea><div class="atbtns two"><button class="atb" data-at="vcopy">Copia report</button><button class="atb" data-at="vback">‹ Torna ai giocatori</button></div><div class="atbtns"><button class="atb ko" data-at="vreset">Azzera valutazioni</button></div>`;
 if(!AV.c){AV.c=avGen();AV.a={s:0};AV.t0=0}const c=AV.c;if(!c)return`${hd}<p class="note">Hai valutato tutti i giocatori disponibili.</p><div class="atbtns"><button class="atb rp" data-at="vrep">🖨 Stampa report (${AV_LOG.length})</button></div>`;
 if(!AV.t0)AV.t0=Date.now();const ok=AV_Q.every(q=>!q.req||AV.a[q.k]!=null);
 const me=AT_PR&&AT_PR.t,myN=me?(ROSE[me]||[]).filter(p=>valOf(p[0])>0).length:0,myD=me?AV_LOG.filter(x=>x.t===me).length:0;
 const qs=AV_Q.flatMap(q=>q.dyn?(avD(AV.a).length?avD(AV.a):[null]).map(dv=>Object.assign({k:"h",hd:dv,req:0},avH(dv))):[q]);
 const qh=q=>{const sel=q.m?avD(AV.a):q.hd!==undefined?[avHm(AV.a)[q.hd==null?"x":q.hd]]:[AV.a[q.k]],dat=q.hd!==undefined?` data-hd="${q.hd==null?"x":q.hd}"`:"";
  return`<section class="avq"><h4>${q.hd!=null&&avD(AV.a).length>1?`<small>${AV_Q.find(z=>z.k==="d").o[q.hd][0]} · </small>`:""}${q.t}${q.req?"":" <small>facoltativa</small>"}</h4>${q.sl?`<div class="avsl"><b id="avslv">${AV.a[q.k]===0?"Nessuno sconto (0%)":"−"+AV.a[q.k]+"%"}</b><input type="range" class="avsli" min="0" max="${q.sl}" step="5" value="${AV.a[q.k]==null?0:AV.a[q.k]}" data-q="${q.k}"><span><i>0%</i><i>50%</i><i>100%</i></span></div>`:q.sc?`<div class="avs">${Array.from({length:q.sc},(_,i)=>i+1).map(v=>`<button type="button" class="avc${AV.a[q.k]===v?" on":""}" data-at="vans" data-q="${q.k}" data-i="${v}">${v}</button>`).join("")}</div>`:`<div class="avo">${q.o.map((op,i)=>`<button type="button" class="avc${sel.includes(i)?" on":""}" data-at="vans" data-q="${q.k}" data-i="${i}"${dat}>${op[0]}</button>`).join("")}</div>`}</section>`};
 return`${hd}${me&&c.t===me?`<p class="note avme">🏠 <b>Prima i giocatori della tua squadra</b> (${myD+1} di ${myN}): dicci come valuti i tuoi, poi passiamo a quelli delle altre squadre.</p>`:""}<div class="atc avp"><div class="avn">${atEsc(c.n)}</div><small>${atEsc(nomeOf(c.t))} · ${c.r} · ${c.e} anni</small></div>
 ${qs.map(qh).join("")}
 <div class="atbtns two"><button class="atb" data-at="vskip">Salta</button><button class="atb ok" data-at="vsave" ${ok?"":"disabled"}>Salva e prossimo</button></div>
 <div class="atbtns"><button class="atb rp" data-at="vrep"${AV_LOG.length?"":" disabled"}>🖨 Stampa report (${AV_LOG.length})</button></div>
 <p class="note">Obbligatorie: voto, rischio infortuni e cosa faresti se te lo chiedono. Rispondi d'istinto, non c'è giusto o sbagliato.</p>`}
function avReport(){const L=AV_LOG,N=L.length,avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null,f1=x=>x==null?"n.d.":(x>0?"+":"")+x.toFixed(1).replace(".",","),m1=x=>x==null?"n.d.":x.toFixed(1).replace(".",","),o=[];
 const sc=x=>x.s!=null?x.s:avSc(x.v),df=x=>x.a.v-sc(x);
 o.push(`ESPN 16 · VALUTAZIONE GIOCATORI · report del ${new Date().toLocaleDateString("it-IT")}`,`Squadra: ${atWho()}`,`Giocatori valutati: ${N}`,"","Voto 1-10 del GM (senza vedere i nostri valori) confrontato con la nostra scala 1-10 (decili del valore nel Calcolatore: 1 = 10% più basso, 10 = 10% più alto). Δ = voto GM − nostra scala; + = il GM lo apprezza più di noi.","");
 const K=L,OQ0=AV_Q.slice(1).filter(q=>q.o&&!q.m);o.push("",`SCOSTAMENTO MEDIO (${K.length} giocatori)`,`- voto medio GM ${m1(avg(K.map(x=>x.a.v)))} · nostra scala ${m1(avg(K.map(sc)))} · Δ ${f1(avg(K.map(df)))}`);
 const bd=(t,f)=>{o.push("",t);const m={};K.forEach(x=>{const k=f(x);(m[k]=m[k]||[]).push(x)});Object.keys(m).sort().forEach(k=>o.push(`- ${k}: Δ ${f1(avg(m[k].map(df)))} su ${m[k].length}`))};
 bd("PER FASCIA DI ETÀ",x=>x.e<=22?"a) fino a 22":x.e<=26?"b) 23–26":x.e<=30?"c) 27–30":"d) 31 e oltre");bd("PER NOSTRA SCALA",x=>sc(x)<=3?"a) 1-3 (bassi)":sc(x)<=7?"b) 4-7 (medi)":"c) 8-10 (alti)");bd("PER RUOLO",x=>x.r);
 OQ0.forEach(q=>{o.push("",q.t.toUpperCase());q.o.forEach((op,i)=>{const s2=K.filter(x=>x.a[q.k]===i);if(s2.length)o.push(`- ${op[0]}: ${s2.length} (${Math.round(s2.length/Math.max(1,K.length)*100)}%) · voto medio ${m1(avg(s2.map(x=>x.a.v)))} · Δ ${f1(avg(s2.map(df)))}`)})});
 const DQ=AV_Q.find(z=>z.k==="d");o.push("","COSA NE DETERMINA IL VALORE (più risposte possibili)");DQ.o.forEach((op,i)=>{const s2=K.filter(x=>avD(x.a).includes(i));if(s2.length)o.push(`- ${op[0]}: ${s2.length} (${Math.round(s2.length/Math.max(1,K.length)*100)}%) · voto medio ${m1(avg(s2.map(x=>x.a.v)))} · Δ ${f1(avg(s2.map(df)))}`)});
 const co={};K.forEach(x=>{const k=avD(x.a).slice().sort().map(i=>DQ.o[i][0]).join(" + ");if(k)co[k]=(co[k]||0)+1});const cs=Object.entries(co).sort((a,b)=>b[1]-a[1]).slice(0,8);if(cs.length){o.push("","COMBINAZIONI PIÙ FREQUENTI");cs.forEach(([k,n])=>o.push(`- ${k}: ${n}`))}
 o.push("","DOMANDA DI APPROFONDIMENTO (cambia con il motivo scelto)");DQ.o.forEach((op,di)=>{const S=K.filter(x=>avD(x.a).includes(di)&&avHm(x.a)[di]!=null);if(!S.length)return;const Hh=avH(di);o.push(`${op[0]} · ${Hh.t}`);Hh.o.forEach((h,hi)=>{const n=S.filter(x=>avHm(x.a)[di]===hi).length;if(n)o.push(`  - ${h[0]}: ${n} (${Math.round(n/S.length*100)}%)`)})});
 const inj=K.filter(x=>x.a.i!=null);if(inj.length){o.push('','INFORTUNI PERCEPITI (1 = di ferro, 10 = sempre rotto; sconto = riduzione di valore dichiarata)',`- rischio medio percepito: ${m1(avg(inj.map(x=>x.a.i)))} su ${inj.length} giocatori · sconto medio dichiarato ${f1(avg(inj.map(x=>x.a.s)))}%`.replace('+',''));[[1,3,'rischio basso 1-3'],[4,6,'medio 4-6'],[7,8,'alto 7-8'],[9,10,'altissimo 9-10']].forEach(([a,b,l])=>{const S=inj.filter(x=>x.a.i>=a&&x.a.i<=b);o.push(`- ${l}: ${S.length} · sconto medio ${S.length?Math.round(avg(S.map(x=>x.a.s)))+'%':'n.d.'} · Δ voto rispetto a noi ${f1(avg(S.map(df)))}`)});o.push('','GIOCATORI PIÙ A RISCHIO PER IL GM',...inj.slice().sort((a,b)=>b.a.i-a.a.i).slice(0,8).map(x=>`- ${x.n}: rischio ${x.a.i}/10, sconto ${x.a.s}%`))}
 {const me=AT_PR&&AT_PR.t,M=me?K.filter(x=>x.t===me):[];if(M.length){o.push("",`I SUOI GIOCATORI (${nickOf(me)}, ${M.length}) · Δ medio ${f1(avg(M.map(df)))}`);M.forEach(x=>o.push(`- ${x.n} (${x.e}a, ${x.r}): GM ${x.a.v} vs noi ${sc(x)} · se lo chiedono: ${x.a.c!=null?AV_Q.find(q=>q.k==="c").o[x.a.c][0]:"n.d."}`))}}
 const d=K.map(x=>({x,d:df(x)})).sort((a,b)=>b.d-a.d);o.push("","PIÙ APPREZZATI DAL GM RISPETTO A NOI",...d.filter(y=>y.d>0).slice(0,8).map(y=>`- ${y.x.n} (${y.x.e}a, ${y.x.r}): GM ${y.x.a.v} vs noi ${sc(y.x)}`),"","MENO APPREZZATI",...d.filter(y=>y.d<0).slice(-8).reverse().map(y=>`- ${y.x.n} (${y.x.e}a, ${y.x.r}): GM ${y.x.a.v} vs noi ${sc(y.x)}`));
 {const KF={};L.forEach(x=>(x.f||[]).forEach(t=>{const g=atFk(t);(KF[g]=KF[g]||[]).push(x)}));const ks=Object.keys(KF);if(ks.length){o.push("","FOCUS (stato del giocatore al momento della risposta)");ks.forEach(g=>{const S=KF[g],I=S.filter(x=>x.a.i!=null);o.push(`- ${g} (${S.length}): Δ voto ${f1(avg(S.map(df)))} · rischio infortuni percepito ${I.length?m1(avg(I.map(x=>x.a.i))):"n.d."} · sconto dichiarato ${I.length?Math.round(avg(I.map(x=>x.a.s||0)))+"%":"n.d."}`)})}}
 o.push("","ELENCO COMPLETO");
 L.forEach((x,i)=>o.push(`${i+1}. ${x.n}${atFxs(x.f)} (${nickOf(x.t)}, ${x.r}, ${x.e}a, calc ${x.v}) → GM ${x.a.v}/10 vs noi ${sc(x)} · `+(x.a.i!=null?`rischio inf. ${x.a.i}/10, sconto ${x.a.s}% · `:'')+[avD(x.a).length?"motivo: "+avD(x.a).map(i=>DQ.o[i][0]).join(" + "):null,...avD(x.a).map(i=>avHm(x.a)[i]!=null?avH(i).o[avHm(x.a)[i]][0]:null),...AV_Q.slice(1).filter(q=>q.o&&!q.m).map(q=>x.a[q.k]==null?null:q.o[x.a[q.k]][0])].filter(Boolean).join(" · ")+(x.ms!=null?` · ${Math.round(x.ms/1000)}s`:"")+(x.ts?" · "+atHm(x.ts):"")));return o.join("\n")}
function avNext(){AV.c=null;AV.a={s:0};AV.t0=0;render();window.scrollTo(0,0)}

/* ---------- CONFRONTO GIOCATORI: due nomi senza valori; «Poco meglio / Meglio / Molto meglio lui» oppure «Pari» ---------- */
let CF={c:null,sel:null,t0:0,rep:false},CF_LOG=atLoad("e16_atc","[]");
const cfSave=()=>{try{localStorage.setItem("e16_atc",JSON.stringify(CF_LOG))}catch(e){}};
/* distanza in punti trade del Calcolatore (in Dreamers erano crediti: qui non ci sono crediti) */
const cfP=n=>Math.round(vtPts(valOf(n)));
function cfGen(){const used=new Set(CF_LOG.map(x=>[x.a.n,x.b.n].sort().join("|"))),L=[];TID().forEach(t=>(ROSE[t]||[]).forEach(p=>{const v=valOf(p[0]);if(v>0)L.push({n:p[0],t,v,e:Math.round(eta(p[0])),r:ruoloDi(p[0]),c:cfP(p[0]),f:atFx(p[0])})}));
 if(L.length<2)return null;const FOC=Math.random()<.7,LF=L.filter(x=>x.f.length);
 for(let k=0;k<200;k++){const LA=FOC&&LF.length?LF:L,w=LA.map(x=>Math.sqrt(x.v)),S=w.reduce((a,b)=>a+b,0);let r=Math.random()*S,A=LA[LA.length-1];for(let i=0;i<LA.length;i++){r-=w[i];if(r<=0){A=LA[i];break}}
  let C=L.filter(x=>x.n!==A.n&&Math.abs(x.c-A.c)<=Math.max(600,A.c*.7)&&!used.has([A.n,x.n].sort().join("|")));if(!C.length)continue;/* coppia di contrasto: il focus contro un giocatore «normale» di valore simile */if(FOC){const C2=C.filter(x=>!x.f.length);if(C2.length)C=C2}const B=C[Math.random()*C.length|0];
  return Math.random()<.5?{a:A,b:B}:{a:B,b:A}}
 return null}
function vCf(){const hd=`${H("Confronto giocatori",`<em>${CF_LOG.length} risposte</em>`)}<p class="atwho">${atEsc(atWho())} <button type="button" class="atlk" data-at="menu">menu</button></p><div class="atrst"><button type="button" class="atb" data-at="undo-c">↶ Annulla l'ultima risposta</button><button type="button" class="atb ko" data-at="creset">Ricomincia da capo</button></div>`;
 if(CF.rep)return`${H("Confronto giocatori",`<em>Report</em>`)}<p class="note">Copia il testo e mandalo a Claude: calibro quanto distano i giocatori.</p><textarea class="atrep" readonly>${atEsc(cfReport())}</textarea><div class="atbtns two"><button class="atb" data-at="ccopy">Copia report</button><button class="atb" data-at="cback">‹ Torna ai confronti</button></div><div class="atbtns"><button class="atb ko" data-at="creset">Azzera confronti</button></div>`;
 if(!CF.c){CF.c=cfGen();CF.sel=null;CF.t0=0}const c=CF.c;if(!c)return`${hd}<p class="note">Non ci sono altre coppie da confrontare.</p><div class="atbtns"><button class="atb rp" data-at="crep">🖨 Stampa report (${CF_LOG.length})</button></div>`;
 if(!CF.t0)CF.t0=Date.now();
 const card=(p,k)=>`<div class="cfp${CF.sel&&CF.sel[0]===k?" on":""}"><b>${atEsc(p.n)}</b><small>${atEsc(nickOf(p.t))} · ${p.r} · ${p.e} anni</small><button type="button" class="atb cfb cfs2${CF.sel===k+"s"?" sel":""}" data-at="cwin" data-s="${k}s">Poco meglio lui</button><button type="button" class="atb cfb${CF.sel===k+"m"?" sel":""}" data-at="cwin" data-s="${k}m">Meglio lui</button><button type="button" class="atb cfb cfs3${CF.sel===k+"l"?" sel":""}" data-at="cwin" data-s="${k}l">Molto meglio lui</button></div>`;
 return`${hd}<p class="note cfq">Chi vale di più?</p><div class="cfg">${card(c.a,"a")}${card(c.b,"b")}</div><div class="atbtns"><button type="button" class="atb cfpari${CF.sel==="p"?" sel":""}" data-at="cwin" data-s="p">Pari</button></div>
 <div class="atbtns two"><button class="atb" data-at="cskip">Salta</button><button class="atb ok" data-at="cok" ${CF.sel?"":"disabled"}>Salva e prossimo</button></div>
 <div class="atbtns"><button class="atb rp" data-at="crep"${CF_LOG.length?"":" disabled"}>🖨 Stampa report (${CF_LOG.length})</button></div><p class="note">Nessun valore mostrato: rispondi d'istinto.</p>`}
function cfReport(){const L=CF_LOG,N=L.length,avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null,med=a=>{if(!a.length)return null;const b=a.slice().sort((x,y)=>x-y),m=b.length>>1;return b.length%2?b[m]:(b[m-1]+b[m])/2},r0=x=>x==null?"n.d.":Math.round(x),o=[];
 const od=x=>x.a.c-x.b.c,ow=x=>od(x)>0?"a":od(x)<0?"b":"p",gr=x=>x.w==="p"?"p":(x.g||"m"),GN={s:"poco meglio",m:"meglio",l:"molto meglio"};
 const P=L.filter(x=>x.w==="p"),W=L.filter(x=>x.w!=="p"),AG=W.filter(x=>x.w===ow(x)),DS=W.filter(x=>x.w!==ow(x)),GM=AG.filter(x=>gr(x)==="m"),GS=AG.filter(x=>gr(x)==="s"),GL=AG.filter(x=>gr(x)==="l");
 o.push(`ESPN 16 · CONFRONTO GIOCATORI · report del ${new Date().toLocaleDateString("it-IT")}`,`Squadra: ${atWho()}`,`Confronti: ${N} (Pari ${P.length}, Poco meglio ${W.filter(x=>gr(x)==="s").length}, Meglio ${W.filter(x=>gr(x)==="m").length}, Molto meglio ${W.filter(x=>gr(x)==="l").length})`,"Punti nostri = punti trade del Calcolatore (valore/1000)^1,4 × 1000. Distanza nostra = differenza tra i due.","");
 o.push("ACCORDO SUL VINCITORE",`- il GM sceglie lo stesso giocatore che vale di più per noi: ${W.length?Math.round(AG.length/W.length*100)+"% su "+W.length:"n.d."}`,`- sceglie l'altro: ${DS.length}`,"");
 o.push("QUANTO DISTANO PER NOI I GIOCATORI, SECONDO LA RISPOSTA DEL GM (per tarare le soglie)",`- Pari (${P.length}): distanza nostra media ${r0(avg(P.map(x=>Math.abs(od(x)))))} punti, mediana ${r0(med(P.map(x=>Math.abs(od(x)))))}`,`- Poco meglio, d'accordo con noi (${GS.length}): media ${r0(avg(GS.map(x=>Math.abs(od(x)))))} punti, mediana ${r0(med(GS.map(x=>Math.abs(od(x)))))}`,`- Meglio, d'accordo con noi (${GM.length}): media ${r0(avg(GM.map(x=>Math.abs(od(x)))))} punti, mediana ${r0(med(GM.map(x=>Math.abs(od(x)))))}`,`- Molto meglio, d'accordo con noi (${GL.length}): media ${r0(avg(GL.map(x=>Math.abs(od(x)))))} punti, mediana ${r0(med(GL.map(x=>Math.abs(od(x)))))}`,"");
 o.push("RISPOSTE PER FASCIA DELLA NOSTRA DISTANZA (% Pari / Poco meglio / Meglio / Molto meglio / vince l'altro)");
 [[0,300,"fino a 300 punti"],[300,800,"300–800"],[800,2000,"800–2000"],[2000,1e9,"oltre 2000"]].forEach(([a,b,l])=>{const S=L.filter(x=>Math.abs(od(x))>=a&&Math.abs(od(x))<b);if(!S.length){o.push(`- ${l}: nessun confronto`);return}const pc=f=>Math.round(S.filter(f).length/S.length*100)+"%";o.push(`- ${l} (${S.length}): ${pc(x=>x.w==="p")} / ${pc(x=>x.w===ow(x)&&gr(x)==="s")} / ${pc(x=>x.w===ow(x)&&gr(x)==="m")} / ${pc(x=>x.w===ow(x)&&gr(x)==="l")} / ${pc(x=>x.w!=="p"&&x.w!==ow(x))}`)});o.push("");
 const ag=x=>Math.abs(x.a.e-x.b.e),YO=W.filter(x=>ag(x)>=3);if(YO.length){const yw=YO.filter(x=>x.w===(x.a.e<x.b.e?"a":"b"));o.push("ETÀ",`- coppie con almeno 3 anni di differenza (${YO.length}): il GM sceglie il più giovane ${Math.round(yw.length/YO.length*100)}% delle volte`,"")}
 if(DS.length){o.push("DISACCORDI (il GM preferisce l'altro)");DS.slice().sort((a,b)=>Math.abs(od(b))-Math.abs(od(a))).slice(0,8).forEach(x=>{const w=x.w==="a"?x.a:x.b,l=x.w==="a"?x.b:x.a;o.push(`- GM: ${w.n} (${w.e}a, ${w.r}) ${GN[gr(x)]} di ${l.n} (${l.e}a, ${l.r}); noi: ${l.n} avanti di ${Math.abs(od(x))} punti`)});o.push("")}
 {const K={};L.forEach(x=>{const fa=(x.a.f||[]).map(atFk),fb=(x.b.f||[]).map(atFk);new Set([...fa,...fb]).forEach(g=>{const ia=fa.includes(g),ib=fb.includes(g);if(ia!==ib)(K[g]=K[g]||[]).push({x,s:ia?"a":"b"})})});const ks=Object.keys(K);
  if(ks.length){o.push("FOCUS (coppie in cui solo uno dei due ha la caratteristica; stato al momento della risposta)");ks.forEach(g=>{const S=K[g],W2=S.filter(y=>y.x.w!=="p"),gm=W2.filter(y=>y.x.w===y.s).length,we=S.filter(y=>ow(y.x)===y.s).length,dg=avg(S.map(y=>{const me=y.s==="a"?y.x.a:y.x.b,ot=y.s==="a"?y.x.b:y.x.a;return (me.c-ot.c)/Math.max(me.c,ot.c,1)*100}));o.push(`- ${g} (${S.length}): il GM sceglie quello con la caratteristica ${W2.length?Math.round(gm/W2.length*100)+"%":"n.d."} (pari ${S.length-W2.length}) · per noi è avanti ${Math.round(we/S.length*100)}% · nostro scarto medio ${dg==null?"n.d.":(dg>0?"+":"")+Math.round(dg)+"%"}`)});o.push("")}}
 o.push("ELENCO COMPLETO");L.forEach((x,i)=>o.push(`${i+1}. ${x.a.n}${atFxs(x.a.f)} (${x.a.e}a, ${x.a.r}, nostri ${x.a.c} punti) vs ${x.b.n}${atFxs(x.b.f)} (${x.b.e}a, ${x.b.r}, nostri ${x.b.c} punti) → ${x.w==="p"?"PARI":(x.w==="a"?x.a.n:x.b.n)+" "+GN[gr(x)]}${x.ms!=null?` · ${Math.round(x.ms/1000)}s`:""}${x.ts?" · "+atHm(x.ts):""}`));return o.join("\n")}

/* ---------- pagina principale: chi sei → menu dei tre allenamenti ---------- */
const sub=()=>!!(AT.mode||AT.rep||AV.rep||CF.rep||(AT.edit&&AT_PR&&AT_PR.t));
function vAtr(){if(!(AT.rem instanceof Set))AT.rem=new Set(Array.isArray(AT.rem)?AT.rem:[]);
 /* tasto ‹ in alto: dentro un allenamento torna al menu degli allenamenti (come «Allenamenti» di Dreamers) */
 const bk=sub()?`<button class="gback" data-atback="1">‹ Allenamenti</button>`:`<button class="gback" data-go="home">‹ Home</button>`;
 if(sub())setTimeout(()=>{const b=document.querySelector('#main [data-atback]');if(b)b.textContent="‹ Allenamenti"},0);
 let h;
 if(!AT_PR||!AT_PR.t||AT.edit)h=vAtrT();
 else if(AT.mode==="trade")h=vAtrT();else if(AT.mode==="val")h=vAv();else if(AT.mode==="cmp")h=vCf();
 else h=`${H("Allenamento IA Trade","")}<p class="atwho">${atEsc(atWho())} <button type="button" class="atlk" data-at="edit">cambia</button></p><div class="atmenu"><button type="button" class="atm" data-at="mode-t"><b>Proposte di scambio</b><span>L'IA ti propone scambi sulla tua squadra: accetti, rifiuti o tratti.</span><small>${AT_LOG.length} risposte</small></button><button type="button" class="atm" data-at="mode-v"><b>Valutazione giocatori</b><span>Ti mostro un giocatore: gli dai un voto da 1 a 10 e rispondi a qualche domanda a scelta multipla.</span><small>${AV_LOG.length} ${AV_LOG.length===1?"giocatore valutato":"giocatori valutati"}</small></button><button type="button" class="atm" data-at="mode-c"><b>Confronto giocatori</b><span>Due giocatori a confronto: chi vale di più, di molto o di poco, oppure pari.</span><small>${CF_LOG.length} ${CF_LOG.length===1?"confronto":"confronti"}</small></button></div>`;
 return bk+h}
window.SCAMBIV.allena=vAtr;
const toMenu=()=>{AT.mode=null;AT.edit=false;AT.rep=false;AV.rep=false;CF.rep=false;AT.chg=false;AT.rem=new Set();AT.note="";AT.c=null;AV.c=null;AV.a={};CF.c=null;CF.sel=null;render();scrollTo(0,0)};
/* navigazione avanti/indietro dell'app (nav.js): stato dell'allenamento */
(window.NAVX=window.NAVX||[]).push({k:"at",get:()=>({mode:AT.mode,rep:AT.rep,edit:AT.edit,vrep:AV.rep,crep:CF.rep}),set:o=>{AT.mode=o.mode;AT.rep=o.rep;AT.edit=o.edit;AV.rep=o.vrep;CF.rep=o.crep;AT.chg=false}});
/* ‹ dentro un allenamento: prima di nav.js (registrato dopo) torna al menu degli allenamenti */
window.addEventListener("click",e=>{if(typeof cur==="undefined"||cur!=="allena")return;const b=e.target.closest&&e.target.closest("[data-atback]");if(!b)return;e.preventDefault();e.stopImmediatePropagation();toMenu()},true);
const copyRep=b=>{const t=document.querySelector(".atrep");if(!t)return;t.select();let ok=false;try{ok=document.execCommand("copy")}catch(x){}try{navigator.clipboard&&navigator.clipboard.writeText(t.value);ok=true}catch(x){}const l=b.textContent;b.textContent=ok?"Copiato ✓":"Seleziona e copia";setTimeout(()=>{b.textContent="Copia report"},1800)};
document.addEventListener("input",e=>{if(cur!=="allena")return;if(e.target.id==="atn")AT.note=e.target.value;
 const r=e.target;if(AT.mode==="val"&&r.classList&&r.classList.contains("avsli")){AV.a[r.dataset.q]=+r.value;const l=document.getElementById("avslv");if(l)l.textContent=+r.value===0?"Nessuno sconto (0%)":"−"+r.value+"%";const sv=document.querySelector('[data-at="vsave"]');if(sv)sv.disabled=!AV_Q.every(q=>!q.req||AV.a[q.k]!=null)}});
document.addEventListener("change",e=>{const b=e.target;if(cur==="allena"&&b.id==="attm"){AT.tm=b.value;const s=document.querySelector('[data-at="start"]');if(s)s.disabled=!AT.tm}});
document.addEventListener("click",e=>{if(cur!=="allena")return;const b=e.target.closest("[data-at]");if(!b||b.disabled)return;const a=b.dataset.at;
 /* menu e scelta dell'allenamento */
 if(a==="mode-t"||a==="mode-v"||a==="mode-c"){AT.mode=a==="mode-t"?"trade":a==="mode-c"?"cmp":"val";render();scrollTo(0,0);return}
 if(a==="menu"){toMenu();return}
 /* annulla l'ultima risposta (ripropone la stessa domanda) */
 if(a==="undo-t"||a==="undo-v"||a==="undo-c"){const L=a==="undo-t"?AT_LOG:a==="undo-v"?AV_LOG:CF_LOG;if(!L.length){b.textContent="Nessuna risposta da annullare";setTimeout(()=>render(),1200);return}
  L.pop();a==="undo-t"?atSave():a==="undo-v"?avSave():cfSave();b.textContent="Annullata ✓";setTimeout(()=>{const y=scrollY;render();scrollTo(0,y)},500);return}
 /* proposte di scambio */
 if(a==="start"){if(!AT.tm)return;AT_PR={t:AT.tm};AT.edit=false;AT.c=null;AV.c=null;CF.c=null;atSave();render()}
 else if(a==="edit"){AT.tm=AT_PR.t;AT.edit=true;render()}
 else if(a==="y"||a==="n")atAns(a);else if(a==="chg"){AT.chg=true;render()}else if(a==="cancel"){AT.chg=false;AT.rem=new Set();AT.note="";render()}
 else if(a==="send")atAns("c");else if(a==="tg"){if(!AT.chg)return;const n=b.dataset.n;AT.rem.has(n)?AT.rem.delete(n):AT.rem.add(n);b.classList.toggle("rm")}
 else if(a==="rep"){AT.rep=true;render();window.scrollTo(0,0)}else if(a==="back"){AT.rep=false;AT.t0=0;render()}
 else if(a==="copy")copyRep(b);
 else if(a==="reset"){if(b.dataset.s!=="1"){b.dataset.s="1";b.textContent="Tocca ancora per azzerare";return}AT_LOG=[];atSave();AT.rep=false;AT.c=null;render()}
 /* valutazione giocatori */
 else if(a==="vans"){const q=b.dataset.q,i=+b.dataset.i;if(q==="d"){const L=avD(AV.a).slice(),j=L.indexOf(i);if(j>=0){L.splice(j,1);const Hh=Object.assign({},avHm(AV.a));delete Hh[i];AV.a.h=Hh}else L.push(i);AV.a.d=L}else if(q==="h"){const Hh=Object.assign({},avHm(AV.a));Hh[b.dataset.hd||"x"]=i;AV.a.h=Hh}else AV.a[q]=i;const y=window.scrollY;render();window.scrollTo(0,y)}
 else if(a==="vsave"){const c=AV.c;if(!c)return;AV_LOG.push({ts:Date.now(),ms:AV.t0?Date.now()-AV.t0:null,n:c.n,t:c.t,v:c.v,s:avSc(c.v),e:c.e,r:c.r,f:atFx(c.n),a:Object.assign({},AV.a)});avSave();avNext()}
 else if(a==="vskip")avNext();else if(a==="vrep"){AV.rep=true;render();window.scrollTo(0,0)}else if(a==="vback"){AV.rep=false;render()}
 else if(a==="vcopy")copyRep(b);
 else if(a==="vreset"){if(b.dataset.s!=="1"){b.dataset.s="1";b.textContent="Tocca ancora per azzerare";return}AV_LOG=[];avSave();AV.rep=false;AV.c=null;render()}
 /* confronto giocatori */
 else if(a==="cwin"){CF.sel=b.dataset.s;const y=window.scrollY;render();window.scrollTo(0,y)}
 else if(a==="cok"){const c=CF.c,s=CF.sel;if(!c||!s)return;const sl=x=>({n:x.n,t:x.t,v:x.v,e:x.e,r:x.r,c:x.c,f:x.f||atFx(x.n)});CF_LOG.push({ts:Date.now(),ms:CF.t0?Date.now()-CF.t0:null,a:sl(c.a),b:sl(c.b),w:s==="p"?"p":s[0],g:s==="p"?null:s[1]});cfSave();CF.c=null;CF.sel=null;CF.t0=0;render();window.scrollTo(0,0)}
 else if(a==="cskip"){CF.c=null;CF.sel=null;CF.t0=0;render();window.scrollTo(0,0)}else if(a==="crep"){CF.rep=true;render();window.scrollTo(0,0)}else if(a==="cback"){CF.rep=false;render()}
 else if(a==="ccopy")copyRep(b);
 else if(a==="creset"){if(b.dataset.s!=="1"){b.dataset.s="1";b.textContent="Tocca ancora per azzerare";return}CF_LOG=[];cfSave();CF.rep=false;CF.c=null;render()}});
/* entrando dalla voce del menu Scambi si riparte dal menu degli allenamenti */
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest('[data-go="allena"]');if(b){AT.mode=null;AT.rep=false;AV.rep=false;CF.rep=false;AT.edit=false;AT.chg=false}},true);
})();
