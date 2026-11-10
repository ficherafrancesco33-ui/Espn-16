/* ===== ESPN 16 – BANNER STATS LIVE sopra il campo (come Dreamers 1494-1497) =====
   Durante le partite scorrono le statistiche dei giocatori della squadra che stanno giocando (righe complete);
   ogni statistica nuova (punti, rimbalzi, assist, recuperi, stoppate, perse, tiri sbagliati) passa una volta da sola, poi si torna alle righe complete.
   Dati: ESPN (live.js). Di giorno banner bianco con la scritta nel colore squadra, di notte banner colore squadra con scritta bianca (Ducks: viola / rosso). */
(function(){
const st=document.createElement("style");st.textContent=`.lvtick{position:relative;overflow:hidden;margin:10px 0 0;height:30px;border-radius:10px 10px 0 0;background:#fff;display:flex;align-items:center;--tk:var(--tc,#5b21b6)}
html.notte .lvtick{background:var(--tc,#5b21b6);--tk:#fff}
html:not(.notte) body[data-ct="DUC"] .lvtick{--tk:#5b21b6}html.notte body[data-ct="DUC"] .lvtick{background:#5b21b6;--tk:#f87171}
.lvtick .lvtk-tr{display:flex;white-space:nowrap;will-change:transform;animation:lvtk linear infinite}.lvtick .lvtk-tr.lvtk-1{animation:none}
.lvtick .lvtk-tr>span{display:inline-flex;padding-right:28px;font:800 italic 14px/1 'Barlow Condensed',system-ui;letter-spacing:.04em;text-transform:uppercase;color:var(--tk)!important;-webkit-text-fill-color:var(--tk)!important;text-shadow:none!important}
.lvtick b{font-weight:900}.lvtick i{font-style:normal;opacity:.55;margin:0 12px}
.lvtick .lvtk-lv{flex:none;align-self:stretch;display:flex;align-items:center;padding:0 9px;border-radius:10px 0 0 0;background:#dc2626;color:#fff;font:900 italic 12px 'Barlow Condensed',system-ui;letter-spacing:.06em;position:relative;z-index:1}
.lvtick .lvtk-lv::before{content:"";width:7px;height:7px;border-radius:50%;background:#fff;margin-right:5px;animation:lvtkb 1s ease-in-out infinite}
.lvtick .lvtk-w{flex:1;overflow:hidden;min-width:0}
.lvtick+.court{margin-top:0!important;border-top:0!important}
@keyframes lvtk{from{transform:translateX(0)}to{transform:translateX(-50%)}}@keyframes lvtkb{50%{opacity:.2}}
@media (prefers-reduced-motion:reduce){.lvtick .lvtk-tr{animation-duration:0s!important}}`;document.head.appendChild(st);
let TMc="",BASE={},Q=[],LIVE={},T0=performance.now(),KEY="",PASS=null,PT=0;
const TXT={pt:v=>v+" PT",reb:v=>v+" RIM",ast:v=>v+" AST",stl:v=>v+" STL",blk:v=>v>1?v+" stoppate":"stoppata",to:v=>v+" TOV",mis:v=>v>1?v+" tiri sbagliati":"tiro sbagliato",ftx:v=>v>1?v+" TL sbagliati":"TL sbagliato"};
const sur=n=>{const p=String(n).replace(/\s+(Jr\.?|Sr\.?|II|III|IV)$/i,"").split(" ");return p.slice(1).join(" ")||p[0]};
const team=()=>window.e16RT?e16RT():"";
/* statistiche dei giocatori della squadra nelle partite in corso */
function liveNow(){const t=team(),names=new Set((ROSE[t]||[]).map(g=>__ownKey(g[0]))),L={};
 for(const id in ESPN.games){const g=ESPN.games[id];if(!g||g[4]!=="L")continue;for(const r of ESPN.box[id]||[]){if(!names.has(__ownKey(r[0])))continue;
  L[r[0]]={pt:r[4],reb:r[11]+r[12],ast:r[13],stl:r[14],blk:r[15],to:r[16],mis:r[6]-r[5],ftx:r[10]-r[9],f:ffps(r)}}}return L}
function sample(){if(document.hidden||cur!=="campo")return;const L=liveNow();if(TMc!==team()){TMc=team();BASE={};Q=[];PASS=null}LIVE=L;
 for(const n in L){const a=L[n],b=BASE[n];if(b)for(const k of["pt","ast","reb","stl","blk","to","mis","ftx"]){const d=(a[k]||0)-(b[k]||0);if(d>0)Q.push({n,k,v:d})}BASE[n]=a}
 for(const n in BASE)if(!L[n])delete BASE[n];if(Q.length>20)Q=Q.slice(-20);paint()}
const f1=v=>(Math.round(v*10)/10).toLocaleString("it-IT",{minimumFractionDigits:1,maximumFractionDigits:1});
const full=()=>Object.keys(LIVE).map(n=>{const a=LIVE[n];return`<b>${sur(n)}</b>&nbsp;${f1(a.f)} AVG · ${a.pt||0} PT · ${a.reb||0} RIM · ${a.ast||0} AST${a.stl?` · ${a.stl} STL`:""}${a.blk?` · ${a.blk} STOP`:""}${a.to?` · ${a.to} TOV`:""}`}).join("<i>•</i>")+"<i>•</i>";
function paint(){const c=document.querySelector("main .court");let el=document.querySelector("main .lvtick");
 if(cur!=="campo"||!c||!Object.keys(LIVE).length){if(el)el.remove();PASS=null;Q=[];return}
 if(!el||el.nextElementSibling!==c){if(el)el.remove();el=document.createElement("div");el.className="lvtick";el.setAttribute("aria-label","Statistiche live");c.before(el);el.dataset.k=""}
 el.style.setProperty("--tc",TCOL[team()]||"#5b21b6");
 const now=performance.now();if(PASS&&now>=PASS.t0+PASS.dur)PASS=null;
 if(!PASS&&Q.length)PASS={html:Q.splice(0).reverse().map(e=>`<b>${sur(e.n)}</b>&nbsp;${TXT[e.k](e.v)}`).join("<i>•</i>"),t0:now,dur:0};
 const lv=`<span class="lvtk-lv">LIVE</span>`;
 if(PASS){const key="P"+PASS.t0;if(el.dataset.k!==key){el.dataset.k=key;el.innerHTML=lv+`<div class="lvtk-w"><div class="lvtk-tr lvtk-1"><span>${PASS.html}</span></div></div>`;
   const wb=el.querySelector(".lvtk-w"),tr=el.querySelector(".lvtk-tr"),W=wb.clientWidth,w=tr.scrollWidth;if(!PASS.dur)PASS.dur=Math.max(4000,(W+w)/55*1000);
   try{const an=tr.animate([{transform:`translateX(${W}px)`},{transform:`translateX(${-w}px)`}],{duration:PASS.dur,iterations:1,fill:"forwards"});an.currentTime=Math.min(PASS.dur,now-PASS.t0)}catch(e){}
   clearTimeout(PT);PT=setTimeout(paint,Math.max(50,PASS.t0+PASS.dur-now+30))}return}
 const html=full(),key="F"+html;if(el.dataset.k!==key){if(KEY!==html){KEY=html;T0=now}el.dataset.k=key;el.innerHTML=lv+`<div class="lvtk-w"><div class="lvtk-tr"><span>${html}</span><span aria-hidden="true">${html}</span></div></div>`;
  const tr=el.querySelector(".lvtk-tr"),w=tr.scrollWidth/2,dur=Math.max(8,w/45);tr.style.animationDuration=dur+"s";tr.style.animationDelay=-(((now-T0)/1000)%dur)+"s"}}
setInterval(sample,2500);setTimeout(sample,900);
const R=render;render=function(){const x=R.apply(this,arguments);try{if(cur==="campo"){if(TMc!==team())sample();else paint()}}catch(e){}return x};
window.__e16Tick=sample;
})();
