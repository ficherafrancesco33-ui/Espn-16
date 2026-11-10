/* ===== ESPN 16 – (73) ANIMAZIONI DEL CAMPO per tutte le 16 squadre: tasto accanto al tasto maglia (h2.lbmh) =====
   Portate da Dreamers (index.html): (1388) PALLA ANIMATA DUCKS e (1397) EFFETTI CAMPO DUCKS.
   Ogni tocco del tasto .fxbtn cambia animazione: Palla e canestro → Crollo del pavimento → Spente → …
   La scelta è ricordata sul telefono (localStorage "e16_fx"); senza scelta: Palla e canestro. L icona mostra l animazione attiva.
   PALLA: la palla passa tra i 5 in campo e i primi 3 «altri titolari» (sesto uomo e panchina), palleggio a 8 (dietro e davanti
   alla maglia), a ogni giro tirano tutti una volta in ordine casuale. Il logo della squadra fa da tabellone: resta nell SVG del campo
   (fermo, niente tremolii) e sotto si disegna il ferro con la retina; la palla entra nel ferro. Palla e scia nei colori della squadra.
   CROLLO: il pavimento visto dall alto si rompe in mattonelle che cadono e sotto compare il campo nel colore della squadra;
   poi crolla anche quello e torna il campo vero. A ogni giro il colore cambia (alterna i due colori della squadra).
   Tolte rispetto a Dreamers: palla live (statistiche in diretta), gioco del tiro (dxGameOn/dxGameCycle), Gotham, casi PEA/DOL, PREMI, faro.
   Fuori dal Campo, con l app nascosta o sotto la modalità Dream (.drm3) non gira niente (nessun requestAnimationFrame, nessun intervallo). */
(function(){
"use strict";
const MODES=[["palla","Palla e canestro"],["crollo","Crollo del pavimento"],["off","Animazioni spente"]];
const K="e16_fx",NS="http://www.w3.org/2000/svg";
const fxMode=()=>{let v=null;try{v=localStorage.getItem(K)}catch(e){}return MODES.some(m=>m[0]===v)?v:"palla"};
const fxNome=m=>(MODES.find(x=>x[0]===m)||MODES[0])[1];
const team=()=>{try{return window.e16RT?e16RT():null}catch(e){return null}};
/* (73) solo nella pagina Campo (non nelle schede squadra), app visibile, senza lo stadio Dream sopra */
const here=()=>typeof cur!=="undefined"&&cur==="campo"&&!(typeof curTeam!=="undefined"&&curTeam)&&!document.hidden&&!document.querySelector(".drm3")&&!!document.querySelector("main .court svg.cbg");

/* ---------------- colori della squadra ---------------- */
const hx=h=>{h=String(h||"").trim();if(/^#[0-9a-f]{3}$/i.test(h))h="#"+[...h.slice(1)].map(c=>c+c).join("");return/^#[0-9a-f]{6}$/i.test(h)?h.toLowerCase():null};
const rgb=h=>{const n=parseInt(h.slice(1),16);return[n>>16,n>>8&255,n&255]};
const lum=h=>{const[r,g,b]=rgb(h);return(.299*r+.587*g+.114*b)/255};
const mix=(h,w,k)=>{const a=rgb(h),b=rgb(w);return"#"+a.map((v,i)=>Math.round(v+(b[i]-v)*k).toString(16).padStart(2,"0")).join("")};
const lt=(h,k)=>mix(h,"#ffffff",k),dk=(h,k)=>mix(h,"#000000",k);
const dist=(a,b)=>{const x=rgb(a),y=rgb(b);return Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2])};
/* come tcol() di Dreamers (1486): se il colore è scuro si schiarisce, così la scia si vede sul legno */
const vivo=h=>{const l=lum(h);return l>=.33?h:l>=.15?lt(h,.25):lt(h,.45)};
const QUEC={bg:"#6d28d9",trim:"#ef4444",fg:"#ffffff"};/* Quebec Ducks: viola e rosso (il rosso al posto del verde lime di Dreamers) */
const PALC={};
function pal(t){if(PALC[t])return PALC[t];
 const C=(t==="QUE"?QUEC:(window.E16COL||{})[t])||{bg:"#1e3a8a",trim:"#f97316",fg:"#ffffff"};
 const tc=hx((typeof TCOL!=="undefined"&&TCOL[t])||C.bg)||"#1e3a8a",cand=[C.bg,C.trim,C.fg,tc].map(hx).filter(Boolean);
 const trail=vivo(t==="QUE"?"#7c3aed":tc);
 const ball=cand.map(vivo).find(c=>dist(c,trail)>90&&lum(c)<.92)||"#f97316";
 /* pavimento: il colore della squadra e un secondo colore ben diverso (bordi o scritte della maglia) */
 const f1=tc,f2=cand.find(c=>dist(c,f1)>110&&lum(c)<.97)||(lum(f1)>.5?dk(f1,.45):lt(f1,.45));
 const fl=h=>{const l=lum(h);return l<.1?lt(h,.22):l>.9?dk(h,.08):h};
 return PALC[t]={trail,ball,hc:lum(tc)>.75?dk(tc,.5):tc,floors:[fl(f1),fl(f2)]}}

/* ---------------- stili e tasto ---------------- */
const st=document.createElement("style");st.id="e16fx";st.textContent=`html body .court>canvas.fxpu{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0}
html body .view>canvas.fxpo{position:absolute;left:0;pointer-events:none;z-index:2}html body .view:has(>canvas.fxpo){position:relative}
html body .court:has(>canvas.fxpu) .cln path[d^="M46 12.5A4"]{visibility:hidden}
html body h2.lbmh>.lbmk{justify-self:start;display:inline-flex;align-items:center;gap:6px;margin-left:14px}
html body h2.lbmh>.lbmk>.kitbtn{margin-left:0!important}
.fxbtn{flex:none;display:inline-grid;place-items:center;width:30px;height:28px;padding:0;border-radius:9px;border:1px solid rgba(255,255,255,.18);background:#141b36;cursor:pointer;-webkit-tap-highlight-color:transparent}
.fxbtn svg{width:19px;height:19px;display:block;filter:drop-shadow(0 1px 1px rgba(0,0,0,.5))}
html.dlt-parquet:not(.notte) main .fxbtn{background:#141b36!important;background-image:none!important;border:1px solid var(--pq-line,rgba(217,86,11,.45))!important;box-shadow:none!important}`;
document.head.appendChild(st);
/* icona: palla nei colori della squadra · mattonelle che cadono · palla spenta (barrata, come il tasto palla live di Dreamers) */
function ico(m,t){const P=pal(t||team()||"FAL");
 const pb=(f,x)=>`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="${f}" stroke="#111" stroke-width="1.6"/><path d="M3.5 12h17M12 3.5v17M6 6c3.5 3.5 3.5 8.5 0 12M18 6c-3.5 3.5-3.5 8.5 0 12" fill="none" stroke="#111" stroke-width="1.3"/>${x?'<path d="M4 20L20 4" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>':""}</svg>`;
 if(m==="off")return pb("#6b7280",1);
 if(m==="crollo"){const[a,b]=P.floors;return`<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="9" height="9" rx="1" fill="${a}" stroke="#fff" stroke-width="1"/><rect x="12.5" y="2.5" width="9" height="9" rx="1" fill="${b}" stroke="#fff" stroke-width="1"/><rect x="2.5" y="12.5" width="9" height="9" rx="1" fill="${b}" stroke="#fff" stroke-width="1"/><rect x="2.5" y="2.5" width="19" height="19" rx="1.5" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width=".8" stroke-dasharray="1.5 1.5"/><rect x="14.6" y="14.6" width="5" height="5" rx=".6" fill="${a}" stroke="#fff" stroke-width=".9" transform="rotate(24 17.1 17.1)"/></svg>`}
 return pb(P.ball,0)}
const btnAttr=m=>`aria-label="Animazioni del campo: ${fxNome(m)} (tocca per cambiare)" title="Animazioni: ${fxNome(m)}"`;
window.e16FxBtn=t=>t&&t!=="FA"?`<button class="fxbtn" type="button" data-fxt="${t}" data-fx="${fxMode()}" ${btnAttr(fxMode())}>${ico(fxMode(),t)}</button>`:"";
/* (73) campo.js lbm(): tasto maglia + tasto animazioni insieme, a sinistra nel tabellone */
window.e16FxWrap=(t,kit)=>kit&&window.e16FxBtn?`<span class="lbmk">${kit}${e16FxBtn(t)}</span>`:kit;

/* ================= PALLA E CANESTRO (da (1388) Dreamers) ================= */
let raf=0,M="",t0=0,TR=[],PLAN=null,PLANKEY="",LASTC=null,LTC="",CT0=0,GC=null,DB=null,BC="#f97316",TC="#7c3aed",HC="#5b21b6";
function els(){const court=document.querySelector("main .court");if(!court)return null;const view=court.closest(".view")||court.parentElement;return{court,view}}
/* i primi 3 «altri titolari» sotto il campo fanno da sesto uomo e panchina */
const benchEls=E=>[...E.view.querySelectorAll(".e16tit .bpl>svg")].slice(0,3);
function mount(E){const{court,view}=E;let u=court.querySelector(":scope>canvas.fxpu"),o=view.querySelector(":scope>canvas.fxpo");
 if(!u){u=document.createElement("canvas");u.className="fxpu";const s=court.querySelector(":scope>svg.cbg");s?s.after(u):court.prepend(u)}
 if(!o){o=document.createElement("canvas");o.className="fxpo";view.appendChild(o)}
 const vr=view.getBoundingClientRect(),cr=court.getBoundingClientRect(),B=benchEls(E),pb=B.length?B[B.length-1].getBoundingClientRect().bottom:cr.bottom;
 const top=cr.top-vr.top-40,h=Math.max(cr.bottom,pb)-cr.top+60,sv=(k,v)=>{if(o.style[k]!==v)o.style[k]=v};sv("top",top+"px");sv("width",vr.width+"px");sv("height",h+"px");
 const d=Math.min(2,window.devicePixelRatio||1)/* tela al massimo 2x, come Dreamers (1435) */;const fit=(c,w,hh)=>{const W=Math.round(w*d),H=Math.round(hh*d);if(c.width!==W||c.height!==H){c.width=W;c.height=H}};fit(u,cr.width,cr.height);fit(o,vr.width,h);
 return{u,o,d,ox:vr.left,oy:vr.top+top,ux:cr.left,uy:cr.top}}
function unmountBall(){LASTC=null;GC=null;DB=null;TR=[];PLAN=null;document.querySelectorAll("canvas.fxpu,canvas.fxpo").forEach(c=>c.remove())}
function players(E){const L=[];E.court.querySelectorAll(".cpl .pj").forEach(p=>L.push({el:p,court:1}));benchEls(E).forEach(p=>L.push({el:p,court:0}));
 return L.map(o=>{const r=o.el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height*.52,w:r.width,court:o.court}}).filter(p=>p.w>0)}
/* (73) il canestro: il logo resta nell SVG (fa da tabellone, sempre fermo) e il ferro sta nella sua parte bassa */
function hoop(E){const im=[...E.court.querySelectorAll(".cbg image")].find(e=>+(e.getAttribute("y")||99)<20);
 if(im){const r=im.getBoundingClientRect();if(r.width>0){const pj=E.court.querySelector(".cpl .pj"),rr=(pj?pj.getBoundingClientRect().width:64)*.22;/* il ferro appeso sotto il logo: copre solo il bordo basso, le scritte del logo restano leggibili */return{x:r.left+r.width/2,y:r.bottom+rr*.45,L:r}}}
 const pa=[...E.court.querySelectorAll(".cln path")].find(e=>/^M46 12\.5A4/.test(e.getAttribute("d")||""));const cr=E.court.getBoundingClientRect();if(!pa)return{x:cr.left+cr.width/2,y:cr.top+cr.height*.18};const r=pa.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+2}}
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const rnd=s=>()=>(s=(s*16807)%2147483647)/2147483647;
/* piano di un giro: tutti tirano una volta, in ordine casuale, con 1-2 passaggi prima di ogni tiro */
function plan(n,seed){const r=rnd(seed),ord=[...Array(n).keys()].sort(()=>r()-.5),S=[];let at=ord[0];
 ord.forEach(sh=>{const np=1+Math.floor(r()*2);for(let k=0;k<np;k++){let to=k===np-1?sh:Math.floor(r()*n);if(to===at)to=(at+1)%n;if(k===np-1&&at===sh){S.push({t:"dr",p:at,d:1.3});continue}S.push({t:"dr",p:at,d:1.3});S.push({t:"pa",a:at,b:to,d:1});at=to}S.push({t:"dr",p:sh,d:1.3});S.push({t:"sh",p:sh,d:1.6});S.push({t:"in",d:.9});at=sh});
 let T=0;S.forEach(x=>{x.s=T;T+=x.d});return{S,T}}
function at(P,H,T){const n=P.length,key=n+"";if(!PLAN||PLANKEY!==key){PLAN=Object.assign(plan(n,7+n),{cyc:0});PLANKEY=key}let t=T%PLAN.T;const cyc=Math.floor(T/PLAN.T);if(PLAN.cyc!==cyc){PLAN=Object.assign(plan(n,7+n+cyc*13),{cyc});t=T%PLAN.T}
 const x=PLAN.S.find(s=>t>=s.s&&t<s.s+s.d)||PLAN.S[0],p=(t-x.s)/x.d;
 if(x.t==="dr"){const a=P[x.p],R=a.w*.75,th=p*Math.PI*2;return{x:a.x+R*.95*Math.sin(th),y:a.y+R*.3*Math.sin(2*th)+R*.35,z:a.court&&Math.cos(th)<0?0:1,s:1}}
 if(x.t==="pa"){const a=P[x.a],b=P[x.b],q=ease(p),R=a.w*.75;return{x:a.x+(b.x-a.x)*q,y:a.y+R*.35+(b.y-a.y)*q-Math.sin(Math.PI*q)*R*1.8,z:1,s:1+.45*Math.sin(Math.PI*q)}}
 if(x.t==="sh"){const a=P[x.p],R=a.w*.75,q=Math.min(1,p/.86);if(p<.86)return{x:a.x+(H.x-a.x)*ease(q),y:a.y+R*.35+(H.y-a.y-R*.35)*q-Math.sin(Math.PI*q)*R*3.4,z:1,s:1+.9*Math.sin(Math.PI*q)};const d=(p-.86)/.14;return{x:H.x,y:H.y+d*3,z:0,s:.95-.45*d,inn:1}}
 return{x:H.x,y:H.y+3,z:0,s:.5,gone:1,sw:p}}
function ball(c,x,y,r){c.save();c.translate(x,y);c.beginPath();c.arc(0,0,r,0,7);c.fillStyle=BC;c.fill();c.lineWidth=r*.12;c.strokeStyle="#111";c.stroke();c.beginPath();c.moveTo(-r,0);c.lineTo(r,0);c.moveTo(0,-r);c.lineTo(0,r);c.moveTo(-r*.7,-r*.7);c.quadraticCurveTo(0,0,-r*.7,r*.7);c.moveTo(r*.7,-r*.7);c.quadraticCurveTo(0,0,r*.7,r*.7);c.lineWidth=r*.09;c.stroke();const g=c.createRadialGradient(-r*.35,-r*.4,r*.1,0,0,r);g.addColorStop(0,"rgba(255,255,255,.55)");g.addColorStop(1,"rgba(255,255,255,0)");c.beginPath();c.arc(0,0,r,0,7);c.fillStyle=g;c.fill();c.restore()}
/* ferro e retina (modalità «logo» di Dreamers); il tabellone è il logo vero, quindi qui solo la staffa nel colore della squadra */
function drawHoop(c,H,w,front,sw){const rr=w*.22;c.save();
 if(!front){c.fillStyle="rgba(0,0,0,.16)";c.beginPath();c.ellipse(H.x,H.y+rr*.3,rr*1.2,rr*.9,0,0,7);c.fill();c.restore();return}
 c.fillStyle=HC;c.strokeStyle="rgba(255,255,255,.85)";c.lineWidth=.8;c.beginPath();c.rect(H.x-2.2,H.y-rr*1.7,4.4,rr*.75);c.fill();c.stroke();
 const k=sw!=null&&sw<.5?1+.25*Math.sin(sw*Math.PI*6):1;c.strokeStyle="rgba(255,255,255,.95)";c.lineWidth=1;for(let i=0;i<12;i++){const an=i/12*Math.PI*2;c.beginPath();c.moveTo(H.x+Math.cos(an)*rr,H.y+Math.sin(an)*rr);c.lineTo(H.x+Math.cos(an+.5)*rr*.45*k,H.y+Math.sin(an+.5)*rr*.45*k+rr*.25);c.stroke()}
 c.beginPath();c.arc(H.x,H.y+rr*.25,rr*.45*k,0,7);c.stroke();c.beginPath();c.arc(H.x,H.y+rr*.12,rr*.72,0,7);c.stroke();c.strokeStyle="#f97316";c.lineWidth=2.6;c.beginPath();c.arc(H.x,H.y,rr,0,7);c.stroke();
 if(sw!=null&&sw<.85){c.globalAlpha=1-sw/.85;c.fillStyle=TC;c.strokeStyle="#111";c.lineWidth=2.4;c.font=`900 italic ${Math.round(w*.32)}px system-ui,sans-serif`;c.textAlign="center";c.strokeText("+3",H.x+w*.66,H.y-rr*.8-sw*14);c.fillText("+3",H.x+w*.66,H.y-rr*.8-sw*14);c.strokeStyle=TC;c.lineWidth=2;c.beginPath();c.arc(H.x,H.y,rr*(1.3+sw*2.2),0,7);c.stroke()}c.restore()}
function ballFrame(ts){const E=els();if(!E)return;
 /* pagina nuova = animazione nuova (1410): via le tele vecchie, scia e tempo da zero; stessa squadra ridisegnata: si continua */
 if(E.court!==LASTC){const same=LASTC&&LTC===team();document.querySelectorAll("canvas.fxpu,canvas.fxpo").forEach(c=>c.remove());LASTC=E.court;LTC=team();GC=null;DB=null;TR=[];if(same)CT0=ts-1e4;else{CT0=ts;t0=0;PLAN=null}
  const P0=pal(LTC);BC=P0.ball;TC=P0.trail;HC=P0.hc}
 if(ts-CT0<350)return;/* si aspetta che la pagina abbia finito di entrare */
 /* misure ogni 0,6 s (1435); tra una misura e l altra si segue lo scorrimento: nessun ricalcolo a ogni fotogramma */
 if(!GC||GC.court!==E.court||ts-GC.t>600){const R0=E.view.getBoundingClientRect();GC={court:E.court,t:ts,m:mount(E),P:players(E),H:hoop(E),vl:R0.left,vt:R0.top,sy:scrollY,sx:scrollX};DB=null}
 const VR={left:GC.vl-(scrollX-GC.sx),top:GC.vt-(scrollY-GC.sy)},dx=VR.left-GC.vl,dy=VR.top-GC.vt,m=Object.assign({},GC.m,{ox:GC.m.ox+dx,oy:GC.m.oy+dy,ux:GC.m.ux+dx,uy:GC.m.uy+dy}),{u,o,d}=m;
 const P=GC.P.map(p=>Object.assign({},p,{x:p.x+dx,y:p.y+dy}));if(!P.length)return;if(m.oy+o.height/d<0||m.oy>innerHeight)return;/* fuori schermo: niente disegno */
 const cu=u.getContext("2d"),co=o.getContext("2d");cu.setTransform(d,0,0,d,-m.ux*d,-m.uy*d);co.setTransform(d,0,0,d,-m.ox*d,-m.oy*d);
 if(DB&&DB.u===u){/* (1483) si cancella solo la zona disegnata prima */const x=VR.left+DB.x0,y=VR.top+DB.y0,w=DB.x1-DB.x0,h=DB.y1-DB.y0;cu.clearRect(x,y,w,h);co.clearRect(x,y,w,h)}else{cu.clearRect(m.ux,m.uy,u.width/d,u.height/d);co.clearRect(m.ox,m.oy,o.width/d,o.height/d)}
 if(!t0)t0=ts;const T=(ts-t0)/1000,H=Object.assign({},GC.H,{x:GC.H.x+dx,y:GC.H.y+dy}),W=P[0].w;drawHoop(cu,H,W,0);
 let q;try{q=at(P,H,T)}catch(e){PLAN=null;TR.length=0;return}if(!q||!isFinite(q.x)||!isFinite(q.y)){TR.length=0;return}
 /* (1407) scia salvata rispetto alla pagina: scorrendo non si allunga; dopo una pausa o un salto riparte da zero */
 const vx=q.x-VR.left,vy=q.y-VR.top,LT=TR.lt||0;TR.lt=ts;const lastP=TR[TR.length-1];
 if(ts-LT>200||(lastP&&Math.hypot(vx-lastP.vx,vy-lastP.vy)>W*1.2))TR.length=0;
 if(q.gone)TR.length=0;else{TR.push({vx,vy,z:q.z});if(TR.length>22)TR.shift()}
 const r=W*.1936*q.s;/* (1391) palla grande quanto il ferro */
 for(let j=1;j<TR.length;j++){const A=TR[j-1],B=TR[j],c=B.z?co:cu,al=j/TR.length;c.beginPath();c.moveTo(A.vx+VR.left,A.vy+VR.top);c.lineTo(B.vx+VR.left,B.vy+VR.top);c.strokeStyle=TC;c.lineCap="round";c.globalAlpha=al*.85;c.lineWidth=r*1.3*al;c.stroke();c.globalAlpha=al*.3;c.lineWidth=r*2.3*al;c.stroke();c.globalAlpha=1}
 if(!q.gone)ball(q.z?co:cu,q.x,q.y,r);drawHoop(co,H,W,1,q.sw);
 const pd=r*2.8+4,B={x0:1e9,y0:1e9,x1:-1e9,y1:-1e9,u},ad=(x,y,p)=>{B.x0=Math.min(B.x0,x-p);B.y0=Math.min(B.y0,y-p);B.x1=Math.max(B.x1,x+p);B.y1=Math.max(B.y1,y+p)};
 TR.forEach(t=>ad(t.vx,t.vy,pd));ad(q.x-VR.left,q.y-VR.top,pd);ad(H.x-VR.left,H.y-VR.top,W*1.3);DB=B}

/* ================= CROLLO DEL PAVIMENTO (da (1397) Dreamers, modo c1) ================= */
let CL=null,GID=0;
function clearCollapse(){if(!CL)return;try{CL.layers.forEach(l=>l.remove());CL.defs.forEach(e=>e.remove())}catch(e){}CL=null}
/* (73) al posto del campo «dell altra modalità» di Dreamers: lo stesso pavimento col legno tinto nel colore della squadra */
function teamFloor(src,col){const id="fx73g"+(++GID),n=typeof E16N!=="undefined"&&E16N,g=document.createElementNS(NS,"linearGradient");g.id=id;g.setAttribute("x1","0");g.setAttribute("x2","1");
 g.innerHTML=`<stop offset="0" stop-color="${dk(col,n?.5:.32)}"/><stop offset=".5" stop-color="${n?dk(col,.12):lt(col,.14)}"/><stop offset="1" stop-color="${dk(col,n?.5:.32)}"/>`;
 const line=lum(col)>.62?"#111827":"#ffffff";let first=true;
 const nodes=src.filter(e=>!e.classList.contains("dxst")).map(e=>{const c=e.cloneNode(true);if(first&&c.tagName.toLowerCase()==="rect"){c.setAttribute("fill",`url(#${id})`);c.removeAttribute("opacity");first=false}if(c.classList.contains("cln"))c.setAttribute("stroke",line);return c});
 return{defs:[g],nodes}}
function grid(){const r=rnd(11),T=[],X0=3,Y0=6,WW=94,HH=106,C=4,R=5;
 for(let i=0;i<C;i++)for(let j=0;j<R;j++)T.push({x:X0+i*WW/C,y:Y0+j*HH/R,w:WW/C,h:HH/R});
 T.forEach(t=>{t.r=r();t.key=t.r});T.sort((a,b)=>a.key-b.key);
 /* ritmo realistico: 1, poi 2, poi 3-4, poi valanga */
 let t=0;T.forEach((x,i)=>{if(i===0)t=0;else if(i<3)t=.55+(i-1)*.12;else if(i<7)t=1.05+(i-3)*.11;else t=1.55+(i-7)*(.9/Math.max(1,T.length-7))+r()*.12;x.dl=t*1.75;x.sh=i===0?2:i<3?1.4:i<7?1.1:.8});return T}
function buildCollapse(k){clearCollapse();const s=document.querySelector("main .court svg.cbg");if(!s)return;const c=s.querySelector(".cln");if(!c)return;const f=c.parentElement;
 let defs=s.querySelector(":scope>defs");if(!defs){defs=document.createElementNS(NS,"defs");s.prepend(defs)}
 const day=[...f.children].filter(e=>!e.classList.contains("fxtl")),P=pal(team()),V=teamFloor(day,P.floors[k%2]);V.defs.forEach(e=>defs.appendChild(e));
 const T=grid(),mk=(src,cls,pre)=>{const L=document.createElementNS(NS,"g");L.setAttribute("class","fxtl "+cls);let dd="";T.forEach((t,j)=>dd+=`<clipPath id="${pre}${j}"><rect x="${t.x.toFixed(3)}" y="${t.y.toFixed(3)}" width="${(t.w+.06).toFixed(3)}" height="${(t.h+.06).toFixed(3)}"/></clipPath>`);L.innerHTML=`<defs>${dd}</defs>`;
  const solid=document.createElementNS(NS,"g");src.forEach(e=>solid.appendChild(e.cloneNode(true)));let md=`<mask id="${pre}m" maskUnits="userSpaceOnUse" x="-50" y="-50" width="200" height="250"><rect x="-50" y="-50" width="200" height="250" fill="#fff"/>`;T.forEach((t,j)=>md+=`<rect id="${pre}h${j}" x="${(t.x-.03).toFixed(3)}" y="${(t.y-.03).toFixed(3)}" width="${(t.w+.12).toFixed(3)}" height="${(t.h+.12).toFixed(3)}" fill="#000" style="display:none"/>`);md+=`</mask>`;L.querySelector("defs").insertAdjacentHTML("beforeend",md);solid.setAttribute("mask",`url(#${pre}m)`);L.appendChild(solid);
  T.forEach((t,j)=>{const g=document.createElementNS(NS,"g");g.setAttribute("clip-path",`url(#${pre}${j})`);g.style.display="none";t[cls+"h"]=L.querySelector(`#${pre}h${j}`);src.forEach(e=>g.appendChild(e.cloneNode(true)));const sh=document.createElementNS(NS,"rect");sh.setAttribute("x",t.x);sh.setAttribute("y",t.y);sh.setAttribute("width",t.w+.06);sh.setAttribute("height",t.h+.06);sh.setAttribute("fill","#000");sh.setAttribute("opacity","0");g.appendChild(sh);t[cls]=g;t[cls+"s"]=sh;L.appendChild(g)});return L};
 const LN=mk(V.nodes,"n","fx73n"),LD=mk(day,"d","fx73d");LN.style.display="none";LD.style.display="none";f.appendChild(LN);f.appendChild(LD);
 CL={k,T,layers:[LN,LD],defs:V.defs,svg:s}}
function tileAt(g,sh,t,p,shake,R){/* p: 0 ferma, 0..1 caduta. vista dall alto: rimpicciolisce verso il basso, si scurisce, ruota appena */
 const cx=t.x+t.w/2,cy=t.y+t.h/2;
 if(p<=0){const jx=shake?(Math.sin(R*97)*.45*shake):0,jy=shake?(Math.cos(R*83)*.45*shake):0,rot=shake?Math.sin(R*61)*1.6*shake:0;g.setAttribute("transform",shake?`translate(${cx+jx} ${cy+jy}) rotate(${rot}) translate(${-cx} ${-cy})`:"");g.setAttribute("opacity","1");sh.setAttribute("opacity",shake?".08":"0");return}
 if(p>=1){g.setAttribute("opacity","0");return}
 const q=p*p,sc=1-q*.82,rot=(t.r-.5)*50*q,dx=(t.r-.5)*3*q,dy=(t.r*.7-.2)*3*q;
 g.setAttribute("transform",`translate(${cx+dx} ${cy+dy}) rotate(${rot}) scale(${sc}) translate(${-cx} ${-cy})`);sh.setAttribute("opacity",(.15+q*.7).toFixed(2));g.setAttribute("opacity",p>.85?((1-p)/.15).toFixed(2):"1")}
function collapseFrame(ts){if(!t0)t0=ts;const T=(ts-t0)/1000,CYC=24,cyc=Math.floor(T/CYC),t=T%CYC,FALL=1.35;
 /* (73) a ogni giro l altro colore della squadra; si ricostruisce anche se il campo è stato ridisegnato */
 if(!CL||!CL.svg.isConnected||CL.k!==cyc){buildCollapse(cyc);if(!CL)return}
 /* 0-2,5 fermo · 2,5 crolla il campo vero e sotto c è quello colorato · 13,5 crolla quello colorato e torna il campo vero */
 const act=(x,lay,on)=>{const g=x[lay],h=x[lay+"h"];if(on){if(g.style.display)g.style.display="";if(h.style.display)h.style.display=""}else{if(!g.style.display)g.style.display="none";if(!h.style.display)h.style.display="none"}};
 const ph=(base,lay)=>{CL.T.forEach(x=>{const s=base+x.dl,R=ts/1000+x.r*10;if(t<s-x.sh)act(x,lay,0);else if(t<s){act(x,lay,1);tileAt(x[lay],x[lay+"s"],x,0,.25+.75*(t-s+x.sh)/x.sh,R)}else{act(x,lay,1);tileAt(x[lay],x[lay+"s"],x,Math.min(1,(t-s)/FALL),0,R)}})};
 const sd=(e,v)=>{if(e.style.display!==v)e.style.display=v};
 sd(CL.layers[1],t<.5?"none":"");sd(CL.layers[0],(t<.5||t>21)?"none":"");/* a riposo niente fughe tra le mattonelle */ph(2.5,"d");if(t>=11.5)ph(13.5,"n");else CL.T.forEach(x=>act(x,"n",0))}

/* ---------------- motore ---------------- */
function stopAll(){if(raf)cancelAnimationFrame(raf);raf=0;t0=0;unmountBall();clearCollapse()}
function frame(ts){raf=0;if(!here()||M==="off"){stopAll();return}raf=requestAnimationFrame(frame);
 try{if(M==="palla")ballFrame(ts);else collapseFrame(ts)}catch(e){/* un errore non deve bloccare la pagina: si spegne e basta */stopAll();console.warn("campo-fx",e)}}
function kick(){const m=fxMode();if(m!==M){M=m;stopAll()}
 if(!here()||M==="off"){if(raf||CL||document.querySelector("canvas.fxpu,canvas.fxpo"))stopAll();return}if(!raf)raf=requestAnimationFrame(frame)}
function setMode(m){try{localStorage.setItem(K,m)}catch(e){}M=m;stopAll();
 document.querySelectorAll(".fxbtn").forEach(b=>{b.dataset.fx=m;b.setAttribute("aria-label",`Animazioni del campo: ${fxNome(m)} (tocca per cambiare)`);b.title=`Animazioni: ${fxNome(m)}`;b.innerHTML=ico(m,b.dataset.fxt)});kick()}
window.e16FxSet=setMode;window.e16Fx=fxMode;
document.addEventListener("click",ev=>{const b=ev.target.closest&&ev.target.closest(".fxbtn");if(!b)return;ev.preventDefault();ev.stopPropagation();
 const i=MODES.findIndex(m=>m[0]===fxMode());setMode(MODES[(i+1)%MODES.length][0])},true);
/* ogni cambio di pagina (render riscrive #main), lo stadio Dream che si apre o si chiude (figli del body), app nascosta o di nuovo visibile */
const obs=new MutationObserver(kick);
const hook=()=>{const m=document.getElementById("main");if(m)obs.observe(m,{childList:true});obs.observe(document.body,{childList:true});kick()};
document.addEventListener("visibilitychange",()=>{if(document.hidden)stopAll();else kick()});
window.addEventListener("pageshow",()=>{stopAll();kick()});
window.addEventListener("resize",()=>{GC=null;DB=null;if(M==="palla")TR=[]},{passive:true});
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",hook):hook();
})();
