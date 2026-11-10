/* ===== ESPN 16 – VALORI, CALCOLATORE TRADE, IA TRADE, PREVISIONE DELLE SCELTE =====
   Valori dei giocatori: valori-data.js (tools/valori.mjs, ogni domenica alle 18): AVG degli ultimi 2 anni (più peso all ultimo), presenza, età.
   Forza di una squadra = 70% somma dei valori dei suoi 14 giocatori migliori + 30% percentuale vittorie → classifica prevista 1–16.
   Scelte: la squadra più debole sceglie per prima. Valore della scelta in base a giro e numero previsto; più l anno è lontano
   più la previsione torna verso il centro (non si sa come sarà la squadra) e il valore si sconta un po'. */
(function(){
const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const nk=n=>String(n||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[.'’]/g,"").replace(/\s+(jr|sr|ii|iii|iv)$/,"").trim();
const VK={};if(typeof VAL!=="undefined")for(const n in VAL.p)VK[nk(n)]=n;
const vRow=n=>{const k=VK[nk(n)];return k?VAL.p[k]:null};
const val=n=>{const r=vRow(n);return r?r[0]:0};
const nick=t=>t.nome.split(" ").slice(-1)[0];
const fmt=v=>Math.round(v).toLocaleString("it-IT");
const f1=v=>(Math.round(v*10)/10).toLocaleString("it-IT",{minimumFractionDigits:1,maximumFractionDigits:1});
/* stipendio 26/27 dal file della lega (per il controllo del cap) */
const SAL={};try{for(const t in CAP)for(const p of CAP[t].pl)SAL[t+"|"+nk(p[0])]=p[1][0]||0}catch(_){}
const sal=(t,n)=>SAL[t+"|"+nk(n)]||0;
/* (43) stipendi di tutte le stagioni (26/27 … 30/31) per il controllo del cap anche negli anni dopo */
const SALY={};try{for(const t in CAP)for(const p of CAP[t].pl)SALY[t+"|"+nk(p[0])]=p[1]||[]}catch(_){}
const salY=(t,n,i)=>(SALY[t+"|"+nk(n)]||[])[i]||0;const CYL=["26/27","27/28","28/29","29/30","30/31"];
/* ---------- forza squadre e scelte ---------- */
function strength(){const S={};let mx=0;for(const t of TEAMS){const v=(ROSE[t.id]||[]).map(g=>val(g[0])).sort((a,b)=>b-a).slice(0,14).reduce((a,b)=>a+b,0);S[t.id]=v;mx=Math.max(mx,v)}
 const R={};for(const t of TEAMS){const r=REC[t.id]||{w:0,l:0},g=r.w+r.l,wp=g?r.w/g:.5;R[t.id]=.7*(S[t.id]/mx)+.3*wp}
 const ord=TEAMS.slice().sort((a,b)=>R[b.id]-R[a.id]);const rank={};ord.forEach((t,i)=>rank[t.id]=i+1);return{S,rank}}
let STR=null;const str=()=>STR||(STR=strength());
const PICKV=(r,slot)=>r===1?1500*Math.exp(-.11*(slot-1)):r===2?280*Math.exp(-.075*(slot-1)):60*Math.exp(-.06*(slot-1));
/* (34) PROTEZIONI E SWAP DELLE SCELTE (regole NBA, dal file della lega):
   - Protetta TOP N: se la scelta finisce tra le prime N resta alla squadra che l ha protetta; altrimenti passa a chi la detiene.
     Protetta lottery = prime 6 (le 10 squadre ai playoff scelgono dopo). Per chi la riceve vale meno (può non arrivare).
   - Swap «scambia migliori»: chi ha il diritto prende la scelta migliore (numero più basso) tra la sua e quella dell altra squadra;
     «scambia peggiori»: l altra squadra sceglie per prima e a te resta la peggiore. A 3 squadre: la prima prende la migliore, poi la seconda…
   Valore: si simula l ordine del Draft 4000 volte (ogni squadra intorno alla sua posizione prevista, più incerta negli anni lontani),
   si applica la regola e si confronta con la stessa scelta senza regole: valore = valore normale × (media con regola / media senza).
   PKRULE: chiave "squadra che la detiene|anno|giro|squadra d origine" → f(slots) = numero di scelta che arriva (null = non arriva) e testo. */
const LOTT=6;
const rk=(S,T,i)=>T.map(t=>S[t]).sort((a,b)=>a-b)[i];
const PKRULE={
 "CAN|2027|1|CAN":{f:S=>{const s=rk(S,["CAN","ALA","SRO"],0);return s<=LOTT?s:null},t:"Swap: prende la migliore tra Mayans, Whales e Pirates. Protetta lottery: resta ai Mayans solo se è tra le prime 6, altrimenti va ai Samb."},
 "NYS|2027|1|CAN":{f:S=>{const s=rk(S,["CAN","ALA","SRO"],0);return s>LOTT?s:null},t:"È la scelta dei Mayans dopo lo swap con Whales (e Pirates): protetta lottery, arriva ai Samb solo se NON è tra le prime 6."},
 "SRO|2027|1|SRO":{f:S=>rk(S,["CAN","ALA","SRO"],1),t:"Swap a 3: i Mayans prendono la migliore tra Mayans, Pirates e Whales; ai Pirates la seconda (migliore dei Whales, peggiore dei Mayans)."},
 "ALA|2027|1|ALA":{f:S=>rk(S,["CAN","ALA","SRO"],2),t:"Swap a 3 con Mayans e Pirates: ai Whales resta la peggiore delle tre scelte."},
 "LVA|2027|1|ALB":{f:S=>rk(S,["ALB","FAL"],0),t:"Swap: agli Aliens va la migliore tra la scelta dei Bluesky e quella dei Mavericks."},
 "ALB|2027|1|ALB":{f:S=>rk(S,["ALB","FAL"],1),t:"Swap con i Mavericks: ai Bluesky resta la peggiore delle due (la migliore va agli Aliens)."},
 "HOU|2027|1|HOU":{f:S=>rk(S,["HOU","CHA"],0),t:"Swap: gli Orange Lions prendono la migliore tra la loro scelta e quella dei Cougars."},
 "CHA|2027|1|CHA":{f:S=>rk(S,["HOU","CHA"],1),t:"Swap con gli Orange Lions: ai Cougars resta la peggiore delle due."},
 "CAN|2028|1|CAN":{f:S=>rk(S,["CAN","CHA"],0),t:"Swap: i Mayans prendono la migliore tra la loro scelta e quella dei Cougars."},
 "CHA|2028|1|CHA":{f:S=>rk(S,["CAN","CHA"],1),t:"Swap con i Mayans: ai Cougars resta la peggiore delle due."},
 "BOS|2028|1|CLE":{f:S=>S.CLE>3?S.CLE:null,t:"Protetta TOP 3: se la scelta dei Cadavers finisce tra le prime 3 resta ai Mayans, altrimenti arriva ai TeaBags."},
 "CAN|2029|1|CAN":{f:S=>rk(S,["CAN","ALA","NYS"],0),t:"Swap a 3: i Mayans prendono la migliore tra la loro scelta, quella dei Whales e quella dei Samb."},
 "ALA|2029|1|ALA":{f:S=>{const m=rk(S,["CAN","ALA","NYS"],0);return m===S.ALA?S.CAN:S.ALA},t:"Swap con i Mayans: se la scelta dei Whales è la migliore delle tre (Mayans, Whales, Samb), i Mayans la prendono e ai Whales va quella dei Mayans."},
 "NYS|2029|1|NYS":{f:S=>{const m=rk(S,["CAN","ALA","NYS"],0);return m===S.NYS?S.CAN:S.NYS},t:"Swap con i Mayans: se la scelta dei Samb è la migliore delle tre (Mayans, Whales, Samb), i Mayans la prendono e ai Samb va quella dei Mayans."},
 "ALB|2029|1|BOS":{f:S=>S.BOS>3?S.BOS:null,t:"Protetta TOP 3: se la scelta dei TeaBags finisce tra le prime 3 resta ai TeaBags, altrimenti arriva ai Bluesky."},
 "BOS|2029|1|BOS":{f:S=>S.BOS<=3?S.BOS:null,t:"Riserva TOP 3: i TeaBags la tengono solo se finisce tra le prime 3, altrimenti va ai Bluesky."},
 "CAN|2030|1|CAN":{f:S=>rk(S,["CAN","ALB","LVA"],0),t:"Swap a 3: i Mayans prendono la migliore tra Mayans, Bluesky e Aliens."},
 "ALB|2030|1|ALB":{f:S=>rk(S,["CAN","ALB","LVA"],1),t:"Swap a 3: i Mayans prendono la migliore, i Bluesky la migliore tra le due che restano (meglio degli Aliens)."},
 "LVA|2030|1|LVA":{f:S=>rk(S,["CAN","ALB","LVA"],2),t:"Swap a 3 con Mayans e Bluesky: agli Aliens resta la peggiore delle tre."},
 "QUE|2030|1|ALA":{f:S=>rk(S,["ALA","CAN"],1),t:"Scelta dei Whales con swap messo dai Mayans: ai Ducks arriva la peggiore tra quella dei Whales e quella dei Mayans."},
 "BOS|2030|1|BOS":{f:S=>rk(S,["BOS","HOU","CHA"],0),t:"Swap a 3: i TeaBags prendono la migliore tra TeaBags, Orange Lions e Cougars."},
 "HOU|2030|1|HOU":{f:S=>rk(S,["BOS","HOU","CHA"],1),t:"Swap a 3: i TeaBags prendono la migliore, gli Orange Lions la migliore tra le due che restano (meglio dei Cougars)."},
 "CHA|2030|1|CHA":{f:S=>rk(S,["BOS","HOU","CHA"],2),t:"Swap a 3 con Orange Lions e TeaBags: ai Cougars resta la peggiore delle tre."},
 "CAN|2031|1|CAN":{f:S=>rk(S,["CAN","NYS"],0),t:"Swap: i Mayans prendono la migliore tra la loro scelta e quella dei Samb."},
 "NYS|2031|1|NYS":{f:S=>rk(S,["CAN","NYS"],1),t:"Swap con i Mayans: ai Samb resta la peggiore delle due."}};
/* ordine del Draft simulato (seme fisso: stessi numeri a ogni apertura) */
let SIMC={},PKMEMO={};function simDraft(y){if(SIMC[y])return SIMC[y];let sd=1234567+y;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
 const gau=()=>{let u=0,v=0;while(!u)u=rnd();while(!v)v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
 const k=Math.min(.75,Math.max(0,(y-2027)*.25)),sdv=2.2+1.8*Math.max(0,y-2027),E={};for(const t of TEAMS){const R=str().rank[t.id]||8.5;E[t.id]=(17-R)*(1-k)+8.5*k}
 const L=[];for(let i=0;i<4000;i++){const sc=TEAMS.map(t=>[t.id,E[t.id]+gau()*sdv]).sort((a,b)=>a[1]-b[1]),S={};sc.forEach((x,j)=>S[x[0]]=j+1);L.push(S)}return SIMC[y]=L}
const ruleOf=(h,p)=>PKRULE[h+"|"+p[0]+"|"+p[1]+"|"+p[2]];
function pickInfo(p,holder){/* p = [anno, giro, squadra d origine, nota]; holder = squadra che la detiene (per protezioni e swap) */const R=str().rank[p[2]]||8.5,slot0=17-R,k=Math.min(.75,Math.max(0,(p[0]-2027)*.25)),slot=slot0*(1-k)+8.5*k;
 let v=PICKV(p[1],slot)*Math.pow(.92,Math.max(0,p[0]-2027));let s=Math.max(1,Math.min(16,Math.round(slot)));let q=slot<=4?"alta":slot<=10?"media":"bassa";
 if(holder===undefined)holder=(()=>{try{for(const t in CAP)if((CAP[t].pk||[]).includes(p))return t}catch(_){}return null})();
 const ru=holder&&ruleOf(holder,p);let extra=null;
 if(ru&&PKMEMO[holder+'|'+p.join('|')]){const m=PKMEMO[holder+'|'+p.join('|')];v*=m.r;s=m.s||s;q=m.q||q;extra=m.x}
 else if(ru){const L=simDraft(p[0]);let a=0,b=0,n=0;const got=[];for(const S of L){b+=PICKV(p[1],S[p[2]]);const f=ru.f(S);if(f!=null){a+=PICKV(p[1],f);n++;got.push(f)}}
  v*=b?a/b:1;got.sort((x,y)=>x-y);const med=got.length?got[Math.floor(got.length/2)]:null;if(med){s=med;q=med<=4?"alta":med<=10?"media":"bassa"}
  extra={txt:ru.t,prob:Math.round(n/L.length*100)};PKMEMO[holder+'|'+p.join('|')]={r:b?a/b:1,s:med,q:med?q:null,x:extra}}
 return{slot:s,q,v:Math.round(v/5)*5,rule:extra}}
window.e16Pick=pickInfo;
function teamValue(id){const pl=(ROSE[id]||[]).reduce((a,g)=>a+val(g[0]),0),pk=((CAP[id]||{}).pk||[]).reduce((a,p)=>a+pickInfo(p).v,0);return{pl,pk,tot:pl+pk}}
window.e16TeamValue=teamValue;window.e16Val=val;window.e16Str=()=>str();
/* ---------- stato ---------- */
const T={a:"QUE",b:null,sa:[],sb:[],me:"QUE",tg:"",q:"",vt:""};
try{Object.assign(T,JSON.parse(localStorage.getItem("e16_trade")||"{}"))}catch(_){}
const save=()=>{try{localStorage.setItem("e16_trade",JSON.stringify(T))}catch(_){}};
const assets=id=>[...(ROSE[id]||[]).map(g=>({k:"p|"+g[0],n:g[0],v:val(g[0]),s:sal(id,g[0]),sub:`${g[1]} · ${(vRow(g[0])||[])[2]?Math.floor(vRow(g[0])[2])+" anni":""}`})),
 ...((CAP[id]||{}).pk||[]).map((p,i)=>{const I=pickInfo(p),o=TM[p[2]];return{k:"k|"+i,n:`${p[1]}° giro ${p[0]}${p[2]!==id?" (da "+(o?nick(o):p[2])+")":""}`,v:I.v,s:0,pick:1,sub:`${I.rule?(/^Protett|^Riserva/.test(I.rule.txt)?'🛡 ':'⇄ ')+(I.rule.prob<100?'arriva al '+I.rule.prob+'% · ':''):''}prev. scelta n° ${I.slot} · ${I.q}`}})];
const capAfter=(id,out,inn)=>{const C=CAP[id];const base=C?(C.occ[0]||0)+(C.tagli||0):0;return base-out.reduce((a,x)=>a+x.s,0)+inn.reduce((a,x)=>a+x.s,0)};
const verdict=(va,vb)=>{const d=va-vb,m=Math.max(va,vb)||1,pc=Math.abs(d)/m*100;return pc<8?["Equo","g"]:pc<20?[d>0?"Leggero vantaggio a chi riceve il lato A":"Leggero vantaggio a chi riceve il lato B","y"]:[d>0?"Sbilanciato: il lato A vale molto di più":"Sbilanciato: il lato B vale molto di più","r"]};
const chips=(sel,attr)=>`<div class="chips">${TEAMS.map(x=>`<button class="chip" ${attr}="${x.id}" aria-pressed="${sel===x.id}"><span class="badge logo lg-${x.id}"></span>${e(nick(x))}</button>`).join("")}</div>`;
const xc=v=>v>=2000?"v":v>=1200?"g":v>=600?"y":"r";
/* ---------- VALORI GIOCATORI ---------- */
function vVal(){if(typeof VAL==="undefined")return`<p class="note">Valori non disponibili.</p>`;const q=nk(T.q);
 const own=n=>{try{return OWNH[__ownKey(n)]||""}catch(_){return""}};
 let L=Object.entries(VAL.p).map(([n,r])=>({n,r,o:own(n)}));if(T.vt)L=L.filter(x=>x.o===T.vt);if(q)L=L.filter(x=>nk(x.n).includes(q)||nk(x.r[3])===q);
 L.sort((a,b)=>b.r[0]-a.r[0]);const h=VAL.h||{};
 const tr=n=>{const H=h[n]||[];if(H.length<2)return"";const d=H[H.length-1]-H[H.length-2];return d?`<small style="color:${d>0?"#16a34a":"#dc2626"}">${d>0?"▲":"▼"} ${fmt(Math.abs(d))}</small>`:""};
 return `<button class="gback" data-go="home">‹ Home</button><h2><span class="t"><span>Valori giocatori</span></span><em>agg. ${e(VAL.upd)}</em></h2>
 <input id="tvq" class="vtq" type="search" placeholder="🔍 Cerca giocatore o squadra NBA" autocomplete="off" value="${e(T.q)}">
 <div class="chips"><button class="chip" data-vt="" aria-pressed="${!T.vt}">Tutti</button>${TEAMS.map(x=>`<button class="chip" data-vt="${x.id}" aria-pressed="${T.vt===x.id}"><span class="badge logo lg-${x.id}"></span>${e(nick(x))}</button>`).join("")}</div>
 <div class="tbl-wrap"><table class="fatbl"><thead><tr><th>#</th><th>Giocatore</th><th>Età</th><th>AVG</th><th>Valore</th></tr></thead><tbody>
 ${L.slice(0,250).map((x,i)=>`<tr class="farow" data-pl="${e(x.n)}"><td class="fark">${i+1}</td><td class="fanm"><b>${e(x.n)}</b><small>${x.o?`<span class="fagl"><span class="faglb logo lg-${x.o}"></span></span>${e(nick(TM[x.o]))} · `:"Svincolato · "}${x.r[3]||""}</small></td><td>${etaOf(x.n)!=null?etaOf(x.n):x.r[2]!=null?Math.floor(x.r[2]):"–"}</td><td>${f1(x.r[1])}</td><td class="fapdk"><span class="pdkx ${xc(x.r[0])}">${fmt(x.r[0])}</span>${tr(x.n)}</td></tr>`).join("")}</tbody></table></div>
 <p class="note">Valore = AVG degli ultimi 2 anni (più peso alla stagione in corso), presenze ed età (i giovani valgono di più). Si aggiorna ogni domenica alle 18; la freccia è la differenza con la settimana prima.</p>`}
/* ===== CALCOLATORE SCAMBI e IA TRADE: stessa struttura e funzionamento di Dreamers (classi vt*, ia*), valori di questa lega =====
   Punti trade di un giocatore = (valore/1000)^1,4 × 1000, come Dreamers: le stelle pesano più della somma di giocatori medi.
   Scelte: valore previsto (vedi pickInfo) trasformato allo stesso modo. Verdetto come Dreamers: <10% equilibrata, 10–30% vincitore,
   30–40% grande truffa, 40–50% truffa pazzesca, oltre… Controllo del cap 190 (stipendi 26/27 dal file della lega). Nessuna regola di ruolo. */
const vtPts=v=>Math.pow(Math.max(0,v)/1000,1.4)*1000;
const RO={G:0,F:1,C:2},RLAB={G:"Guardie",F:"Ali",C:"Centri"},RN={G:"Guardia",F:"Ala",C:"Centro"};
const roleOf=n=>{for(const t in ROSE){const g=ROSE[t].find(x=>x[0]===n);if(g){const a=g[3].split(",")[0];return a==="C"?"C":/G/.test(a)?"G":"F"}}return"F"};
const ownerOf=n=>{for(const t in ROSE)if(ROSE[t].some(g=>g[0]===n))return t;return""};
const ageOf=n=>(vRow(n)||[])[2]||null;
const sh=n=>{const p=String(n).split(" ");return p.length>1?p[0][0]+". "+p.slice(1).join(" "):n};
const lgS=(t,s)=>`<span class="drlg ${s||"m"}" style="--tc:${TCOL[t]}"><span class="badge logo lg-${t}"></span></span>`;
const wdg=t=>`<span class="wedge" style="--tc:${TCOL[t]}"><span class="badge logo lg-${t}"></span></span>`;
const tOpts=sel=>TEAMS.map(x=>`<option value="${x.id}" ${x.id===sel?"selected":""}>${e(x.nome)}</option>`).join("");
const pkLab=(t,p)=>`${String(p[0]).slice(2)} ${p[1]}°${p[2]!==t?" "+nick(TM[p[2]]).slice(0,3):""}`;
const itPts=x=>x.ty==="pl"?vtPts(val(x.n)):vtPts(pickInfo(x.p).v);
const itVal=x=>x.ty==="pl"?val(x.n):pickInfo(x.p).v;
const itLab=x=>x.ty==="pl"?x.n:`Scelta ${x.p[0]} · ${x.p[1]}° giro${x.p[2]!==x.from?" (da "+nick(TM[x.p[2]])+")":""}`;
const itSal=x=>x.ty==="pl"?sal(x.from,x.n):0;
const trArt=n=>/^[aeiou]/i.test(n)?"gli":"i";
const verd=(d,w,l)=>d<.10?["Trade equilibrata","ok"]:d<.30?[`Vincitore trade ${nick(TM[w])}`,"mid"]:d<.40?[`Grande truffa dei ${nick(TM[w])}`,"bad"]:d<.50?[`Truffa pazzesca dei ${nick(TM[w])}`,"bad"]:d<.60?["Mamma mia che inculata","bad"]:[`Ma ${trArt(nick(TM[l]))} ${nick(TM[l])} ne capiscono di basket?`,"bad"];
/* colonna di una squadra nel risultato (come Dreamers: riceve, percentuale, pezzi) */
function colHTML(t,rec,pc,you){const c=pc>=5?"g":pc<=-5?"r":"y",w=pc>=5?"vantaggio":pc<=-5?"svantaggio":"alla pari";
 return `<div class="iacol" style="--tc:${TCOL[t]}"><div class="iach">${lgS(t)}<b>${e(nick(TM[t]))}</b><small>${you?"tu · ":""}riceve</small><span class="trpc ${c}">${pc>0?"+":pc<0?"−":""}${Math.abs(Math.round(pc))}%</span><small class="trpw">${w}</small></div>
 <div class="iacb">${rec.map(x=>`<div class="iapc"><div class="iapn"><i class="rc ${x.ty==="pl"?roleOf(x.n):"x"}"></i><span>${e(x.ty==="pl"?sh(x.n):itLab(x))}</span></div><div class="iapm"><b>${fmt(itVal(x))}</b></div><small class="iafrm">da ${e(nick(TM[x.from]))}</small></div>`).join("")||`<em class="iaem">niente</em>`}</div></div>`}
/* saldo di ogni squadra: punti ricevuti − punti dati, in % sul più grande dei due */
function bal(items,t){const r=items.filter(x=>x.to===t).reduce((a,x)=>a+itPts(x),0),g=items.filter(x=>x.from===t).reduce((a,x)=>a+itPts(x),0);return{r,g,pc:(r-g)/(Math.max(r,g)||1)*100}}
/* (43) cap controllato in ogni stagione: occupato di quell anno (nel 26/27 anche i tagli) meno chi esce più chi entra con i suoi stipendi di quell anno.
   capFail → {i: stagione che sfora, v: occupato} oppure null; capOK resta true / numero (occupato della prima stagione che sfora) */
function capFail(items,t){const C=CAP[t];if(!C)return null;for(let i=0;i<5;i++){const base=(C.occ[i]||0)+(i?0:(C.tagli||0));const sY=x=>x.ty==="pl"?salY(x.from,x.n,i):0;
 const v=base-items.filter(x=>x.from===t).reduce((a,x)=>a+sY(x),0)+items.filter(x=>x.to===t).reduce((a,x)=>a+sY(x),0);if(v>CAP_TOT+1e-9)return{i,v}}return null}
function capOK(items,t){const f=capFail(items,t);return f?f.v:true}
window.e16CapFail=capFail;
const capMsg=(items,t)=>{const f=capFail(items,t);return f?`sforerebbe il cap ${CYL[f.i]} (${f1(f.v)} su ${CAP_TOT})`:""};
/* (44) REGOLA DEI 3 UNDER 25: dopo ogni scambio ogni squadra deve avere almeno 3 under 25 (età di oggi). Chi è già sotto non può scendere ancora.
   u25Fail → numero di under 25 dopo lo scambio se la regola salta, altrimenti null. Vale per calcolatore, IA trade, gusti, allenamento, Pic-Trade (window.e16U25Fail). */
const isU=n=>typeof u25==="function"&&u25(n);
function u25Fail(items,t){const now=(ROSE[t]||[]).filter(g=>isU(g[0])).length,pl=items.filter(x=>x.ty==="pl");
 const after=now-pl.filter(x=>x.from===t&&isU(x.n)).length+pl.filter(x=>x.to===t&&isU(x.n)).length;return after<3&&after<now?after:null}
window.e16U25Fail=u25Fail;
const u25Msg=(items,t)=>{const a=u25Fail(items,t);return a==null?"":`resterebbe con ${a} under 25 (minimo 3)`};
/* interesse delle altre squadre (come «Interesse alto/medio/basso» di Dreamers): saldo di valore, età e ruoli */
function intHTML(items,teams,me){return `<div class="iaint">${teams.filter(t=>t!==me).map(t=>{const B=bal(items,t),inn=items.filter(x=>x.to===t&&x.ty==="pl"),out=items.filter(x=>x.from===t&&x.ty==="pl");
  const ea=inn.length?inn.reduce((a,x)=>a+(ageOf(x.n)||27),0)/inn.length:null,eo=out.length?out.reduce((a,x)=>a+(ageOf(x.n)||27),0)/out.length:null;
  const S=str().rank[t],reb=S>8,lv=B.pc>=5?"alto":B.pc>=-5?"medio":"basso";const why=[`${B.pc>=0?"ci guadagna":"ci rimette"} circa il ${Math.abs(Math.round(B.pc))}% di valore`];
  if(ea!=null&&eo!=null)why.push(`età media: riceve ${f1(ea)} anni, cede ${f1(eo)}${reb&&ea<eo?" (squadra che ricostruisce: le piacciono i giovani)":!reb&&ea>eo?" (squadra forte: le servono giocatori pronti)":""}`);
  why.push(`forza prevista ${S}ª su 16`);const cap=capOK(items,t);if(cap!==true)why.push(capMsg(items,t));if(u25Fail(items,t)!=null)why.push(u25Msg(items,t));
  return `<div class="iaint1 ${cap!==true?"basso":lv}"><span><b>Interesse ${cap!==true?"basso":lv}</b></span><small>${e(nick(TM[t]))}: ${why.join(" · ")}</small></div>`}).join("")}</div>`}
/* ---------- CALCOLATORE ---------- */
const VT={tab:"calc",t:["QUE","HOU"],it:[],t3:["QUE","HOU","LVA","DET"]};
try{Object.assign(VT,JSON.parse(localStorage.getItem("e16_vt")||"{}"))}catch(_){}
const vtSave=()=>{try{localStorage.setItem("e16_vt",JSON.stringify(VT))}catch(_){}};
const nT=()=>VT.tab==="calc4"?4:VT.tab==="calc3"?3:2;
const tms=()=>VT.tab==="calc"?VT.t:VT.t3.slice(0,nT());
function resHTML(){const T2=tms(),I=VT.it.filter(x=>T2.includes(x.from)&&T2.includes(x.to));if(!I.length)return"";
 if(T2.length===2){const[a,b]=T2,A=bal(I,a),Bb=bal(I,b),ga=I.filter(x=>x.from===a).reduce((s,x)=>s+itPts(x),0),gb=I.filter(x=>x.from===b).reduce((s,x)=>s+itPts(x),0);
  const mx=Math.max(ga,gb)||1,d=Math.abs(ga-gb)/mx,pa=ga/((ga+gb)||1)*100,fav=ga>gb?b:a,give=ga>gb?a:b,[lab,cls]=verd(d,fav,give);
  const need=Math.abs(ga-gb),vneed=Math.round(Math.pow(need/1000,1/1.4)*1000/5)*5;
  const caps=[a,b].map(t=>[t,capOK(I,t)]).filter(x=>x[1]!==true);
  return `<div class="vtres ${cls}"><div class="iacols2">${colHTML(a,I.filter(x=>x.to===a),A.pc)}${colHTML(b,I.filter(x=>x.to===b),Bb.pc)}</div>
  <div class="vtbar"><i style="width:${100-pa}%;background:${TCOL[a]};color:#fff">${Math.round(100-pa)}%</i><i style="width:${pa}%;background:${TCOL[b]};color:#fff">${Math.round(pa)}%</i><em style="left:50%"></em></div>
  <div class="vtver"><b>${lab}</b><span>${d<.10?"Differenza":"Ci guadagnano i "+e(nick(TM[fav]))+" del"} ${Math.round(d*100)}%</span></div>
  ${d>=.10?`<p class="vtsug">Per pareggiare: i <b>${e(nick(TM[fav]))}</b> dovrebbero aggiungere un giocatore o una scelta da circa <b>${fmt(vneed)}</b> di valore (o i ${e(nick(TM[give]))} togliere qualcosa).</p>`:""}
  ${caps.length?`<p class="vtsug">⚠️ ${caps.map(([t,v])=>`<b>${e(nick(TM[t]))}</b> ${capMsg(I,t)}`).join(" · ")}</p>`:""}
  ${[a,b].some(t=>u25Fail(I,t)!=null)?`<p class="vtsug">⚠️ ${[a,b].filter(t=>u25Fail(I,t)!=null).map(t=>`<b>${e(nick(TM[t]))}</b> ${u25Msg(I,t)}`).join(" · ")} · scambio non valido</p>`:""}
  ${intHTML(I,[a,b],null)}</div>`}
 const B=T2.map(t=>bal(I,t)),mx=Math.max(...B.map(x=>Math.abs(x.pc)));const[lab,cls]=mx<10?["Trade equilibrata","ok"]:mx<30?["Qualcuno ci guadagna","mid"]:["Trade sbilanciata","bad"];
 return `<div class="vtres ${cls}"><div class="iacols${T2.length===3?3:2}">${T2.map((t,i)=>colHTML(t,I.filter(x=>x.to===t),B[i].pc)).join("")}</div><div class="vtver"><b>${lab}</b><span>saldo massimo ${Math.round(mx)}%</span></div>${T2.some(t=>u25Fail(I,t)!=null)?`<p class="vtsug">⚠️ ${T2.filter(t=>u25Fail(I,t)!=null).map(t=>`<b>${e(nick(TM[t]))}</b> ${u25Msg(I,t)}`).join(" · ")} · scambio non valido</p>`:""}${T2.some(t=>capOK(I,t)!==true)?`<p class="vtsug">⚠️ ${T2.filter(t=>capOK(I,t)!==true).map(t=>`<b>${e(nick(TM[t]))}</b> ${capMsg(I,t)}`).join(" · ")}</p>`:""}${intHTML(I,T2,null)}</div>`}
function cardHTML(k){const T2=tms(),t=T2[k],I=VT.it.filter(x=>x.from===t&&T2.includes(x.to)),sel=new Set(I.filter(x=>x.ty==="pl").map(x=>x.n));
 const ros=(ROSE[t]||[]).map(g=>({n:g[0],r:roleOf(g[0]),v:val(g[0])})).sort((a,b)=>(RO[a.r]-RO[b.r])||(b.v-a.v));
 const pks=((CAP[t]||{}).pk||[]);
 return `<div class="vtcard" style="--tc:${TCOL[t]}"><div class="vthd">${wdg(t)}<select data-vtsel="${k}">${tOpts(t)}</select><span class="vtgv">dà</span></div>
 <div class="${T2.length>2?"v3items":"vtitems"}">${I.map(x=>`<button class="vtit" data-vt="rm" data-id="${e(x.id)}"><span>${e(itLab(x))}${T2.length>2?` → <b>${e(nick(TM[x.to]))}</b>`:""}</span><b>${fmt(itVal(x))}</b><i>✕</i></button>`).join("")||`<em>Niente ancora: tocca i giocatori qui sotto</em>`}</div>
 ${pks.length?`<div class="vtpk"><span>Scelte</span>${pks.map((p,i)=>`<button data-vt="pk" data-k="${k}" data-i="${i}" aria-pressed="${I.some(x=>x.ty==="pk"&&x.pi===i)}">${pkLab(t,p)}<small>${fmt(pickInfo(p).v)}</small></button>`).join("")}</div>`:""}
 <div class="vtros">${ros.map((p,i)=>`${i===0||ros[i-1].r!==p.r?`<div class="vtrh ${p.r}">${RLAB[p.r]}</div>`:""}<button class="vtp ${sel.has(p.n)?"on":""}" data-vt="pl" data-k="${k}" data-n="${e(p.n)}"><i class="rc ${p.r}"></i><span>${e(p.n)}</span><b>${fmt(p.v)}</b></button>`).join("")}</div></div>`}
function vCalc(){const tabs=`<div class="ctabs vttabs">${[["calc","2 squadre"],["calc3","3 squadre"],["calc4","4 squadre"],["list","Valori lega"]].map(([k,l])=>`<button data-vt="tab" data-k="${k}" aria-pressed="${VT.tab===k}">${l}</button>`).join("")}</div>`;
 const head=`<button class="gback" data-go="home">‹ Home</button><h2><span class="t"><span>Calcolatore scambi</span></span><em>${typeof VAL!=="undefined"?e(VAL.upd.split(",")[0]):""}</em></h2>${tabs}`;
 if(VT.tab==="list")return head+listHTML();
 const T2=tms();return head+`<div id="vtRes">${resHTML()}</div>${T2.length>2?`<div class="vtgrid">`:""}${T2.map((t,k)=>cardHTML(k)).join("")}${T2.length>2?`</div>`:""}
 <button class="vtclr" data-vt="clr">Azzera</button>
 <p class="note">Ogni giocatore vale (valore/1000)<sup>1,4</sup> × 1000 punti trade: le stelle pesano più della somma di giocatori medi. Le scelte valgono in base alla previsione (quanto è forte la squadra d'origine). Sotto il 10% di differenza la trade è equilibrata, fino al 30% c'è un vincitore, oltre è una truffa. ${T2.length>2?"Nello scambio a più squadre ogni pezzo va alla squadra successiva: tocca il pezzo nel riquadro per cambiare chi lo riceve. ":""}Valori della lega aggiornati ogni domenica alle 18.</p>`}
function listHTML(){const q=nk(VT.q||"");let L=Object.entries(VAL.p).map(([n,r])=>({n,r,o:ownerOf(n)})).filter(x=>x.o);if(q)L=L.filter(x=>nk(x.n).includes(q)||nk(TM[x.o].nome).includes(q));L.sort((a,b)=>b.r[0]-a.r[0]);const h=VAL.h||{};
 const dl=n=>{const H=h[n]||[];if(H.length<2||!H[H.length-2])return"";const d=(H[H.length-1]-H[H.length-2])/H[H.length-2]*100;return Math.abs(d)<.5?"":`<i class="vdl ${d>0?"su":"giu"}">${d>0?"▲ +":"▼ "}${Math.round(d)}%</i>`};
 return `<input id="vtq" class="vtq" type="search" placeholder="🔍 Cerca giocatore o squadra" autocomplete="off" value="${e(VT.q||"")}"><div class="tbl-wrap vtlist">${L.map((x,i)=>`<div class="vtrow" data-pl="${e(x.n)}">${wdg(x.o)}<span class="vtrk">${i+1}</span><span class="vtnm"><span class="vtnn">${e(x.n)}</span><small>${e(nick(TM[x.o]))} · ${etaOf(x.n)!=null?etaTxt(x.n):""}</small></span><span class="vtvp"><b>${fmt(x.r[0])}</b><small>valore${dl(x.n)}</small></span><span class="vtvp pr"><b>${f1(x.r[1])}</b><small>AVG</small></span></div>`).join("")}</div>`}
/* ---------- IA TRADE (Per ruolo · Per giocatore · Per gusti), come Dreamers ---------- */
const IA={mode:"",st:1,me:"QUE",needs:[null,null,null],any:false,give:[],keep:[],want:[],n:2,lv:"eq",tf:null,q:"",res:null};
try{Object.assign(IA,JSON.parse(localStorage.getItem("e16_ia")||"{}"),{res:null})}catch(_){}
const iaSave=()=>{try{const o={...IA};delete o.res;localStorage.setItem("e16_ia",JSON.stringify(o))}catch(_){}};
const LV={eq:[-10,10],win:[10,30],scam:[30,80]};
/* motore: cerca scambi a 2 squadre (io ↔ X) e a 3 squadre a ragnatela (io → Y → X → io) */
function iaFind(){const me=IA.me,mode=IA.mode,[lo,hi]=LV[IA.lv]||LV.eq,out=[];
 const myPool=()=>{const allow=mode==="role"?new Set(IA.give):null,keep=new Set(IA.keep);return (ROSE[me]||[]).filter(g=>allow?allow.has(g[0]):!keep.has(g[0])).map(g=>({ty:"pl",n:g[0],from:me})).concat(mode==="role"?[]:((CAP[me]||{}).pk||[]).map((p,i)=>({ty:"pk",p,pi:i,from:me}))).sort((a,b)=>itPts(b)-itPts(a)).slice(0,14)};
 const subsets=(L,mx)=>{const R=[];for(let i=0;i<L.length;i++){R.push([L[i]]);if(mx>1)for(let j=i+1;j<L.length;j++){R.push([L[i],L[j]]);if(mx>2)for(let k=j+1;k<L.length;k++)R.push([L[i],L[j],L[k]])}}return R};
 const MP=myPool(),MS=subsets(MP,3);
 /* che cosa voglio ricevere */
 let targets=[];
 if(mode==="pl"){const by={};IA.want.forEach(n=>{const t=ownerOf(n);if(t&&t!==me)(by[t]=by[t]||[]).push(n)});targets=Object.entries(by).map(([t,L])=>({t,get:L.map(n=>({ty:"pl",n,from:t}))}))}
 else{const roles=IA.any?["G","F","C"]:IA.needs.filter(Boolean);for(const x of TEAMS){if(x.id===me)continue;const L=(ROSE[x.id]||[]).filter(g=>roles.includes(roleOf(g[0]))&&val(g[0])>=200).map(g=>({ty:"pl",n:g[0],from:x.id}));for(const g of L.slice(0,40))targets.push({t:x.id,get:[g]})}}
 const ok=(I,teams)=>teams.every(t=>capOK(I,t)===true&&u25Fail(I,t)==null);/* (44) anche la regola dei 3 under 25 */
 for(const T0 of targets){const X=T0.t,get=T0.get.map(x=>({...x,to:me}));const gp=get.reduce((a,x)=>a+itPts(x),0);
  /* 2 squadre */
  for(const S of MS){const gv=S.reduce((a,x)=>a+itPts(x),0);const pcMe=(gp-gv)/Math.max(gp,gv)*100;if(pcMe<lo||pcMe>hi)continue;if((gp-gv)/Math.max(gp,gv)*-100<-35)continue;
   const I=[...get,...S.map(x=>({...x,to:X}))];if(!ok(I,[me,X]))continue;out.push({I,teams:[me,X],score:Math.abs(pcMe-(lo+hi)/2)+S.length*2})}
  /* 3 squadre a ragnatela: io do a Y, Y dà a X, X dà a me */
  if((mode==="pl"&&IA.n>=3)||(mode==="role"&&IA.n>=3)){for(const Y of TEAMS){if(Y.id===me||Y.id===X)continue;const YP=(ROSE[Y.id]||[]).map(g=>({ty:"pl",n:g[0],from:Y.id})).sort((a,b)=>itPts(b)-itPts(a)).slice(0,10),YS=subsets(YP,2);
    for(const H of YS){const hp=H.reduce((a,x)=>a+itPts(x),0);const pcX=(hp-gp)/Math.max(hp,gp)*100;if(pcX<-10||pcX>40)continue;
     for(const S of MS){if(S.length>2)continue;const gv=S.reduce((a,x)=>a+itPts(x),0);const pcMe=(gp-gv)/Math.max(gp,gv)*100;if(pcMe<lo||pcMe>hi)continue;const pcY=(gv-hp)/Math.max(gv,hp)*100;if(pcY<-10)continue;
      const I=[...get,...H.map(x=>({...x,to:X})),...S.map(x=>({...x,to:Y.id}))];if(!ok(I,[me,X,Y.id]))continue;out.push({I,teams:[me,X,Y.id],score:Math.abs(pcMe-(lo+hi)/2)+S.length*2+H.length*2+6})}}}}}
 out.sort((a,b)=>a.score-b.score);const seen=new Set(),R=[];for(const o of out){const key=o.I.map(x=>(x.ty==="pl"?x.n:x.p.join("-"))+">"+x.to).sort().join("|");if(seen.has(key))continue;seen.add(key);R.push(o);if(R.length>=8)break}return R}
function iaResHTML(){const R=IA.res;if(!R)return"";if(!R.length)return`<div class="iares"><p class="iasub">Nessuno scambio trovato con queste scelte: prova a offrire di più, a cambiare guadagno o ad aggiungere una squadra.</p></div>`;
 return `<div class="iares">${R.map((o,i)=>{const B=o.teams.map(t=>bal(o.I,t)),me=bal(o.I,IA.me),pc=Math.round(me.pc);
  return `<div class="iacard"><div class="iahd"><span class="ian1">${i+1}</span><span class="iah"><b>${o.teams.length===3?"Scambio a 3 · ragnatela":"Scambio a 2"}</b></span><span class="iabal ${Math.abs(pc)<=10?"ok":pc>0?"ok":"bad"}">${pc>0?"+":pc<0?"−":"±"}${Math.abs(pc)}%</span></div>
  <div class="iacols${o.teams.length}">${o.teams.map((t,j)=>colHTML(t,o.I.filter(x=>x.to===t),B[j].pc,t===IA.me)).join("")}</div>
  <div class="iawhy">${IA.mode==="pl"?"<span>Giocatore scelto da te</span>":`<span>Ruolo cercato: ${IA.any?"tutti":IA.needs.filter(Boolean).map(r=>RN[r]).join(", ")}</span>`}<span>Cap ${CAP_TOT} rispettato da tutte le squadre</span></div>
  ${intHTML(o.I,o.teams,IA.me)}<div class="iaact"><button class="iaopen" data-ia="open" data-i="${i}">Apri nel calcolatore</button></div></div>`}).join("")}</div>`}
function vIaNew(){const me=IA.me,H=`<button class="gback" data-go="calc">‹ Calcolatore trade</button><h2><span class="t"><span>IA Trade</span></span><em>${e(nick(TM[me]))}</em></h2>`;
 if(IA.mode!=="role"&&IA.mode!=="pl"&&IA.mode!=="gusti")return H+`<div class="iachoose"><div class="iach"><button data-ia="mode" data-k="role">Per ruolo</button><p>Hai bisogno di un ruolo (guardia, ala o centro)? Scegli che ruolo cerchi e cosa sei disposto a dare: l'IA trova da sola i giocatori giusti e le squadre con cui scambiare, anche a 3 squadre.</p></div><div class="iach"><button data-ia="mode" data-k="pl">Per giocatore</button><p>Hai in mente uno o più giocatori precisi? Scegli quelli che vuoi e quelli che non vuoi dare: l'IA costruisce gli scambi per arrivarci, anche a 3 squadre.</p></div><div class="iach"><button data-ia="mode" data-k="gusti">Per gusti</button><p>Contano gli interessi delle squadre più dei valori: trova gli scambi che hanno più probabilità di essere accettati, in base a quanto è forte ogni squadra (chi ricostruisce vuole giovani e scelte, chi è forte vuole giocatori pronti).</p></div></div>`;
 const MD={role:"Per ruolo",pl:"Per giocatore",gusti:"Per gusti"};const st=IA.st,pl=IA.mode==="pl";
 const modeBar=`<div class="iahd"><button class="iabk2" data-ia="mode" data-k="">‹ Modalità</button><b>${MD[IA.mode]}</b></div>`;
 const teamSel=`<label class="iatm">${wdg(me)}<select data-iasel="1">${tOpts(me)}</select></label>`;
 const lvSel=`<div class="iaq">${[["eq","Equilibrata","fino a ±10%"],["win","Vinco io","+10% / +30%"],["scam","Truffo","oltre +30%"]].map(([k,l,s])=>`<button data-ia="lv" data-k="${k}" aria-pressed="${IA.lv===k}"><b>${l}</b><small>${s}</small></button>`).join("")}</div>`;
 const nSel=`<div class="iaq iaq2">${[2,3].map(n=>`<button data-ia="n" data-n="${n}" aria-pressed="${IA.n===n}"><b>${n}</b><small>${n===2?"squadre":"fino a 3"}</small></button>`).join("")}</div>`;
 const ros=(t,setName)=>{const S=new Set(IA[setName]);const L=(ROSE[t]||[]).map(g=>({n:g[0],r:roleOf(g[0]),v:val(g[0])})).sort((a,b)=>(RO[a.r]-RO[b.r])||(b.v-a.v));return L.map(p=>`<button class="iapl ${S.has(p.n)?"on":""}" data-ia="${setName}" data-n="${e(p.n)}"><i class="rc ${p.r}"></i><span>${e(p.n)}</span><b>${fmt(p.v)}</b></button>`).join("")};
 let body="";
 if(IA.mode==="gusti"){/* Per gusti: per ogni squadra l'IA cerca cosa le serve (ricostruzione o titolo) e propone lo scambio con me più gradito a entrambe */
  if(!IA.res){const S=str(),R=[];for(const x of TEAMS){if(x.id===me)continue;const reb=S.rank[x.id]>8,meReb=S.rank[me]>8;
    const theirs=(ROSE[x.id]||[]).map(g=>({ty:"pl",n:g[0],from:x.id,to:me})).filter(p=>val(p.n)>=300&&(reb?(ageOf(p.n)||27)>=27:(ageOf(p.n)||27)<=24)).sort((a,b)=>itPts(b)-itPts(a)).slice(0,6);
    const mine=[...(ROSE[me]||[]).map(g=>({ty:"pl",n:g[0],from:me,to:x.id})).filter(p=>!IA.keep.includes(p.n)&&(reb?(ageOf(p.n)||27)<=24:(ageOf(p.n)||27)>=26)),...((CAP[me]||{}).pk||[]).map((p,i)=>({ty:"pk",p,pi:i,from:me,to:x.id})).filter(()=>reb)].sort((a,b)=>itPts(b)-itPts(a)).slice(0,10);
    let best=null;for(const a of theirs)for(let i=0;i<mine.length;i++)for(let j=i;j<mine.length;j++){const G=i===j?[mine[i]]:[mine[i],mine[j]],I=[a,...G];const pm=bal(I,me).pc;if(pm<-12||pm>15)continue;if(!(capOK(I,me)===true&&capOK(I,x.id)===true&&u25Fail(I,me)==null&&u25Fail(I,x.id)==null))continue;const sc=Math.abs(pm)+G.length*2;if(!best||sc<best.score)best={I,teams:[me,x.id],score:sc}}
    if(best)R.push(best)}R.sort((a,b)=>a.score-b.score);IA.res=R.slice(0,8)}
  body=`<div class="iabox">${teamSel}<h4>Intoccabili (facoltativo)</h4><p class="iasub">Tocca i giocatori che NON vuoi dare. Per ogni squadra l'IA guarda se ricostruisce (vuole giovani e scelte) o punta al titolo (vuole giocatori pronti) e ti propone lo scambio più gradito a tutte e due.</p><div class="iaros">${ros(me,"keep")}</div><div class="iabtn2"><button class="iago" data-ia="regusti">Ricalcola ›</button></div></div>${iaResHTML()}`;
  return H+modeBar+body}
 const ok1=pl?IA.want.some(n=>ownerOf(n)&&ownerOf(n)!==me):(!!IA.needs[0]||IA.any),ok2=pl?true:IA.give.length>0;
 const steps=pl?[["1","Voglio e opzioni"],["2","Intoccabili"]]:[["1","Cerco"],["2","Offro"],["3","Squadre"]];
 const bar=`<div class="iabar">${steps.map(([k,l])=>`<button data-ia="go" data-s="${k}" aria-pressed="${st===+k||(st===4&&+k===steps.length)}" ${+k===1||(+k===2&&ok1)||(+k===3&&ok1&&ok2)?"":"disabled"}><b>${k}</b>${l}</button>`).join("")}</div>`;
 if(pl&&st===1){const others=TEAMS.filter(x=>x.id!==me),tf=others.some(x=>x.id===IA.tf)?IA.tf:others[0].id,q=nk(IA.q||"");
  const L=q?others.flatMap(x=>(ROSE[x.id]||[]).map(g=>g[0])).filter(n=>nk(n).includes(q)):(ROSE[tf]||[]).map(g=>g[0]);L.sort((a,b)=>val(b)-val(a));
  body=`<div class="iabox">${teamSel}<h4>Quante squadre coinvolgo?</h4><p class="iasub">Scelgo io le squadre da coinvolgere, fino al numero che indichi: ognuna deve avere interesse a fare lo scambio con cui arrivi al giocatore.</p>${nSel}<h4>Che guadagno cerchi?</h4>${lvSel}<h4>Quali giocatori vuoi?</h4><p class="iasub">Scegli fino a 3 giocatori.</p>
  <div class="iawant">${IA.want.map(n=>`<button class="iachip" data-ia="want" data-n="${e(n)}">${lgS(ownerOf(n),"s")}<span>${e(n)}</span><i>✕</i></button>`).join("")||`<em class="iaem">Nessun giocatore scelto</em>`}</div>
  <input id="iaq" class="vtq" type="search" placeholder="🔍 Cerca un giocatore in tutta la lega" autocomplete="off" value="${e(IA.q||"")}">
  <div class="iatf">${others.map(x=>`<button data-ia="tf" data-t="${x.id}" aria-pressed="${tf===x.id&&!q}">${lgS(x.id,"s")}</button>`).join("")}</div>
  <div class="iaros" id="iaList">${L.map(n=>`<button class="iapl ${IA.want.includes(n)?"on":""}" data-ia="want" data-n="${e(n)}"><i class="rc ${roleOf(n)}"></i><span>${e(n)}</span><b>${fmt(val(n))}</b></button>`).join("")}</div>
  <button class="iago" data-ia="go" data-s="2" ${ok1?"":"disabled"}>Avanti · intoccabili ›</button></div>`}
 else if(pl&&st>=2){body=`<div class="iabox"><h4>Intoccabili (facoltativo)</h4><p class="iasub">Tocca i giocatori che NON vuoi dare: userò tutti gli altri del tuo roster e le tue scelte.</p><div class="iaros">${ros(me,"keep")}</div><div class="iabtn2"><button class="iabk" data-ia="go" data-s="1">‹ Indietro</button><button class="iago" data-ia="find">Trova scambi ›</button></div></div>${st===4?iaResHTML():""}`}
 else if(!pl&&st===1){body=`<div class="iabox">${teamSel}<h4>Che ruolo cerchi?</h4><p class="iasub">Scegli prima la necessità principale, poi (se vuoi) la seconda e la terza. Oppure lascia che decida io: nessuna preferenza di ruolo.</p>
  ${[0,1,2].map(i=>`<div class="iarow ${i>0&&!IA.needs[i-1]?"off":""}"><span>${["1ª","2ª","3ª"][i]} necessità</span><div>${["G","F","C"].map(r=>`<button class="iarb ${r}" data-ia="need" data-i="${i}" data-r="${r}" aria-pressed="${IA.needs[i]===r}" ${i>0&&!IA.needs[i-1]?"disabled":""}>${RN[r]}</button>`).join("")}${i>0?`<button class="iarb x" data-ia="need" data-i="${i}" data-r="" ${IA.needs[i]?"":"disabled"}>✕</button>`:""}</div></div>`).join("")}
  <button class="iaany" data-ia="any" aria-pressed="${IA.any}"><b>Indifferente</b><small>Nessuna preferenza: valuta tutti i ruoli</small></button><button class="iago" data-ia="go" data-s="2" ${ok1?"":"disabled"}>Avanti · cosa offri ›</button></div>`}
 else if(!pl&&st===2){body=`<div class="iabox"><h4>Cosa sei disposto a dare?</h4><p class="iasub">Tocca i giocatori di cui ti vuoi liberare: l'app userà solo quelli che servono. In questa lega non ci sono regole di ruolo.</p><div class="iaros">${ros(me,"give")}</div>${ok2?"":`<p class="iaerr">Scegli almeno un giocatore da offrire.</p>`}<div class="iabtn2"><button class="iabk" data-ia="go" data-s="1">‹ Indietro</button><button class="iago" data-ia="go" data-s="3" ${ok2?"":"disabled"}>Avanti · squadre ›</button></div></div>`}
 else{body=`<div class="iabox"><h4>Quante squadre coinvolgo?</h4>${nSel}<h4>Che guadagno cerchi?</h4>${lvSel}<div class="iabtn2"><button class="iabk" data-ia="go" data-s="2">‹ Indietro</button><button class="iago" data-ia="find">Trova scambi ›</button></div></div>${st===4?iaResHTML():""}`}
 return H+modeBar+bar+body}
window.TRADEV={val:vVal,calc:vCalc,ia:vIaNew};
(window.NAVX=window.NAVX||[]).push({k:"ia",get:()=>({mode:IA.mode,st:IA.st,vt:VT.tab}),set:o=>{IA.mode=o.mode;IA.st=o.st;VT.tab=o.vt}});
document.addEventListener("click",ev=>{const c=ev.target.closest("[data-vt],[data-ia]");if(!c||!(cur==="calc"||cur==="ia"))return;const d=c.dataset;ev.preventDefault();
 if(d.vt){const T2=tms();
  if(d.vt==="tab"){VT.tab=d.k}
  else if(d.vt==="clr"){VT.it=[]}
  else if(d.vt==="rm"){const x=VT.it.find(y=>y.id===d.id);if(x&&T2.length>2&&!ev.target.closest("i")){const k=T2.indexOf(x.to);let nx=(k+1)%T2.length;if(T2[nx]===x.from)nx=(nx+1)%T2.length;x.to=T2[nx]}else VT.it=VT.it.filter(y=>y.id!==d.id)}
  else if(d.vt==="pl"||d.vt==="pk"){const k=+d.k,t=T2[k],to=T2[(k+1)%T2.length];
   if(d.vt==="pl"){const id="pl|"+d.n;if(VT.it.some(y=>y.id===id))VT.it=VT.it.filter(y=>y.id!==id);else VT.it.push({id,ty:"pl",n:d.n,from:t,to})}
   else{const i=+d.i,p=CAP[t].pk[i],id="pk|"+t+"|"+i;if(VT.it.some(y=>y.id===id))VT.it=VT.it.filter(y=>y.id!==id);else VT.it.push({id,ty:"pk",p,pi:i,from:t,to})}}
  vtSave();const y=scrollY;render();scrollTo(0,y);return}
 const k=d.ia;
 if(k==="mode"){IA.mode=d.k;IA.st=1;IA.res=null}
 else if(k==="go"){IA.st=+d.s;IA.res=null}
 else if(k==="need"){const i=+d.i;IA.needs[i]=d.r||null;if(!d.r)for(let j=i;j<3;j++)IA.needs[j]=null;IA.any=false}
 else if(k==="any"){IA.any=!IA.any;if(IA.any)IA.needs=[null,null,null]}
 else if(k==="give"||k==="keep"){const L=IA[k];IA[k]=L.includes(d.n)?L.filter(x=>x!==d.n):[...L,d.n];IA.res=null}
 else if(k==="want"){IA.want=IA.want.includes(d.n)?IA.want.filter(x=>x!==d.n):IA.want.length<3?[...IA.want,d.n]:IA.want}
 else if(k==="tf"){IA.tf=d.t;IA.q=""}
 else if(k==="n"){IA.n=+d.n;IA.res=null}
 else if(k==="lv"){IA.lv=d.k;IA.res=null}
 else if(k==="find"){IA.res=iaFind();IA.st=4}
 else if(k==="regusti"){IA.res=null}
 else if(k==="open"){const o=IA.res&&IA.res[+d.i];if(o){const teams=o.teams;VT.tab=teams.length===3?"calc3":"calc";if(teams.length===2)VT.t=teams.slice();else VT.t3=[...teams,...VT.t3.filter(t=>!teams.includes(t))].slice(0,4);VT.it=o.I.map(x=>({...x,id:x.ty==="pl"?"pl|"+x.n:"pk|"+x.from+"|"+x.pi}));vtSave();cur="calc";render();scrollTo(0,0);return}}
 iaSave();const y=scrollY;render();if(k==="find"){const r=document.querySelector(".iares");if(r)r.scrollIntoView({block:"start"})}else scrollTo(0,y)},true);
document.addEventListener("change",ev=>{const t=ev.target;if(t.dataset.vtsel!=null&&(cur==="calc")){const k=+t.dataset.vtsel;if(VT.tab==="calc"){VT.t[k]=t.value;if(VT.t[0]===VT.t[1])VT.t[1-k]=TEAMS.find(x=>x.id!==t.value).id}else VT.t3[k]=t.value;VT.it=[];vtSave();render()}
 if(t.dataset.iasel&&cur==="ia"){IA.me=t.value;IA.give=[];IA.keep=[];IA.want=IA.want.filter(n=>ownerOf(n)!==t.value);IA.res=null;iaSave();render()}});
document.addEventListener("input",ev=>{const t=ev.target;if(t.id==="vtq"&&cur==="calc"){VT.q=t.value;const p=t.selectionStart;render();const i=document.getElementById("vtq");i.focus();try{i.setSelectionRange(p,p)}catch(_){}}
 if(t.id==="iaq"&&cur==="ia"){IA.q=t.value;const p=t.selectionStart;render();const i=document.getElementById("iaq");i.focus();try{i.setSelectionRange(p,p)}catch(_){}}});
document.addEventListener("change",ev=>{if(ev.target.dataset.tg){T.tg=ev.target.value;save();render()}});
document.addEventListener("input",ev=>{if(ev.target.id==="tvq"){T.q=ev.target.value;save();const p=ev.target.selectionStart;render();const i=document.getElementById("tvq");i.focus();try{i.setSelectionRange(p,p)}catch(_){}}});
})();
