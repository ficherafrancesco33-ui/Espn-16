/* ===== ESPN 16 – DYNASTY TV (come la Dynasty TV di Dreamers, con AVG al posto dei PDK) =====
   Calendario NBA giorno per giorno (data USA), risultati, tabellino di ogni partita con la squadra del fanta (SQ) e l AVG di ogni giocatore.
   Dati: ESPN (espn-data.js + live.js). Stesse classi di Dreamers: gli stili sono in skin-giorno.css / skin-notte.css. */
(function(){
const TVS={d:null,g:null,side:"a"};
const GG=["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"],GS=["Dom","Lun","Mar","Mer","Gio","Ven","Sab"],MM=["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];
const dd=d=>new Date(d+"T12:00:00Z");
const nyDay=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York"}).format(new Date());
const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const f1=v=>(Math.round(v*100)/100).toLocaleString("it-IT",{maximumFractionDigits:2});
const nm=n=>{const p=String(n).split(" ");return p.length>1?p[0][0]+". "+p.slice(1).join(" "):n};
const last=n=>{const p=String(n).split(" ");return p[p.length-1]==="Jr."||p[p.length-1]==="II"||p[p.length-1]==="III"?p[p.length-2]:p[p.length-1]};
const nbaLg=a=>`loghi/nba/${String(a).toLowerCase()}.svg`;
const T=a=>(ESPN.teams&&ESPN.teams[a])||[a,"#333333",""];
const lw=a=>`<span class="tvlw ok" style="background:${T(a)[1]}"><em>${a}</em><img src="${nbaLg(a)}" alt=""></span>`;
const pc=v=>v>=50?"pv":v>=35?"pg":v>=20?"py":"pr";
const xc=v=>v>=50?"v":v>=35?"g":v>=20?"y":"r";
const own=n=>{try{return window.__ownKey&&OWNH[__ownKey(n)]||""}catch(_){return""}};
function stOf(g){return g[4]==="F"?"Finale"+(g[6]==="OT"?" · OT":""):g[4]==="L"?(g[6]||"Live"):new Date(g[5]).toLocaleTimeString("it-IT",{timeZone:"Europe/Rome",hour:"2-digit",minute:"2-digit"})}
function defDay(){const D=Object.keys(ESPN.days).sort(),t=nyDay();if(D.includes(t)&&(ESPN.days[t]||[]).some(id=>ESPN.games[id]&&ESPN.games[id][4]!=="S"))return t;
 const done=D.filter(d=>d<=t&&(ESPN.days[d]||[]).some(id=>ESPN.box[id]));return done[done.length-1]||t}
/* (38) SCONTRI DIRETTI della lega sotto le partite NBA, come «Dreamers» nella Dynasty TV di Dreamers: le sfide della settimana del giorno scelto,
   (44) punteggio = ufficiale ESPN (settimane finite) o somma dei 14 titolari della formazione ESPN del lunedì, quanti dei 14 hanno già giocato, giorni giocati della settimana e i migliori di ogni squadra.
   Tocca una sfida → (74) box score della sfida in stile Dynasty TV di Dreamers (vDr); da lì «Apri la sfida» porta al duello della Lega. */
function e16Sfide(d){try{const w=weekOf(d<W1?W1:d),M=MATCHUPS[w]||[];if(!M.length)return"";const[a,b]=weekRange(w),WS=sfidaScores(w),wNow=weekOf(nyToday()<W1?W1:nyToday());
 const days=Object.keys(ESPN.days).filter(k=>k>=a&&k<=b&&(ESPN.days[k]||[]).length).sort(),done=days.filter(k=>(ESPN.days[k]||[]).every(id=>ESPN.games[id]&&ESPN.games[id][4]==="F")).length;
 const fin=w===8?false:w<wNow||(days.length&&done===days.length),st=fin?"Finale":w===8&&w<wNow?"Continua nella 9":w>wNow?"Da giocare":"In corso";
 const card=([A,B])=>{const TA=wkTeam(A,w),TB=wkTeam(B,w),sa=WS.S[A],sb=WS.S[B];
  const pl=T=>T.L.filter(x=>x.on&&x.n>0).length,best=T=>T.L[0]&&T.L[0].n?T.L[0]:null;
  const side=(id,sc,T,win)=>`<div class="tvt${win?" win":""}"><span class="drtvl" style="--tc:${TCOL[id]}"><span class="badge logo lg-${id}" role="img" aria-label="${e(TM[id].nome)}"></span></span><span class="tvnm"><b>${e(TM[id].nome.split(" ").slice(-1)[0])}</b><small>${w===9?"totale sett. 8+9":WS.off?"punteggio ufficiale ESPN":WS.esp?"punteggio ESPN · "+new Date(WS.ts).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"}):pl(T)+"/14 hanno giocato"}</small></span><span class="tvsc">${f1(sc)}</span></div>`;
  const ba=best({L:TA.L.filter(x=>x.on)}),bb=best({L:TB.L.filter(x=>x.on)});
  return `<button class="tvg drtvg" data-drtv="${A},${B},${w}" aria-label="${e(TM[A].nome)} contro ${e(TM[B].nome)}"><div class="tvteams">${side(A,sa,TA,fin&&sa>sb)}${side(B,sb,TB,fin&&sb>sa)}</div>
  <div class="tvst"><b class="pre">${st}</b><small>${done}/${days.length} giorni · sfida ›</small></div>${ba||bb?`<div class="tvtop"><span>Migliori: ${ba?`<b>${e(last(ba.g[0]))}</b> (${A}) <span class="pdkx ${xc(ba.pg)}">${f1(ba.tot)}</span>`:""}${ba&&bb?" · ":""}${bb?`<b>${e(last(bb.g[0]))}</b> (${B}) <span class="pdkx ${xc(bb.pg)}">${f1(bb.tot)}</span>`:""}</span></div>`:""}</button>`};
 return `<div class="drtvh"><h2><span class="t"><span>ESPN 16</span></span><em>Settimana ${w} · ${done} su ${days.length} giorni${is89(w)?" · sfida unica 8–9, si sommano":""}</em></h2></div><div class="tvlist">${M.map(card).join("")}</div>`}catch(_){return""}}
function vList(){const D=Object.keys(ESPN.days).sort();const d=TVS.d&&ESPN.days[TVS.d]?TVS.d:defDay();TVS.d=d;const i=D.indexOf(d);
 /* (99) come Dreamers: prima le partite LIVE, poi quelle in programma, in fondo le finite (a parità, ordine d inizio) */const rkG=g=>g[4]==="L"?0:g[4]==="F"?2:1;const G=(ESPN.days[d]||[]).map(id=>[id,ESPN.games[id]]).filter(x=>x[1]).sort((a,b)=>rkG(a[1])-rkG(b[1])||(a[1][5]<b[1][5]?-1:1));
 const nF=G.filter(x=>x[1][4]==="F").length,nL=G.filter(x=>x[1][4]==="L").length;
 const x=dd(d),dl=`${GG[x.getUTCDay()]} ${x.getUTCDate()} ${MM[x.getUTCMonth()]}`;
 const card=([id,g])=>{const B=ESPN.box[id]||[];const top=B.length?B.reduce((m,r)=>ffps(r)>ffps(m)?r:m,B[0]):null;const aw=g[4]==="F"&&g[2]>g[3],hw=g[4]==="F"&&g[3]>g[2];
  const side=(a,sc,w)=>`<div class="tvt${w?" win":""}">${lw(a)}<span class="tvnm"><b>${e(T(a)[0])}</b><small>${a}${T(a)[2]?" · "+T(a)[2]:""}</small></span><span class="tvsc">${g[4]==="S"?"":sc}</span></div>`;
  return `<button class="tvg" data-tvg="${id}"><div class="tvteams">${side(g[0],g[2],aw)}${side(g[1],g[3],hw)}</div>
  <div class="tvst"><b>${g[4]==="L"?`<span class="hmlv">LIVE</span> `:""}${e(stOf(g))}</b><small>${B.length?"tabellino ›":g[4]==="S"?"ora italiana":""}</small></div>${top?`<div class="tvtop"><span>Top: <b>${e(last(top[0]))}</b> (${top[1]}) ${top[4]} pt · ${top[11]+top[12]} rb · ${top[13]} as · <span class="pdkx ${xc(ffps(top))}">${f1(ffps(top))}</span> AVG</span></div>`:""}</button>`};
 return `<button class="gback" data-go="home">‹ Home</button><div class="tvpnl"><div class="tvhero"><b>Dynasty TV <i>NBA</i></b><small>Calendario, risultati e tabellini · AVG della lega</small></div>
 <div class="tvdate"><button ${i>0?`data-tvd="${D[i-1]}"`:"disabled"}>‹</button><div class="tvdl"><b>${dl}</b><small>${G.length} partite · ${nL?nL+" live · ":""}${nF===G.length&&G.length?"tutte finite":nF+" finite"} · data USA</small></div><button ${i<D.length-1?`data-tvd="${D[i+1]}"`:"disabled"}>›</button></div>
 <div class="tvweek" id="tvweek">${D.map(k=>{const y=dd(k),n=(ESPN.days[k]||[]).length;return`<button class="tvday${n?"":" off"}" data-tvd="${k}" aria-pressed="${k===d}"${n?"":" disabled"}><span>${GS[y.getUTCDay()]}</span><b>${y.getUTCDate()}</b><small>${n?n+" part.":"—"}</small></button>`}).join("")}</div>
 <div class="tvlist">${G.map(card).join("")||`<p class="note">Nessuna partita.</p>`}</div>${e16Sfide(d)}</div>
 <p class="note">Dati ESPN · durante le partite si aggiorna da solo ogni 30 secondi.</p>`}
function vGame(){const id=TVS.g,g=ESPN.games[id];if(!g){TVS.g=null;return vList()}const B=ESPN.box[id]||[];const ab=TVS.side==="h"?g[1]:g[0];const R=B.filter(r=>r[1]===ab);
 const x=dd(TVS.d||nyDay()),dl=`${x.getUTCDate()} ${MM[x.getUTCMonth()]}`;const oc=new Set(B.oc||[]);
 const row=r=>{const f=ffps(r),o=own(r[0]);return`<tr><td><div class="tvpn"><div class="plk" data-pl="${e(r[0])}">${e(nm(r[0]))}<small><i class="tvps">${e(r[22]||"")}</i></small></div></div></td><td class="sqc"><span class="tvown">${o?`<span class="tvob logo lg-${o}"></span>`:""}</span></td><td class="pdkl ${pc(f)}">${g[4]==="L"&&oc.has(r[0])?'<i class="lvd"></i>':""}<span class="pdkb">${f1(f)}</span></td><td>${r[3]}</td><td class="pts">${r[4]}</td><td>${r[11]+r[12]}</td><td>${r[13]}</td><td>${r[14]}</td><td>${r[15]}</td><td>${r[16]}</td><td>${r[5]}-${r[6]}</td><td>${r[7]}-${r[8]}</td><td>${r[9]}-${r[10]}</td><td>${r[11]}</td><td>${r[12]}</td><td>${r[17]}${r[18]?` <small>${r[18]}T</small>`:""}${r[19]?` <small>${r[19]}F</small>`:""}</td><td class="${(r[21]||0)>0?"pos":(r[21]||0)<0?"neg":""}">${(r[21]||0)>0?"+":""}${r[21]||0}</td></tr>`};
 const s=k=>R.reduce((a,r)=>a+r[k],0),pct=(a,b)=>b?(a/b*100).toFixed(1).replace(".",",")+"%":"–";
 const tot=R.reduce((a,r)=>a+ffps(r),0);
 const side=(a,lab)=>`<div class="tside">${lw(a)}<b>${e(T(a)[0])}</b><small>${T(a)[2]?T(a)[2]+" · ":""}${lab}</small></div>`;
 return `<button class="gback tvback" data-tvback="1">‹ Partite del ${dl}</button>
 <div class="tvsb">${side(g[0],"trasferta")}<div class="tmid"><div><span class="${g[4]==="F"&&g[2]<g[3]?"lo":""}">${g[2]}</span><i>–</i><span class="${g[4]==="F"&&g[3]<g[2]?"lo":""}">${g[3]}</span></div><small>${g[4]==="L"?`<span class="hmlv">LIVE</span> `:""}${e(stOf(g))}</small></div>${side(g[1],"casa")}</div>
 <div class="tvtabs">${["a","h"].map((k,j)=>`<button class="tvtab" data-tvside="${k}" aria-pressed="${TVS.side===k}">${lw(g[j])}${e(T(g[j])[0])}</button>`).join("")}</div>
 ${R.length?`<div class="tbl-wrap tvw"><table class="ptbl tvbox tvsq"><thead><tr><th>Giocatore</th><th class="sqh">SQ</th><th class="pdkl">AVG</th><th>Min</th><th>Pt</th><th>RIM</th><th>AST</th><th>STL</th><th>BLK</th><th>TOV</th><th>Tiri</th><th>Da 3</th><th>Liberi</th><th>Off</th><th>Dif</th><th>Falli</th><th>+/−</th></tr></thead>
 <tbody><tr class="grp"><td>Quintetto</td><td colspan="16"></td></tr>${R.filter(r=>r[2]).map(row).join("")}<tr class="grp"><td>Panchina</td><td colspan="16"></td></tr>${R.filter(r=>!r[2]).sort((a,b)=>b[3]-a[3]).map(row).join("")}
 <tr class="tot"><td>Totale squadra</td><td class="sqc"></td><td class="pdkl">${f1(tot)}</td><td></td><td>${s(4)}</td><td>${s(11)+s(12)}</td><td>${s(13)}</td><td>${s(14)}</td><td>${s(15)}</td><td>${s(16)}</td><td>${s(5)}-${s(6)}</td><td>${s(7)}-${s(8)}</td><td>${s(9)}-${s(10)}</td><td>${s(11)}</td><td>${s(12)}</td><td>${s(17)}</td><td></td></tr>
 <tr class="pct"><td>Percentuali</td><td class="sqc"></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>${pct(s(5),s(6))}</td><td>${pct(s(7),s(8))}</td><td>${pct(s(9),s(10))}</td><td></td><td></td><td></td><td></td></tr></tbody></table></div>`:`<p class="note">Tabellino non ancora disponibile${g[4]==="S"?": la partita non è iniziata":""}.</p>`}
 <p class="note">Tabellino ESPN. AVG = punti della lega (vedi Statistiche). SQ = squadra del fanta. Pt punti, RIM rimbalzi, AST assist, STL palle rubate, BLK stoppate, TOV palle perse, Off/Dif rimbalzi offensivi/difensivi, T tecnico, F flagrante${g[4]==="L"?", pallino rosso = in campo adesso":""}.</p>`}
/* (74) SFIDA ESPN 16 IN STILE DYNASTY TV (come «tvDrGame» di Dreamers): tabellone con i due loghi e il punteggio, schede delle due squadre,
   tabella con Titolari (formazione ESPN del lunedì), In attesa (titolari che non hanno ancora giocato) e Tribuna; AVG = punti della settimana,
   statistiche = somma delle partite della settimana dai tabellini ESPN (si scorre a destra come nel box NBA). */
function vDr(){try{const[A,B,ws,cup]=TVS.dr.split(","),w=+ws,MD=cup==="c"?"sum":undefined/* (104) dalla McGee Cup: regola a somma */,WS=sfidaScores(w,MD),TA=wkTeam(A,w,MD),TB=wkTeam(B,w,MD),sa=WS.S[A],sb=WS.S[B];
 const[a0,b0]=weekRange(w),wNow=weekOf(nyToday()<W1?W1:nyToday()),days=Object.keys(ESPN.days).filter(k=>k>=a0&&k<=b0&&(ESPN.days[k]||[]).length).sort(),done=days.filter(k=>(ESPN.days[k]||[]).every(id=>ESPN.games[id]&&ESPN.games[id][4]==="F")).length;
 const fin=w===8?false:w<wNow||(days.length&&done===days.length),live=[TA,TB].some(T=>T.L.some(x=>x.G.some(g=>g.lv)));
 const side=TVS.drs==="b"?"b":"a",id=side==="a"?A:B,T=side==="a"?TA:TB;
 const nick=t=>e(TM[t].nome.split(" ").slice(-1)[0]),lg=t=>`<span class="drsbl"><span class="badge logo lg-${t}" role="img" aria-label="${e(TM[t].nome)}"></span></span>`;
 const pl=T=>T.L.filter(x=>x.on&&x.n>0).length;
 const NS=11,st=x=>{const r={m:0,p:0,rb:0,as:0,s:0,b:0,to:0,fm:0,fa:0,tm:0,ta:0,lm:0,la:0};for(const g of x.G){if(g.f==null)continue;const R=(ESPN.box[g.id]||[]).find(q=>__ownKey(q[0])===__ownKey(x.g[0]));if(!R)continue;r.m+=+R[3]||0;r.p+=R[4];r.fm+=R[5];r.fa+=R[6];r.tm+=R[7];r.ta+=R[8];r.lm+=R[9];r.la+=R[10];r.rb+=R[11]+R[12];r.as+=R[13];r.s+=R[14];r.b+=R[15];r.to+=R[16]}return r};
 const row=(x,grp)=>{const r=x.n?st(x):null,lv=x.G.some(g=>g.lv&&g.f!=null),cells=r?`<td>${x.n}</td><td>${Math.round(r.m)}</td><td class="pts">${r.p}</td><td>${r.rb}</td><td>${r.as}</td><td>${r.s}</td><td>${r.b}</td><td>${r.to}</td><td>${r.fm}-${r.fa}</td><td>${r.tm}-${r.ta}</td><td>${r.lm}-${r.la}</td>`:`<td>0</td>${"<td>—</td>".repeat(NS-1)}`;
  return`<tr><td><div class="tvpn"><div class="plk" data-pl="${e(x.g[0])}">${lv?'<i class="lvd"></i>● ':""}${e(nm(x.g[0]))}<small><i class="tvps">${e(x.team||"")}${x.rem?` · ${x.rem} da gioc.`:""}</i></small></div></div></td><td class="pdkl ${x.n?pc(x.pg):""}">${x.n?`<span class="pdkb">${f1(x.tot)}</span>`:'<span class="dash">—</span>'}</td>${cells}</tr>`};
 const grp=(lab,arr,g)=>arr.length?`<tr class="grp"><td>${lab}</td><td colspan="${1+NS}"></td></tr>${arr.map(x=>row(x,g)).join("")}`:"";
 const tit=T.L.filter(x=>x.on&&x.n>0),att=T.L.filter(x=>x.on&&!x.n),trib=T.L.filter(x=>!x.on);
 const x=dd(TVS.d||nyDay()),dl=`${x.getUTCDate()} ${MM[x.getUTCMonth()]}`,sc=v=>v==null?"—":f1(v);
 return`<button class="gback tvback" data-tvback="1">‹ Partite del ${dl}</button>
 <div class="tvsb" style="--ca:${TCOL[A]};--ch:${TCOL[B]}"><div class="tside">${lg(A)}<b>${nick(A)}</b><small>${pl(TA)}/14 hanno giocato</small></div>
  <div class="tmid"><div><span class="${fin&&sa<sb?"lo":""}">${sc(sa)}</span><i>–</i><span class="${fin&&sb<sa?"lo":""}">${sc(sb)}</span></div><small>${live?'<span class="hmlv">LIVE</span> ':""}${fin?"Finale":w===8&&w<wNow?"Continua nella 9":w>wNow?"Da giocare":"In corso"}</small><em class="drsbn">ESPN 16 · settimana ${w}${w===9?" (8+9)":""}</em></div>
  <div class="tside">${lg(B)}<b>${nick(B)}</b><small>${pl(TB)}/14 hanno giocato</small></div></div>
 <div class="tvtabs"><button class="tvtab" data-drside="a" aria-pressed="${side==="a"}"><span class="drtvl"><span class="badge logo lg-${A}"></span></span>${nick(A)}</button><button class="tvtab" data-drside="b" aria-pressed="${side==="b"}"><span class="drtvl"><span class="badge logo lg-${B}"></span></span>${nick(B)}</button></div>
 <div class="tbl-wrap tvw"><table class="ptbl tvbox drbox drbxs"><thead><tr><th>Giocatore</th><th class="pdkl">AVG</th><th>G</th><th>Min</th><th>Pt</th><th>RIM</th><th>AST</th><th>STL</th><th>BLK</th><th>TOV</th><th>Tiri</th><th>Da 3</th><th>Liberi</th></tr></thead>
 <tbody>${grp("Titolari",tit,"on")}${grp(fin?"Non hanno giocato":"In attesa",att,"wait")}${grp("Tribuna · non contano",trib,"trib")}
 <tr class="tot"><td>Punteggio squadra</td><td class="pdkl dfp">${sc(side==="a"?sa:sb)}</td>${"<td></td>".repeat(NS)}</tr></tbody></table></div>
 <button class="advbtn" data-du="${A},${B}" data-duw="${w}">Apri la sfida ›</button>
 <p class="note">Settimana ${w} · ${done} su ${days.length} giorni${w===9?" · sfida unica 8–9: il punteggio somma le due settimane (media 8 + media 9), la tabella mostra la 9":""}. I 14 titolari sono la formazione ESPN del lunedì; chi è in tribuna non conta. ${MD?"Sfida di McGee Cup: AVG = somma dei punti nella settimana":"Regola delle medie: AVG = media delle partite della settimana, la squadra somma le 14 medie"}; G partite giocate; statistiche sommate sulle partite della settimana (scorri a destra).${WS.off?" Punteggio ufficiale ESPN.":""}</p>`}catch(er){return""}}
window.vTv=()=>{if(TVS.dr){const h=vDr();if(h)return h;TVS.dr=null}return TVS.g?vGame():vList()};
window.TVS=TVS;
(window.NAVX=window.NAVX||[]).push({k:"tv",get:()=>({d:TVS.d,g:TVS.g,side:TVS.side,dr:TVS.dr||null,drs:TVS.drs||"a"}),set:o=>Object.assign(TVS,o)});
document.addEventListener("click",ev=>{if(cur!=="tv")return;const c=ev.target.closest("[data-tvd],[data-tvg],[data-tvback],[data-tvside],[data-drtv],[data-drside]");if(!c)return;const d=c.dataset;
 if(d.drtv){TVS.dr=d.drtv;TVS.drs="a";TVS.g=null;render();scrollTo(0,0);return}/* (74) */
 if(d.drside){TVS.drs=d.drside;const y=scrollY;render();scrollTo(0,y);return}
 if(d.tvd){TVS.d=d.tvd;TVS.g=null;TVS.dr=null;render();const w=document.getElementById("tvweek"),b=w&&w.querySelector('[aria-pressed="true"]');if(b)w.scrollLeft=b.offsetLeft-w.clientWidth/2+b.clientWidth/2;return}
 if(d.tvg){TVS.g=d.tvg;TVS.side="a";render();scrollTo(0,0);return}
 if(d.tvback){TVS.g=null;TVS.dr=null;render();return}
 if(d.tvside){TVS.side=d.tvside;render();return}},true);
})();
