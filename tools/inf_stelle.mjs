// ESPN 16 – genera inf-data.js: stelline INFORTUNI della pagella (più stelle = più sano), come INF_STELLE di Dreamers.
// 1) se il giocatore c'è in Dreamers si prende la sua stella (stessa persona, stessa storia);
// 2) altrimenti stima dai dati: partite saltate in media nelle ultime 2 stagioni NBA giocate (24/25, 25/26 dagli archivi ESPN;
//    se non c'era in una stagione ma c'era nell'altra conta come stagione saltata), scala come Dreamers (≤11 saltate = 5 … ≥70 = 0),
//    −1 se ora è fuori per Achille/crociato o con rientro tra 60 giorni o più; rookie senza storia = 3 (neutro).
import fs from "fs";
const load=(f,k)=>{const c={window:{}};new Function("window",fs.readFileSync(f,"utf8")+`;window.__x=${k};`)(c.window);return c.window.__x};
const nn=s=>String(s).replace(/\\u00a0|\u00a0/g, " ").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/ş/g,"s").replace(/[.'’]/g,"").replace(/\s+(jr|sr|ii|iii|iv)$/,"").replace(/\s+/g," ").trim();
const html=fs.readFileSync("index.html","utf8");
const ROSE=new Function(html.match(/const ROSE=(\{[\s\S]*?\});/)[0].replace("const ROSE=","return ")+"")();
const dre=fs.readFileSync(process.argv[2],"utf8"),DS=JSON.parse(dre.match(/const INF_STELLE=(\{[^}]*\})/)[1]),DN={};for(const k in DS)DN[nn(k)]=DS[k];
const ST={};for(const k of ["2425","2526"]){const S=load(`storico-${k}.js`,`STORICO["${k}"]`),cnt={};for(const g of S.G)for(const x of g[5]){const p=S.P[x[0]];if(p&&x[3]>0)cnt[nn(p[0])]=(cnt[nn(p[0])]||0)+1}ST[k]=cnt}
const ESPN=load("espn-data.js","ESPN"),INJ={};for(const x of ESPN.inj||[])INJ[nn(x[0])]=x;
const ip=(x,P)=>{if(x<=P[0][0])return P[0][1];for(let i=1;i<P.length;i++)if(x<=P[i][0]){const[a,b]=P[i-1],[c,d]=P[i];return b+(d-b)*(x-a)/(c-a)}return P[P.length-1][1]};
const out={},src={};
for(const t in ROSE)for(const g of ROSE[t]){const n=g[0],k=nn(n);if(DN[k]!=null){out[n]=DN[k];src[n]="D";continue}
 const a=ST["2425"][k]||0,b=ST["2526"][k]||0;let v;
 if(!a&&!b)v=3;else{const seas=[a,b].filter((x,i)=>x>0||(i===0?b>0:a>0)),miss=[a,b].map(x=>Math.max(0,82-x));const L=a&&b?miss:a?[miss[0]]:[miss[1]];
  /* se ha giocato solo l'ultima stagione (rookie 25/26) conta solo quella */const m=L.reduce((s,x)=>s+x,0)/L.length;v=ip(m,[[11,5],[20,4],[30,3],[42,2],[55,1],[70,0]])}
 const I=INJ[k];if(I&&/out/i.test(I[2])){const tp=String(I[4]||"").toLowerCase(),rd=I[5]?(Date.parse(I[5])-Date.now())/864e5:0;if(/achill|acl|cruciate/.test(tp)||rd>=60)v-=1}
 out[n]=Math.max(0,Math.round(v*10)/10);src[n]="S"}
fs.writeFileSync("inf-data.js",`/* ESPN 16 – stelline INFORTUNI della pagella (più stelle = più sano), generato da tools/inf_stelle.mjs.
   D = come Dreamers (stesso giocatore); S = stima dalle partite saltate nelle ultime 2 stagioni (24/25, 25/26) e dall infortunio attuale. Da ritoccare a mano dopo infortuni lunghi. */
const INF_STELLE=${JSON.stringify(out)};
const INF_SRC=${JSON.stringify(src)};
`);
console.log(Object.keys(out).length,Object.values(src).filter(x=>x==="D").length);
