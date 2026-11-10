/* ===== ESPN 16 – NAVIGAZIONE come Dreamers =====
   - Ogni pagina che si apre (sezione, squadra, giocatore, partita, passo dell IA…) entra in una pila: il tasto «‹», il gesto indietro
     del telefono (anche Android) e lo swipe dal bordo tornano alla pagina di prima, alla stessa altezza e con l elemento toccato evidenziato.
   - La scritta del tasto «‹» dice dove porta.
   - Toccando il logo dell app in alto la pagina si aggiorna (scarica dati e app nuovi); toccando la scritta ESPN 16 si torna alla Home. */
(function(){
const NAV=[];let last=null,restoring=false,pend=null;
const NX=()=>window.NAVX||[];
function snap(){return{cur,curTeam,tmTab,lgTab,night,x:NX().map(m=>({k:m.k,v:JSON.parse(JSON.stringify(m.get()))})),y:scrollY,sel:null}}
function sig(s){const x=Object.fromEntries(s.x.map(o=>[o.k,o.v]));const c=s.cur;
 /* (70) come Dreamers: cambiare scheda dentro la stessa pagina (schede squadra, schede Lega, vista calcolatore) non entra nella pila */return [c,s.curTeam||"","",c==="gioc"?x.st&&x.st.pl:"",c==="comp"?(x.st&&x.st.pa+"|"+x.st.pb):"",c==="tv"?(x.tv&&(x.tv.g||x.tv.dr)||""):"",(c==="campo"||c==="roster")?(x.g&&x.g.rt):"",c==="lega"?(x.g&&(x.g.du||"")):"",c==="ia"?(x.ia&&x.ia.mode+"|"+x.ia.st):""].join("~")}
function apply(s){cur=s.cur;curTeam=s.curTeam;tmTab=s.tmTab;lgTab=s.lgTab;night=s.night;for(const o of s.x){const m=NX().find(z=>z.k===o.k);if(m)try{m.set(JSON.parse(JSON.stringify(o.v)))}catch(_){}}}
const LAB={draft:"Sala Draft",drpl:"Rookie",drcmp:"Confronto rookie",fcons:"Formazione consigliata",fag:"Free agent",dax:"Area riservata",ssql:"Squadre",storico:"Storico trade",osserv:"Osservatorio",gusti:"IA Trade",pictrade:"Pic-Trade",allena:"Allenamento IA Trade",home:"Home",lega:"Lega",tv:"Dynasty TV",stat:"Statistiche",sgioc:"Giocatori",ssq:"Squadre",gioc:"Grafico",comp:"Comparatore",roster:"Roster",inf:"Centro Medico",reg:"Regolamento",cap:"Cap & Scelte",calc:"Calcolatore trade",ia:"IA Trade",val:"Valori giocatori",campo:"Campo"};
function label(s){if(!s)return"Home";if(s.curTeam)return TM[s.curTeam]?TM[s.curTeam].nome.split(" ").slice(-1)[0]:"Squadra";
 const x=Object.fromEntries(s.x.map(o=>[o.k,o.v]));if(s.cur==="tv"&&x.tv&&x.tv.g)return"Partita";if(s.cur==="tv"&&x.tv&&x.tv.dr)return"Sfida";if(s.cur==="lega"&&x.g&&x.g.du)return"Sfida";if(s.cur==="lega"&&x.g&&x.g.tab==="turno"&&x.g.wk)return"Settimana "+x.g.wk;if(s.cur==="campo"&&x.g&&TM[x.g.rt])return"Campo "+TM[x.g.rt].nome.split(" ").slice(-1)[0];
 if(s.cur==="gioc"&&x.st&&x.st.pl)return x.st.pl.split(" ").slice(-1)[0];return LAB[s.cur]||"Indietro"}
const BK=".gback,.grback,.drexit,.bk,.bk2,.back,[data-back],[data-tvback],.tvback";
/* dopo ogni disegno: se la pagina è cambiata, quella di prima entra nella pila */
const r0=render;render=function(){const out=r0.apply(this,arguments);try{
  const s=snap();if(last&&!restoring&&sig(s)!==sig(last)){if(pend&&pend.sig===sig(last)){last.y=pend.y;last.sel=pend.sel}
   /* (70) se la pagina nuova è già nella pila (A → B → A) si torna a quel punto invece di allungare la pila: il tasto ‹ non gira più a vuoto */
   const ns=sig(s),k=NAV.findIndex(z=>sig(z)===ns);if(k>=0)NAV.length=k;else{NAV.push(last);if(NAV.length>50)NAV.shift()}
   /* niente doppioni di fila */for(let i=NAV.length-1;i>0;i--)if(sig(NAV[i])===sig(NAV[i-1]))NAV.splice(i,1)}
  last=s;pend=null;
  const prev=NAV[NAV.length-1];document.querySelectorAll("#main "+BK.split(",").join(",#main ")).forEach(b=>{if(b.classList.contains("iabk")||b.classList.contains("iabk2"))return;b.textContent="‹ "+(prev?label(prev):"Home")});
 }catch(e){}return out};
addEventListener("scroll",()=>{if(last)last.y=scrollY},{passive:true});
/* ricorda cosa hai toccato (per ritrovarlo tornando indietro) */
const selOf=el=>{for(let e=el;e&&e.id!=="main";e=e.parentElement){if(!e.attributes)continue;const d=[...e.attributes].filter(a=>a.name.startsWith("data-")&&a.value!==""&&!/^data-(pq|pqc)$/.test(a.name)).slice(0,2);if(d.length)return e.tagName.toLowerCase()+d.map(a=>`[${a.name}="${CSS.escape(a.value)}"]`).join("")}return null};
addEventListener("click",e=>{const m=document.getElementById("main");if(!m||!m.contains(e.target)||e.target.closest(BK))return;if(last)pend={sig:sig(last),y:scrollY,sel:selOf(e.target)}},true);
let navT=0;
function back(){const n=Date.now();if(n-navT<350)return true;navT=n;const s=NAV.pop();if(!s){if(cur==="home"&&!curTeam)return false;cur="home";curTeam=null;restoring=true;render();restoring=false;scrollTo(0,0);return true}
 restoring=true;apply(s);render();restoring=false;last=snap();
 setTimeout(()=>{let el=null;try{el=s.sel&&document.querySelector("#main "+s.sel)}catch(_){}if(el){el.scrollIntoView({block:"center"});el.classList.add("navhl");setTimeout(()=>el.classList.remove("navhl"),1300)}else scrollTo(0,s.y||0)},40);return true}
window.e16Back=back;
/* tasti «‹» delle pagine */
addEventListener("click",e=>{const b=e.target.closest(BK);if(!b||!b.closest("#main")||b.classList.contains("iabk")||b.classList.contains("iabk2"))return;e.preventDefault();e.stopImmediatePropagation();back()},true);
/* gesto indietro del telefono / tasto Android */
try{history.pushState({e16:1},"")}catch(e){}
addEventListener("popstate",()=>{if(back()){try{history.pushState({e16:1},"")}catch(e){}}});
/* swipe dal bordo sinistro */
let sx=null,sy=0;addEventListener("touchstart",e=>{const t=e.touches[0];sx=t.clientX<28?t.clientX:null;sy=t.clientY},{passive:true});
addEventListener("touchend",e=>{if(sx==null)return;const t=e.changedTouches[0];if(t.clientX-sx>innerWidth*.25&&Math.abs(t.clientY-sy)<80)back();sx=null},{passive:true});
/* logo: aggiorna l app (nuova versione e dati freschi); scritta: Home */
addEventListener("click",e=>{const l=e.target.closest(".lglogo");if(l){e.preventDefault();e.stopImmediatePropagation();l.style.transition="transform .5s";l.style.transform="rotate(360deg)";
  save();const go=()=>location.reload();/* (70) si riapre nella stessa pagina */try{navigator.serviceWorker&&navigator.serviceWorker.getRegistration().then(r=>r?r.update():null).catch(()=>{}).finally(()=>setTimeout(go,350))}catch(_){setTimeout(go,350)}return}
 const b=e.target.closest(".brand");if(b){e.preventDefault();e.stopImmediatePropagation();NAV.length=0;cur="home";curTeam=null;render();scrollTo(0,0)}},true);
{const st=document.createElement("style");st.textContent=".navhl{outline:3px solid #facc15!important;outline-offset:2px;border-radius:10px;transition:outline-color .4s}";document.head.appendChild(st)}
/* (70) RICARICA RESTANDO DOVE SEI (come Dreamers): prima di ricaricare (logo) o quando l app va in secondo piano salvo pagina, pila e altezza;
   al riavvio si torna lì (ricarica col logo: subito; app riaperta: entro 90 minuti). Si salva solo la navigazione, i dati arrivano freschi. */
function save(){try{const x=JSON.stringify({t:Date.now(),s:snap(),nav:NAV.slice(-30)});sessionStorage.setItem("e16_reload",x);localStorage.setItem("e16_nav",x)}catch(_){}}
document.addEventListener("visibilitychange",()=>{if(document.hidden)save()});addEventListener("pagehide",save);
try{let r=JSON.parse(sessionStorage.getItem("e16_reload")||"null");sessionStorage.removeItem("e16_reload");
 if(!r||Date.now()-r.t>=30000){const q=JSON.parse(localStorage.getItem("e16_nav")||"null");r=q&&Date.now()-q.t<90*60000?q:null}
 if(r&&r.s){restoring=true;try{apply(r.s);NAV.length=0;(r.nav||[]).forEach(z=>NAV.push(z));render()}catch(_){}restoring=false;setTimeout(()=>scrollTo(0,r.s.y||0),80)}}catch(_){restoring=false}
last=snap();
})();
