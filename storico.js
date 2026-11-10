/* ===== ESPN 16 – STORICO TRADE (come «Trade Alert · Operazioni chiuse» di Dreamers) =====
   TRADES: una riga per operazione, la più recente in cima: {data:"gg/mm/aaaa",ora:"hh:mm",titolo:"Scambio",lati:[["QUE",["Giocatore","Scelta 1° giro 2027"]],["HOU",[...]]]}
   (ogni lato = squadra e ciò che RICEVE). Si aggiunge quando un GM manda lo scambio con «Copia per Claude» del Pic-Trade.
   (44) In più, in automatico dalla lega ESPN (lega-data.js): LEGA.trades = giocatori arrivati con uno scambio e ancora in rosa, raggruppati per ora
   (ESPN non mostra in pubblico le scelte scambiate né chi è stato poi ceduto di nuovo); se c è una riga a mano per la stessa data e le stesse squadre vale quella.
   LEGA.mov = firme e tagli di free agent («Movimenti»). Banner in Home per 24 ore dopo ogni scambio, come Dreamers (tocca → Storico trade). */
const TRADES=[];
(function(){
const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const sur=n=>{const p=String(n).replace(/\s+(Jr\.?|II|III|IV)$/i,"").split(" ");return p.length>1?p.slice(1).join(" "):p[0]};
const nmAb=n=>{const p=String(n).split(" ");return p.length>1?p[0][0]+". "+p.slice(1).join(" "):n};
const nick=t=>TM[t]?TM[t].nome.split(" ").slice(-1)[0]:t;
const wedge=t=>`<span class="wedge" style="--tc:${TCOL[t]}"><span class="badge logo lg-${t}"></span></span>`;
const isPl=n=>{try{return!!(OWNH[__ownKey(n)]||VAL.p[n])}catch(_){return false}};
const RLx=n=>{try{const t=OWNH[__ownKey(n)];const g=t&&(ROSE[t]||[]).find(x=>__ownKey(x[0])===__ownKey(n));const r=g?String(g[3]).split(",")[0]:"";return r==="C"?"C":/G/.test(r)?"G":"F"}catch(_){return"F"}};
const pad=v=>String(v).padStart(2,"0");
const fromTs=ms=>{const f=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Rome",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date(ms)),g=t=>f.find(x=>x.type===t).value;return{data:`${g("day")}/${g("month")}/${g("year")}`,ora:`${g("hour")}:${g("minute")}`}};
/* ora italiana "gg/mm/aaaa" + "hh:mm" → istante (ms) */
const tsOf=x=>{if(x.ts)return x.ts;if(!x.data||!x.ora)return 0;const[d,m,y]=x.data.split("/").map(Number),[hh,mm]=x.ora.split(":").map(Number);
 const guess=Date.UTC(y,m-1,d,hh,mm),off=(()=>{const f=fromTs(guess);const[d2,m2]=f.data.split("/").map(Number),[h2,mi2]=f.ora.split(":").map(Number);return Date.UTC(y,m2-1,d2,h2,mi2)-guess})();return guess-off};
/* scambi: righe a mano + automatici da ESPN (stesso giorno e stesse squadre = vale la riga a mano) */
function allTrades(){const L=TRADES.map(x=>({...x,ts:tsOf(x),auto:0}));
 try{for(const T of (LEGA.trades||[])){const by={};for(const[t,p]of T.l)(by[t]=by[t]||[]).push(p);const f=fromTs(T.d),tms=Object.keys(by).sort().join();
  if(L.some(x=>x.data===f.data&&x.lati.map(l=>l[0]).sort().join().includes(tms)))continue;
  L.push({data:f.data,ora:f.ora,titolo:"Scambio",lati:Object.keys(by).map(t=>[t,by[t]]),ts:T.d,auto:1})}}catch(_){}
 return L.sort((a,b)=>b.ts-a.ts)}
window.e16Trades=allTrades;
function vStorico(){const T=allTrades();
 const cell=x=>x&&TM[x[0]]?`<div class="tc">${wedge(x[0])}<div class="tct"><small>${e(nick(x[0]))} · riceve</small><div class="trc"><div>${x[1].map(n=>`<span${isPl(n)?"":` class="tcr2"`}>${e(isPl(n)?sur(n):n)}</span>`).join("")}</div></div></div></div>`:`<div class="tc"></div>`;
 const rows=T.map(x=>{const sides=x.lati.length>=2?x.lati:[...x.lati,null];return `<div class="tr3"><div class="tty3"><span>${e(x.titolo||"Scambio")}${x.data?" "+x.data.slice(0,5):""}</span></div>${sides.map(cell).join("")}</div>`}).join("");
 const M=(typeof LEGA!=="undefined"&&LEGA.mov||[]).filter(m=>m.ty==="add"||m.ty==="drop");
 const mv=M.slice(0,120).map(m=>{const f=fromTs(m.d);return `<div class="e16mv" ${isPl(m.p)||m.ty==="drop"?`data-pl="${e(m.p)}"`:""}><span class="e16mvd">${f.data.slice(0,5)}</span>${m.t&&TM[m.t]?wedge(m.t):"<span></span>"}<span class="e16mvt ${m.ty}">${m.ty==="add"?"Firmato":"Tagliato"}</span><b>${e(m.p)}</b><small>${m.t?e(nick(m.t)):""}</small></div>`}).join("");
 return `<button class="gback" data-go="home">‹ Home</button><h2><span class="t"><span>Trade Alert</span></span><em>Operazioni chiuse</em></h2>`+
  (rows?`<div class="tbl-wrap ttab">${rows}</div><p class="note">Scambi registrati a mano (Pic-Trade) e quelli letti in automatico da ESPN («· ESPN»): di questi ESPN mostra solo i giocatori arrivati con lo scambio e ancora in rosa; le scelte del Draft scambiate non si vedono.</p>`:`<p class="note">Nessuno scambio registrato finora.</p>`)+
  `<h2><span class="t"><span>Movimenti</span></span><em>free agent · da ESPN</em></h2>${mv?`<div class="e16mvl">${mv}</div>`:`<p class="note">Nessun movimento.</p>`}`}
window.SCAMBIV=window.SCAMBIV||{};SCAMBIV.storico=vStorico;
/* banner in Home (striscia che scorre) per 24 ore dopo ogni scambio, come Dreamers: per ogni lato la squadra che riceve e i giocatori */
window.e16TradeCards=function(){const now=Date.now(),H=24*36e5;
 return allTrades().filter(x=>x.ts&&now>=x.ts&&now-x.ts<H).map(x=>{const side=l=>{const t=l[0],its=l[1]||[],pl=its.filter(isPl),ot=its.filter(n=>!isPl(n));
   return `<div class="tmcol"><div class="tmhd" style="background:linear-gradient(90deg,${TCOL[t]||"#334"},rgba(0,0,0,.25))"><span class="tmlg"><span class="badge logo lg-${t}"></span></span>${e(nick(t))} ricevono</div>${pl.map(n=>`<span class="tmp"><i class="${RLx(n)}"></i>${e(nmAb(n))}</span>`).join("")}${ot.map(n=>`<span class="tmcr">${e(n)}</span>`).join("")}</div>`};
  return `<div class="tmc" data-tmgo="1" role="link" tabindex="0" aria-label="Apri lo scambio nello Storico trade"><div class="tmrow">${x.lati.map(side).join('<span class="tmar">⇄</span>')}</div></div>`})};
document.addEventListener("click",ev=>{const b=ev.target.closest("[data-tmgo]");if(!b)return;ev.preventDefault();cur="storico";curTeam=null;render();scrollTo(0,0)});
})();
