/* ===== ESPN 16 – LIVE (come Dreamers): il telefono legge da solo ESPN durante le partite =====
   Ogni 30 secondi (solo con l app aperta e se c è una partita in corso o in arrivo) scarica il calendario
   di oggi e di ieri (data USA) e i tabellini delle partite live o appena finite, e li mette in ESPN
   (stesso formato di espn-data.js, vedi tools/espn.mjs). Poi ridisegna Home, Dynasty TV e Statistiche.
   ESPN permette queste letture dal browser (CORS aperto). Il file espn-data.js resta la base. */
(function(){
if(typeof ESPN==="undefined")return;
ESPN.live=ESPN.live||{};ESPN.teams=ESPN.teams||{};
const SB=d=>`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${d.replace(/-/g,"")}&t=${Date.now()}`;
const SUM=id=>`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${id}&t=${Date.now()}`;
const fTO=(u,ms=9000)=>{const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);return fetch(u,{cache:"no-store",signal:c.signal}).then(r=>r.ok?r.json():null).catch(()=>null).finally(()=>clearTimeout(t))};
const n=v=>{const x=+String(v==null?"":v).replace("+","");return Number.isFinite(x)?x:0};
const mm=s=>{const[a,b]=String(s||"").split("-");return[n(a),n(b)]};
const nyDay=dt=>new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York"}).format(dt||new Date());
const addD=(d,k)=>{const x=new Date(d+"T12:00:00Z");x.setUTCDate(x.getUTCDate()+k);return x.toISOString().slice(0,10)};
/* stesso tabellino di tools/espn.mjs (tecnici e flagranti dalla cronaca) */
function boxOf(sum){const out=[],idx={};
 for(const t of(sum.boxscore&&sum.boxscore.players)||[]){const ab=t.team.abbreviation,S=t.statistics&&t.statistics[0];if(!S)continue;const L=S.labels||S.names||[],k=x=>L.indexOf(x);
  for(const a of S.athletes||[]){const st=a.stats||[];if(!st.length||a.didNotPlay||!a.athlete||!a.athlete.id)continue;const g=x=>st[k(x)];
   const[fgm,fga]=mm(g("FG")),[tpm,tpa]=mm(g("3PT")),[ftm,fta]=mm(g("FT"));
   const row=[a.athlete.displayName,ab,a.starter?1:0,n(g("MIN")),n(g("PTS")),fgm,fga,tpm,tpa,ftm,fta,n(g("OREB")),n(g("DREB")),n(g("AST")),n(g("STL")),n(g("BLK")),n(g("TO")),n(g("PF")),0,0,a.athlete.id,n(g("+/-")),(a.athlete.position&&a.athlete.position.abbreviation)||""];
   idx[a.athlete.id]=row;out.push(row)}}
 for(const p of sum.plays||[]){const t=(p.type&&p.type.text)||"";if(!/technical|flagrant/i.test(t)||/3[- ]?second|free throw/i.test(t))continue;
  for(const q of(p.participants||[]).slice(0,/double/i.test(t)?2:1)){const r=q&&q.athlete&&idx[q.athlete.id];if(!r)continue;if(/flagrant/i.test(t))r[19]++;else r[18]++}}
 /* in campo adesso: titolari + sostituzioni della cronaca */
 const on=new Set(out.filter(r=>r[2]).map(r=>r[0]));const re=/^(.+?) enters the game for (.+?)\.?$/;
 for(const p of sum.plays||[]){const m=re.exec(String(p.text||"").trim());if(m){on.delete(m[2]);on.add(m[1])}}
 out.oc=[...on];return out}
let busy=false,timer=0;
async function tick(){if(busy||document.hidden)return;busy=true;let changed=false;
 try{const today=nyDay(),days=[today];if((ESPN.days[addD(today,-1)]||[]).some(id=>ESPN.games[id]&&ESPN.games[id][4]!=="F"))days.push(addD(today,-1));
  for(const d of days){const J=await fTO(SB(d));if(!J)continue;const ids=[];
   for(const e of J.events||[]){const c=e.competitions[0],h=c.competitors.find(x=>x.homeAway==="home"),a=c.competitors.find(x=>x.homeAway==="away");if(!h||!a)continue;
    const stt=e.status.type,st=stt.completed?"F":stt.state==="in"?"L":"S";
    for(const x of[a,h])ESPN.teams[x.team.abbreviation]=[x.team.shortDisplayName||x.team.name,"#"+(x.team.color||"333333"),((x.records||[]).find(r=>r.type==="total")||{}).summary||(ESPN.teams[x.team.abbreviation]||[])[2]||""];
    const old=ESPN.games[e.id],G=[a.team.abbreviation,h.team.abbreviation,n(a.score),n(h.score),st,e.date,st==="L"?stt.shortDetail:(st==="F"&&(e.status.period||0)>4?"OT":"")];
    if(!old||old.join("|")!==G.join("|"))changed=true;ESPN.games[e.id]=G;ids.push(e.id);
    if(st==="L"||(st==="F"&&(!ESPN.box[e.id]||ESPN.live[e.id]))){const S=await fTO(SUM(e.id));if(S){ESPN.box[e.id]=boxOf(S);changed=true;if(st==="L")ESPN.live[e.id]=1;else delete ESPN.live[e.id]}}}
   if(ids.length)ESPN.days[d]=ids}
  if(changed){ESPN.upd=new Intl.DateTimeFormat("it-IT",{timeZone:"Europe/Rome",dateStyle:"short",timeStyle:"short"}).format(new Date())+" (live)";
   try{window.e16Reset&&e16Reset()}catch(e){}
   const a=document.activeElement;if(!(a&&/INPUT|SELECT|TEXTAREA/.test(a.tagName))&&["home","tv","stat","ssq","lega"].includes(cur)&&!curTeam){const y=scrollY;render();scrollTo(0,y)}}
 }catch(e){}finally{busy=false}
 /* ritmo: 30 s se c è una partita in corso o che sta per iniziare, altrimenti 5 minuti */
 const t=nyDay(),G=[...(ESPN.days[t]||[]),...(ESPN.days[addD(t,-1)]||[])].map(id=>ESPN.games[id]).filter(Boolean);
 const hot=G.some(g=>g[4]==="L"||(g[4]==="S"&&new Date(g[5])-Date.now()<15*60e3));
 clearTimeout(timer);timer=setTimeout(tick,hot?30e3:300e3)}
window.e16Live=tick;
document.addEventListener("visibilitychange",()=>{if(!document.hidden)tick()});
setTimeout(tick,1500);
})();
