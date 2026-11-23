/* ===== ESPN 16 – (92) FORMAZIONI DEL LUNEDÌ IN DIRETTA =====
   Il lunedì (primo giorno della settimana di lega) i GM mettono la formazione su ESPN fino alla prima partita: da lì resta bloccata tutta la settimana.
   In quella finestra il telefono legge la formazione da ESPN ogni 60 secondi (solo con l app aperta e visibile), come un dato live,
   e la mette subito in LEGA.line della settimana: Campo, Lega, sfide, Coppa e Formazione consigliata si aggiornano da soli.
   Finestra: dalle 7:00 italiane del giorno di inizio settimana fino alla palla a due della prima partita NBA di quel giorno.
   ESPN permette questa lettura dal browser (CORS aperto per il sito dell app). Il file lega-data.js (GitHub, ogni 15 minuti il lunedì) resta la base comune. */
(function(){
if(typeof LEGA==="undefined"||!LEGA.map)return;
const B="https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/2027/segments/0/leagues/1609471983";
const day=d=>new Date(d+"T12:00:00Z").getTime(),spOf=d=>Math.round((day(d)-day("2026-10-20"))/864e5)+1;
const itNow=()=>{const p=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Rome",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(new Date()),g=k=>(p.find(x=>x.type===k)||{}).value;return{d:`${g("year")}-${g("month")}-${g("day")}`,h:+g("hour"),hm:(+g("hour")%24)*60+ +(g("minute")||0)}};
/* settimana da aggiornare e prima palla a due di quel giorno; null = fuori finestra */
function finestra(){try{const t=nyToday(),w=weekOf(t<W1?W1:t),a=weekRange(w)[0];if(t!==a)return null;
 const it=itNow();if(it.d===a&&it.hm<630)return null;/* (121) dalle 10:30, quando inizia l attesa del turno nuovo */
 const ids=(ESPN.days&&ESPN.days[a])||[];let first=Infinity,started=false;for(const id of ids){const g=ESPN.games[id];if(!g)continue;if(g[4]!=="S")started=true;const t0=new Date(g[5]).getTime();if(t0<first)first=t0}
 /* (120) fino all ultimo istante: si legge fino a 10 minuti dopo la prima palla a due (la formazione è ormai bloccata: così si salva quella definitiva) */
 if(Date.now()>=first+10*60000)return null;return{w,a,first}}catch(_){return null}}
let busy=false,timer=null;window.E16FORM={ts:0,w:null};
async function giro(){const f=finestra();if(!f||busy||document.hidden)return;busy=true;
 try{const c=new AbortController(),to=setTimeout(()=>c.abort(),12000);const r=await fetch(`${B}?view=mRoster&scoringPeriodId=${spOf(f.a)}&t=${Date.now()}`,{signal:c.signal,cache:"no-store"});clearTimeout(to);if(!r.ok)return;const J=await r.json();
  const L={};for(const t of J.teams||[]){const id=LEGA.map[t.id];if(!id)continue;L[id]=(t.roster&&t.roster.entries||[]).filter(e=>e.lineupSlotId!==12&&e.lineupSlotId!==13).map(e=>e.playerPoolEntry.player.fullName)}
  if(Object.keys(L).length<TEAMS.length)return;/* risposta incompleta: si tiene quella che c era */
  LEGA.line=LEGA.line||{};const prima=JSON.stringify(LEGA.line[f.w]||{});LEGA.line[f.w]=L;window.E16FORM={ts:Date.now(),w:f.w};
  if(JSON.stringify(L)!==prima){const y=scrollY;try{render()}catch(_){}scrollTo(0,y)}
 }catch(_){}finally{busy=false}}
/* (120) ogni 60 secondi; negli ultimi 15 minuti prima della prima partita (e nei 10 dopo) ogni 15 secondi, per prendere anche gli ultimi spostamenti */
let last=0;function avvia(){if(timer)return;giro();timer=setInterval(()=>{const f=finestra();if(!f)return;const vic=Math.abs(Date.now()-f.first)<15*60000;if(vic||Date.now()-last>=60000){last=Date.now();giro()}},15000)}
/* (121) ROSE IN TEMPO REALE: con l app aperta il telefono rilegge le rose da ESPN ogni 2 minuti (firme, tagli, scambi, slot), sempre tranne
   il lunedì prima delle 9:00 (lì restano le rose della settimana finita; (145) prima era alle 10:30). Stesso formato di tools/lega.mjs: [nome, squadra NBA, slot, ruoli]. */
const PRO={1:"ATL",2:"BOS",3:"NO",4:"CHI",5:"CLE",6:"DAL",7:"DEN",8:"DET",9:"GS",10:"HOU",11:"IND",12:"LAC",13:"LAL",14:"MIA",15:"MIL",16:"MIN",17:"BKN",18:"NY",19:"ORL",20:"PHI",21:"PHX",22:"POR",23:"SAC",24:"SA",25:"OKC",26:"UTAH",27:"WSH",28:"TOR",29:"MEM",30:"CHA",0:"FA"};
const SLOT={0:"PG",1:"SG",2:"SF",3:"PF",4:"C",5:"G",6:"F",7:"SG/SF",8:"G/F",9:"PF/C",10:"F/C",11:"UTIL",12:"BE",13:"IR"},POS={1:"PG",2:"SG",3:"SF",4:"PF",5:"C"};
const pos=p=>{const d=POS[p.defaultPositionId];const L=[0,1,2,3,4].filter(s=>(p.eligibleSlots||[]).includes(s)).map(s=>SLOT[s]);return[d,...L.filter(x=>x!==d)].filter(Boolean).join(",")};
function roseAperte(){try{const t=nyToday(),w=weekOf(t<W1?W1:t);if(w>1&&weekRange(w)[0]===t&&itNow().hm<540&&!(window.E16_TURNO_ECC&&t in E16_TURNO_ECC))return false;return true}catch(_){return false}}
let rbusy=false;async function giroRose(){if(rbusy||document.hidden||!roseAperte()||!window.e16SetRose)return;rbusy=true;
 try{const c=new AbortController(),to=setTimeout(()=>c.abort(),12000);const r=await fetch(`${B}?view=mRoster&t=${Date.now()}`,{signal:c.signal,cache:"no-store"});clearTimeout(to);if(!r.ok)return;const J=await r.json();
  const R={};for(const t of J.teams||[]){const id=LEGA.map[t.id];if(!id)continue;R[id]=(t.roster&&t.roster.entries||[]).map(e=>{const p=e.playerPoolEntry.player;return[p.fullName,PRO[p.proTeamId]||"FA",SLOT[e.lineupSlotId]||"BE",pos(p)]})}
  if(Object.keys(R).length<TEAMS.length)return;if(e16SetRose(R)){window.E16ROSE={ts:Date.now()};const y=scrollY;try{render()}catch(_){}scrollTo(0,y)}
 }catch(_){}finally{rbusy=false}}
setTimeout(giroRose,4000);setInterval(giroRose,120000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden){giro();giroRose()}});
setTimeout(avvia,2500);
})();
