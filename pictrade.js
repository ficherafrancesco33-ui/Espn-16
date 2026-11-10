/* ===== ESPN 16 – PIC-TRADE (come la Pic-Trade di Dreamers) =====
   Scambio ufficiale tra due squadre: per ogni lato la squadra che CEDE, i suoi giocatori (in ordine di valore), le scelte del Draft
   (al posto di crediti e slot di Dreamers, che in ESPN 16 non esistono) e un campo «Altro». Sotto il riepilogo «X riceve: …».
   «📸 Fai la foto» = immagine da condividere (maglie, AVG, età, valore, «✔ Scambio ufficiale»), stesso disegno di Dreamers (shHistTrade, ramo Pic-Trade):
   di giorno con i colori parquet, di notte viola galassia. «🔗 Copia per Claude» = prompt con lo scambio e il link ?scambio=… che riapre la pagina compilata.
   Stesse classi di Dreamers (tagrid, tasd, tash, tapl, tapc, tast, tasm, taer, tabtn, shsheet…): gli stili sono in skin-giorno.css / skin-notte.css. */
(function(){
window.SCAMBIV=window.SCAMBIV||{};
const esc2=v=>String(v).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const nick=t=>t&&TM[t]?TM[t].nome.split(" ").slice(-1)[0]:"…";
const nickU=t=>nick(t).toUpperCase();
/* ruolo G/F/C dalle posizioni ESPN della rosa (primo ruolo) */
const ROLEOF={};for(const t in ROSE)for(const g of ROSE[t]){const a=String(g[3]||"").split(",")[0];ROLEOF[g[0]]=a==="C"?"C":/G/.test(a)?"G":"F"}
const ruoloDi=n=>ROLEOF[n]||"F";
const valOf=n=>{const v=(typeof VAL!=="undefined"&&VAL.p&&VAL.p[n])?VAL.p[n][0]:null;return v==null?null:v};
/* AVG della stagione in corso (pstats); se non ha ancora giocato, l AVG pesato dei valori */
const avgOf=n=>{try{const p=pstats()[n];if(p&&p.gp)return p.ff/p.gp}catch(e){}const v=(typeof VAL!=="undefined"&&VAL.p&&VAL.p[n])?VAL.p[n][1]:null;return v==null?null:v};
const nmAb=n=>{const p=String(n).split(" ");return p.length>1?p[0][0]+". "+p.slice(1).join(" "):n};
const iaSur=n=>{const p=String(n).replace(/\s+(Jr\.?|Sr\.?|II|III|IV)$/i,"").split(" ");return p.length>1?p.slice(1).join(" "):p[0]};
const wedge=t=>`<span class="wedge" style="--tc:${TCOL[t]}"><span class="badge logo lg-${t}" role="img" aria-label="${esc2(nick(t))}"></span></span>`;
const H=(t,em)=>`<h2><span class="t"><span>${t}</span></span>${em||""}</h2>`;
const pkLab=(t,p)=>`Scelta ${p[0]} · ${p[1]}° giro${p[2]!==t?" (da "+nick(p[2])+")":""}`;
const pkKey=p=>p.join("|");
/* ---------- stato ---------- */
let TA={t:["",""],pl:[[],[]],pk:[[],[]],ex:["",""]};
window.TA_LOOK=window.TA_LOOK||"space";
const ks=()=>TEAMS.map(x=>x.id);
const taNow=()=>{const f=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Rome",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date()),g=t=>f.find(x=>x.type===t).value;return{d:`${g("year")}-${g("month")}-${g("day")}`,h:`${g("hour")}:${g("minute")}`}};
/* cosa CEDE il lato s */
function taItems(s){const t=TA.t[s],L=[...TA.pl[s]];
 const P=((typeof CAP!=="undefined"&&CAP[t])||{}).pk||[];TA.pk[s].forEach(k=>{const p=P.find(x=>pkKey(x)===k);if(p)L.push(pkLab(t,p))});
 if(TA.ex[s].trim())L.push(TA.ex[s].trim());return L}
/* chi RICEVE ciò che l altra squadra cede */
function taTrade(){const n=taNow();return{data:n.d.slice(8,10)+"/"+n.d.slice(5,7)+"/"+n.d.slice(0,4),ora:n.h,titolo:"Scambio",lati:[[TA.t[0],taItems(1)],[TA.t[1],taItems(0)]]}}
function taErr(){const e=[];if(!TA.t[0]||!TA.t[1])e.push("Scegli le due squadre.");
 else{if(!TA.pl[0].length&&!TA.pl[1].length)e.push("Metti almeno un giocatore nello scambio.");
  for(let s=0;s<2;s++)if(!taItems(s).length)e.push(`${nick(TA.t[s])} non cede niente.`)}
 return e}
function taPrompt(){const T=taTrade();
 const link=location.origin+location.pathname+"?scambio="+encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify({t:TA.t,pl:TA.pl,pk:TA.pk,ex:TA.ex})))));
 return `Claude, registra e pubblica questo scambio di ESPN 16 già concordato tra i due GM.

SCAMBIO concordato il ${T.data} alle ${T.ora} (ora italiana):
${T.lati.map(l=>`- ${TM[l[0]].nome} riceve: ${l[1].join(", ")}`).join("\n")}

Fai come per tutti gli scambi:
1. aggiungi lo scambio allo Storico trade con data e ora;
2. aggiorna le rose (ROSE in index.html) e, se ci sono scelte del Draft o contratti, cap-data.js (scelte pk e contratti pl), poi la nota in NOTE_SVILUPPO.md;
3. pubblica e verifica che la nuova versione sia online.

Link con lo scambio già compilato: ${link}`}
/* ---------- pagina ---------- */
function vPicTrade(){if(!TA.t[0]&&!TA.t[1])TA.t[0]=(window.e16RT&&e16RT())||"QUE";
 const errs=taErr(),can=!errs.length,all=ks();
 const side=s=>{const t=TA.t[s],o=TA.t[1-s],pl=t?(ROSE[t]||[]).map(g=>g[0]).sort((a,b)=>(valOf(b)??0)-(valOf(a)??0)):[],P=t&&typeof CAP!=="undefined"&&CAP[t]?CAP[t].pk||[]:[];
  return`<section class="tasd" style="--tc:${t?TCOL[t]:"#64748b"}"><div class="tash">${t?wedge(t):""}<select data-ta="team" data-s="${s}" aria-label="Squadra ${s+1}"><option value="">Scegli la squadra</option>${all.filter(x=>x!==o).map(x=>`<option value="${x}"${x===t?" selected":""}>${esc2(nick(x))}</option>`).join("")}</select><em>cede</em></div>
  ${t?`<div class="tapl">${pl.map(n=>`<button type="button" class="tapc${TA.pl[s].includes(n)?" on":""}" data-ta="pl" data-s="${s}" data-n="${esc2(n)}"><i class="${ruoloDi(n)}"></i>${esc2(nmAb(n))}</button>`).join("")}</div>
  <div class="tast"><span>Scelte del Draft</span></div>
  ${P.length?`<div class="tapl">${P.map(p=>{const k=pkKey(p);return`<button type="button" class="tapc${TA.pk[s].includes(k)?" on":""}" data-ta="pk" data-s="${s}" data-k="${esc2(k)}">${p[0]} · ${p[1]}°${p[2]!==t?" ("+esc2(nick(p[2]))+")":""}</button>`}).join("")}</div>`:`<small class="tain">Nessuna scelta disponibile.</small>`}
  <input class="taex" data-ta="ex" data-s="${s}" type="text" maxlength="90" placeholder="Altro (contratti, note)…" value="${esc2(TA.ex[s])}">`:`<p class="tain">Scegli la squadra per vedere i suoi giocatori.</p>`}</section>`};
 const sum=!errs.length?`<div class="tasm">${[0,1].map(s=>`<p><b>${esc2(nick(TA.t[1-s]))}</b> riceve: ${taItems(s).map(esc2).join(", ")}</p>`).join("")}</div>`:`<ul class="taer">${errs.map(e=>`<li>${e}</li>`).join("")}</ul>`;
 return`<button class="gback" data-go="home">‹ Home</button>${H("Pic-Trade",`<em>Scambio ufficiale</em>`)}
 <div class="tagrid">${side(0)}<div class="taarr">⇄</div>${side(1)}</div>${sum}
 <div class="tabtn"><button type="button" class="tab1" data-ta="photo"${can?"":" disabled"}>📸 Fai la foto</button><button type="button" class="tab2" data-ta="copy"${can?"":" disabled"}>🔗 Copia per Claude</button></div>
 <p class="note">La foto è l'immagine da condividere con maglie, AVG, età e «Scambio ufficiale». «Copia per Claude» copia il prompt con il link: incollalo a Claude per registrare lo scambio (rose, scelte del Draft e Storico trade).</p>`}
window.SCAMBIV.pictrade=vPicTrade;
(window.NAVX=window.NAVX||[]).push({k:"pt",get:()=>JSON.parse(JSON.stringify(TA)),set:o=>{if(o&&o.t)TA=o}});
/* ---------- tocchi ---------- */
document.addEventListener("click",e=>{if(cur!=="pictrade")return;const b=e.target.closest("[data-ta]");if(!b||b.disabled||b.tagName==="SELECT"||b.tagName==="INPUT")return;const a=b.dataset.ta,s=+b.dataset.s,y=scrollY;
 if(a==="pl"){const i=TA.pl[s].indexOf(b.dataset.n);i<0?TA.pl[s].push(b.dataset.n):TA.pl[s].splice(i,1)}
 else if(a==="pk"){const i=TA.pk[s].indexOf(b.dataset.k);i<0?TA.pk[s].push(b.dataset.k):TA.pk[s].splice(i,1)}
 else if(a==="copy"){const t=taPrompt(),ok=()=>{b.textContent="✔ Copiato";setTimeout(()=>{b.textContent="🔗 Copia per Claude"},1800)};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,()=>{window.prompt("Copia questo testo:",t)});else window.prompt("Copia questo testo:",t);return}
 else if(a==="photo"){shShare();return}
 else return;render();scrollTo(0,y)});
document.addEventListener("change",e=>{if(cur!=="pictrade")return;const b=e.target.closest("select[data-ta]");if(!b)return;const s=+b.dataset.s,y=scrollY;
 if(b.dataset.ta==="team"){TA.t[s]=b.value;TA.pl[s]=[];TA.pk[s]=[]}render();scrollTo(0,y)});
document.addEventListener("input",e=>{if(cur!=="pictrade")return;const b=e.target;if(b.dataset&&b.dataset.ta==="ex")TA.ex[+b.dataset.s]=b.value});
/* link «?scambio=…»: apre Pic-Trade già compilata */
try{const q=new URLSearchParams(location.search).get("scambio");if(q){const o=JSON.parse(decodeURIComponent(escape(atob(q))));if(o&&o.t&&o.pl){TA=Object.assign(TA,{pk:[[],[]],ex:["",""]},o);setTimeout(()=>{try{cur="pictrade";curTeam=null;render()}catch(e){}},0)}}}catch(e){}

/* ===== FOTO (disegno su canvas come shHistTrade di Dreamers, ramo Pic-Trade) ===== */
function shRR(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
const SH_F=(w,s,it)=>`${it?"italic ":""}${w} ${s}px "Barlow Condensed","Arial Narrow",Arial,sans-serif`,SH_B=(w,s)=>`${w} ${s}px Barlow,Arial,sans-serif`;
const SHF=v=>v==null?"—":(Math.round(v*10)/10).toLocaleString("it-IT",{minimumFractionDigits:1,maximumFractionDigits:1});
const SH_ICO='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
function shImg(src){return new Promise(r=>{if(!src)return r(null);const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src})}
async function shLogoAt(c,t,x,y,z){const lg=await shImg((TM[t]||{}).logo);if(lg){const r=Math.min(z/lg.width,z/lg.height);c.drawImage(lg,x+(z-lg.width*r)/2,y+(z-lg.height*r)/2,lg.width*r,lg.height*r)}}
/* maglia della squadra (la stessa del campo, campo.js) disegnata da SVG */
async function shJersey(t,n){try{if(!window.e16Jersey)return null;const s=e16Jersey(t,e16Num(n),nick(t));return await shImg("data:image/svg+xml;charset=utf-8,"+encodeURIComponent(s.includes("xmlns=")?s:s.replace("<svg",'<svg xmlns="http://www.w3.org/2000/svg"')))}catch(e){return null}}
/* di giorno lo stile parquet di Dreamers: i viola del disegno vengono rimappati sui colori parquet (come shThemeCtx di Dreamers) */
const TH_PQ={bg:["#b9763a","#9b5f2c"],deep:[30,15,5],pan:[48,25,10],pan2:[104,56,22],acc:[242,112,26],lt:[255,184,108],stripe:"rgba(0,0,0,.07)",ang:90};
const shTheme=()=>(typeof E16N!=="undefined"&&E16N)?null:TH_PQ;
function shThemeBg(c,W,H,T){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,T.bg[0]);g.addColorStop(1,T.bg[1]);c.fillStyle=g;c.fillRect(0,0,W,H);
 c.save();c.strokeStyle=T.stripe;c.lineWidth=26;c.beginPath();for(let x=0;x<W;x+=60){c.moveTo(x,0);c.lineTo(x,H)}c.stroke();c.restore()}
function shThemeCtx(c,T){const cache={};const map=v=>{if(typeof v!=="string")return v;if(cache[v]!==undefined)return cache[v];let r,g,b,a=1,m;
  if(m=v.match(/^#([0-9a-f]{6})$/i)){const n=parseInt(m[1],16);r=n>>16;g=n>>8&255;b=n&255}
  else if(m=v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/)){r=+m[1];g=+m[2];b=+m[3];if(m[4]!=null)a=+m[4]}
  else return cache[v]=v;
  if(v.toLowerCase()==="#8b5cf6")return cache[v]=v;
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn,L=(mx+mn)/510;let out=v;
  if(d>0){const S=d/(255-Math.abs(mx+mn-255));let h;if(mx===r)h=((g-b)/d+6)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;
   if(h>=225&&h<=300&&S>.25){const q=L>=.78?T.lt:L>=.55?T.acc:L>=.3?T.pan2:L>=.08?T.pan:T.deep;out=`rgba(${q[0]},${q[1]},${q[2]},${a})`}}
  return cache[v]=out};
 for(const k of["fillStyle","strokeStyle","shadowColor"]){const ds=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,k);Object.defineProperty(c,k,{configurable:true,get(){return ds.get.call(c)},set(v){ds.set.call(c,map(v))}})}
 for(const k of["createLinearGradient","createRadialGradient"]){const f=c[k].bind(c);c[k]=(...a)=>{const g=f(...a),ac=g.addColorStop.bind(g);g.addColorStop=(o,col)=>ac(o,map(col));return g}}}
/* sfondo e marchio: come shBase di Dreamers, con il logo dell app e la scritta ESPN 16 */
async function shBase(H,W){try{await Promise.all([document.fonts.load(SH_F(800,40,1)),document.fonts.load(SH_F(700,40)),document.fonts.load(SH_B(500,30)),document.fonts.load(SH_B(600,30))])}catch(e){}
 const cv=document.createElement("canvas");cv.width=W;cv.height=H;const c=cv.getContext("2d"),TH=shTheme();let g;
 if(TH){shThemeBg(c,W,H,TH);shThemeCtx(c,TH)}else{
  g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,"#2a1260");g.addColorStop(.45,"#160a38");g.addColorStop(1,"#0a0618");c.fillStyle=g;c.fillRect(0,0,W,H);
  g=c.createRadialGradient(200,0,0,200,0,760);g.addColorStop(0,"rgba(168,85,247,.55)");g.addColorStop(1,"rgba(168,85,247,0)");c.fillStyle=g;c.fillRect(0,0,W,H);
  g=c.createRadialGradient(980,140,0,980,140,620);g.addColorStop(0,"rgba(59,130,246,.35)");g.addColorStop(1,"rgba(59,130,246,0)");c.fillStyle=g;c.fillRect(0,0,W,H);
  let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<Math.round(H/14);i++){c.globalAlpha=.25+rnd()*.6;c.fillStyle=rnd()<.3?"#e9d5ff":"#fff";c.beginPath();c.arc(rnd()*W,rnd()*H,.8+rnd()*1.8,0,7);c.fill()}c.globalAlpha=1}
 /* logo dell app (riquadro E16) */
 const lg=await shImg("logo-app.png");c.save();shRR(c,56,56,76,76,16);c.clip();if(lg)c.drawImage(lg,56,56,76,76);else{c.fillStyle="#ea580c";c.fillRect(56,56,76,76)}c.restore();
 c.textBaseline="alphabetic";c.textAlign="left";c.font=SH_F(800,48,1);c.letterSpacing="6px";const bg=c.createLinearGradient(150,0,420,0);bg.addColorStop(0,"#e9d5ff");bg.addColorStop(.5,"#c084fc");bg.addColorStop(1,"#a5b4fc");c.fillStyle=TH?"#fff":bg;c.shadowColor="rgba(168,85,247,.8)";c.shadowBlur=18;c.fillText("ESPN 16",150,102);c.shadowBlur=0;c.letterSpacing="3px";c.font=SH_F(700,19,1);c.fillStyle="rgba(233,213,255,.8)";c.fillText("FANTABASKET USA · AVG",153,128);c.letterSpacing="0px";
 return{cv,c,W}}
function shFoot(c,W,H,txt){const PQ=!!shTheme();if(PQ){shRR(c,40,H-92,W-80,72,18);c.fillStyle="#fdf3e1";c.fill()}else{c.strokeStyle="rgba(196,181,253,.25)";c.lineWidth=2;c.beginPath();c.moveTo(56,H-96);c.lineTo(W-56,H-96);c.stroke()}
 const n=new Date(),p=v=>String(v).padStart(2,"0");c.font=SH_B(500,24);c.fillStyle=PQ?"#b8410a":"rgba(226,232,240,.6)";c.textAlign="left";c.textBaseline="middle";c.fillText(txt,56,H-56);
 c.textAlign="right";c.fillText(`${p(n.getDate())}/${p(n.getMonth()+1)} · ${p(n.getHours())}:${p(n.getMinutes())}`,W-56,H-56)}
/* immagine Pic-Trade: due pannelli «RICEVE» con maglie, nome, ruolo · età, AVG e valore; extra (scelte, altro) in caselle oro; fascia «✔ SCAMBIO UFFICIALE» */
async function shPicTrade(){const T=taTrade(),W=1080,IN=W-112,pw=(IN-24)/2,rowH=186;
 /* lato k = squadra che riceve; giocatori = quelli ceduti dall altra */
 const sides=[0,1].map(k=>{const s=1-k,t=TA.t[k],pl=[...TA.pl[s]],ex=taItems(s).filter(x=>!pl.includes(x));return{t,pl,ex}});
 const load=Math.max(...sides.map(s=>s.pl.length)),SC=load<=1?1.18:load===2?1.0:load===3?.86:.74,mc=document.createElement("canvas").getContext("2d");
 const exH=sd=>{if(!sd.ex.length)return 0;let x=22,rows=1;sd.ex.forEach(t0=>{const t=t0.toUpperCase();let f=28;mc.font=SH_F(800,f,1);while(f>18&&mc.measureText(t).width+28>pw-40){f-=2;mc.font=SH_F(800,f,1)}const w=mc.measureText(t).width+28;if(x+w>pw-18){x=22;rows++}x+=w+10});return 34+rows*50};
 const topH=Math.max(...sides.map(sd=>230+Math.round(sd.pl.length*rowH*SC)+exH(sd)+24)),Hh=190+topH+40+125+130;
 const{cv,c}=await shBase(Hh,W);
 c.font=SH_F(700,28,1);c.textAlign="right";c.textBaseline="alphabetic";c.fillStyle="rgba(233,213,255,.75)";c.fillText("PIC-TRADE · "+T.data+" "+T.ora,W-56,100);
 let y=190;const LK=window.TA_LOOK||"space";
 for(let k=0;k<2;k++){const sd=sides[k],t=sd.t,bgc=TCOL[t]||"#334155",x0=56+k*(pw+24),panH=topH;
  c.save();shRR(c,x0,y,pw,panH,28);c.clip();c.fillStyle="rgba(10,6,24,.62)";c.fillRect(x0,y,pw,panH);
  if(LK==="space"){const bg2=c.createLinearGradient(x0,y,x0,y+panH);bg2.addColorStop(0,"#3b1c8a");bg2.addColorStop(1,"#150a38");c.fillStyle=bg2;c.fillRect(x0,y,pw,panH);c.fillStyle=bgc;c.fillRect(x0,y,pw,210)}
  else{const gg=c.createLinearGradient(x0,y,x0+pw,y+210);gg.addColorStop(0,bgc);gg.addColorStop(1,"rgba(10,6,24,.2)");c.fillStyle=gg;c.fillRect(x0,y,pw,210)}
  c.fillStyle="#ffffff";c.fillRect(x0,y+210,pw,8);c.restore();
  shRR(c,x0,y,pw,panH,28);c.strokeStyle=bgc;c.lineWidth=6;c.stroke();
  await shLogoAt(c,t,x0+22,y+24,140);
  c.textAlign="left";c.textBaseline="alphabetic";c.fillStyle="#fff";let fs=64;c.font=SH_F(800,fs,1);const nk=nickU(t);while(fs>34&&c.measureText(nk).width>pw-190){fs-=2;c.font=SH_F(800,fs,1)}c.fillText(nk,x0+178,y+86);
  c.font=SH_F(700,28,1);c.globalAlpha=.85;c.fillText("RICEVE",x0+178,y+126);c.globalAlpha=1;
  let yy=y+230;
  for(const n of sd.pl){c.save();c.translate(x0*(1-SC),yy*(1-SC));c.scale(SC,SC);const role=ruoloDi(n),rc=role==="G"?"#ef4444":role==="F"?"#60a5fa":"#fbbf24";
   /* maglia della squadra che lo riceve */
   const ic=await shJersey(t,n);
   if(ic){const bx=150,r=Math.min(bx/ic.width,bx/ic.height);c.drawImage(ic,x0+16+(bx-ic.width*r)/2,yy+(rowH-12-ic.height*r)/2,ic.width*r,ic.height*r)}
   c.textAlign="left";c.textBaseline="alphabetic";const tx=x0+170,mw=pw/SC-170-12;c.fillStyle="#fff";let f2=40;c.font=SH_F(800,f2,1);const nn=n.toUpperCase();while(f2>26&&c.measureText(nn).width>mw){f2-=2;c.font=SH_F(800,f2,1)}c.fillText(nn,tx,yy+44);
   const eta=etaOf(n);c.beginPath();c.arc(tx+8,yy+68,8,0,7);c.fillStyle=rc;c.fill();c.fillStyle="rgba(233,213,255,.85)";c.font=SH_F(700,21,1);c.fillText(`${({G:"GUARDIA",F:"ALA",C:"CENTRO"})[role]}${eta!=null?" · "+eta+" ANNI":""}`,tx+24,yy+75);
   c.font=SH_F(700,22,1);c.fillStyle="rgba(226,232,240,.65)";c.fillText("AVG",tx,yy+134);c.font=SH_F(800,58,1);c.fillStyle="#fde047";c.fillText(SHF(avgOf(n)),tx+62,yy+138);
   const v=valOf(n);if(v!=null){const tt=`VALORE ${v}`;c.font=SH_F(800,20,1);const w=c.measureText(tt).width+22;shRR(c,tx,yy+152,w,28,8);c.fillStyle="rgba(245,180,0,.9)";c.fill();c.fillStyle="#1b1200";c.textAlign="left";c.textBaseline="middle";c.fillText(tt,tx+11,yy+167);c.textBaseline="alphabetic"}
   c.fillStyle="rgba(255,255,255,.08)";c.fillRect(x0+22,yy+rowH-8,pw/SC-44,2);c.restore();yy+=rowH*SC}
  /* extra: scelte del Draft e note, caselle oro */
  if(sd.ex.length){let ex=x0+22,ey=yy+10;c.textBaseline="middle";c.textAlign="left";sd.ex.forEach(t0=>{const tt=("+ "+t0).toUpperCase();let f=28;c.font=SH_F(800,f,1);while(f>18&&c.measureText(tt).width+28>pw-40){f-=2;c.font=SH_F(800,f,1)}const w=c.measureText(tt).width+28;if(ex+w>x0+pw-18){ex=x0+22;ey+=50}shRR(c,ex,ey,w,42,12);c.fillStyle="rgba(245,180,0,.2)";c.fill();c.strokeStyle="rgba(245,180,0,.6)";c.lineWidth=2;c.stroke();c.fillStyle="#fcd34d";c.fillText(tt,ex+14,ey+22);ex+=w+10});c.textBaseline="alphabetic"}}
 y+=topH+40;
 const gg=c.createLinearGradient(56,y,56+IN,y);gg.addColorStop(0,"#7c3aed");gg.addColorStop(.55,"#a855f7");gg.addColorStop(1,"#6366f1");shRR(c,56,y,IN,105,22);c.fillStyle=gg;c.fill();c.strokeStyle="rgba(233,213,255,.55)";c.lineWidth=3;c.stroke();
 c.textAlign="center";c.textBaseline="alphabetic";c.fillStyle="#fff";c.font=SH_F(800,46,1);c.letterSpacing="2px";c.fillText("✔ SCAMBIO UFFICIALE",56+IN/2,y+67);c.letterSpacing="0px";c.textAlign="left";
 shFoot(c,W,Hh,"ESPN 16 · Pic-Trade");return cv}
window.e16PicTradeCanvas=shPicTrade;
/* foglio di condivisione come Dreamers (anteprima, Chiudi, Salva, Condividi) */
async function shShare(){const sh=document.createElement("div");sh.className="shsheet";sh.innerHTML='<div class="shbox"><p class="shwait">Preparo l\'immagine…</p></div>';document.body.appendChild(sh);
 sh.addEventListener("click",e=>{if(e.target===sh||e.target.closest(".shx"))sh.remove()});
 let cv=null;try{cv=await shPicTrade()}catch(e){console.error(e)}
 if(!cv){sh.querySelector(".shbox").innerHTML='<p class="shwait">Niente da condividere adesso.</p><button class="shx">Chiudi</button>';return}
 const name="pic-trade.png",blob=await new Promise(r=>cv.toBlob(r,"image/png")),file=new File([blob],name,{type:"image/png"}),url=URL.createObjectURL(blob);
 sh.querySelector(".shbox").innerHTML=`<img src="${url}" alt="Anteprima da condividere"><div class="shfoot"><div class="shbar"><button class="shx">Chiudi</button><a class="shsv" href="${url}" download="${name}">Salva</a><button class="shgo">${SH_ICO} Condividi</button></div></div>`;
 const go=sh.querySelector(".shgo");if(!(navigator.canShare&&navigator.canShare({files:[file]})))go.remove();
 else go.addEventListener("click",async()=>{try{await navigator.share({files:[file],title:"ESPN 16 · Pic-Trade"})}catch(e){}})}
})();
