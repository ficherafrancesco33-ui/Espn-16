/* ===== ESPN 16 – CAMPO della squadra (come il Campo di Dreamers) =====
   Qui: 14 giocatori a punteggio pieno (5 in campo = slot ESPN PG, SG, SF, PF, C; gli altri 9 nel riquadro «100% AVG»)
   e 3 in tribuna (BE/IR: under 25 o infortunati). Nessun capitano.
   Maglie e colori del campo inventati per ogni squadra (COL); Quebec Ducks = campo e maglia dei Ducks di Dreamers
   con il rosso al posto del verde lime (campo-assets.js). Stili: skin-giorno.css / skin-notte.css (classi Dreamers). */
(function(){
const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const f1=v=>(Math.round(v*10)/10).toLocaleString("it-IT",{minimumFractionDigits:1,maximumFractionDigits:1});
/* colori inventati: maglia (bg), scritte (fg), bordi (trim), cornice del campo (fr), legno (w1 bordi, w2 centro) */
const COL={DET:{bg:"#1d3fa0",fg:"#ffffff",trim:"#dc2626",fr:"#0b1a45",w1:"#ae592c",w2:"#e8763a"},
 CLE:{bg:"#111827",fg:"#e5e7eb",trim:"#9ca3af",fr:"#0b0f19",w1:"#7c4a2d",w2:"#b9794a"},
 BOS:{bg:"#166534",fg:"#ffffff",trim:"#ca8a04",fr:"#0b2e1a",w1:"#a3602f",w2:"#d9944f"},
 NYS:{bg:"#c2410c",fg:"#ffffff",trim:"#1e3a8a",fr:"#1e3a8a",w1:"#ae592c",w2:"#e8763a"},
 CHA:{bg:"#0f172a",fg:"#f59e0b",trim:"#f59e0b",fr:"#0b1222",w1:"#9c5a2c",w2:"#d48a48"},
 NYP:{bg:"#f8fafc",fg:"#111111",trim:"#111111",fr:"#111111",w1:"#b0703e",w2:"#e6a663"},
 CAN:{bg:"#0f766e",fg:"#fde68a",trim:"#7c2d12",fr:"#0b3b37",w1:"#a3602f",w2:"#d9944f"},
 HOU:{bg:"#ea580c",fg:"#111111",trim:"#111111",fr:"#2a1205",w1:"#ae592c",w2:"#f08a45"},
 LVA:{bg:"#1e3a8a",fg:"#fbbf24",trim:"#0b1022",fr:"#0b1430",w1:"#8f5530",w2:"#c98550"},
 HON:{bg:"#0e7490",fg:"#ffffff",trim:"#fb923c",fr:"#083344",w1:"#b0703e",w2:"#e6a663"},
 ALB:{bg:"#38bdf8",fg:"#0b1022",trim:"#7f1d1d",fr:"#0c4a6e",w1:"#ae592c",w2:"#e8763a"},
 ALA:{bg:"#1d4ed8",fg:"#ffffff",trim:"#93c5fd",fr:"#0b1f5c",w1:"#a3602f",w2:"#d9944f"},
 WIC:{bg:"#ea580c",fg:"#ffffff",trim:"#9ca3af",fr:"#3b1a0a",w1:"#ae592c",w2:"#e8763a"},
 FAL:{bg:"#0b1022",fg:"#ffffff",trim:"#f97316",fr:"#0b1022",w1:"#9c5a2c",w2:"#d48a48"},
 /* (45) maglia dei free agent: tutta bianca con scritta FREE AGENT */
 FA:{bg:"#ffffff",fg:"#111827",trim:"#e5e7eb",fr:"#9ca3af",w1:"#ae592c",w2:"#e8763a"},
 SRO:{bg:"#0f172a",fg:"#f1f5f9",trim:"#b91c1c",fr:"#020617",w1:"#7c4a2d",w2:"#b9794a"}};
window.E16COL=COL;/* (57) colori delle maglie anche per kit.js */
let JID=0;
/* maglia (stessa sagoma e luci delle maglie Dreamers). (57) con kit.js caricato disegna la maglia scelta col tasto maglia (Casa/Notte/Alternativa/NBA 2026/Anni 90); pl = giocatore, serve per le maglie NBA */
function jersey(t,num,nick,pl){if(window.E16KIT)return E16KIT.jersey(t,num,nick,pl);if(t==="QUE")/* (61) senza kit.js: vecchia maglia di riserva */return CAMPO_ART["jersey"+(E16N?1:0)].replace(/__NUM__/g,num==null?"":String(num));
 const c=COL[t]||COL.FAL,k="e"+(JID++),n=num==null?"":String(num),fs=n.length>1?38:44;
 const lum=h=>{const x=parseInt(h.slice(1),16);return(0.299*(x>>16)+0.587*((x>>8)&255)+0.114*(x&255))/255};const ol=lum(c.fg)<0.45?"#ffffff":"#0a0f1f";
 const word=String(nick).toUpperCase(),L=word.length,wfs=L<=6?17:L<=9?15:L<=12?13:11,wlen=Math.min(74,Math.round(L*wfs*.62));
 const body="M38 6 C42 27 78 27 82 6 L98 12 C97 34 104 46 114 50 L112 126 Q60 137 8 126 L6 50 C16 46 23 34 22 12 Z";
 return `<svg viewBox="0 0 120 146" aria-hidden="true"><defs><linearGradient id="${k}s" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".22" stop-color="#000" stop-opacity=".08"/><stop offset=".5" stop-color="#fff" stop-opacity=".18"/><stop offset=".78" stop-color="#000" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient><linearGradient id="${k}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient><linearGradient id="${k}n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient><pattern id="${k}m" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".55" fill="#000" fill-opacity=".16"/></pattern><clipPath id="${k}c"><path d="${body}"/></clipPath><filter id="${k}b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter><filter id="${k}d" x="-20%" y="-10%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter></defs>
 <ellipse cx="60" cy="136" rx="46" ry="5" fill="#000" opacity=".55" filter="url(#${k}d)"/><path d="${body}" fill="${c.bg}"/>
 <g clip-path="url(#${k}c)"><rect x="0" y="112" width="120" height="6" fill="${c.trim}" opacity=".9"/><rect width="120" height="146" fill="url(#${k}m)"/><path d="M30 40 C36 70 34 100 40 132" stroke="#000" stroke-opacity=".25" stroke-width="5" fill="none" filter="url(#${k}b)"/><path d="M90 40 C84 72 88 100 82 132" stroke="#000" stroke-opacity=".2" stroke-width="5" fill="none" filter="url(#${k}b)"/><rect width="120" height="146" fill="url(#${k}s)"/><rect width="120" height="146" fill="url(#${k}v)"/></g>
 <path d="M38 6 C42 27 78 27 82 6" fill="none" stroke="${c.trim}" stroke-width="6" stroke-linecap="round"/><path d="M39 6 C43 25 77 25 81 6" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.2"/><path d="M22 12 C23 34 16 46 6 50 M98 12 C97 34 104 46 114 50" fill="none" stroke="${c.trim}" stroke-width="6" stroke-linecap="round"/><path d="M22 12 C23 34 16 46 6 50 M98 12 C97 34 104 46 114 50" fill="none" stroke="url(#${k}n)" stroke-width="6" stroke-linecap="round"/>
 <g font-family="Barlow Condensed,Arial Narrow,sans-serif" font-weight="800" font-style="italic"><text x="60" y="60" text-anchor="middle" font-style="normal" font-size="${wfs}" letter-spacing=".6" fill="${c.fg}" stroke="${ol}" stroke-width="3.2" paint-order="stroke" stroke-linejoin="round" textLength="${wlen}" lengthAdjust="spacingAndGlyphs">${e(word)}</text><text x="61.5" y="106.5" font-size="${fs}" text-anchor="middle" fill="#000" fill-opacity=".45" filter="url(#${k}b)">${n}</text><text x="60" y="104" font-size="${fs}" text-anchor="middle" fill="${c.fg}" stroke="${ol}" stroke-width="3.6" paint-order="stroke" stroke-linejoin="round">${n}</text><text x="60" y="104" font-size="${fs}" text-anchor="middle" fill="url(#${k}n)">${n}</text></g>
 <path d="${body}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="1"/></svg>`}
/* campo: modello Dreamers con i colori della squadra */
function court(t){if(t.id==="QUE")return CAMPO_ART["court"+(E16N?1:0)];const c=COL[t.id]||COL.FAL;const city=t.nome.split(" ").slice(0,-1).join(" ").toUpperCase(),nick=t.nome.split(" ").slice(-1)[0].toUpperCase();
 return CAMPO_ART.dol.replace(/#ae592c/g,c.w1).replace(/#e8763a/g,c.w2).replace('fill="#1c0f44"',`fill="${c.fr}"`).replace(/stroke="#0a205a"/g,`stroke="${c.fr}"`)
  .replace(/>SALT LAKE</,">"+e(city)+"<").replace(/>DOLPHINS</,">"+e(nick)+"<").replace(/href="img\/80465239f661\.webp"/,`href="${t.logo}"`)}
const NUM={};try{for(const id in ESPN.box)for(const r of ESPN.box[id]){}}catch(_){}
const SLOT5={C:[50,27.6],SF:[21,55.8],PF:[79,55.8],PG:[33,83.2],SG:[67,83.2]};
const RL=r=>{const a=String(r||"").split(",");return a[0]==="C"?"C":/G/.test(a[0])?"G":"F"};
const RLi={G:"G",F:"A",C:"C"};
const pcls=v=>v>=50?"v":v>=35?"g":v>=20?"y":"r";
const gcol=v=>v>=50?"#7c3aed":v>=35?"#3ba764":v>=20?"#f5b400":"#dc2626";
const last=n=>{const p=String(n).replace(/\s+(Jr\.?|Sr\.?|II|III|IV)$/i,"").split(" ");return p.slice(1).join(" ")||p[0]};
function card(t,g,P,W){const p=P[g[0]],avg=p?p.ff/p.gp:null,w=W[g[0]];
 return `<span class="pj">${jersey(t.id,numOf(g[0]),t.nome.split(" ").slice(-1)[0],g[0])}</span><span class="pnm ${RL(g[3])}"><i>${RLi[RL(g[3])]}</i><b class="pn">${e(last(g[0]))}</b></span>
 <span class="gw"><span class="pcs"><span class="pcd ${avg!=null?pcls(avg):""}"><b>${avg!=null?f1(avg):"–"}</b></span></span><span class="gd gbar">${w?`<i class="ok" style="--gc:${gcol(w.f/w.n)}">${f1(w.f)}</i><i>${w.n}P</i>`:`<i>SETT. 0</i>`}</span></span>`}
window.e16Jersey=(t,n,nk,pl)=>jersey(t,n,nk,pl);window.e16Num=n=>numOf(n);
let NUMS=null;function numOf(n){if(!NUMS){NUMS={};/* numero di maglia NBA: dalle rose ESPN non lo abbiamo; si usa un numero stabile dal nome */}
 if(NUMS[n]!=null)return NUMS[n];let h=0;for(const ch of n)h=(h*31+ch.charCodeAt(0))%97;return NUMS[n]=h%55}
/* (26) TABELLONE sopra il campo, come Dreamers (h2.lbmh): sfida della settimana con loghi, punteggi (formazione ESPN) e partite giocate/totali.
   Toccandolo si apre il duello stile Sleeper della Lega; le frecce cambiano settimana (campo e tabellone). */
let CW=null;
function lbm(id,w,wCur){const m=(MATCHUPS[w]||[]).find(x=>x.includes(id));if(!m)return window.E16KIT?`<h2 class="lbmh">${E16KIT.kitBtn(id)}</h2>`:"";/* (57) senza sfida il tasto maglia resta */const o=m[0]===id?m[1]:m[0],WS=weekScores(w);
 /* (44) sopra: partite giocate / totali dei 14 titolari della formazione ESPN; sotto: senza gli infortunati (slot IR), come Dreamers */
 const gp=t=>{const T=wkTeam(t,w),L=T.L.filter(x=>x.on),c=A=>A.reduce((s,x)=>s+x.G.filter(y=>!y.up).length,0)+"/"+A.reduce((s,x)=>s+x.G.length,0);return[c(L),c(L.filter(x=>x.g[2]!=="IR"))]};
 const[a1,a2]=gp(id),[b1,b2]=gp(o),sa=WS.S[id],sb=WS.S[o],live=w===wCur;
 const svgL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',svgR='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
 const has=k=>(MATCHUPS[k]||[]).some(x=>x.includes(id));
 return `<h2 class="lbmh">${window.E16KIT?E16KIT.kitBtn(id):"<span></span>"}<span class="lbmw"><button class="lbma" type="button" data-cwk="${w-1}" aria-label="Settimana precedente" ${has(w-1)?"":"disabled"}>${svgL}</button><span class="lbm${live?" run":""} pqw" style="--sc:color-mix(in srgb,${TCOL[id]} 62%,#fff)" data-du="${m[0]},${m[1]}" data-duw="${w}" role="button" tabindex="0" aria-label="${e(TM[id].nome)} ${f1(sa)} contro ${e(TM[o].nome)} ${f1(sb)}"><span class="lbml"><span class="badge logo lg-${id}"></span></span><span class="lbmg" title="Sopra: partite giocate sul totale (migliori 14). Sotto: senza gli infortunati"><i>${a1}</i><b>${a2}</b></span><span class="lbmn${sa>=sb?"":" dim"}">${f1(sa)}</span><span class="lbmx"></span><span class="lbmn${sb>sa?"":" dim"}">${f1(sb)}</span><span class="lbmg"><i>${b1}</i><b>${b2}</b></span><span class="lbml"><span class="badge logo lg-${o}"></span></span></span><button class="lbma" type="button" data-cwk="${w+1}" aria-label="Settimana successiva" ${w<wCur&&has(w+1)?"":"disabled"}>${svgR}</button></span><span></span></h2>`}
document.addEventListener("click",ev=>{const b=ev.target.closest("[data-cwk]");if(!b||b.disabled)return;ev.stopPropagation();CW=+b.dataset.cwk;render()},true);
window.vCampo=function(id){const t=TM[id];if(!t)return"";const R0=ROSE[id]||[],P=pstats();
 /* punteggio della settimana in corso di ogni giocatore (somma AVG e partite) */
 const wCur=weekOf(nyToday()<W1?W1:nyToday()),wNow=CW&&CW<=wCur?CW:wCur,[wa,wb]=weekRange(wNow),W={};
 for(const d of Object.keys(ESPN.days)){if(d<wa||d>wb)continue;for(const x of rowsOf(d)){const k=x.r[0];(W[k]=W[k]||{f:0,n:0}).f+=x.f;W[k].n++}}
 /* (16) in campo i 5 titolari con l AVG medio più alto; posizioni: centri in alto, ali in mezzo, guardie in basso */
 const avgOf=g=>{const p=P[g[0]];return p?p.ff/p.gp:-1},tit=R0.filter(g=>g[2]!=="BE"&&g[2]!=="IR").sort((a,b)=>avgOf(b)-avgOf(a));
 const RK={C:0,F:1,G:2},POS=["C","SF","PF","PG","SG"];
 const five=tit.slice(0,5).sort((a,b)=>RK[RL(a[3])]-RK[RL(b[3])]).map((g,i)=>[g[0],g[1],POS[i],g[3]]),rest=tit.slice(5),trib=R0.filter(g=>g[2]==="BE"||g[2]==="IR");
 const tot=[...five,...rest].reduce((a,g)=>a+(W[g[0]]?W[g[0]].f:0),0),r=REC[id];
 const name=t.nome.split(" ").slice(-1)[0];
 return `<div class="e16campo">
 <div class="teamhead" style="background:linear-gradient(115deg,${TCOL[id]} 0%,color-mix(in srgb,${TCOL[id]} 55%,#000) 100%);color:#fff;border-bottom:4px solid #0b0b0b"><img class="hlogo" src="${t.logo}" alt=""><div><h3>${e(name)}</h3><p>${e(t.nome.split(" ").slice(0,-1).join(" "))}</p></div><div class="hstats"><div class="rec">${r?r.w+"-"+r.l:"–"}<small>RECORD</small></div><div class="rec">${f1(tot)}<small>SETT. ${wNow}</small></div></div></div>
 ${(()=>{/* (13) al posto della «Cassa» di Dreamers: il salary cap (dal file della lega) */const C=CAP[id];if(!C)return"";const occ=C.occ||[],lib=C.libero!=null?C.libero:CAP_TOT-(occ[0]||0)-(C.tagli||0);
  return `<div class="cassa clink" data-team="${id}" data-tab="cap"><div class="csal"><small>Salary cap</small><b>${f1(lib)}<i>liberi</i></b><em>Cap ${CAP_TOT}</em></div>
  <div class="ctab"><span></span><span>26/27</span><span>27/28</span><span class="rl p">Occupato</span><b>${f1(occ[0]||0)}</b><b>${f1(occ[1]||0)}</b><span class="rl n">Tagli</span><b class="${C.tagli?"n":"z"}">${C.tagli?f1(C.tagli):"—"}</b><b class="z">—</b></div>
  <div class="cgo">Contratti e scelte ›</div></div>`})()}
  ${lbm(id,wNow,wCur)}
  <div class="court" style="--tc:${TCOL[id]};border-left:0;border-right:0;border-top:4px solid ${id==="QUE"?(E16N?"#5b21b6":"#ffffff"):(COL[id]||COL.FAL).fr}!important;margin-top:10px">${court(t)}
 ${five.map(g=>{const[x,y]=SLOT5[g[2]];return `<button class="cpl dr" data-ist="${g[2]==="IR"?"out":"ok"}" data-pl="${e(g[0])}" style="left:${x}%;top:${y}%;--k:1">${card(t,g,P,W)}</button>`}).join("")}</div>
 <h2><span class="t"><span>Titolari</span></span><em>altri ${rest.length} · 100% AVG</em></h2>
 <div class="bench dptrib e16tit">${rest.map(g=>{const p=P[g[0]],v=p?p.ff/p.gp:null,w=W[g[0]];return `<button class="bpl" data-pl="${e(g[0])}">${jersey(id,numOf(g[0]),name,g[0])}<span class="bnm"><i class="rtr ${RL(g[3])}"></i>${e(g[0])}<small>${({G:"Guardia",F:"Ala",C:"Centro"})[RL(g[3])]} · ${g[1]}${etaOf(g[0])!=null?" · "+etaTxt(g[0]):""}${w?` · sett. ${f1(w.f)} (${w.n}P)`:""}</small></span><span class="trlk"></span><span class="bev"><span class="cev ${v!=null?pcls(v):"wait"}">${v!=null?f1(v):"–"}</span></span></button>`}).join("")}</div>
 <h2><span class="t"><span>Tribuna</span></span><em>panchina e IR della formazione ESPN · non contano</em></h2>
 <div class="bench dptrib">${trib.map(g=>{const p=P[g[0]],v=p?p.ff/p.gp:null;return `<button class="bpl" data-pl="${e(g[0])}">${jersey(id,numOf(g[0]),name,g[0])}<span class="bnm"><i class="rtr ${RL(g[3])}"></i>${e(g[0])}<small>${g[2]==="IR"?"Infortunato · ":""}${g[1]}${etaOf(g[0])!=null?" · "+etaTxt(g[0]):""}${g[2]==="IR"?"":u25(g[0])?" · under 25 ✓":etaOf(g[0])!=null?" · ⚠️ non under 25":""}</small></span><span class="trlk"></span><span class="bev"><span class="cev ${v!=null?pcls(v):"wait"}">${v!=null?f1(v):"–"}</span></span></button>`}).join("")}</div>
 ${window.e16FconsBtn?e16FconsBtn(id):""}
 ${liveBox(id)}
 <p class="note">Sotto ogni maglia: AVG medio della stagione; barra = AVG fatti questa settimana e partite giocate. I numeri di maglia sono indicativi.</p></div>`};
/* (46) «LIVE STANOTTE» sotto la tribuna, come Dreamers: tabellino di tutti i giocatori della squadra.
   Notte = la notte scelta (giorni della settimana in corso, data USA), con stato della partita.
   Turno = la SETTIMANA intera: per ogni giocatore la somma di tutte le sue partite (AVG e statistiche cumulative), con ‹ › per le altre settimane.
   Titolari della formazione ESPN segnati con il pallino; tocca una riga per il profilo. */
const CL={m:"notte",d:null,w:null};
const snm=n=>{const p=String(n).split(" ");return p.length>1?p[0][0]+". "+last(n):n};
function liveBox(id){const own=new Set((ROSE[id]||[]).map(g=>__ownKey(g[0]))),wCur=weekOf(nyToday()<W1?W1:nyToday());
 const days=k=>{const[a,b]=weekRange(k);return Object.keys(ESPN.days).filter(d=>d>=a&&d<=b&&(ESPN.days[d]||[]).length).sort()};
 const rowsDay=d=>{const out=[];for(const gid of ESPN.days[d]||[]){const g=ESPN.games[gid],B=ESPN.box[gid];if(!g||!B)continue;for(const r of B)if(own.has(__ownKey(r[0])))out.push({r,g,gid})}return out};
 const st=(g)=>g[4]==="F"?"Finale":g[4]==="L"?`<span class="hmlv">LIVE</span> ${e(g[6]||"")}`:"";
 const mmss=m=>{const x=Math.round(m*60);return Math.floor(x/60)+":"+String(x%60).padStart(2,"0")};
 const sh=(a,b)=>`${a}-${b}`,pm=v=>`<td class="${v>0?"pos":v<0?"neg":""}">${v>0?"+":""}${v}</td>`;
 const sCls=v=>v>=50?"v":v>=35?"g":v>=20?"y":"r";
 const head=`<thead><tr><th>Giocatore</th><th class="pdkl">AVG</th><th>Min</th><th>Pt</th><th>RIM</th><th>AST</th><th>STL</th><th>BLK</th><th>TOV</th><th>Tiri</th><th>Da 3</th><th>Liberi</th><th>Off</th><th>Dif</th><th>Falli</th><th>+/−</th></tr></thead>`;
 let h="",tit="",nav="";
 const w=CL.w&&CL.w<=wCur?CL.w:wCur,lineup=(()=>{try{return new Set(((LEGA.line||{})[w]||{})[id].map(n=>__ownKey(n)))}catch(_){return null}})();
 const dot=n=>lineup&&lineup.has(__ownKey(n))?'<i class="cltit" title="Titolare della formazione ESPN"></i>':"";
 if(CL.m==="notte"){const D=days(wCur),t=nyToday(),dflt=[...D].reverse().find(d=>d<=t&&(ESPN.days[d]||[]).some(id=>ESPN.box[id]))||D[0],d=CL.d&&D.includes(CL.d)?CL.d:dflt;
  nav=`<span class="clnt" role="group" aria-label="Scegli la notte">${D.map((k,i)=>`<button data-cln="${k}" aria-pressed="${k===d}">${(ESPN.days[k]||[]).some(x=>ESPN.games[x]&&ESPN.games[x][4]==="L")?'<i class="clnd"></i>':""}N${i+1}<small>${dIt(k)}</small></button>`).join("")}</span>`;
  const R=d?rowsDay(d).sort((a,b)=>ffps(b.r)-ffps(a.r)):[];tit=d?dIt(d):"";
  h=R.length?R.map(({r,g})=>{const f=ffps(r),opp=r[1]===g[0]?"@"+g[1]:"vs "+g[0];return `<tr class="clgo" data-pl="${e(r[0])}" role="link" tabindex="0"><td>${dot(r[0])}<span class="plk">${e(snm(r[0]))}</span><small>${r[1]} ${opp} · ${st(g)}</small></td><td class="pdkl"><span class="pdkx ${sCls(f)}">${f1(f)}</span></td><td>${r[3]}</td><td class="pts">${r[4]}</td><td>${r[11]+r[12]}</td><td>${r[13]}</td><td>${r[14]}</td><td>${r[15]}</td><td>${r[16]}</td><td>${sh(r[5],r[6])}</td><td>${sh(r[7],r[8])}</td><td>${sh(r[9],r[10])}</td><td>${r[11]}</td><td>${r[12]}</td><td>${r[17]}</td>${pm(r[21]||0)}</tr>`}).join(""):`<tr><td colspan="16" class="clnone">Nessun giocatore ha giocato in questa notte.</td></tr>`}
 else{const D=days(w),A={};for(const d of D)for(const {r} of rowsDay(d)){const k=__ownKey(r[0]),o=A[k]||(A[k]={n:r[0],t:r[1],g:0,f:0,s:new Array(22).fill(0)});o.g++;o.f+=ffps(r);for(let j=3;j<22;j++)if(typeof r[j]==="number")o.s[j]+=r[j]}
  tit=`Settimana ${w}`;const[wa,wb]=weekRange(w);
  nav=`<span class="clnt clwk" role="group" aria-label="Scegli la settimana"><button data-clw="${w-1}" ${w>1?"":"disabled"} aria-label="Settimana precedente">‹</button><button aria-pressed="true">Sett. ${w}<small>${dIt(wa)}–${dIt(wb)}</small></button><button data-clw="${w+1}" ${w<wCur?"":"disabled"} aria-label="Settimana successiva">›</button></span>`;
  const L=Object.values(A).sort((a,b)=>b.f-a.f);
  h=L.length?L.map(o=>{const x=o.s;return `<tr class="clgo" data-pl="${e(o.n)}" role="link" tabindex="0"><td>${dot(o.n)}<span class="plk">${e(snm(o.n))}</span><small>${o.t} · ${o.g}P · media ${f1(o.f/o.g)}</small></td><td class="pdkl"><span class="pdkx ${sCls(o.f/o.g)}">${f1(o.f)}</span></td><td>${x[3]}</td><td class="pts">${x[4]}</td><td>${x[11]+x[12]}</td><td>${x[13]}</td><td>${x[14]}</td><td>${x[15]}</td><td>${x[16]}</td><td>${sh(x[5],x[6])}</td><td>${sh(x[7],x[8])}</td><td>${sh(x[9],x[10])}</td><td>${x[11]}</td><td>${x[12]}</td><td>${x[17]}</td>${pm(x[21])}</tr>`}).join(""):`<tr><td colspan="16" class="clnone">Nessuna partita in questa settimana.</td></tr>`}
 return `<div class="clwrap"><h2><span class="t"><span>Live stanotte</span></span><em>${tit}</em></h2><div class="cltgw"><span class="cltg" role="group" aria-label="Cosa mostrare"><button data-clm="notte" aria-pressed="${CL.m==="notte"}">Notte</button><button data-clm="turno" aria-pressed="${CL.m==="turno"}">Turno</button></span>${nav}</div>
 <div class="tbl-wrap"><table class="ptbl tvbox drbox clbox clall">${head}<tbody>${h}</tbody></table></div>
 <p class="note">${CL.m==="notte"?"Tutte le partite della notte dei giocatori della squadra (data USA).":"Turno = tutta la settimana: AVG e statistiche sommate di tutte le partite del giocatore."} Pallino = titolare della formazione ESPN del lunedì. Tocca un giocatore per il profilo.</p></div>`}
document.addEventListener("click",ev=>{if(cur!=="campo")return;const b=ev.target.closest("[data-clm],[data-cln],[data-clw]");if(!b||b.disabled)return;const d=b.dataset;
 if(d.clm){CL.m=d.clm;if(d.clm==="turno")CL.w=null}if(d.cln)CL.d=d.cln;if(d.clw)CL.w=+d.clw;const y=scrollY;render();scrollTo(0,y)});
})();
