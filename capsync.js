/* ===== ESPN 16 – (141) MOVIMENTI DEDOTTI DA ESPN =====
   Regola di Francesco (18/11/2026): firme degli svincolati e tagli non si scrivono più a mano. L app li deduce confrontando le rose ESPN
   (quelle in vigore dal lunedì alle 10:30, cioè con le formazioni del turno) con i contratti di cap-data.js:
   - giocatore in una rosa ESPN senza contratto in nessuna squadra  → FIRMA da svincolato: contratto provvisorio di 1 anno allo stipendio di
     mercato (formula della lega, STIP), segnato «da confermare» finché Francesco non comunica il prezzo vero (poi va scritto in cap-data.js);
   - giocatore con contratto che non è più in nessuna rosa ESPN → TAGLIO: contratto tolto, costo del taglio = 10% di quello che restava,
     minimo 1, arrotondato a 0,1 (regola del foglio «Tagli»), aggiunto ai tagli di quest anno;
   - giocatore con contratto in una squadra ma nella rosa ESPN di un altra → SCAMBIO: (144, 23/11/2026) il contratto SI SPOSTA da solo nella
     squadra della rosa ESPN (stesso stipendio e stessi anni; occupato e libero ricalcolati per tutte e due), segnato «da confermare» finché
     Francesco non manda i dettagli (scelte, crediti, eventuali modifiche al contratto): poi lo scambio si scrive in cap-data.js e non viene più dedotto.
   Occupato e libero vengono ricalcolati di conseguenza. Quando un movimento viene scritto in cap-data.js non viene più dedotto. */
(function(){
if(typeof CAP==="undefined"||typeof ROSE==="undefined")return;
const nk=n=>{try{return __ownKey(n)}catch(_){return String(n).toLowerCase()}};
const r1=v=>Math.round(v*10)/10;
const CAP0=JSON.parse(JSON.stringify(CAP));
let SIG="";
function sync(){const sig=JSON.stringify(Object.keys(ROSE).map(t=>[t,(ROSE[t]||[]).map(g=>g[0])]));if(sig===SIG)return false;SIG=sig;
 const own={};for(const t in CAP0)for(const p of CAP0[t].pl||[])own[nk(p[0])]=t;
 const espn={};for(const t in ROSE)for(const g of ROSE[t]||[])espn[nk(g[0])]={t,n:g[0]};
 const M=[],MV=[];
 for(const t in CAP0){const C=JSON.parse(JSON.stringify(CAP0[t])),keep=[];
  for(const p of C.pl||[]){const e=espn[nk(p[0])],y=(p[1]||[]).filter(v=>v!=null);
   if(!e){const tot=y.reduce((a,b)=>a+b,0),cost=Math.max(1,r1(tot*.1));y.forEach((v,i)=>{C.occ[i]=r1((C.occ[i]||0)-v)});C.tagli=r1((C.tagli||0)+cost);C.libero=r1((C.libero!=null?C.libero:CAP_TOT-(CAP0[t].occ[0]||0)-(CAP0[t].tagli||0))+y[0]-cost);
    M.push({ty:"taglio",t,n:p[0],tot:r1(tot),cost});continue}
   if(e.t!==t){/* scambio: il contratto esce da qui e va nella squadra della rosa ESPN (dopo il giro) */y.forEach((v,i)=>{C.occ[i]=r1((C.occ[i]||0)-v)});C.libero=r1((C.libero!=null?C.libero:CAP_TOT-(CAP0[t].occ[0]||0)-(CAP0[t].tagli||0))+(y[0]||0));
    MV.push({p,to:e.t});M.push({ty:"scambio",t,to:e.t,n:p[0],v:y[0]||0,anni:y.length});continue}
   keep.push(p)}
  C.pl=keep;CAP[t]=C}
 for(const{p,to}of MV){const C=CAP[to];if(!C)continue;const y=(p[1]||[]).filter(v=>v!=null),q=JSON.parse(JSON.stringify(p));q[3]=1;q[4]="scambio";C.pl.push(q);
  y.forEach((v,i)=>{C.occ[i]=r1((C.occ[i]||0)+v)});C.libero=r1((C.libero!=null?C.libero:CAP_TOT-(CAP0[to].occ[0]||0)-(CAP0[to].tagli||0))-(y[0]||0))}
 for(const k in espn){if(own[k])continue;const e=espn[k],C=CAP[e.t];if(!C)continue;let v=null;try{v=window.e16Stip?e16Stip(e.n):null}catch(_){}v=v!=null?Math.max(4,r1(v)):4;
  C.pl.push([e.n,[v],0,1]);C.occ[0]=r1((C.occ[0]||0)+v);C.libero=r1((C.libero!=null?C.libero:0)-v);M.push({ty:"firma",t:e.t,n:e.n,v})}
 window.E16MOV=M;try{window.e16CtReset&&e16CtReset()}catch(_){}return true}
window.e16CapSync=sync;sync();
const SR=window.e16SetRose;if(SR)window.e16SetRose=function(){const r=SR.apply(this,arguments);try{sync()}catch(_){}return r};
})();
