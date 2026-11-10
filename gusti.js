/* ===== ESPN 16 – IA TRADE CON I GUSTI DEI GM (Scambi › IA Trade), copia strutturale dell IA Trade di Dreamers (modulo GUSTI) =====
   Pagine: ingresso (tasto «IA Trade» + nota informativa «I gusti dei GM»), «scopri» (scheda di ogni squadra), «ia» (la ricerca).
   Ricerca: scambi fino a 6 squadre «a ragnatela»: lo scambio è un insieme di GIRI (A→B→C→A): in ogni giro ogni squadra dà un giocatore
   alla successiva, così ogni squadra riceve tanti giocatori quanti ne dà e la rosa resta di 17 (ESPN 16 non ha regole di ruolo: un giro
   può mescolare guardie, ali e centri). Ogni squadra dice sì con una probabilità (logistica del suo profilo: vantaggio % sul valore,
   età, ruoli e giocatori che piacciono o no, situazione della squadra); la proposta vale il prodotto delle probabilità («si chiude al»).
   Le squadre senza report dell Allenamento IA usano il gusto medio della lega («stima»). Controllo del salary cap (190) come nel Calcolatore.
   Profili: gusti-data.js (GM_GUSTI, GM_DESCR, GM_K). Valori: valori-data.js (VAL), come trade.js. */
(function(){
if(typeof TEAMS==="undefined")return;
const GU={page:null,team:null,mode:"sell",target:null,q:"",role:"C",minv:900,maxk:4,keep:new Set(),sell:new Set(),buy:null,res:null,busy:false,info:false,gusti:true};window.GU=GU;
const E=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const RN={G:"guardia",F:"ala",C:"centro"},RP={G:"Guardie",F:"Ali",C:"Centri"};
const TID=TEAMS.map(t=>t.id),NK=t=>TM[t]?TM[t].nome.split(" ").slice(-1)[0]:t;
const badge=t=>`<span class="badge logo lg-${t}" role="img" aria-label="${E(NK(t))}"></span>`;
const H=(t,sub="",bk="")=>`${bk}<h2><span class="t"><span>${t}</span></span>${sub}</h2>`;
/* ---------- dati della lega (stesse convenzioni di trade.js) ---------- */
const nk=n=>String(n||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[.'’]/g,"").replace(/\s+(jr|sr|ii|iii|iv)$/,"").trim();
const VK={};if(typeof VAL!=="undefined")for(const n in VAL.p)VK[nk(n)]=n;
const vRow=n=>{const k=VK[nk(n)];return k?VAL.p[k]:null};
const valOf=n=>{const r=vRow(n);return r?r[0]:0};
const nmAb=n=>{const p=String(n).trim().split(/\s+/);return p.length<2?n:p[0].charAt(0)+". "+p.slice(1).join(" ")};
const OWN={},ROL={};for(const t in ROSE)for(const g of ROSE[t]){OWN[g[0]]=t;const a=String(g[3]||"").split(",")[0];ROL[g[0]]=a==="C"?"C":/G/.test(a)?"G":"F"}
const iaOwner=n=>OWN[n]||"";
const ruoloDi=n=>ROL[n]||"F";
const iaAge=n=>{try{const a=etaOf(n);if(a!=null)return a}catch(e){}const r=vRow(n);return r&&r[2]!=null?r[2]:null};
/* infortuni ESPN (espn-data.js): fuori = «Out»; vale meno in base a quanto manca al rientro */
const INJK={};try{for(const x of (ESPN.inj||[]))INJK[nk(x[0])]=x}catch(e){}
const iaOut=n=>{const x=INJK[nk(n)];return!!(x&&/out/i.test(x[2]))};
const iaOutF=n=>{const x=INJK[nk(n)];if(!x||!x[5])return .75;const d=(Date.parse(x[5])-Date.now())/864e5;return d<=7?.95:d<=21?.88:d<=45?.8:.7};
/* stipendi 26/27 per il controllo del cap */
const SAL={};try{for(const t in CAP)for(const p of CAP[t].pl)SAL[t+"|"+nk(p[0])]=p[1][0]||0}catch(e){}
const sal=(t,n)=>SAL[t+"|"+nk(n)]||0;
const capBase=t=>{const C=(typeof CAP!=="undefined")&&CAP[t];return C?(C.occ[0]||0)+(C.tagli||0):0};
const CAPT=typeof CAP_TOT!=="undefined"?CAP_TOT:190;
/* punti trade come il Calcolatore: (valore/1000)^1,4 × 1000; pacchetto: i riempitivi contano poco rispetto al pezzo migliore */
const vtPts=v=>Math.pow(Math.max(0,v)/1000,1.4)*1000;
const pkK=vtop=>3*Math.min(1,Math.max(0,(vtop-1000)/300));
const pkgPts=(ps,vtop)=>{ps=ps.filter(p=>p>0).sort((a,b)=>b-a);if(!ps.length)return 0;const m=ps[0],k=vtop==null?2:pkK(vtop);return ps.reduce((s,p)=>s+p*Math.pow(p/m,k),0)};
const myT=()=>GU.team&&TM[GU.team]?GU.team:"QUE";
const pool=t=>(ROSE[t]||[]).map(g=>g[0]).filter(n=>valOf(n)>0);
const teamOrd=()=>TID.slice();
/* AVG di riferimento: stagione in corso pesata sulle partite giocate (g/(g+15)), il resto dall anno scorso */
function gmForm(n){const r=vRow(n);if(!r)return{f:0,g:0};const g=r[6]||0,c=r[7]||0,p=r[5]||r[1]||0,w=g/(g+15);return{f:g?w*c+(1-w)*p:p,g}}
/* ---------- profilo medio della lega per chi non ha ancora mandato report ---------- */
function profAvg(){const L=Object.values(GM_GUSTI);if(!L.length)return{age:1,req:3,sc:GM_K.sc,role:{G:0,F:0,C:0},pl:{},stima:1};
  const m=f=>L.reduce((a,g)=>a+f(g),0)/L.length;return{age:m(g=>g.age||0),req:m(g=>g.req||0),sc:m(g=>g.sc||GM_K.sc),role:{G:m(g=>(g.role||{}).G||0),F:m(g=>(g.role||{}).F||0),C:m(g=>(g.role||{}).C||0)},pl:{},stima:1}}
let PA=null,VX={},AX={};
/* «Usa i gusti dei GM» spento = solo i valori ufficiali del Calcolatore (nessun gusto, vantaggio chiesto 0) */
const NEUT={age:0,req:0,sc:12.5,role:{G:0,F:0,C:0},pl:{}};
const prof=t=>GU.gusti===false?NEUT:(GM_GUSTI[t]||PA||profAvg());
/* ---------- SITUAZIONE DI SQUADRA (come Dreamers): età media dei 14 migliori pesata sul valore, quota di valore under 23,
   giovani di potenziale (≤22 e valore ≥ 900). Squadra giovane = costruisce (l età pesa di più, cedere un giovane costa);
   squadra esperta = vuole vincere subito (l età pesa meno, conta l AVG di questa stagione). ---------- */
const GM_SITC={};
function gmSit(t){if(GM_SITC[t])return GM_SITC[t];const R=(ROSE[t]||[]).map(g=>({n:g[0],v:valOf(g[0]),a:iaAge(g[0])??26})).sort((x,y)=>y.v-x.v);
  const top=R.slice(0,14),sv=top.reduce((a,x)=>a+x.v,0)||1,eta=top.reduce((a,x)=>a+x.v*x.a,0)/sv,tv=R.reduce((a,x)=>a+x.v,0)||1,giov=R.filter(x=>x.a<23).reduce((a,x)=>a+x.v,0)/tv;
  const pot=R.filter(x=>x.a<23&&x.v>=900).map(x=>x.n);
  const tipo=eta<=24.3||giov>=.45?"giovane":eta>=27.5?"esperta":"mista";
  const ka=Math.max(-1.5,Math.min(2.5,(26-eta)*.8)),kp=Math.max(0,Math.min(8,giov*14));
  const kw=tipo==="esperta"?.3:tipo==="mista"?.15:0;
  let pos=null;try{pos=seeds().findIndex(x=>x.id===t)+1||null}catch(e){}
  const all=TID.map(u=>({u,v:(ROSE[u]||[]).reduce((a,g)=>a+valOf(g[0]),0)})).sort((x,y)=>y.v-x.v),rv=all.findIndex(x=>x.u===t)+1;
  return GM_SITC[t]={eta,giov,pot,tipo,ka,kp,kw,pos,rv}}
/* termine di situazione nel punteggio: età (ka) e giovani di potenziale (kp) sul pacchetto, pesati sulla quota di valore; chi vuole vincere guarda l AVG di oggi */
function gmSitG(t,give,get,vf,af,ga){try{const S=gmSit(t),tg=(()=>{try{return gmCtx(t).AP.tight}catch(e){return 0}})(),ka=(S.ka<0?Math.max(S.ka,-Math.max(0,ga||0)):S.ka)*(1-.5*tg);
  const sh=L=>{const s=L.reduce((a,n)=>a+vf(n),0)||1;return n=>vf(n)/s},ag=L=>{const s=L.reduce((a,n)=>a+vf(n),0)||1;return L.reduce((a,n)=>a+vf(n)*af(n),0)/s};
  const yg=n=>{const a=af(n);return a<=22?1:a<=24?.5:0};const sg=sh(give),sr=sh(get);
  const pot=get.reduce((a,n)=>a+yg(n)*sr(n),0)*S.kp*.5-give.reduce((a,n)=>a+yg(n)*sg(n),0)*S.kp;
  let rc=1;try{rc=.4+.6*gmCtx(t).race}catch(e){}
  const rot=L=>L.reduce((a,n)=>{const f=gmForm(n).f;return a+(f>=20?f:0)},0),wn=S.kw*rc*(rot(get)-rot(give))*.4;
  return Math.max(-25,Math.min(20,-ka*(ag(get)-ag(give))+pot+wn))}catch(e){return 0}}
/* ---------- CONTESTO DI SQUADRA (si ricalcola a ogni apertura): corsa al titolo (classifica + forza dei 14 migliori per AVG in forma),
   linea d età (percentili 15–85 dei giocatori veri, pesati con la radice del valore), rifondazione, infortunati. ---------- */
const GM_CTXC={};
function gmWq(L,q){const s=L.reduce((a,x)=>a+x.w,0);let c=0;for(const x of L){c+=x.w;if(c>=q*s)return x.a}return L.length?L[L.length-1].a:26}
function gmAgeProf(t){const L=(ROSE[t]||[]).filter(g=>valOf(g[0])>=300).map(g=>({n:g[0],a:iaAge(g[0])??26,w:Math.sqrt(valOf(g[0]))})).sort((x,y)=>x.a-y.a);
  const lo=gmWq(L,.15),hi=gmWq(L,.85),med=gmWq(L,.5),wd=hi-lo,tight=Math.max(0,Math.min(1,(9-wd)/5));
  const fuori=tight>=.3?L.filter(x=>x.a>hi+2.5&&x.a>=26).map(x=>x.n):[];return{lo,hi,med,wd,tight,fuori,dir:0,ntr:0}}
function gmCtx(t){if(GM_CTXC[t])return GM_CTXC[t];const S=gmSit(t),R=(ROSE[t]||[]).map(g=>g[0]);
  const outs=R.filter(n=>iaOut(n)).filter(n=>gmForm(n).f>=25);
  const str=TID.map(u=>({u,v:(ROSE[u]||[]).map(g=>gmForm(g[0]).f).sort((a,b)=>b-a).slice(0,14).reduce((a,x)=>a+x,0)})).sort((x,y)=>y.v-x.v),rs=str.findIndex(x=>x.u===t)+1,N=str.length||16;
  const r=(typeof REC!=="undefined"&&REC[t])||{w:0,l:0},played=(r.w||0)+(r.l||0);
  const wp=Math.min(.8,played/Math.max(1,16*.6)),ps=S.pos?(N-S.pos)/(N-1):.5,ss=(N-rs)/(N-1),race=wp*ps+(1-wp)*ss;
  const corsa=race>=.6?"in corsa per il titolo":race>=.35?"può giocarsela":"fuori dalla corsa al titolo";
  const AP=gmAgeProf(t),old=Math.max(0,Math.min(1,(AP.med-24.5)/3)),rif=S.tipo==="giovane"?1:Math.max(0,Math.min(1,(.45-race)/.45))*Math.max(.25,old)*Math.min(1,.4+played/6);
  return GM_CTXC[t]={race,corsa,rs,outs,played,AP,rif}}
/* termine di contesto: linea d età (chi è più vecchio della linea vale meno, i fuori linea si cedono volentieri) + rifondazione */
function gmCtxG(t,give,get,vf){const why=[],af0=n=>iaAge(n)??26;try{const C=gmCtx(t);
  const sh=L=>{const s=L.reduce((a,n)=>a+vf(n),0)||1;return n=>vf(n)/s},sg=sh(give),sr=sh(get);let ve=0;const AP=C.AP;
  if(AP){let pen=0;get.forEach(n=>{const d=Math.max(0,af0(n)-AP.hi);if(d>0)pen+=AP.tight*(8*d+d*d)*sr(n)});
    pen=Math.min(30,pen);if(pen>=3)why.push(`fuori dalla sua linea d'età (${Math.round(AP.lo)}–${Math.floor(AP.hi)} anni)`);ve-=pen;
    let fo=0;give.forEach(n=>{if(AP.fuori.includes(n)){fo+=(4+6*AP.tight)*sg(n);why.push(`cede volentieri ${nmAb(n)}, fuori dalla sua linea d'età`)}});ve+=Math.min(9,fo)}
  if(C.rif>0&&gmSit(t).tipo!=="giovane"){let rv=0;give.forEach(n=>{if(af0(n)>=29)rv+=8*C.rif*sg(n)});get.forEach(n=>{const a=af0(n);if(a>=29)rv-=6*C.rif*sr(n);else if(a<=23&&vf(n)>=700)rv+=4*C.rif*sr(n)});
    if(rv>=3)why.push(`fuori dalla corsa: pensa a rifondare (${Math.round(C.rif*100)}%)`);ve+=Math.max(-8,Math.min(8,rv))}
  return{v:Math.max(-40,Math.min(18,ve)),why}}catch(e){return{v:0,why}}}
/* una stella per 2-3 giocatori medi: praticamente nessun GM la cede (chi rifonda sì, se riceve un giovane da 900+) */
function gmStarG(give,get,vf){try{const top=Math.max(0,...give.map(vf)),all=Math.max(0,...give.concat(get).map(vf));if(!top||top<all||get.length<2||top<700)return 0;if(get.some(n=>vf(n)>=.85*top))return 0;return-12*(get.length-1)}catch(e){return 0}}
function gmStarRif(t,get,vf,st){try{if(st<0&&gmCtx(t).rif>=.5&&get.some(n=>(iaAge(n)??26)<=23&&vf(n)>=900))return st/3}catch(e){}return st}
/* le squadre giovani non sono «contente di lasciare» i loro giovani di potenziale */
function gmPlOwn(t,n,b){try{const S=gmSit(t);if(b<0&&S.tipo==="giovane"&&S.pot.includes(n))return 0}catch(e){}return b}
const vx=n=>VX[n]??(VX[n]=(()=>{let v=valOf(n);try{if(iaOut(n))v*=iaOutF(n)}catch(e){}return v})());
const ax=n=>AX[n]??(AX[n]=(iaAge(n)??26));
/* gusto della squadra t: punteggio e probabilità di dire sì */
function gsc(t,give,get){const G=prof(t),vt=Math.max(0,...give.concat(get).map(n=>vx(n))),vg=pkgPts(give.map(n=>vtPts(vx(n))),vt),vr=pkgPts(get.map(n=>vtPts(vx(n))),vt);
  const ag=L=>{const s=L.reduce((a,n)=>a+vx(n),0)||1;return L.reduce((a,n)=>a+vx(n)*ax(n),0)/s};
  const d=(vr-vg)/Math.max(vg,vr,1)*100,ea=-(G.age||0)*(ag(get)-ag(give));let ro=0,pp=[];
  get.forEach(n=>{ro+=((G.role||{})[ruoloDi(n)]||0)/get.length;const b=(G.pl||{})[n];if(b)pp.push([n,b,1])});give.forEach(n=>{let b=gmPlOwn(t,n,(G.pl||{})[n]||0);if(b<0&&d<-5)b*=Math.max(0,1+(d+5)/15);if(Math.abs(b)>=1)pp.push([n,-b,0])});
  const ps=pp.reduce((a,x)=>a+x[1],0),si0=GU.gusti===false?0:gmSitG(t,give,get,vx,ax,G.age),st=GU.gusti===false?0:gmStarRif(t,get,vx,gmStarG(give,get,vx)),cx=GU.gusti===false?{v:0,why:[]}:gmCtxG(t,give,get,vx),si=si0+st+cx.v,g=d+ea-(G.req||0)+ro+si+Math.max(-20,Math.min(20,ps));
  return{p:1/(1+Math.exp(-g/(G.sc||GM_K.sc))),d,ea,ro,pp,si,si0,st,cx}}
/* ---------- ricerca ---------- */
const rnd=a=>a[Math.random()*a.length|0];
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
function buildIO(D){const io={};D.T.forEach(t=>io[t]={give:[],get:[]});const mv=[];
  D.cy.forEach(c=>c.seq.forEach((t,i)=>{const to=c.seq[(i+1)%c.seq.length],n=c.pl[i];mv.push({n,from:t,to,fix:c.fix&&i===0});io[t].give.push(n);io[to].get.push(n)}));return{io,mv}}
function evalDeal(D){const{io,mv}=buildIO(D);
  if(mv.length>Math.max(4,2*D.T.length+1))return null;/* scambi leggibili: al massimo 3 giocatori dati per squadra */
  for(const t of D.T){const x=io[t];if(!x.give.length||!x.get.length||x.give.length>3)return null;
    /* salary cap: dopo lo scambio non si può sforare (chi è già sopra non può salire) */const b=capBase(t),a=b-x.give.reduce((s,n)=>s+sal(t,n),0)+x.get.reduce((s,n)=>s+sal(iaOwner(n),n),0);if(a>CAPT+1e-9&&a>b)return null;
    /* (44) regola dei 3 under 25: nessuna squadra può scendere sotto i 3 under 25 */if(window.e16U25Fail&&e16U25Fail([...x.give.map(n=>({ty:"pl",n,from:t,to:""})),...x.get.map(n=>({ty:"pl",n,from:"",to:t}))],t)!=null)return null}
  if(new Set(mv.map(m=>m.n)).size!==mv.length)return null;
  if(GU.mode==="sell"){const A=myT();if(io[A]&&io[A].give.some(n=>!GU.sell.has(n)))return null}
  let P=1;const S={};for(const t of D.T){const r=gsc(t,io[t].give,io[t].get);if(r.d<-45)return null;
    /* niente «regali» per far quadrare il giro: in uno scambio a 3+ una squadra esterna non può guadagnare oltre il 45% e oltre 300 punti di valore */
    if(D.T.length>2&&t!==myT()&&r.d>45){const sv=L=>L.reduce((a,n)=>a+vx(n),0);if(sv(io[t].get)-sv(io[t].give)>300)return null}
    S[t]=r;P*=r.p}
  return{P,S,io,mv}}
function search(){const A=myT(),others=TID.filter(t=>t!==A),maxk=Math.max(2,Math.min(6,GU.maxk));PA=profAvg();VX={};AX={};
  /* P[t] = giocatori scambiabili; «Cedo»: se ne scegli qualcuno, la tua squadra cede solo quelli */
  const P={};TID.forEach(t=>{P[t]=pool(t).filter(n=>!(t===A&&GU.keep.size&&!GU.keep.has(n)))});
  let tg=null,need=null;const SELL=GU.mode==="sell"?[...GU.sell].filter(n=>iaOwner(n)===A):null;if(SELL&&!SELL.length)return[];
  if(GU.mode==="pl"){tg=GU.target;if(!tg||!iaOwner(tg)||iaOwner(tg)===A)return[]}else if(!SELL)need={r:GU.role,v:+GU.minv||0};
  const BUY={};
  const cand=need?others.flatMap(t=>P[t].filter(n=>ruoloDi(n)===need.r&&vx(n)>=need.v).map(n=>({n,t}))):[];if(need&&!cand.length)return[];
  const used=D=>new Set(D.cy.flatMap(c=>c.pl));
  /* un giro sulla sequenza di squadre seq (ognuna dà alla successiva); fixN = giocatore obbligato del primo. Nessuna regola di ruolo. */
  const mkCycle=(seq,U,fixN)=>{const pl=[];for(let i=0;i<seq.length;i++){if(i===0&&fixN){pl.push(fixN);continue}const L=P[seq[i]].filter(n=>!U.has(n)&&!pl.includes(n));if(!L.length)return null;pl.push(rnd(L))}return{seq,pl,fix:!!fixN}};
  const best=new Map(),t0=performance.now();let it=0;
  while(performance.now()-t0<2200&&it<12000){it++;
    const k=2+Math.floor(Math.pow(Math.random(),1.3)*(maxk-1));
    let T,D;
    if(SELL){/* CESSIONE: A dà i giocatori scelti (uno o più, da soli o insieme) a uno o più acquirenti, che ricambiano anche passando da altre squadre */
      const ss=shuffle(SELL.slice()).slice(0,1+(Math.random()*SELL.length|0));const b0=others[it%others.length];
      T=[A,b0];shuffle(others.filter(t=>t!==b0)).slice(0,k-2).forEach(t=>T.push(t));D={T,cy:[]};let bad=false;
      ss.forEach((n,j)=>{if(bad)return;const by=j===0?b0:rnd(T.filter(t=>t!==A));const mid=shuffle(T.filter(t=>t!==A&&t!==by)).slice(0,Math.random()*(T.length-1)|0);
        const c=mkCycle([A,by,...mid],new Set(D.cy.flatMap(c=>c.pl)),n);if(!c)bad=true;else D.cy.push(c)});if(bad)continue}
    else{const f=tg?{n:tg,t:iaOwner(tg)}:rnd(cand);
      T=[A,f.t];shuffle(others.filter(t=>t!==f.t)).slice(0,k-2).forEach(t=>T.push(t));
      /* giro obbligato: il proprietario dà il giocatore cercato ad A, poi il giro torna al proprietario */
      const mid=shuffle(T.filter(t=>t!==A&&t!==f.t)).slice(0,Math.random()*(T.length-1)|0);
      D={T,cy:[]};const c0=mkCycle([f.t,A,...mid],new Set(),f.n);if(!c0)continue;D.cy.push(c0)}
    /* chi non è ancora coinvolto entra con un altro giro, anche in direzione diversa: è la ragnatela */
    let ok=true;for(let g=0;g<6;g++){const inv=new Set(D.cy.flatMap(c=>c.seq)),miss=T.filter(t=>!inv.has(t));if(!miss.length)break;
      const t=miss[0],pals=shuffle(T.filter(u=>u!==t)).slice(0,1+(Math.random()<.4?1:0)),c=mkCycle(shuffle([t,...pals]),used(D));if(c)D.cy.push(c);else if(g===5)ok=false}
    if(!ok)continue;let R=evalDeal(D),cur2=D;
    for(let s=0;s<40;s++){const D2={T,cy:cur2.cy.map(c=>({...c,seq:c.seq.slice(),pl:c.pl.slice()}))},op=Math.random(),U=used(D2);
      if(op<.5){/* cambio giocatore della stessa squadra */const c=rnd(D2.cy),i=Math.random()*c.seq.length|0;if(c.fix&&i===0)continue;const L=P[c.seq[i]].filter(n=>!U.has(n));if(!L.length)continue;c.pl[i]=rnd(L)}
      else if(op<.75){/* nuovo giro corto */const seq=shuffle(T.slice()).slice(0,2+(Math.random()<.3?1:0)),c=mkCycle(seq,U);if(!c)continue;D2.cy.push(c)}
      else{/* togli un giro non obbligato */const fr=D2.cy.filter(c=>!c.fix);if(!fr.length)continue;const c=rnd(fr);D2.cy=D2.cy.filter(x=>x!==c)}
      const R2=evalDeal(D2);if(R2&&(!R||R2.P>R.P)){cur2=D2;R=R2}}
    if(!R)continue;const key=R.mv.map(m=>m.n+">"+m.to).sort().join("|");if(!best.has(key))best.set(key,{D:{T,mv:R.mv},R});
    if(SELL){const sold=R.io[A].give.filter(n=>SELL.includes(n)).sort();if(sold.length){const ck=sold.join(" + "),dk=key,G=BUY[ck]=BUY[ck]||{};if(!G[dk])G[dk]={P:R.P,x:{D:{T,mv:R.mv},R}}}}}
  GU.iter=it;GU.buy=SELL?BUY:null;const all=[...best.values()].sort((a,b)=>b.R.P-a.R.P).filter((x,i,a)=>a.slice(0,i).filter(y=>y.D.T.length===x.D.T.length&&y.D.mv.filter(m=>x.D.mv.some(z=>z.n===m.n)).length>=x.D.mv.length-1).length<2);
  /* vendita: un solo elenco ordinato per «si chiude al», con i giocatori venduti da soli e insieme (le 3 migliori per ogni gruppo) */
  if(SELL){const F=[];Object.values(BUY).forEach(G=>Object.values(G).sort((a,b)=>b.P-a.P).filter((o,i,a)=>a.findIndex(z=>z.x.D.T.slice().sort().join()===o.x.D.T.slice().sort().join())===i).slice(0,3).forEach(o=>F.push({D:o.x.D,R:o.x.R})));return F.sort((a,b)=>b.R.P-a.R.P).slice(0,20)}
  const pick=new Set(all.slice(0,6));for(let k=3;k<=maxk;k++)all.filter(x=>x.D.T.length===k).slice(0,2).forEach(x=>pick.add(x));return[...pick].sort((a,b)=>b.R.P-a.R.P).slice(0,16)}
/* perché: la ragione principale per ogni squadra */
function why(t,r){const f=v=>(v>0?"+":"")+Math.round(v);const L=[];
  L.push(r.d>=0?`guadagna ${f(r.d)}% di valore`:`perde ${Math.round(-r.d)}% di valore`);
  if(Math.abs(r.ea)>=3)L.push(r.ea>0?"ringiovanisce":"invecchia la rosa");
  if(Math.abs(r.ro)>=2)L.push(r.ro>0?"riceve il ruolo che preferisce":"riceve un ruolo che non ama");
  r.pp.sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,2).forEach(([n,b,inn])=>L.push(inn?(b>0?`gli piace ${nmAb(n)}`:`non ama ${nmAb(n)}`):(b>0?`è contento di lasciare ${nmAb(n)}`:`gli dispiace cedere ${nmAb(n)}`)));
  if(r.st)L.push("non dà il giocatore più forte per due o tre giocatori medi");
  if(r.cx&&r.cx.why)r.cx.why.slice(0,2).forEach(w=>L.push(w));
  if(Math.abs(r.si0||0)>=6){const S=gmSit(t);L.push(r.si0<0?(S.tipo==="giovane"?"squadra in ricostruzione: non vuole cedere i suoi giovani":"vuole vincere subito: perde AVG di questa stagione"):(S.tipo==="giovane"?"squadra in ricostruzione: le servono giovani":"vuole vincere subito: guadagna AVG di questa stagione"))}
  return L.join(" · ")}
const pc=p=>Math.round(p*100)+"%",cl=p=>p>=.6?"hi":p>=.4?"md":"lo";
function dealRows(x){const{D,R}=x,A=myT();
  return D.T.slice().sort((a,b)=>a===A?-1:b===A?1:0).map(t=>{const io=R.io[t],r=R.S[t],G=prof(t),from=n=>{const m=D.mv.find(m=>m.n===n);return m?m.from:""},to=n=>{const m=D.mv.find(m=>m.n===n);return m?m.to:""};
    return`<div class="gurow${t===A?" me":""}"><div class="guth">${badge(t)}<b>${E(NK(t))}</b>${G.stima?'<em class="gust">stima</em>':""}<span class="gup ${cl(r.p)}"><small>dice sì al</small> ${pc(r.p)}</span></div>
    <div class="guio"><div><small>Riceve</small>${io.get.map(n=>`<span class="gupl"><i class="rc ${ruoloDi(n)}"></i>${E(nmAb(n))} <em>da ${E(NK(from(n)))}</em></span>`).join("")}</div><div><small>Dà</small>${io.give.map(n=>`<span class="gupl"><i class="rc ${ruoloDi(n)}"></i>${E(nmAb(n))} <em>a ${E(NK(to(n)))}</em></span>`).join("")}</div></div>
    <p class="guwhy">${E(why(t,r))}</p></div>`}).join("")}
/* proposta chiusa: numero e «lo scambio si chiude al»; aperta: squadra per squadra chi riceve e chi dà */
function card(x,i){const{R}=x;
  return`<details class="gucard"><summary class="gusm"><span class="gun">#${i+1}</span><span class="gup ${cl(R.P)}" title="probabilità che dicano sì tutti"><small>lo scambio si chiude al</small> ${pc(R.P)}</span><i class="gubx" aria-hidden="true">▾</i></summary>${dealRows(x)}</details>`}
/* ---------- schede dei gusti di ogni squadra ---------- */
function gmSitHtml(t){const S=gmSit(t),f1=x=>(Math.round(x*10)/10).toString().replace(".",",");
  const tip={giovane:"Squadra giovane che costruisce: i giovani di potenziale li cede solo con un vantaggio netto e per un giocatore pronto ma più vecchio chiede di più",esperta:"Squadra esperta che vuole vincere subito: l'età pesa meno, conta la produzione di oggi",mista:"Rosa a metà strada: l'età pesa come nei report"}[S.tipo];
  let ctx="";try{const C=gmCtx(t),A=C.AP;ctx=`<p class="gmsitn"><b>Contesto di questa settimana.</b> ${C.corsa[0].toUpperCase()+C.corsa.slice(1)} (${C.rs}ª per AVG in forma${S.pos?`, ${S.pos}ª nel tabellone`:""}).${C.outs.length?` Fuori per infortunio: ${C.outs.map(nmAb).join(", ")}.`:""} Linea d'età ${Math.round(A.lo)}–${Math.floor(A.hi)} anni (${A.tight>=.6?"stretta: cerca giocatori dentro questa fascia":A.tight>=.3?"abbastanza stretta":"larga: prende giocatori di qualsiasi età"}).${A.fuori.length?` Fuori linea (li cede più volentieri): ${A.fuori.map(nmAb).join(", ")}.`:""}${C.rif>=.15&&S.tipo!=="giovane"?` Probabilità di rifondare: ${Math.round(C.rif*100)}%.`:""}</p>`}catch(e){}
  return`<div class="gmsit"><p><b>Situazione squadra.</b> ${tip}.</p><div class="gmnum"><div><small>Età media rosa</small><b>${f1(S.eta)}</b></div><div><small>Valore under 23</small><b>${Math.round(S.giov*100)}%</b></div><div><small>Rosa per valore</small><b>${S.rv}ª</b></div></div>
  <p class="gmsitn">${S.pot.length?`Giovani di potenziale: ${S.pot.map(E).join(", ")}. `:""}L'IA Trade aggiunge questa situazione ai gusti dei report: ${S.ka>=0?`l'età pesa ${f1(S.ka)} punti per anno in più`:`l'età pesa fino a ${f1(-S.ka)} punti per anno in meno (mai sotto zero)`}${S.kp?`; cedere un giovane fino a 22 anni costa ${f1(S.kp)} punti`:""}. In più nessuna squadra dà il suo giocatore più forte per due o tre giocatori medi.</p>${ctx}</div>`}
function gmScheda(t){const G=GM_GUSTI[t],D=GM_DESCR[t],f=v=>(v>0?"+":"")+(Math.round(v*10)/10).toString().replace(".",",");
  if(!G)return`<section class="gmsc nd">${badge(t)}<div><h4>${E(NK(t))}</h4><p class="gmnd">⏳ <b>Ancora da verificare.</b> I ${E(NK(t))} non hanno ancora mandato i report dell'Allenamento IA Trade: per ora nell'IA Trade usano il gusto medio della lega (segnati «stima»). Appena arrivano i report, qui compariranno cosa cercano e come trattano.</p></div></section>`;
  const aff=Math.round(Math.min(1,(G.n||0)/150)*100),pl=Object.entries(G.pl||{}),up=pl.filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,6),dn=pl.filter(x=>x[1]<0).sort((a,b)=>a[1]-b[1]).slice(0,6);
  const ro=["G","F","C"].map(r=>{const v=(G.role||{})[r]||0;return`<span class="gmro ${v>0?"su":v<0?"giu":""}">${RP[r]} ${v?f(v):"="}</span>`}).join("");
  return`<section class="gmsc">${badge(t)}<div><h4>${E(NK(t))}</h4><small>${D?E(D.rep||""):""} · aggiornato ${E(G.agg||"—")}</small>
  <div class="gmaff"><span>Affidabilità del profilo</span><b>${aff}%</b><i style="width:${aff}%"></i></div>${gmSitHtml(t)}
  ${D?`${D.cerca?`<p><b>Cosa cercano.</b> ${D.cerca}</p>`:""}${D.chiude&&D.chiude.length?`<p><b>Come chiudono gli scambi.</b></p><ul>${D.chiude.map(x=>`<li>${x}</li>`).join("")}</ul>`:""}${D.inf?`<p><b>Infortuni.</b> ${D.inf}</p>`:""}${D.nota?`<p><b>Nota.</b> ${D.nota}</p>`:""}${D.manca?`<p class="gmnd">⏳ ${D.manca}</p>`:""}`:""}
  <div class="gmnum"><div><small>Vantaggio chiesto</small><b>+${Math.round(G.req||0)}%</b></div><div><small>Età (punti per anno)</small><b>${f(G.age||0)}</b></div><div><small>Decisione</small><b>${(G.sc||GM_K.sc)<=9?"netta":(G.sc||GM_K.sc)<=13?"normale":"morbida"}</b></div></div>
  <div class="gmros">${ro}</div>
  ${up.length?`<p class="gmpl"><b>Li vogliono più dei nostri valori:</b> ${up.map(([n,v])=>`${E(nmAb(n))} <em class="su">${f(v)}%</em>`).join(", ")}</p>`:""}
  ${dn.length?`<p class="gmpl"><b>Li vogliono meno:</b> ${dn.map(([n,v])=>`${E(nmAb(n))} <em class="giu">${f(v)}%</em>`).join(", ")}</p>`:""}</div></section>`}
/* ---------- pagine ---------- */
const BK=`<button class="gback" data-go="home">‹ Home</button>`,BK2=l=>`<button class="gback iabk2" data-gu="page" data-v="">‹ ${l}</button>`;
function vGustiHome(){const T=teamOrd(),n=Object.keys(GM_GUSTI).length;
  return`${H("IA Trade",`<em>con i gusti dei GM</em>`,BK)}
  <div class="guhome"><button type="button" class="guia" data-gu="page" data-v="ia"><span class="guiai">🤖</span><b>IA Trade</b><i class="guiar">›</i></button>
  <button type="button" class="guinfo" data-gu="page" data-v="scopri"><span class="guinfi">ℹ️</span><span><b>I gusti dei GM</b><small>Nota informativa: cosa cerca ogni squadra · ${n} su ${T.length} squadre</small></span></button></div>`}
function vGustiScopri(){const T=teamOrd();
  return`${H("Gusti dei GM",`<em>${Object.keys(GM_GUSTI).length} su ${T.length} squadre</em>`,BK2("IA Trade"))}
  <p class="setnote">I numeri sono rispetto ai nostri valori: <b>+5%</b> vuol dire che quel GM vuole un giocatore il 5% più di quanto vale nel Calcolatore. <b>Vantaggio chiesto</b> = quanto deve guadagnare per dire sì metà delle volte. <b>Età</b> = quanti punti di valore toglie per ogni anno in più che riceve. <b>Affidabilità</b> = quanto pesa il profilo, cresce con i report dell'Allenamento IA Trade.</p>
  ${T.map(gmScheda).join("")}`}
function vGusti(){if(!GU.page)return vGustiHome();if(GU.page==="scopri")return vGustiScopri();const A=myT(),T=TID;
  const tch=T.map(t=>`<button type="button" class="guchip${t===A?" on":""}" data-gu="team" data-v="${t}" aria-pressed="${t===A}">${badge(t)}</button>`).join("");
  const q=nk(GU.q||""),list=GU.mode==="pl"?T.filter(t=>t!==A).flatMap(t=>pool(t).map(n=>({n,t}))).filter(x=>!q||nk(x.n).includes(q)||nk(NK(x.t)).includes(q)).sort((a,b)=>valOf(b.n)-valOf(a.n)).slice(0,q?40:16):[];
  const tgt=GU.target&&iaOwner(GU.target)&&iaOwner(GU.target)!==A?GU.target:null;
  const keep=pool(A).sort((a,b)=>valOf(b)-valOf(a)).map(n=>`<button type="button" class="guk${GU.keep.has(n)?" on":""}" data-gu="keep" data-v="${E(n)}">${GU.keep.has(n)?"💸 ":""}${E(nmAb(n))}</button>`).join("");
  const res=GU.res;
  return`${H("IA Trade",`<em>con i gusti dei GM</em>`,BK2("IA Trade"))}
  <section class="gubox"><h4>La tua squadra</h4><div class="gurowc">${tch}</div>
  <h4>Cosa vuoi fare</h4><div class="guseg"><button type="button" data-gu="mode" data-v="sell" class="${GU.mode==="sell"?"on":""}">Voglio vendere</button><button type="button" data-gu="mode" data-v="role" class="${GU.mode==="role"?"on":""}">Cerco ruolo</button><button type="button" data-gu="mode" data-v="pl" class="${GU.mode==="pl"?"on":""}">Cerco giocatore</button></div>
  ${GU.mode==="sell"?`<p class="setnote">Tocca i giocatori da vendere.</p><div class="gukeep">${pool(A).sort((a,b)=>valOf(b)-valOf(a)).map(n=>`<button type="button" class="guk${GU.sell.has(n)?" on":""}" data-gu="sell" data-v="${E(n)}">${GU.sell.has(n)?"💸 ":""}${E(nmAb(n))} <small>${valOf(n)}</small></button>`).join("")}</div>`
  :GU.mode==="pl"?`${tgt?`<div class="gutg">${badge(iaOwner(tgt))}<b>${E(tgt)}</b><small>${RN[ruoloDi(tgt)]} · ${E(NK(iaOwner(tgt)))} · valore ${valOf(tgt)}</small><button type="button" data-gu="untg">cambia</button></div>`:`<input class="vtq" id="guq" type="search" placeholder="🔍 Cerca il giocatore che vuoi" value="${E(GU.q||"")}" autocomplete="off"><div class="gulist">${list.map(x=>`<button type="button" class="guli" data-gu="tg" data-v="${E(x.n)}">${badge(x.t)}<span>${E(x.n)}<small>${RN[ruoloDi(x.n)]} · ${E(NK(x.t))}</small></span><b>${valOf(x.n)}</b></button>`).join("")}</div>`}`
  :`<div class="guseg">${["G","F","C"].map(r=>`<button type="button" data-gu="role" data-v="${r}" class="${GU.role===r?"on":""}">${RP[r]}</button>`).join("")}</div><label class="gumin">Valore minimo <select data-gu="minv">${[0,500,700,900,1100,1300,1600].map(v=>`<option value="${v}"${+GU.minv===v?" selected":""}>${v?v+"+":"qualsiasi"}</option>`).join("")}</select></label>`}
  <h4>Fino a quante squadre</h4><div class="guseg">${[2,3,4,5,6].map(k=>`<button type="button" data-gu="k" data-v="${k}" class="${GU.maxk===k?"on":""}">${k}</button>`).join("")}</div>
  <h4>Con che valori</h4><div class="guseg"><button type="button" data-gu="gs" data-v="1" class="${GU.gusti!==false?"on":""}">🎯 Usa i gusti dei GM</button><button type="button" data-gu="gs" data-v="0" class="${GU.gusti===false?"on":""}">📊 Valori ufficiali</button></div>
    ${GU.mode==="sell"?"":`<h4>Cedo <small>(tocca chi vorresti cedere; se non scegli nessuno l'IA può usare tutti)</small></h4><div class="gukeep">${keep}</div>`}
  <button type="button" class="gugo" data-gu="go"${GU.busy||(GU.mode==="pl"&&!tgt)||(GU.mode==="sell"&&!GU.sell.size)?" disabled":""}>${GU.busy?"⏳ Cerco tra migliaia di combinazioni…":res?"🔄 Cerca ancora (altre combinazioni)":"🔎 Cerca gli scambi"}</button></section>
  ${res?`<section class="gures"><h4>${res.length?`Le ${res.length} proposte più gradite`:"Nessuno scambio trovato"}</h4>${res.length?`<p class="setnote">Verde sopra 60%, giallo 40–60%, rosso sotto. Tocca una proposta per aprirla.</p>`:`<p class="setnote">Prova con più squadre, un valore minimo più basso o meno giocatori bloccati.</p>`}${res.map(card).join("")}</section>`:""}
  <p class="note">Ogni squadra coinvolta dice sì con una probabilità che dipende dai suoi gusti (report dell'Allenamento IA Trade) e dalla sua situazione: età della rosa, corsa al titolo, linea d'età, infortuni. Chi non ha ancora mandato report usa il gusto medio della lega («stima»). Gli scambi rispettano il salary cap di ${CAPT} e ogni squadra riceve tanti giocatori quanti ne dà.</p>`}
window.SCAMBIV=window.SCAMBIV||{};SCAMBIV.gusti=vGusti;
(window.NAVX=window.NAVX||[]).push({k:"gu",get:()=>({page:GU.page}),set:o=>{if(o&&"page" in o)GU.page=o.page}});
/* ---------- tocchi ---------- */
const keepY=()=>{const y=scrollY;render();scrollTo(0,y)};
/* dal menu si riparte dalla pagina d ingresso, come Dreamers */
document.addEventListener("click",e=>{const g=e.target.closest&&e.target.closest('[data-go="gusti"]');if(g)GU.page=null},true);
document.addEventListener("click",e=>{if(cur!=="gusti")return;const b=e.target.closest("[data-gu]");if(!b||b.tagName==="SELECT"||b.disabled)return;e.preventDefault();const a=b.dataset.gu,v=b.dataset.v;
  if(a==="page"){GU.page=v||null;render();scrollTo(0,0);return}
  if(a==="team"){GU.team=v;GU.keep=new Set();GU.sell=new Set();GU.res=null;if(GU.target&&iaOwner(GU.target)===v)GU.target=null;keepY()}
  else if(a==="mode"){GU.mode=v;GU.res=null;keepY()}else if(a==="tg"){GU.target=v;GU.q="";GU.res=null;keepY()}else if(a==="untg"){GU.target=null;GU.res=null;keepY()}
  else if(a==="role"){GU.role=v;GU.res=null;keepY()}else if(a==="k"){GU.maxk=+v;keepY()}
  else if(a==="keep"){GU.keep.has(v)?GU.keep.delete(v):GU.keep.add(v);keepY()}else if(a==="gs"){GU.gusti=v==="1";GU.res=null;GU.buy=null;keepY()}else if(a==="sell"){GU.sell.has(v)?GU.sell.delete(v):GU.sell.add(v);GU.res=null;keepY()}
  else if(a==="go"){GU.busy=true;keepY();setTimeout(()=>{try{GU.res=search()}catch(err){console.error(err);GU.res=[]}GU.busy=false;const y=scrollY;render();const r=document.querySelector(".gures");if(r)r.scrollIntoView({behavior:"smooth",block:"start"});else scrollTo(0,y)},40)}});
document.addEventListener("change",e=>{if(cur!=="gusti")return;const s=e.target;if(s.dataset&&s.dataset.gu==="minv"){GU.minv=+s.value;GU.res=null;keepY()}});
document.addEventListener("input",e=>{if(cur!=="gusti"||e.target.id!=="guq")return;GU.q=e.target.value;const pos=e.target.selectionStart;render();const n=document.getElementById("guq");if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(_){}}});
})();
