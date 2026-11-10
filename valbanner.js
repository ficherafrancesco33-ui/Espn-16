/* ===== ESPN 16 – STRISCE DEI VALORI in Home (come Dreamers (902) e (1106)) =====
   - VALORI: da domenica 18:00 a lunedì 18:00 (ora italiana) scorrono i giocatori il cui valore è cambiato con l aggiornamento
     automatico della domenica (tools/valori.mjs, VAL.h = storia settimanale): «N. Cognome · prima→dopo · ▲/▼ %», prima chi sale di più.
   - SQUADRE: da lunedì 18:01 a mercoledì 18:00 scorrono le 16 squadre con la variazione % del valore della rosa (somma dei valori prima e dopo).
   Compaiono solo se l ultimo aggiornamento dei valori è proprio di quella domenica (se GitHub non ha ancora girato, niente striscia). */
(function(){
const romeNow=()=>{const f=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Rome",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23",weekday:"short"}).formatToParts(new Date()),g=t=>(f.find(x=>x.type===t)||{}).value;
 return{d:`${g("year")}-${g("month")}-${g("day")}`,h:+g("hour")*60+ +g("minute"),wd:g("weekday")}};
const addD=(d,k)=>{const x=new Date(d+"T12:00:00Z");x.setUTCDate(x.getUTCDate()+k);return x.toISOString().slice(0,10)};
const short=n=>{const p=String(n).split(" ");return p.length>1?p[0][0]+". "+p.slice(1).join(" "):n};
const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
/* minuti passati dallo scatto della domenica (domenica 18:00 = 0), e la data della domenica */
function sinceSunday(){const n=romeNow(),back={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[n.wd];let sun=addD(n.d,-back),m=back*1440+n.h-18*60;if(m<0){sun=addD(sun,-7);m+=7*1440}return{sun,m}}
function changes(){if(typeof VAL==="undefined"||!VAL.w||VAL.w.length<2)return null;const k=VAL.w.length-1,L=[];
 for(const n in VAL.h){const h=VAL.h[n];if(!h||h.length<VAL.w.length)continue;const a=h[k-1],b=h[k];if(a==null||b==null||a===b||!a)continue;L.push({n,a,b,p:Math.round((b-a)/a*100)})}return{k,L,date:VAL.w[k]}}
function valHtml(){const s=sinceSunday();if(s.m<0||s.m>=1440)return"";const C=changes();if(!C||C.date!==s.sun)return"";
 const L=C.L.slice().sort((x,y)=>(y.b-y.a)/y.a-(x.b-x.a)/x.a);if(!L.length)return"";
 const it=x=>`<span class="tki ${x.b>x.a?"su":"giu"}"><b>${e(short(x.n))}</b><em>${x.a}→${x.b}</em><i>${x.b>x.a?"▲ +":"▼ "}${Math.abs(x.p)}%</i></span>`,row=L.map(it).join("");
 return `<div class="tkbar" role="marquee" aria-label="Valori aggiornati"><span class="tklab">VALORI<small>dom 18:00</small></span><div class="tkvw"><div class="tktr" style="animation-duration:${Math.max(25,L.length*3)}s">${row}${row}</div></div></div>`}
function sqHtml(){const s=sinceSunday();if(s.m<1441||s.m>=3*1440)return"";const C=changes();if(!C||C.date!==s.sun)return"";const k=C.k,L=[];
 for(const t of TEAMS){let a=0,b=0;for(const g of ROSE[t.id]||[]){const h=VAL.h[g[0]];if(h&&h[k-1]!=null&&h[k]!=null){a+=h[k-1];b+=h[k]}}if(a>0)L.push({t:t.id,p:(b-a)/a*100})}
 L.sort((x,y)=>y.p-x.p);if(!L.length)return"";
 const it=x=>`<span class="tki ${x.p>=0?"su":"giu"}"><img src="${TM[x.t].logo}" alt="" style="height:24px;width:auto;margin-right:6px;align-self:center;display:inline-block;transform:translateY(1px)"><b>${e(TM[x.t].nome.split(" ").slice(-1)[0].toUpperCase())}</b><i>${x.p>=0?"▲ +":"▼ "}${Math.abs(x.p).toFixed(1).replace(".",",")}%</i></span>`,row=L.map(it).join("");
 return `<div class="tkbar tksq" role="marquee" aria-label="Valore delle squadre"><span class="tklab">SQUADRE<small>lun–mer</small></span><div class="tkvw"><div class="tktr" style="animation-duration:30s">${row}${row}</div></div></div>`}
function put(){try{if(cur!=="home"||curTeam)return;const m=document.getElementById("main");if(!m||m.querySelector(".tkbar"))return;const hb=m.querySelector(".hbar");if(!hb)return;const h=valHtml()||sqHtml();if(h)hb.insertAdjacentHTML("afterend",h)}catch(_){}}
window.e16TkTest={valHtml,sqHtml,changes,sinceSunday};
const R0=render;render=function(){const r=R0.apply(this,arguments);put();return r};
setTimeout(put,800);setInterval(put,60000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)put()});
})();
