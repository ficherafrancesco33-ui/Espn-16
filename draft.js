/* ===== ESPN 16 – (57) SALA DRAFT =====
   Tre sezioni in una sala elegante:
   1) LOTTERY: le 8 squadre fuori dai playoff (oggi, dalla classifica: 6ª–8ª di ogni conference + le perdenti del play-in, che per ora sono le 5ª)
      si giocano le prime 3 scelte con i numeri del regolamento (dalla peggiore alla migliore 161, 161, 161, 143, 120, 103, 85, 66 su 1000;
      +10 numeri alla vincitrice del consolation ladder, da scegliere). «Gira»: palline che girano nell urna, escono la 1ª, la 2ª e la 3ª scelta,
      poi l ordine completo (4–8 le altre escluse in ordine inverso, 9–16 le squadre dei playoff in ordine inverso). Probabilità calcolate con 20.000 estrazioni.
   2) ROOKIE: i primi 60 del big board di Tankathon (rookie-data.js, aggiornato ogni domenica) con AVG a partita calcolato con la formula della lega
      (Tankathon non divide i rimbalzi: REB × 2,1), minuti, efficienza (AVG al minuto), AVG su 36 minuti e una breve analisi.
   3) SQUADRE: per ognuna delle 16 squadre le scelte di 1°, 2° e 3° giro anno per anno (CAP.pk), con valore (window.e16Pick) e protezioni/swap.
   Toccando un rookie si apre il suo profilo (cur="drpl", come la scheda giocatore): statistiche a partita e su 36 minuti, tiro, AVG, minuti,
   efficienza, grafico dell AVG (partita per partita dal game log di Tankathon o settimana per settimana dallo storico) e il Comparatore
   tra due rookie (cur="drcmp"). Trend ▲/▼: AVG rispetto alla settimana prima (storico settimanale ROOKIE.h, o il game log) e nella stagione.
   Pagine in SCAMBIV.draft / drpl / drcmp, tasto «Sala Draft» nella barra in alto. */
(function(){
const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const f1=v=>(Math.round(v*10)/10).toLocaleString("it-IT",{minimumFractionDigits:1,maximumFractionDigits:1});
/* (78) età al draft in evidenza: pastiglia colorata (fino a 19,5 verde, fino a 21 oro, oltre arancio/rosso) */
const ageB=a=>a?`<b class="dsage ${a<=19.5?"g":a<=21?"y":"o"}" title="Età al draft">${f1(a)} anni</b>`:"";
const nick=id=>TM[id]?TM[id].nome.split(" ").slice(-1)[0]:id;
const dei=id=>(/^[AEIOU]/i.test(nick(id))?"degli ":"dei ")+e(nick(id)),ai=id=>(/^[AEIOU]/i.test(nick(id))?"agli ":"ai ")+e(nick(id));/* (107) articoli: dei Ducks, degli Aliens */
const LOTT_N=[161,161,161,143,120,103,85,66];
const f2=v=>v.toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2});
const D={tab:"lot",cl:"",run:false,res:null,sort:"rk",dir:"d",q:"",pos:"",tm:null,pl:"",pa:"",pb:"",met:"f",per:"g"};
try{Object.assign(D,JSON.parse(localStorage.getItem("e16_draft")||"{}"),{run:false,res:null})}catch(_){}
const save=()=>{try{localStorage.setItem("e16_draft",JSON.stringify({tab:D.tab,cl:D.cl,sort:D.sort,dir:D.dir,pos:D.pos,met:D.met,per:D.per}))}catch(_){}};
/* ---------- chi va in lottery oggi ---------- */
function order(){const by=(a,b)=>(a.w-b.w)||(b.l-a.l)||(a.pf-b.pf);/* dalla peggiore alla migliore */
 const po=[],out=[];for(const c of ["E","W"]){const L=standings(c);/* migliore → peggiore */L.slice(0,4).forEach(t=>po.push(t));out.push(L[4],...L.slice(5))}
 const lot=out.filter(Boolean).sort(by),pl=po.sort(by);return{lot,pl}}
function nums(lot){return lot.map((t,i)=>LOTT_N[i]+(D.cl===t.id?10:0))}
/* probabilità di ogni posto (1–3) per le 8 squadre: 20.000 estrazioni */
let PC={k:"",p:null};function probs(lot){const k=lot.map(t=>t.id).join()+"|"+D.cl;if(PC.k===k)return PC.p;const N=nums(lot),P=lot.map(()=>[0,0,0,0]),R=20000;
 for(let r=0;r<R;r++){const left=lot.map((t,i)=>i),w=N.slice();for(let pk=0;pk<3;pk++){const tot=w.reduce((a,b)=>a+b,0);let x=Math.random()*tot,i=0;while(x>w[i]&&i<w.length-1){x-=w[i];i++}P[left[i]][pk]++;left.splice(i,1);w.splice(i,1)}}
 const p=P.map(a=>a.map(v=>v/R*100));PC={k,p};return p}
function draw(lot){const N=nums(lot),left=lot.slice(),w=N.slice(),win=[];for(let pk=0;pk<3;pk++){const tot=w.reduce((a,b)=>a+b,0);let x=Math.random()*tot,i=0;while(x>w[i]&&i<w.length-1){x-=w[i];i++}win.push(left[i]);left.splice(i,1);w.splice(i,1)}return{win,rest:left}}
const lg=(id,c="")=>`<span class="dslg ${c}" style="--tc:${TCOL[id]||"#334"}"><span class="badge logo lg-${id}"></span></span>`;
function vLot(){const{lot,pl}=order(),P=probs(lot),N=nums(lot);
 const drum=`<div class="dsdrum${D.run?" spin":""}" aria-hidden="true"><div class="dsglass"></div>${lot.map((t,i)=>`<span class="dsball" style="--i:${i};--tc:${TCOL[t.id]}"><span class="badge logo lg-${t.id}"></span></span>`).join("")}</div>`;
 const res=D.res;
 /* (107) chi sceglie davvero (scelte scambiate, swap e protezioni come in NBA: «Mayans (dai Ducks)») */
 let OW={};if(res&&res.shown>=1){try{const S={};[...res.win,...res.rest,...pl].forEach((t,i)=>S[t.id]=i+1);OW=window.e16PickOwners?e16PickOwners(2027,1,S):{}}catch(_){}}
 const via=(n,t)=>{const o=OW[n];return o&&o.own!==t.id?o:null};
 /* (107) suspense come in NBA: esce prima la 3ª, poi la 2ª, infine la 1ª */
 const vis=k=>res&&res.shown>=4-k,nextK=res&&res.shown<3?3-res.shown:0;
 const slots=[1,2,3].map(k=>{const t=vis(k)?res.win[k-1]:null,v=t?via(k,t):null;return `<div class="dsslot${t?" on":""}${D.run&&k===nextK?" next":""}${v?" via":""}"><i>${k}ª</i>${t?(v?`${lg(v.own,"big")}<b>${e(nick(v.own))}</b><small class="dsvia">scelta ${dei(t.id)} ${lg(t.id,"mini")}</small>`:`${lg(t.id,"big")}<b>${e(nick(t.id))}</b><small>${e(t.nome)}</small>`):`<b class="dsq">?</b>`}</div>`}).join("");
 const msg=D.run&&nextK?`<p class="dsmsg">🥁 E la <b>${nextK}ª scelta</b> del Draft 2027 va a…</p>`:"";
 const full=res&&res.shown>=3?[...res.win,...res.rest,...pl].map((t,i)=>{const v=via(i+1,t);return v?`<div class="dsord via${i<3?" top":""}" title="${e(v.txt||"")}"><i>${i+1}</i>${lg(v.own)}<span class="dsow"><b>${e(nick(v.own))}</b><small>${dei(t.id).replace(/^de/,"da")}</small></span></div>`:`<div class="dsord${i<3?" top":""}"><i>${i+1}</i>${lg(t.id)}<b>${e(nick(t.id))}</b><small>${t.w}-${t.l}${i<3?" · lottery":i<8?" · fuori playoff":" · playoff"}</small></div>`}).join(""):"";
 const viaL=res&&res.shown>=3?[...res.win,...res.rest,...pl].map((t,i)=>({n:i+1,t,v:via(i+1,t)})).filter(x=>x.v):[];
 return `<div class="dsbox"><h4 class="dsh">Lottery 2027 <small>prime 3 scelte tra le 8 escluse dai playoff</small></h4>
 ${drum}${msg}<div class="dsslots">${slots}</div>
 <div class="dsbtns"><button class="dsgo" data-ds="gira" ${D.run?"disabled":""}>🎱 ${res?"Rigira":"Gira"}</button>${res?`<button class="dsre" data-ds="reset">Azzera</button>`:""}</div>
 ${full?`<h4 class="dsh">Ordine del 1° giro <small>con questa estrazione</small></h4><div class="dsordl">${full}</div>`:""}
 ${viaL.length?`<h4 class="dsh">Scelte che cambiano squadra <small>scambi, swap e protezioni</small></h4><div class="dsvial">${viaL.map(x=>`<div class="dsviar"><i>${x.n}ª</i>${lg(x.t.id,"mini")}<span>la scelta ${dei(x.t.id).replace(/ (.*)$/," <b>$1</b>")} va ${ai(x.v.own).split(" ")[0]}</span>${lg(x.v.own,"mini")}<b>${e(nick(x.v.own))}</b>${x.v.txt?`<small>${e(x.v.txt)}</small>`:""}</div>`).join("")}</div>`:""}</div>
 <div class="dsbox"><h4 class="dsh">Le 8 squadre in lottery <small>classifica di oggi</small></h4>
 <div class="tbl-wrap"><table class="dstab"><thead><tr><th>#</th><th>Squadra</th><th>Numeri</th><th>1ª</th><th>2ª</th><th>3ª</th><th>Top 3</th></tr></thead><tbody>
 ${lot.map((t,i)=>`<tr><td>${i+1}</td><td class="dstn">${lg(t.id)}<span><b>${e(nick(t.id))}</b><small>${t.w}-${t.l}</small></span></td><td><b>${N[i]}</b>${D.cl===t.id?' <em class="dscl">+10</em>':""}</td>${P[i].slice(0,3).map(v=>`<td>${f1(v)}%</td>`).join("")}<td><b>${f1(P[i][0]+P[i][1]+P[i][2])}%</b></td></tr>`).join("")}</tbody></table></div>
 <div class="dscon"><span>Vincitrice del consolation ladder <small>(+10 numeri)</small></span><div class="chips">${[{id:""},...lot].map(t=>`<button class="chip" data-dcl="${t.id}" aria-pressed="${D.cl===t.id}">${t.id?`<span class="badge logo lg-${t.id}"></span>${e(nick(t.id))}`:"Nessuna"}</button>`).join("")}</div></div>
 <p class="note">Regolamento: le squadre fuori dai playoff partecipano alla lottery per le prime 3 scelte con 161, 161, 161, 143, 120, 103, 85 e 66 numeri su 1000 (dalla peggiore alla migliore); chi vince il consolation ladder ha 10 numeri in più. Dalla 4ª scelta in poi si va in ordine inverso di classifica. Le 8 squadre sono quelle fuori dai playoff con la classifica di oggi (6ª–8ª di ogni conference e, per ora, le 5ª come perdenti del play-in). Probabilità da 20.000 estrazioni.</p></div>`}
/* ---------- rookie ---------- */
const avgOf=s=>s[14]+2*s[2]-s[3]+s[4]+s[6]-s[7]+2.1*s[8]+2*s[9]+4*s[11]+4*s[10]-2*s[12]-s[13];
/* riga del game log [data, avv, V/S, MIN, FGM, FGA, 3PM, 3PA, FTM, FTA, REB, AST, BLK, STL, TO, PF, PTS] → stesso ordine delle medie (G=1) */
const gS=g=>[1,...g.slice(3,17)];
const RH=()=>(typeof ROOKIE!=="undefined"&&ROOKIE.h)||{};
const sur=n=>n.split(" ").filter(w=>!/^(Jr\.?|Sr\.?|II|III|IV)$/.test(w)).slice(-1)[0];
const ini=n=>n.split(" ").filter(w=>/^[A-ZÀ-Ý]/.test(w)).map(w=>w[0]).slice(0,2).join("");
/* colore della scheda dal nome del college (niente loghi esterni) */
const scCol=sc=>{let h=0;for(const c of String(sc))h=(h*31+c.charCodeAt(0))%360;return`hsl(${h} 52% 34%)`};
const DT=d=>new Date(d+"T12:00:00Z");
function trendP(P){const n=P.length;if(n<3)return null;const mx=(n-1)/2,my=P.reduce((a,b)=>a+b,0)/n;let num=0,den=0;P.forEach((v,i)=>{num+=(i-mx)*(v-my);den+=(i-mx)**2});return my?num/den*(n-1)/Math.abs(my)*100:0}
let RC=null;const ROOK=()=>{const src=typeof ROOKIE!=="undefined"?ROOKIE.p:[];if(RC&&RC.src===src)return RC.L;const H=RH();
 const L=src.map(r=>{const s=r[10],gp=s[0],mp=s[1],a=gp?avgOf(s):null,slug=r[11]||r[0],gl=(r[12]||[]).map(g=>{const S=gS(g);return{d:g[0],o:g[1],wl:g[2],m:g[3],f:avgOf(S),r:g}}),h=H[slug]||[];
  /* trend della settimana: due snapshot dello storico, altrimenti il game log (media di oggi − media fino a 7 giorni prima) */
  let wk=null;if(h.length>=2)wk=h[h.length-1].a-h[h.length-2].a;else if(gl.length>=2){const ref=DT(h.length?h[h.length-1].d:new Date().toISOString().slice(0,10))-7*864e5,old=gl.filter(g=>DT(g.d)<=ref);
   if(old.length&&old.length<gl.length)wk=gl.reduce((t,g)=>t+g.f,0)/gl.length-old.reduce((t,g)=>t+g.f,0)/old.length}
  const sz=trendP(gl.length>=3?gl.map(g=>g.f):h.map(z=>z.a));
  return{n:r[0],pos:r[1],sc:r[2],yr:r[3],age:r[4],h:r[5],w:r[6],rk:r[7],md:r[9]?`${r[8]}° giro · ${r[9]}ª`:"",s,gp,mp,avg:a,eff:a!=null&&mp?a/mp:null,a36:a!=null&&mp?a/mp*36:null,slug,gl,stag:r[13]||"",hist:h,wk,sz}});
 RC={src,L};return L};
const tsP=s=>{const d=2*(s[3]+.44*s[7]);return d?s[14]/d*100:null};
function tags(x){if(!x.gp)return["nessuna partita ancora"];const s=x.s,T=[],p36=v=>x.mp?v/x.mp*36:0;
 if(p36(s[14])>=20)T.push("realizzatore");if(p36(s[8])>=10)T.push("rimbalzista");if(p36(s[9])>=5)T.push("regista");if(p36(s[10]+s[11])>=3)T.push("difensore");
 const ts=tsP(s);if(ts!=null&&ts>=60)T.push("molto efficiente al tiro");else if(ts!=null&&ts<48)T.push("tiro da migliorare");if(p36(s[12])>=4)T.push("perde molti palloni");
 if(x.eff!=null&&x.eff>=1.2)T.push("AVG alto per minuto");if(x.gp<5)T.push("poche partite: dati provvisori");return T.length?T:["profilo equilibrato"]}
const pc=v=>v==null?"":v>=50?"v":v>=35?"g":v>=20?"y":"r";/* colori AVG come nel resto dell app */
const evC=v=>v>=1.4?"g":v>=1?"y":"r";
const evB=v=>v==null?'<span class="ev na">—</span>':`<span class="ev ${evC(v)}"><i></i>${f2(v)}</span>`;
const trB=(v,lab="")=>v==null||Math.abs(v)<.05?(v==null?"":`<em class="dstr eq">= ${lab}</em>`):`<em class="dstr ${v>0?"up":"dn"}">${v>0?"▲ +":"▼ −"}${f1(Math.abs(v))}${lab?" "+lab:""}</em>`;
const trS=v=>v==null?"":`<em class="dstr ${v>=0?"up":"dn"}">${v>=0?"▲ +":"▼ −"}${Math.round(Math.abs(v))}%</em>`;
function vRook(){let L=ROOK().slice();const q=String(D.q||"").toLowerCase();if(q)L=L.filter(x=>x.n.toLowerCase().includes(q)||x.sc.toLowerCase().includes(q));if(D.pos)L=L.filter(x=>x.pos.includes(D.pos));
 const K={rk:x=>-x.rk,avg:x=>x.avg??-99,a36:x=>x.a36??-99,eff:x=>x.eff??-99,age:x=>-x.age,min:x=>x.mp,wk:x=>x.wk??-99}[D.sort]||(x=>-x.rk),sg=D.dir==="a"?-1:1;L.sort((a,b)=>sg*(K(b)-K(a)));
 const head=[["rk","Big board"],["avg","AVG"],["wk","Trend"],["a36","AVG/36′"],["eff","Efficienza"],["min","Minuti"],["age","Età"]];
 const card=x=>`<div class="dsrk" data-drk="${e(x.slug)}" role="button" tabindex="0" aria-label="Profilo di ${e(x.n)}"><div class="dsrkh"><i class="dsrkn">${x.rk}</i><span class="dsini" style="--sc:${scCol(x.sc)}">${e(ini(x.n))}</span><span class="dsrki"><b>${e(x.n)}</b><small>${ageB(x.age)}${e(x.pos)} · ${e(x.sc)}${x.h?" · "+e(x.h):""}</small></span><span class="dsrkv"><span class="pdkx ${pc(x.avg)}">${x.avg!=null?f1(x.avg):"–"}</span><small>AVG</small>${trB(x.wk)}</span></div>
  <div class="dsrks"><span><b>${x.gp?f1(x.mp):"–"}</b><small>min</small></span><span><b>${x.eff!=null?f2(x.eff):"–"}</b><small>AVG/min</small></span><span><b>${x.a36!=null?f1(x.a36):"–"}</b><small>AVG/36′</small></span><span><b>${x.gp}</b><small>partite</small></span>${x.md?`<span><b>${x.md}</b><small>mock</small></span>`:""}</div>
  <div class="dstags">${tags(x).slice(0,3).map(t=>`<em>${t}</em>`).join("")}<i class="dsgo2">Profilo ›</i></div></div>`;
 return `<div class="dsbox"><h4 class="dsh">Rookie del Draft 2027 <small>primi ${ROOK().length} del big board · Tankathon ${typeof ROOKIE!=="undefined"?e(ROOKIE.upd):""}</small></h4>
 <input id="dsq" class="vtq" type="search" placeholder="🔍 Cerca un rookie o un college" autocomplete="off" value="${e(D.q||"")}">
 <div class="chips">${["","PG","SG","SF","PF","C"].map(p=>`<button class="chip" data-dpos="${p}" aria-pressed="${D.pos===p}">${p||"Tutti"}</button>`).join("")}</div>
 <div class="chips dssort">${head.map(([k,l])=>`<button class="chip" data-dsrt="${k}" aria-pressed="${D.sort===k}">${l}${D.sort===k?(D.dir==="a"?" ▲":" ▼"):""}</button>`).join("")}</div>
 <button class="advbtn ggrbtn ggy" data-dcmp="">⚖ Confronta due rookie</button>
 <div class="dsrkl">${L.map(card).join("")||`<p class="note">Nessun rookie.</p>`}</div>
 <p class="note">Dati di Tankathon (medie a partita della stagione in corso al college o nella sua lega), aggiornati ogni domenica alle 18 con uno storico settimana per settimana. AVG = formula della lega (+1 punto, +2 canestro, −1 tiro tentato, +1 tripla, +1 libero segnato, −1 libero tentato, rimbalzi, +2 assist, +4 recupero, +4 stoppata, −2 palla persa, −1 fallo); Tankathon non divide i rimbalzi in offensivi e difensivi, quindi ogni rimbalzo vale 2,1. ▲/▼ = AVG rispetto alla settimana prima. Tocca un rookie per il profilo completo.</p></div>`}
/* ---------- grafico (stesso disegno del Grafico delle Statistiche: griglia, etichette, punti con valore) ---------- */
const MET={f:["AVG",x=>x.f,"pdk"],m:["Minuti",x=>x.m,"min"],e:["Efficienza",x=>x.m?x.f/x.m:0,"eff"]};
const fmV=(v,m)=>m==="e"?f2(v):f1(v);
/* punti di un rookie: partita per partita (game log) o settimana per settimana (storico) */
function pts(x,per){if(per==="w")return x.hist.map(z=>({k:z.d,lab:z.d.slice(8)+"/"+z.d.slice(5,7),sub:z.G+" part.",f:z.a,m:z.MP}));
 return x.gl.map((g,i)=>({k:i,lab:g.d.slice(8)+"/"+g.d.slice(5,7),sub:String(g.o).split(" ")[0].slice(0,9),f:g.f,m:g.m}))}
function chart(series,met){
 const W=340,H=246,l=32,r=14,t=28,b=32;const P0=series.map(s=>s.G.map(g=>g?MET[met][1](g):null));const all=P0.flat().filter(v=>v!=null);if(!all.length)return`<div class="grfoot">Nessun dato ancora.</div>`;
 const mx0=Math.max(...all),mn=Math.min(0,Math.min(...all));const step=met==="e"?(mx0>2?1:.5):mx0>30?20:10;const mx=Math.ceil(mx0*1.05/step)*step||step;
 const N=Math.max(...series.map(s=>s.G.length)),X=i=>l+12+(N<2?(W-l-r-24)/2:i*(W-l-r-24)/(N-1)),Y=v=>t+(H-t-b)*(1-(v-mn)/(mx-mn));
 let o="";for(let v=Math.ceil(mn/step)*step;v<=mx+1e-9;v+=step)o+=`<line x1="${l}" x2="${W-r}" y1="${Y(v)}" y2="${Y(v)}" class="grg"></line><text x="${l-5}" y="${Y(v)+3}" class="gry l">${met==="e"?String(v).replace(".",","):v}</text>`;
 const ev=Math.ceil(N/4),G0=series[0].G;for(let i=0;i<N;i+=ev){const g=G0[i]||(series[1]&&series[1].G[i]);if(!g)continue;o+=`<line x1="${X(i)}" x2="${X(i)}" y1="${t}" y2="${H-b}" class="grv"></line><text x="${X(i)}" y="${H-b+15}" class="grx big">${e(g.lab)}</text><text x="${X(i)}" y="${H-b+26}" class="grx">${e(g.sub)}</text>`}
 o+=`<text x="4" y="10" class="gry ax" text-anchor="start">${MET[met][0].toUpperCase()}</text>`;
 series.forEach((s,k)=>{const P=P0[k].map((v,i)=>[v,i]).filter(z=>z[0]!=null);if(!P.length)return;o+=`<polyline points="${P.map(([v,i])=>X(i).toFixed(1)+","+Y(v).toFixed(1)).join(" ")}" fill="none" stroke="${s.col}" stroke-width="2.6" stroke-linejoin="miter" stroke-linecap="round"></polyline>`;
  const big=P.length<=40;P.forEach(([v,i])=>{o+=`<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="${big?4:2.2}" fill="${s.col}" stroke="#0b1022" stroke-width="${big?2:1}"></circle>`});
  if(P.length<=14)P.forEach(([v,i])=>{const tx=fmV(v,met),w=tx.length*5.4+8;o+=`<g class="grtag"><rect x="${(X(i)-w/2).toFixed(1)}" y="${(Y(v)-20).toFixed(1)}" width="${w.toFixed(1)}" height="12" rx="6" fill="${s.col}"></rect><text x="${X(i).toFixed(1)}" y="${(Y(v)-10.5).toFixed(1)}">${tx}</text></g>`})});
 return `<svg class="grsvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Andamento">${o}</svg>`}
const avgPts=(G,met)=>{const L=G.filter(Boolean);if(!L.length)return null;if(met==="e"){const m=L.reduce((a,g)=>a+g.m,0);return m?L.reduce((a,g)=>a+g.f,0)/m:null}return L.reduce((a,g)=>a+MET[met][1](g),0)/L.length};
const ctl=()=>`<div class="pergr"><span>Andamento per</span><div>${[["g","Partite"],["w","Settimane"]].map(([k,l])=>`<button data-dper="${k}" aria-pressed="${D.per===k}">${l}</button>`).join("")}</div></div>
 <div class="grtgs">${Object.keys(MET).map(k=>`<button class="grtg ${MET[k][2]}" data-dmet="${k}" aria-pressed="${D.met===k}"><i></i>${MET[k][0]}</button>`).join("")}</div>`;
const perTxt=()=>D.per==="w"?"settimana per settimana (storico della domenica)":"partita per partita (game log)";
/* ---------- profilo del rookie (come la scheda giocatore) ---------- */
const vPlR=()=>`<div class="dsroom dspg">${vPlR0()}</div>`,vCmpR=()=>`<div class="dsroom dspg">${vCmpR0()}</div>`;
function vPlR0(){const L=ROOK(),x=L.find(z=>z.slug===D.pl)||L[0];if(!x)return`<button class="gback" data-go="draft">‹ Sala Draft</button><p class="note">Nessun rookie.</p>`;D.pl=x.slug;
 const s=x.s,bg=scCol(x.sc),p36=v=>x.mp?v/x.mp*36:null,pct=(a,b)=>b?f1(a/b*100)+"%":"–",ts=tsP(s);
 const stat=(lab,val,sub="")=>`<div class="gst"><small>${lab}</small><b>${val}</b>${sub?`<em>${sub}</em>`:""}</div>`;
 const G=pts(x,D.per),sz=trendP(G.map(g=>MET[D.met][1](g)));
 const rows=[["Punti",14],["Rimbalzi",8],["Assist",9],["Recuperi",11],["Stoppate",10],["Palle perse",12],["Falli",13]];
 return `<button class="gback" data-go="draft">‹ Sala Draft</button>
 <div class="ghead dsph" style="background:linear-gradient(115deg,${bg} 0%,color-mix(in srgb,${bg} 55%,#000) 100%);color:#ffffff;border-bottom:4px solid #0b0b0b">
  <div class="gjer"><span class="dsini xl">${e(ini(x.n))}</span></div>
  <div class="gtit"><small>${e(x.sc)}${x.stag?" · "+e(x.stag):""}</small><h3>${e(x.n)}</h3><p>${ageB(x.age)}${[x.pos,x.yr,x.h,x.w?x.w+" lb":""].filter(Boolean).map(e).join(" · ")}<span style="display:block">Big board n° ${x.rk}${x.md?" · mock "+e(x.md):""}</span></p></div>
 </div>
 <button class="advbtn ggrbtn ggy" data-dcmp="${e(x.slug)}">⚖ Confronta con un altro rookie</button>
 ${!x.gp?`<p class="note">Nessuna partita giocata finora: i dati compariranno dopo la prima gara.</p>`:`
 <div class="gbig g2"><div><b class="gpdk"><span style="color:#fff!important;-webkit-text-fill-color:#fff!important" class="pdkx big ${pc(x.avg)}">${f2(x.avg)}</span></b><small>AVG medi a partita ${trB(x.wk,"in 7 gg")}</small></div><div>${evB(x.eff)}<small>Efficienza (AVG al minuto)</small></div></div>
 <div class="gstats">${stat("Partite",x.gp)}${stat("Minuti medi",f1(x.mp))}${stat("Proiezione 36′",x.a36!=null?f1(x.a36):"–","AVG")}${stat("Settimana",x.wk!=null?(x.wk>=0?"+":"−")+f1(Math.abs(x.wk)):"–","AVG vs 7 giorni fa")}${stat("Stagione",x.sz!=null?(x.sz>=0?"+":"−")+Math.round(Math.abs(x.sz))+"%":"–","trend dell AVG")}${stat("Ultima partita",x.gl.length?f1(x.gl[x.gl.length-1].f):"–",x.gl.length?"AVG vs "+e(x.gl[x.gl.length-1].o):"")}</div>
 <h2><span class="t"><span>Statistiche</span></span></h2>
 <div class="tbl-wrap"><table class="dstab dsst"><thead><tr><th></th><th>A partita</th><th>Su 36′</th></tr></thead><tbody>
 <tr class="dsav"><td>AVG</td><td><b>${f1(x.avg)}</b></td><td><b>${f1(x.a36)}</b></td></tr>
 ${rows.map(([l,k])=>`<tr><td>${l}</td><td>${f1(s[k])}</td><td>${f1(p36(s[k]))}</td></tr>`).join("")}</tbody></table></div>
 <div class="tbl-wrap"><table class="dstab dsst"><thead><tr><th>Tiro</th><th>Segnati-tentati</th><th>%</th><th>Su 36′</th></tr></thead><tbody>
 <tr><td>Dal campo</td><td>${f1(s[2])}-${f1(s[3])}</td><td>${pct(s[2],s[3])}</td><td>${f1(p36(s[2]))}-${f1(p36(s[3]))}</td></tr>
 <tr><td>Da 3</td><td>${f1(s[4])}-${f1(s[5])}</td><td>${pct(s[4],s[5])}</td><td>${f1(p36(s[4]))}-${f1(p36(s[5]))}</td></tr>
 <tr><td>Liberi</td><td>${f1(s[6])}-${f1(s[7])}</td><td>${pct(s[6],s[7])}</td><td>${f1(p36(s[6]))}-${f1(p36(s[7]))}</td></tr>
 <tr><td>True shooting</td><td colspan="3">${ts!=null?f1(ts)+"%":"–"}</td></tr></tbody></table></div>`}
 <h2><span class="t"><span>Grafico</span></span></h2>
 <div class="grroom dsgr">${ctl()}
 <div class="grcard grshc"><div class="grtrs"><div class="grtr ${MET[D.met][2]}"><i></i><b>${G.length?fmV(avgPts(G,D.met),D.met):"–"}</b>${trS(sz)}</div></div>${chart([{col:"#22c55e",G}],D.met)}<div class="grfoot">${G.length} ${D.per==="w"?"settimane":"partite"} · ${perTxt()}</div></div></div>
 ${x.gl.length?`<h2><span class="t"><span>Partita per partita</span></span><em>${x.gl.length} ${x.gl.length===1?"gara":"gare"}</em></h2>
 <div class="tbl-wrap"><table class="fatbl e16log dslog"><thead><tr><th>Data</th><th>Vs</th><th>Min</th><th>AVG</th><th>PT</th><th>RB</th><th>AS</th><th>ST</th><th>BL</th><th>TO</th><th>Tiri</th></tr></thead><tbody>
 ${x.gl.slice().reverse().map(g=>{const r=g.r;return`<tr><td>${g.d.slice(8)}/${g.d.slice(5,7)}</td><td>${e(g.o)} <i class="dswl ${g.wl==="W"?"w":"l"}">${g.wl==="W"?"V":"S"}</i></td><td>${g.m}</td><td class="fapdk"><span class="pdkx ${pc(g.f)}">${f1(g.f)}</span></td><td>${r[16]}</td><td>${r[10]}</td><td>${r[11]}</td><td>${r[13]}</td><td>${r[12]}</td><td>${r[14]}</td><td>${r[4]}/${r[5]}</td></tr>`}).join("")}</tbody></table></div>`:""}
 <p class="dsan"><b>Analisi:</b> ${tags(x).join(" · ")}.</p>
 <p class="note">Dati Tankathon${x.stag?" della stagione "+e(x.stag):""}. AVG con la formula della lega, rimbalzi × 2,1 (Tankathon non divide offensivi e difensivi). Efficienza = AVG al minuto: verde da 1,40 · giallo 1,00–1,40 · rosso sotto 1,00. Settimana = AVG di oggi meno quello di 7 giorni fa; Stagione = trend dell AVG nel grafico.</p>`}
/* ---------- comparatore tra due rookie ---------- */
function vCmpR0(){const L=ROOK(),byRk=L.slice().sort((a,b)=>a.rk-b.rk),A=L.find(z=>z.slug===D.pa),B=L.find(z=>z.slug===D.pb),CA="#22c55e",CB="#f472b6";
 const sel=(k,v,c)=>`<label class="grsel"><span><i style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${c};margin-right:5px"></i>Rookie ${k==="pa"?"A":"B"}</span><select data-dsel="${k}"><option value="">🔍 Scegli il rookie ${k==="pa"?"A":"B"}</option>${byRk.map(x=>`<option value="${e(x.slug)}"${x.slug===v?" selected":""}>${x.rk}. ${e(x.n)} (${e(x.sc)})</option>`).join("")}</select></label>`;
 let body=`<div class="grcard"><div class="grfoot" style="text-align:center;padding:30px 0">Scegli i due rookie da confrontare.</div></div>`;
 if(A&&B){let ga=pts(A,D.per),gb=pts(B,D.per);
  if(D.per==="w"){const ks=[...new Set([...ga,...gb].map(g=>g.k))].sort();ga=ks.map(k=>ga.find(g=>g.k===k)||null);gb=ks.map(k=>gb.find(g=>g.k===k)||null)}
  else{const lab=(g,i)=>g&&{...g,lab:i+1+"ª",sub:""};ga=ga.map(lab);gb=gb.map(lab)}
  const va=avgPts(ga,D.met),vb=avgPts(gb,D.met);
  const T=(l,fa,fb,hi=1,fmt=f1)=>{const a=fa(A),b=fb?fb(B):fa(B),ok=a!=null&&b!=null&&!isNaN(a)&&!isNaN(b);return`<tr><td class="${ok&&hi&&(hi>0?a>b:a<b)?"dsw":""}">${a==null||isNaN(a)?"–":fmt(a)}</td><th>${l}</th><td class="${ok&&hi&&(hi>0?b>a:b<a)?"dsw":""}">${b==null||isNaN(b)?"–":fmt(b)}</td></tr>`};
  const pS=(k)=>x=>x.gp?x.s[k]:null,pc2=(a,b)=>x=>x.gp&&x.s[b]?x.s[a]/x.s[b]*100:null,pcf=v=>f1(v)+"%";
  body=`<div class="grcard grshc"><div class="grtrs"><div class="grtr pdk"><i style="background:${CA}"></i><b>${va!=null?fmV(va,D.met):"–"}</b><em>${e(sur(A.n))}</em></div><div class="grtr min"><i style="background:${CB}"></i><b>${vb!=null?fmV(vb,D.met):"–"}</b><em>${e(sur(B.n))}</em></div></div>${chart([{col:CA,G:ga},{col:CB,G:gb}],D.met)}<div class="grfoot">${A.gl.length} e ${B.gl.length} partite · ${perTxt()}</div></div>
  <div class="tbl-wrap"><table class="dstab dscmp"><thead><tr><th style="color:${CA}">${e(A.n)}</th><th></th><th style="color:${CB}">${e(B.n)}</th></tr></thead><tbody>
  ${T("AVG",x=>x.avg)}${T("Trend 7 gg",x=>x.wk,null,1,v=>(v>=0?"+":"−")+f1(Math.abs(v)))}${T("Minuti",x=>x.gp?x.mp:null)}${T("AVG/min",x=>x.eff,null,1,f2)}${T("AVG/36′",x=>x.a36)}
  ${T("Punti",pS(14))}${T("Rimbalzi",pS(8))}${T("Assist",pS(9))}${T("Recuperi",pS(11))}${T("Stoppate",pS(10))}${T("Palle perse",pS(12),null,-1)}
  ${T("Dal campo",pc2(2,3),null,1,pcf)}${T("Da 3",pc2(4,5),null,1,pcf)}${T("Liberi",pc2(6,7),null,1,pcf)}${T("True shooting",x=>x.gp?tsP(x.s):null,null,1,pcf)}
  ${T("Partite",x=>x.gp,null,0,v=>String(v))}${T("Età al draft",x=>x.age,null,-1,ageB)}<tr><td>${e(A.h||"–")}</td><th>Altezza</th><td>${e(B.h||"–")}</td></tr>${T("Big board",x=>x.rk,null,-1,v=>"n° "+v)}<tr><td>${e(A.pos)} · ${e(A.sc)}</td><th>Ruolo</th><td>${e(B.pos)} · ${e(B.sc)}</td></tr></tbody></table></div>
  <p class="note">In verde il migliore dei due in ogni voce (per palle perse, età e posto nel big board vince il valore più basso). Con «Partite» le gare sono allineate per numero (1ª, 2ª…), con «Settimane» per data dello storico.</p>`}
 return `<div class="grroom dsgr" style="--tc:#1747c9;--tf:#ffffff"><button class="gback" data-go="draft">‹ Sala Draft</button><div class="grhd"><span class="grlg"></span><div><small>Confronto · due rookie sullo stesso grafico</small><b>Comparatore rookie</b></div></div>
 <div class="grctl">${sel("pa",D.pa,CA)}${sel("pb",D.pb,CB)}</div>${ctl()}${body}</div>`}
/* ---------- squadre e scelte ---------- */
function vTeams(){const Y=[2027,2028,2029,2030,2031];const pick=(t,p)=>{let I=null;try{I=window.e16Pick?e16Pick(p,t):null}catch(_){}const o=p[2]!==t;
  return `<span class="dspk g${p[1]}${I&&I.rule?" rl":""}" title="${e(I&&I.rule?I.rule.txt:p[3]||"")}"><i>${p[1]}°</i>${o?`<span class="badge logo lg-${p[2]}"></span>`:""}${I?`<b>${I.v.toLocaleString("it-IT")}</b>`:""}${I&&I.rule?`<em>${/swap/i.test(I.rule.txt)?"⇄":"🛡"}</em>`:""}</span>`};
 const top3=t=>{try{return window.e16Top3?e16Top3(2027,t):null}catch(_){return null}};
 return `<div class="dsbox"><h4 class="dsh">Le scelte delle 16 squadre <small>1°, 2° e 3° giro · valore</small></h4><div class="dstml">${TEAMS.map(t=>{const C=(typeof CAP!=="undefined"&&CAP[t.id])||{pk:[]},p3=top3(t.id);
  return `<div class="dstm" style="--tc:${TCOL[t.id]}"><div class="dstmh">${lg(t.id,"big")}<span><b>${e(t.nome)}</b><small>${C.pk.length} scelte${p3!=null&&p3>0.005?` · top 3 nel 2027: ${f1(p3*100)}%`:""}</small></span></div>
  ${Y.map(y=>{const P=C.pk.filter(p=>p[0]===y).sort((a,b)=>a[1]-b[1]);return `<div class="dsyr"><span class="dsy">${y}</span><span class="dspks">${P.length?P.map(p=>pick(t.id,p)).join(""):`<em class="dsnone">nessuna</em>`}</span></div>`}).join("")}</div>`}).join("")}</div>
 <p class="note">Ogni casella = una scelta: giro, logo della squadra d origine se arriva da un altra squadra, valore (lo stesso del calcolatore: forza e giovinezza delle squadre, lottery del regolamento). ⇄ = swap, 🛡 = protezione (tieni premuto o passa sopra per la spiegazione; dettagli nella pagina Scelte della squadra). Top 3 nel 2027 = probabilità che la propria scelta 2027 esca tra le prime 3.</p></div>`}
function vDraft(){const tabs=[["lot","🎱 Lottery"],["rook","Rookie 2027"],["tm","Squadre e scelte"]];
 return `<div class="dsroom"><button class="gback" data-go="home">‹ Home</button><div class="dshero"><span class="dsspot l"></span><span class="dsspot r"></span><small>ESPN 16 · FantaBasket USA</small><b>Sala Draft</b><em>Draft 2027 · lottery, rookie e scelte</em></div>
 <div class="dstabs">${tabs.map(([k,l])=>`<button data-dtab="${k}" aria-pressed="${D.tab===k}">${l}</button>`).join("")}</div>
 ${D.tab==="rook"?vRook():D.tab==="tm"?vTeams():vLot()}</div>`}
window.SCAMBIV=window.SCAMBIV||{};SCAMBIV.draft=vDraft;SCAMBIV.drpl=vPlR;SCAMBIV.drcmp=vCmpR;
(window.NAVX=window.NAVX||[]).push({k:"ds",get:()=>({tab:D.tab,pl:D.pl,pa:D.pa,pb:D.pb}),set:o=>{D.tab=o.tab||"lot";D.pl=o.pl||"";D.pa=o.pa||"";D.pb=o.pb||""}});
const IN=()=>cur==="draft"||cur==="drpl"||cur==="drcmp";
const keep=()=>{const y=scrollY;render();scrollTo(0,y)};
const reduced=()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch(_){return false}};
document.addEventListener("click",ev=>{if(!IN())return;const b=ev.target.closest("[data-dtab],[data-ds],[data-dcl],[data-dsrt],[data-dpos],[data-drk],[data-dcmp],[data-dmet],[data-dper]");if(!b)return;const d=b.dataset;
 if(d.dmet){D.met=d.dmet;save();keep();return}
 if(d.dper){D.per=d.dper;save();keep();return}
 if(d.dcmp!=null){if(d.dcmp){D.pa=d.dcmp;if(D.pb===d.dcmp)D.pb=""}go("drcmp");return}
 if(d.dtab){D.tab=d.dtab;save();keep();return}
 if(d.dcl!=null){D.cl=d.dcl;D.res=null;save();keep();return}
 if(d.dpos!=null){D.pos=d.dpos;save();keep();return}
 if(d.dsrt){D.dir=D.sort===d.dsrt&&D.dir!=="a"?"a":"d";D.sort=d.dsrt;save();keep();return}
 if(d.drk){D.pl=d.drk;go("drpl");return}
 if(d.ds==="reset"){D.res=null;keep();return}
 if(d.ds==="gira"&&!D.run){const{lot}=order(),r=draw(lot);D.res={...r,shown:0};const W=reduced()?[60,60,60]:[2800,3000,4200];/* (107) 3ª, 2ª e poi la 1ª con più attesa */D.run=true;keep();
  setTimeout(function nx(){if(cur!=="draft"||!D.res)return(D.run=false);D.res.shown++;if(D.res.shown>=3)D.run=false;keep();if(D.res.shown<3)setTimeout(nx,W[D.res.shown])},W[0])}});
document.addEventListener("keydown",ev=>{if(!IN()||ev.key!=="Enter")return;const b=ev.target.closest&&ev.target.closest("[data-drk]");if(b){D.pl=b.dataset.drk;go("drpl")}});
document.addEventListener("change",ev=>{if(cur!=="drcmp")return;const s=ev.target.closest("[data-dsel]");if(!s)return;D[s.dataset.dsel]=s.value;keep()});
document.addEventListener("input",ev=>{if(cur!=="draft"||ev.target.id!=="dsq")return;D.q=ev.target.value;const pos=ev.target.selectionStart;render();const n=document.getElementById("dsq");if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(_){}}});
})();
