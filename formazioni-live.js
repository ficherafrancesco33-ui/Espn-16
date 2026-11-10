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
const itNow=()=>{const p=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Rome",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",hour12:false}).formatToParts(new Date()),g=k=>(p.find(x=>x.type===k)||{}).value;return{d:`${g("year")}-${g("month")}-${g("day")}`,h:+g("hour")}};
/* settimana da aggiornare e prima palla a due di quel giorno; null = fuori finestra */
function finestra(){try{const t=nyToday(),w=weekOf(t<W1?W1:t),a=weekRange(w)[0];if(t!==a)return null;
 const it=itNow();if(it.d===a&&it.h<7)return null;
 const ids=(ESPN.days&&ESPN.days[a])||[];let first=Infinity,started=false;for(const id of ids){const g=ESPN.games[id];if(!g)continue;if(g[4]!=="S")started=true;const t0=new Date(g[5]).getTime();if(t0<first)first=t0}
 if(started||Date.now()>=first)return null;return{w,a}}catch(_){return null}}
let busy=false,timer=null;window.E16FORM={ts:0,w:null};
async function giro(){const f=finestra();if(!f||busy||document.hidden)return;busy=true;
 try{const c=new AbortController(),to=setTimeout(()=>c.abort(),12000);const r=await fetch(`${B}?view=mRoster&scoringPeriodId=${spOf(f.a)}&t=${Date.now()}`,{signal:c.signal,cache:"no-store"});clearTimeout(to);if(!r.ok)return;const J=await r.json();
  const L={};for(const t of J.teams||[]){const id=LEGA.map[t.id];if(!id)continue;L[id]=(t.roster&&t.roster.entries||[]).filter(e=>e.lineupSlotId!==12&&e.lineupSlotId!==13).map(e=>e.playerPoolEntry.player.fullName)}
  if(Object.keys(L).length<TEAMS.length)return;/* risposta incompleta: si tiene quella che c era */
  LEGA.line=LEGA.line||{};const prima=JSON.stringify(LEGA.line[f.w]||{});LEGA.line[f.w]=L;window.E16FORM={ts:Date.now(),w:f.w};
  if(JSON.stringify(L)!==prima){const y=scrollY;try{render()}catch(_){}scrollTo(0,y)}
 }catch(_){}finally{busy=false}}
function avvia(){if(timer)return;giro();timer=setInterval(()=>{if(!finestra()){return}giro()},60000)}
document.addEventListener("visibilitychange",()=>{if(!document.hidden)giro()});
setTimeout(avvia,2500);
})();
