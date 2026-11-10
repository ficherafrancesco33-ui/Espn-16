/* ESPN 16 – (6) CONTRASTO del tema Parquet, copiato dall app Dreamers così la resa è identica:
   (711) le caselle semitrasparenti sopra il parquet diventano bianche con scritte arancio;
   (248) dopo ogni render ogni testo con poco contrasto sul suo sfondo viene corretto (bianco su scuro, arancio scuro su chiaro).
   Funziona solo di giorno (html.dlt-parquet); di notte si annulla da solo. */
(function(){
/* (711) Parquet: ogni casella semitrasparente che sta direttamente sul parquet diventa bianca con scritte arancio */
(function(){let t=null;function run(){t=null;const R=document.documentElement;if(!R.classList.contains("dlt-parquet"))return;const m=document.querySelector("main")||document.body;
  const trans=e=>{const c=getComputedStyle(e).backgroundColor,x=c.match(/rgba?\(([^)]+)\)/);if(!x)return 0;const q=x[1].split(",").map(Number);return q.length>3?q[3]:1};
  const onWood=e=>{for(let a=e.parentElement;a&&a!==m&&a!==document.body;a=a.parentElement){if(a.classList.contains("pqw"))return false;const al=trans(a);if(al>=.9)return false}return true};
  const WQ=[];m.querySelectorAll("*").forEach(e=>{if(e.classList.contains("pqw")||e.closest("svg,#tgo,.tgo,.nzmq,header,.bxs,main .bt,main .lab .lbstage,main .lab .lbtabs,main #lbpan"))return;/* (1197) la Sala scommesse ha i suoi colori: il Parquet non la tocca */const tg=e.tagName;if(tg==="SVG"||tg==="PATH"||tg==="IMG"||tg==="INPUT"||tg==="OPTION"||tg==="TR"||tg==="TD"||tg==="TH"||tg==="TABLE"||tg==="THEAD"||tg==="TBODY")return;
    const cs=getComputedStyle(e);if(cs.position==="fixed"||cs.display==="none"||cs.visibility==="hidden")return;
    const al=trans(e);if(al<=.02||al>=.97)return;if(e.getAttribute("aria-pressed")==="true"||e.getAttribute("aria-selected")==="true"||e.classList.contains("on"))return;
    const r=e.getBoundingClientRect();if(r.width<36||r.height<24)return;if(!onWood(e))return;WQ.push(e)});
  /* (851) scritture dopo tutte le letture */for(const e of WQ){e.classList.add("pqw");e.querySelectorAll("[data-pq]").forEach(x=>{if(x.matches(".pdkx,.pdkb,.gv,.gr2,.badge,.injtag,[class*=\"lg-\"]"))return;x.style.removeProperty("color");x.style.removeProperty("text-shadow");x.removeAttribute("data-pq")})}}
  const go=()=>{if(t)return;t=setTimeout(()=>{try{(window.requestIdleCallback||setTimeout)(()=>{run();try{if(!document.documentElement.classList.contains("notte")&&window.pqFix)window.pqFix()}catch(e){}})}catch(e){}},180)};
  window.__pqw=()=>{t=null;run()};new MutationObserver(go).observe(document.body,{childList:true,subtree:true});document.addEventListener("click",go);window.addEventListener("load",go)})();

/* (248) CONTRASTO AUTOMATICO tema Parquet: dopo ogni render, ogni testo con contrasto < 3,4 sul suo sfondo viene corretto: bianco su sfondi scuri/arancioni, arancione scuro (o la stessa tinta scurita) su sfondi chiari. Le stelle vuote si scuriscono sui fondi chiari. Si annulla uscendo dal tema. */
(function(){
const PQL=[];
const pr=c=>{const m=c&&c.match(/rgba?\(([^)]+)\)/);if(!m)return null;const a=m[1].split(",").map(parseFloat);return{r:a[0],g:a[1],b:a[2],a:a.length>3?a[3]:1}};
const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
const cr=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const mix=(c,t,k)=>({r:c.r+(t.r-c.r)*k,g:c.g+(t.g-c.g)*k,b:c.b+(t.b-c.b)*k});
function pqClean(){while(PQL.length){const e=PQL.pop();try{e.style.removeProperty("color");e.style.removeProperty("text-shadow");e.removeAttribute("data-pq")}catch(_){}}}
function pqFix(){try{
  const app=document.documentElement.classList.contains("dlt-parquet"),dr=!!document.querySelector('.drroom[data-th="3"]');
  {/* (725) cambio di modalità (base ↔ Parquet ↔ notte): via tutti i residui del tema precedente (colori scritti sugli elementi e caselle bianche) */
  const key=(app?"p":"")+(document.documentElement.classList.contains("notte")?"n":"")+(dr?"d":"");
  if(window.__pqKey!==undefined&&window.__pqKey!==key){pqClean();document.querySelectorAll(".pqw").forEach(x=>x.classList.remove("pqw"));document.querySelectorAll("[data-pq]").forEach(x=>{x.style.removeProperty("color");x.style.removeProperty("text-shadow");x.removeAttribute("data-pq")})}
  window.__pqKey=key}
  if(!app&&!dr){pqClean();document.querySelectorAll(".pqw").forEach(x=>x.classList.remove("pqw"));document.querySelectorAll("[data-pq]").forEach(x=>{x.style.removeProperty("color");x.style.removeProperty("text-shadow");x.removeAttribute("data-pq")});window.__pqKey="";return}
  if(!document.documentElement.classList.contains("notte")){pqClean();if(app&&window.__pqw)window.__pqw()}/* (722) prima il pannello bianco (pqw), poi il contrasto: così le scritte non restano bianche su bianco */
  const cache=new Map();
  const bgOfOld=el=>{if(cache.has(el))return cache.get(el);let res;const cs=getComputedStyle(el);let c=null;
    const gi=cs.backgroundImage;if(gi&&gi!=="none"&&!/^url/.test(gi)){const m=gi.match(/rgba?\([^)]+\)/);if(m)c=pr(m[0])}
    const bc=pr(cs.backgroundColor);if(!c||c.a<.95){if(bc&&bc.a>0&&(!c||bc.a>=.95))c=bc}
    if(c&&c.a>=.95)res=c;else{const par=el.parentElement;const under=par?bgOfOld(par):{r:255,g:246,b:228};res=c&&c.a>0?{r:c.r*c.a+under.r*(1-c.a),g:c.g*c.a+under.g*(1-c.a),b:c.b*c.a+under.b*(1-c.a)}:under}
    cache.set(el,res);return res};
  const NT=document.documentElement.classList.contains("notte");/* (724) in modalità notte il correttore lavora come prima della v253 */
  const colRe=/rgba?\([^)]*\)|color\(srgb [^)]*\)/g;
  const pc=t=>{const m=t.match(/[-\d.]+/g);if(!m)return null;if(t.startsWith("color(")){return{r:+m[0]*255,g:+m[1]*255,b:+m[2]*255,a:m.length>3?+m[3]:1}}return{r:+m[0],g:+m[1],b:+m[2],a:m.length>3?+m[3]:1}};
  const splitTop=str=>{const o=[];let d=0,cur="";for(const ch of str){if(ch==="(")d++;if(ch===")")d--;if(ch===","&&d===0){o.push(cur);cur=""}else cur+=ch}if(cur.trim())o.push(cur);return o};
  const over=(top,base)=>{const a=top.a;return{r:top.r*a+base.r*(1-a),g:top.g*a+base.g*(1-a),b:top.b*a+base.b*(1-a),a:1}};
  const bgOf=el=>{if(cache.has(el))return cache.get(el);const cs=getComputedStyle(el);const par=el.parentElement;
    let base=par?bgOf(par):{r:200,g:138,b:76,a:1};
    const bc=pr(cs.backgroundColor);if(bc&&bc.a>0)base=over(bc,base);
    const gi=cs.backgroundImage;
    if(gi&&gi!=="none"){const layers=splitTop(gi);for(let i=layers.length-1;i>=0;i--){const st=(layers[i].match(colRe)||[]).map(pc).filter(Boolean);if(!st.length)continue;const n=st.length;const m={r:st.reduce((q,x)=>q+x.r,0)/n,g:st.reduce((q,x)=>q+x.g,0)/n,b:st.reduce((q,x)=>q+x.b,0)/n,a:st.reduce((q,x)=>q+x.a,0)/n};m.r=st.reduce((q,x)=>q+x.r*x.a,0)/Math.max(.001,st.reduce((q,x)=>q+x.a,0));m.g=st.reduce((q,x)=>q+x.g*x.a,0)/Math.max(.001,st.reduce((q,x)=>q+x.a,0));m.b=st.reduce((q,x)=>q+x.b*x.a,0)/Math.max(.001,st.reduce((q,x)=>q+x.a,0));base=over(m,base)}}
    cache.set(el,base);return base};
  const bgOfNew=bgOf;const bgSel=el=>NT?bgOfOld(el):bgOfNew(el);
  const W={r:255,g:255,b:255},DK={r:43,g:22,b:8},OR={r:184,g:65,b:10},ORD={r:124,g:45,b:5};
  const WR=[];/* (851) scritture rimandate a dopo tutte le letture: niente ricalcoli della pagina a ogni elemento */
  document.querySelectorAll(app?"header *,main *,#subnav *,#subnav2 *":'.drroom[data-th="3"] *').forEach(el=>{
    if(el.tagName==="svg"||el.closest("svg"))return;
    if(el.closest(".htile"))return;if(el.closest("main .bt"))return;if(el.closest(".pcd"))return;if(el.closest("main .lab .lbstage,main .lab .lbtabs,main #lbpan"))return;/* (1259) il Laboratorio maglie ha i suoi colori */
    if(el.closest(".cltg,.cltn,.tvpnl .tvdate,.tvpnl .tvday"))return;
    if(window.__dxSkip&&window.__dxSkip(el))return;if(el.matches&&el.matches("div.teamhead,div.teamhead *,button.shbtn,div.gszn,table td.pnm,table td.pnm *,table thead th,table thead th *,.pdkx,.pdkx *,.pdkb,.pdkb *,.tgc,.tgc *,.tvbox tr.grp td,.tvbox tr.grp td *,.tvbox tr.tot td,.tvbox tr.tot td *,.mnb,.bxs span.gv *,.bxs span.gr2 *"))return;
    if(el.classList&&el.classList.contains("tstar")){const b=bgSel(el),v=lum(b)>.4;WR.push(()=>el.classList.toggle("stl",v));return}
    let has=false;for(const n of el.childNodes)if(n.nodeType===3&&n.textContent.trim().length>0){has=true;break}
    if(!has)return;const r=el.getBoundingClientRect();if(r.width<2||r.height<2)return;
    const cs=getComputedStyle(el);if(cs.visibility==="hidden"||+cs.opacity===0)return;
    const fg=pr(cs.color);if(!fg||fg.a===0)return;const bg=bgSel(el);
    const f=fg.a<1?mix(bg,fg,fg.a):fg;const dark=lum(f)<.07;/* niente scritte nere: nero/marrone scurissimo diventa arancione (fondo chiaro) o bianco (fondo scuro) */
    if(cr(f,bg)>=3.4&&!dark)return;
    let n;const L=lum(bg);
    if(el.closest("header")&&!el.closest(".subnav")){WR.push(()=>{el.style.setProperty("color","#fff","important");el.setAttribute("data-pq","1")});PQL.push(el);return}
    let shadow=false;
    if(L<.3)n=W;
    else{const sat=Math.max(fg.r,fg.g,fg.b)-Math.min(fg.r,fg.g,fg.b)>90;
      if(sat){let k=.1;n=mix(fg,{r:0,g:0,b:0},k);while(cr(n,bg)<3.4&&k<.9){k+=.1;n=mix(fg,{r:0,g:0,b:0},k)}}
      else n=OR;
      if(cr(n,bg)<3.4){const wood=bg.r>170&&bg.g>120&&bg.r>bg.g&&bg.g>bg.b&&bg.r-bg.b>80&&bg.r-bg.b<145;
        if(wood){n=W;shadow=true}/* sul legno: bianco con contorno marrone */
        else if(cr(ORD,bg)>=3.4)n=ORD;/* su colori vivaci (verde, giallo, viola…): arancione bruciato */
        else{n=W;shadow=true}}}
    const nc=`rgb(${n.r|0},${n.g|0},${n.b|0})`,sh=shadow;WR.push(()=>{if(sh)el.style.setProperty("text-shadow","0 1px 0 #6b3a10,0 -1px 0 #6b3a10,1px 0 0 #6b3a10,-1px 0 0 #6b3a10,0 2px 6px rgba(60,25,0,.6)","important");el.style.setProperty("color",nc,"important");el.setAttribute("data-pq","1")});PQL.push(el)});
  for(const f of WR)f();
}catch(e){}}
window.pqFix=pqFix;
/* (01/11) prestazioni: tutte le chiamate a pqFix nello stesso fotogramma diventano una sola, eseguita prima del disegno */
const pqFixNow=pqFix;{let q=0;pqFix=function(){if(q)return;q=requestAnimationFrame(()=>{q=0;pqFixNow()})}}window.pqFix=pqFix;window.pqFixNow=pqFixNow;
{const R0=render;render=function(){const x=R0.apply(this,arguments);pqFix();return x}}

pqFix();
})();
})();
