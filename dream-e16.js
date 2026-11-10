/* ===== ESPN 16 – (67) MODALITÀ DREAM: lo stadio 3D di Dreamers per tutte le 16 squadre =====
   dream.js è copiato da Dreamers così com'è (stesse funzioni: tiro, gara da 3, 1 contro 1, inquadratura TV, spogliatoi, sala trofei, ufficio del GM).
   Qui c'è solo l'adattatore: i dati che dream.js leggeva dall'app Dreamers (TEAMS, ROSTER, LOGO, TV, TVL, jersey, sfide del turno…)
   costruiti con i dati ESPN 16 e passati a dream.js come parametri (window.DRM_E16.args, stesso ordine dell'intestazione di dream.js).
   - Colori dello stadio: TCOL (colore della squadra) + COL di campo.js (scritte e bordi); logo da loghi/; maglie con jersey() di kit.js.
   - Giocatori stanotte: tabellini ESPN (ESPN.days/games/box, aggiornati da live.js) nel formato della Dynasty TV di Dreamers.
   - Sala trofei / albo d'oro: vuoti (nessun dato storico ESPN 16): bacheca «il primo trofeo è vicino».
   - Niente Dream City (solo arena, spogliatoi, sala trofei, ufficio): si entra sempre con {solo:true} come dal tasto D di Dreamers.
   Il tasto viola «D» sta a destra nel tabellone del Campo (h2.lbmh), specchio del tasto maglia; dream.js si scarica solo al primo tocco. */
(function(){
const nm=n=>String(n||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[.'’]/g,"").replace(/\s+(jr|sr|ii|iii|iv)$/,"").replace(/[^a-z0-9]+/g," ").trim();
const lum=h=>{const x=parseInt(String(h).slice(1),16);return(0.299*(x>>16)+0.587*((x>>8)&255)+0.114*(x&255))/255};
const nick=t=>{const T=TM[t];return T?T.nome.split(" ").slice(-1)[0]:t};
/* maglia forzata per gli armadietti (dream.js mette KITO = 0/1/2 = Casa/Notte/Alternativa, come in Dreamers) */
window.KITO=null;window.DUCK_GST=false;/* niente stile Gotham: è solo dei Ducks di Dreamers */
const D={TEAMS:{},ROSTER:{},LOGO:{},LOGO_DUC0:{},TV:{upd:"",teams:{},days:{},box:{}},TVL:{st:{}},STORIA:[],STATI:{},INFORTUNI:{lista:[]},INJ_RIENTRI:[]};
/* squadre: nome, città, nick e colori stile Dreamers (bg = colore squadra, fg = scritte a contrasto, trim = bordi) */
function squadre(){const C=window.E16COL||{};TEAMS.forEach(t=>{const c=C[t.id]||{},bg=t.id==="QUE"?"#6d28d9":(TCOL[t.id]||c.bg||"#334155");
  const fg=t.id==="QUE"?"#ffffff":[c.fg,c.trim,c.bg,"#ffffff","#111111"].find(x=>x&&Math.abs(lum(x)-lum(bg))>=.3)||"#ffffff";
  const P=t.nome.split(" ");D.TEAMS[t.id]={name:t.nome,city:P.slice(0,-1).join(" "),nick:P.slice(-1)[0],bg,fg,trim:t.id==="QUE"?"#111111":(c.trim||fg)};D.LOGO[t.id]=t.logo})}
/* rosa: [nome, numero, ruolo, squadra NBA] come ROSTER di Dreamers, il migliore (AVG) per primo */
function rose(){let P={};try{P=pstats()}catch(e){}const avg=n=>{const p=P[n];return p&&p.gp?p.ff/p.gp:-1};
  for(const t in ROSE)D.ROSTER[t]=ROSE[t].slice().sort((a,b)=>avg(b[0])-avg(a[0])).map(g=>{const r=String(g[3]||"").split(",")[0];return[g[0],window.e16Num?e16Num(g[0]):"",r==="C"?"C":/G/.test(r)?"G":"F",g[1]]})}
/* partite NBA nel formato Dynasty TV di Dreamers: giorno → [ospite, casa, punti, punti, ot, stato L/F/S, ora, chiave]; tabellino a/h:
   [nome, titolare, min, punti, rimb. off, rimb. dif, rimbalzi, assist, recuperi, stoppate, perse, falli, tiri segnati, tentati, triple, tentate, liberi, tentati, +/-, punti fantasy] */
const ora=s=>{try{return new Intl.DateTimeFormat("it-IT",{timeZone:"Europe/Rome",hour:"2-digit",minute:"2-digit"}).format(new Date(s))}catch(e){return""}};
function tv(){if(typeof ESPN==="undefined")return;const T=D.TV;T.upd=ESPN.upd;
  for(const ab in ESPN.teams||{}){const x=ESPN.teams[ab];T.teams[ab]=[x[0],ab.toLowerCase(),x[1]||"#333333"]}
  const days={},box={},st={};for(const d in ESPN.days){days[d]=(ESPN.days[d]||[]).map(id=>{const g=ESPN.games[id];if(!g)return null;
    if(g[4]==="L")st[id]=g[6]||"Live";const B=ESPN.box[id];
    if(B&&g[4]!=="S"){const row=r=>[r[0],r[2],String(r[3]),r[4],r[11],r[12],r[11]+r[12],r[13],r[14],r[15],r[16],r[17],r[5],r[6],r[7],r[8],r[9],r[10],r[21]||0,Math.round(ffps(r)*100)/100];
      box[id]={a:B.filter(r=>r[1]===g[0]).map(row),h:B.filter(r=>r[1]===g[1]).map(row),oc:(B.oc||[]).map(nm),fin:g[4]==="F"}}
    return[g[0],g[1],g[2],g[3],g[6]==="OT"?1:0,g[4],g[4]==="S"?ora(g[5]):"",id]}).filter(Boolean)}
  T.days=days;T.box=box;D.TVL.st=st}
/* notte del campo come Dreamers: oggi (data USA) se ci sono partite iniziate, altrimenti ieri */
function notte(){const o=nyToday(),x=new Date(o+"T12:00:00Z");x.setUTCDate(x.getUTCDate()-1);const ie=x.toISOString().slice(0,10),on=d=>(D.TV.days[d]||[]).some(g=>g[5]==="L"||g[5]==="F");return on(o)?o:on(ie)?ie:null}
function campoNotteMap(t,dd){const d=dd||notte(),o={};if(!d)return o;const mine={};(D.ROSTER[t]||[]).forEach(p=>mine[nm(p[0])]=p[0]);
  for(const g of D.TV.days[d]||[]){const B=g[7]&&D.TV.box[g[7]];if(!B||g[5]==="S")continue;
    [["a",g[1]],["h",g[0]]].forEach(([sd,opp])=>(B[sd]||[]).forEach(r=>{const n=mine[nm(r[0])];if(n&&r[19]!=null)o[n]={p:+r[19],opp,lv:g[5]==="L",st:g[5]==="L"?(D.TVL.st[g[7]]||"Live"):"Finale",k:g[7],sd,dy:d}}))}
  return o}
/* sfida della settimana ESPN 16 al posto del turno Dreamers (maxischermo, spogliatoio ospiti, canale TV) */
let SC={};const sco=k=>{const n=Date.now();if(SC[k]&&n-SC[k].t<20000)return SC[k].S;let S={};try{S=(typeof sfidaScores==="function"?sfidaScores(k):weekScores(k)).S||{}}catch(e){}SC[k]={t:n,S};return S};
const drStand=()=>TEAMS.map(t=>({t:t.id,...(REC[t.id]||{w:0,l:0,pf:0,pa:0})})).sort((a,b)=>(b.w-a.w)||(b.pf-a.pf));
const drPO=x=>x,drCurWeek=()=>{const d=nyToday();return weekOf(d<W1?W1:d)},drWeek=k=>({k,closed:SCORES[k]!=null}),drPairs=k=>MATCHUPS[k]||[],drTeam=(k,t)=>({score:sco(k)[t]??null});
/* maglie: jersey() di kit.js con il nome della squadra sul petto; KITO 2 (Alternativa) per i Ducks = la loro prima maglia in più */
function jersey(t,num,nk){const K=window.KITO;let kf;if(K!=null){kf=K;try{if(t==="QUE"&&K===2)kf=E16KIT.kitLista(t)[2]}catch(e){}}
  return window.E16KIT?E16KIT.jersey(t,num,nk||nick(t),undefined,kf):(window.e16Jersey?e16Jersey(t,num,nk||nick(t)):"")}
const pdkF=v=>f1(v),pdkLvl=v=>v==null?"na":v>=50?"v":v>=35?"g":v>=20?"y":"r";
const tvEspn=async()=>{try{if(window.e16Live)await e16Live()}catch(e){}tv()};
D.refresh=()=>{squadre();rose();tv();SC={}};
/* stesso ordine dei parametri di dream.js */
D.args=[D.TEAMS,D.ROSTER,D.LOGO,D.LOGO_DUC0,D.TV,D.TVL,D.STORIA,D.STATI,D.INFORTUNI,D.INJ_RIENTRI,campoNotteMap,nm,tvEspn,()=>{},nyToday,jersey,undefined,pdkF,pdkLvl,drCurWeek,drPO,drPairs,drStand,drTeam,drWeek,undefined,[],"menu",{},undefined,{},()=>{},null];
window.DRM_E16=D;
/* ---- tasto viola «D» (identico a Dreamers DRM_BTN) ---- */
const DRM_BTN=`<button class="drmbtn" id="drmbtn" type="button" aria-label="Modalità Dream" title="Modalità Dream"><svg viewBox="0 0 24 24" aria-hidden="true"><text x="11" y="18.2" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="17" font-weight="900" font-style="italic" fill="#fff">D</text><path d="M19.2 2.6l.75 1.6 1.65.2-1.2 1.15.3 1.7-1.5-.85-1.5.85.3-1.7-1.2-1.15 1.65-.2z" fill="#fde68a"/></svg></button>`;
window.e16DrmBtn=t=>TM[t]?DRM_BTN.replace('id="drmbtn"',`id="drmbtn" data-drmt="${t}"`):"";
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("#drmbtn");if(!b)return;e.preventDefault();e.stopPropagation();const t=b.dataset.drmt||(window.e16RT&&e16RT());if(!TM[t])return;
  /* iPhone: audio e voce della modalità Dream si sbloccano solo dentro il tocco (come Dreamers) */
  try{const AC=window.AudioContext||window.webkitAudioContext;if(AC&&!window.__drmAC){try{if(navigator.audioSession)navigator.audioSession.type="playback"}catch(_){}window.__drmAC=new AC();window.__drmAC.resume()}const S=window.speechSynthesis;if(S){const u=new SpeechSynthesisUtterance(" ");u.volume=0;u.lang="it-IT";S.speak(u)}}catch(_){}
  const go=()=>{try{D.refresh();window.dreamOpen(t,{solo:true})}catch(er){console.error(er)}};
  if(window.dreamOpen)return go();const s=document.createElement("script");s.src="dream.js?v=67";s.onload=go;s.onerror=()=>alert("Modalità Dream non disponibile: controlla la connessione.");document.head.appendChild(s)},true);
/* iPhone: chiusa la modalità Dream si spegne l audio (come Dreamers) */
(function(){const off=()=>{try{const a=window.__drmAC;if(a&&a.state!=="closed")a.close()}catch(e){}window.__drmAC=null;try{if(navigator.audioSession)navigator.audioSession.type="auto"}catch(e){}try{speechSynthesis.cancel()}catch(e){}};
 const hook=()=>{if(window.dreamClose&&!window.dreamClose.__ofx){const C=window.dreamClose;window.dreamClose=function(){const r=C.apply(this,arguments);setTimeout(off,300);return r};window.dreamClose.__ofx=1}};
 setInterval(()=>{hook();if(!document.querySelector(".drm3")&&window.__drmAC)off()},1500);
 document.addEventListener("visibilitychange",()=>{if(document.hidden&&!document.querySelector(".drm3"))off()})})();
/* ---- stili Dreamers del tasto e dello stadio (uguali di giorno e di notte); il tasto sta a 14px dal bordo destro, come il tasto maglia a sinistra ---- */
const st=document.createElement("style");st.id="e16drm";st.textContent=`html body .drmbtn:not(#a):not(#b){margin-left:auto;flex:none;display:inline-grid;place-items:center;width:38px;height:28px;padding:0;border-radius:9px;border:1px solid #c4b5fd!important;background:linear-gradient(180deg,#8b5cf6,#5b21b6)!important;box-shadow:0 0 12px rgba(139,92,246,.65),inset 0 1px 0 rgba(255,255,255,.35);cursor:pointer;animation:drmglow 2.6s ease-in-out infinite}
html body .drmbtn svg{width:20px;height:20px;display:block}
html body .drmbtn.off:not(#a):not(#b){filter:grayscale(1);opacity:.4;animation:none;box-shadow:none;cursor:default}
@keyframes drmglow{50%{box-shadow:0 0 18px rgba(167,139,250,.9),inset 0 1px 0 rgba(255,255,255,.35)}}
h2 .kitbtn+.drmbtn{margin-left:6px!important}
h2.lbmh>.drmbtn{justify-self:end;margin-left:0!important}
body.drm3on{overflow:hidden}
@media (orientation:landscape){.drm3top{padding-top:calc(env(safe-area-inset-top) + 6px)}.drm3top button{width:36px;height:36px}.drm3t{font-size:15px}}
.drm3{position:fixed;inset:0;z-index:99999;background:#060509;color:#fff;touch-action:none;-webkit-user-select:none;user-select:none;font-family:var(--display),system-ui,sans-serif}
/* (994) nessun menu iPhone «Copia / Traduci / Cerca» toccando più volte pedali, volante e tasti: niente selezione di testo né menu del tocco lungo nella modalità Dream (tranne nei campi da scrivere) */.drm3 *,.drm3 *::before,.drm3 *::after{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}.drm3 button{touch-action:manipulation}.drm3 input,.drm3 textarea,.drm3 [contenteditable]{-webkit-user-select:text;user-select:text;-webkit-touch-callout:default}
.drm3 canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.drm3top{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:calc(env(safe-area-inset-top) + 10px) calc(env(safe-area-inset-right) + 12px) 10px calc(env(safe-area-inset-left) + 12px);background:linear-gradient(180deg,rgba(6,5,9,.85),transparent);pointer-events:none}
.drm3top button{pointer-events:auto;width:40px;height:40px;border-radius:12px;border:1px solid rgba(196,181,253,.6);background:rgba(20,12,40,.75);color:#fff;font-size:18px;cursor:pointer}
.drm3t{text-align:center;font:italic 800 17px/1 var(--display),Arial;letter-spacing:.14em;text-shadow:0 0 14px #8b5cf6}.drm3t small{display:block;margin-top:4px;font:700 10.5px/1 system-ui,sans-serif;letter-spacing:.12em;color:#c4b5fd}
.drm3msg{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:12px 18px;border-radius:12px;background:rgba(20,12,40,.85);border:1px solid #8b5cf6;font:700 14px/1.3 system-ui,sans-serif;text-align:center;max-width:80%}
.drm3pad{position:absolute;right:14px;bottom:calc(env(safe-area-inset-bottom) + 18px);display:grid;gap:10px}
.drm3pad button{width:58px;height:58px;border-radius:50%;border:1.5px solid rgba(196,181,253,.8);background:rgba(30,16,60,.7);color:#fff;font-size:20px;cursor:pointer;touch-action:none}
.drm3pad button:active{background:#7c3aed}
.drm3def{position:absolute;left:14px;bottom:calc(env(safe-area-inset-bottom) + 22px);padding:10px 14px;border-radius:12px;border:1.5px solid #fde68a;background:rgba(30,16,60,.75);color:#fde68a;font:italic 900 14px/1 Arial Black,Arial;letter-spacing:.06em;cursor:pointer}
.drm3hint{pointer-events:none}/* (02/11) la scritta d aiuto non blocca più i tocchi (anche invisibile copriva il fondo dello schermo) */
.drm3hint{position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom) + 40px);transform:translateX(-50%);padding:8px 12px;border-radius:10px;background:rgba(10,6,20,.7);font:600 12px/1.3 system-ui,sans-serif;color:#ddd6fe;transition:opacity .6s;white-space:normal;width:max-content;max-width:88vw;text-align:center}
html body h2.lbmh>.drmbtn:not(#a):not(#b){justify-self:end;margin-left:0!important;margin-right:14px!important}`;document.head.appendChild(st);
})();
