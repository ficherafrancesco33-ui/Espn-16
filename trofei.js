/* ===== ESPN 16 – SALA TROFEI · ALBO D'ORO (87) =====
   Pagina SCAMBIV.trofei (tasto «Sala Trofei» nella barra in alto, dopo Sala Draft): campioni, campioni di conference, miglior record,
   bacheca di ogni squadra e classifiche finali. Gli stessi dati riempiono la sala trofei dello stadio 3D (dream-e16.js → dream.js).

   COME AGGIUNGERE UNA RIGA (dati dal foglio Google della lega; a = anno di fine stagione: 2024 = stagione 2023/24):
   - titoli:  campione della lega      → {a:2027,t:"DET"}
   - conf:    campioni di conference   → {a:2027,t:"DET"},{a:2027,t:"LVA"}  (Est/Ovest presi da TEAMS.conf)
   - record:  miglior record stagionale → {a:2027,t:"HON"}
   - nota:    segno accanto all anno, scritto come nel foglio (es. nota:"*")
   - t = sigla ATTUALE della squadra (TEAMS). Se quell anno la squadra si chiamava in un altro modo, aggiungerlo in exNomi
     (es. FAL nel 2024 era Seattle Sonics): il nome di allora compare accanto a quello di oggi.
   - CLASSIFICHE: una voce per stagione, righe dalla 1ª alla 16ª: {t:"HOU",n:"Houston Orange Lions"} con n = nome scritto quell anno.
     lab = scritta della stagione (si cambia qui). Le squadre di cui non si conosce la sigla di oggi hanno t:null (badge grigio,
     non contano nelle bacheche): quando si sa chi sono, scrivere la sigla in t. */
const ALBO={
 titoli:[{a:2024,t:"CAN",nota:"*"},{a:2025,t:"BOS"},{a:2026,t:"HOU"}],
 conf:[{a:2024,t:"CAN",nota:"*"},{a:2024,t:"FAL",nota:"*"},{a:2025,t:"ALA"},{a:2025,t:"BOS"},{a:2026,t:"HOU"}],
 record:[{a:2024,t:"FAL",nota:"*"},{a:2025,t:"ALA"},{a:2026,t:"HON"}],
 exNomi:{FAL:{2024:"Seattle Sonics"}},
 CLASSIFICHE:{
  s1:{lab:"1ª stagione",righe:[
   {t:"HOU",n:"Houston Orange Lions"},{t:"FAL",n:"Seattle Sonics"},{t:"CLE",n:"Cleveland Cadavers"},{t:"LVA",n:"Las Vegas Aliens"},
   {t:"NYS",n:"New York Samb"},{t:null,n:"Milwaukee Sucks"}/* una tra DET, QUE, NYP, CAN: scrivere la sigla in t quando si sa */,
   {t:null,n:"Houston Devils"}/* idem */,{t:null,n:"New York Monsters"}/* idem */,{t:"SRO",n:"Santa Rosa Pirates"},
   {t:"CHA",n:"Charlotte Cougars"},{t:"WIC",n:"Wichita Aviators"},{t:"ALB",n:"Albuquerque Bluesky"},{t:"BOS",n:"Boston Teabags"},
   {t:null,n:"Naples Gators"}/* idem */,{t:"HON",n:"Honolulu Monk Seals"},{t:"ALA",n:"Alaska Whales"}]},
  s2:{lab:"2ª stagione",righe:[
   {t:"HON",n:"Honolulu Monk Seals"},{t:"HOU",n:"Houston Orange Lions"},{t:"NYP",n:"New York Pandas"},{t:"BOS",n:"Boston TeaBags"},
   {t:"ALA",n:"Alaska Whales"},{t:"CHA",n:"Charlotte Cougars"},{t:"FAL",n:"Seattle Sonics"},{t:"CLE",n:"Cleveland Cadavers"},
   {t:"CAN",n:"Cancun Mayans"},{t:"DET",n:"Detroit Pythons"},{t:"NYS",n:"New York Samb"},{t:"ALB",n:"Albuquerque BlueSky"},
   {t:"QUE",n:"Toronto Huskies"},{t:"LVA",n:"Las Vegas Aliens"},{t:"WIC",n:"Wichita Aviators"},{t:"SRO",n:"Santa Rosa Pirates"}]}}
};
window.ALBO=ALBO;
(function(){
const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ST={sel:"",cl:""};
const anno=r=>r.a+(r.nota||"");
const stag=a=>(a-1)+"/"+String(a).slice(2);
const nome=t=>TM[t]?TM[t].nome:t;
const ex=(t,a)=>{const x=ALBO.exNomi&&ALBO.exNomi[t];return x&&x[a]?x[a]:""};
/* nome di oggi + «(come …)» se quell anno la squadra si chiamava diversamente */
const nomeA=(t,a)=>{const x=ex(t,a);return e(nome(t))+(x?` <small class="st-ex">(come ${e(x)})</small>`:"")};
const lg=(t,cls)=>t&&TM[t]?`<span class="st-lg ${cls||""}" style="--tc:${TCOL[t]||"#333"}"><span class="badge logo lg-${t}" role="img" aria-label="${e(nome(t))}"></span></span>`:"";
/* badge grigio con le iniziali, per le squadre senza sigla di oggi */
const lgN=(n,cls)=>`<span class="st-lg st-lgn ${cls||""}" aria-hidden="true"><i>${e(String(n).split(/\s+/).filter(Boolean).slice(-2).map(w=>w[0]).join("").toUpperCase())}</i></span>`;
const desc=L=>L.slice().sort((x,y)=>y.a-x.a);
const confLab=t=>TM[t]&&TM[t].conf==="E"?"Est":"Ovest";

/* COPPA DELLA LEGA disegnata a mano (stile del trofeo McGee): coppa a due manici con pallone in cima, stella e alloro,
   gambo con nodi e piedistallo in marmo nero. tipo "oro" = titolo; "arg" = conference (argento, più piccola). */
let NID=0;
function coppa(tipo,scritta){const k="stc"+(++NID),arg=tipo==="arg";
 const P=arg?["#ffffff","#dfe5ee","#9aa5b5","#4b5563"]:["#fff6c4","#f6c845","#c58a12","#7a4d06"],S=arg?"#4b5563":"#7a4d06";
 const G=`url(#${k}g)`,GD=`url(#${k}d)`,GL=`url(#${k}l)`;
 return `<svg viewBox="0 0 200 300" class="st-cup ${arg?"arg":"oro"}" role="img" aria-label="${arg?"Coppa di conference":"Coppa di campione"}"><defs>
 <linearGradient id="${k}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P[0]}"/><stop offset=".35" stop-color="${P[1]}"/><stop offset=".7" stop-color="${P[2]}"/><stop offset="1" stop-color="${P[3]}"/></linearGradient>
 <linearGradient id="${k}d" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P[1]}"/><stop offset="1" stop-color="${P[3]}"/></linearGradient>
 <radialGradient id="${k}l" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="${P[0]}"/><stop offset=".45" stop-color="${P[1]}"/><stop offset="1" stop-color="${P[3]}"/></radialGradient>
 <linearGradient id="${k}m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2a2e"/><stop offset=".5" stop-color="#0d0d10"/><stop offset="1" stop-color="#1c1c20"/></linearGradient>
 <filter id="${k}s" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter></defs>
 <ellipse cx="100" cy="140" rx="86" ry="118" fill="${P[1]}" opacity=".16" filter="url(#${k}s)"/>
 <!-- piedistallo in marmo nero con fasce e targa -->
 <ellipse cx="100" cy="292" rx="70" ry="6" fill="#000" opacity=".45"/>
 <path d="M40 248 H160 L166 284 H34 Z" fill="url(#${k}m)" stroke="${G}" stroke-width="2.2"/>
 <path d="M48 256 Q76 266 100 259 T152 272" stroke="#4a4a52" stroke-width=".8" fill="none" opacity=".7"/>
 <rect x="32" y="281" width="136" height="7" rx="2" fill="${G}"/><rect x="42" y="242" width="116" height="8" rx="2" fill="${G}"/>
 <rect x="70" y="258" width="60" height="17" rx="2" fill="${GD}" stroke="${P[0]}" stroke-width=".6"/>
 <text x="100" y="270.5" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="9.5" font-weight="700" fill="#1a1205" letter-spacing=".8">${e(scritta||(arg?"CONFERENCE":"ESPN 16"))}</text>
 <!-- piede e gambo con due nodi -->
 <path d="M66 242 Q100 230 134 242 L126 228 Q100 220 74 228 Z" fill="${G}" stroke="${S}" stroke-width=".9"/>
 <path d="M90 224 Q94 206 91 190 L109 190 Q106 206 110 224 Z" fill="${GD}" stroke="${S}" stroke-width=".9"/>
 <ellipse cx="100" cy="208" rx="14" ry="5" fill="${G}" stroke="${S}" stroke-width=".9"/><ellipse cx="100" cy="190" rx="18" ry="5.5" fill="${G}" stroke="${S}" stroke-width=".9"/>
 <!-- manici -->
 <path d="M52 86 C16 82 14 132 70 150" fill="none" stroke="${GD}" stroke-width="7.5" stroke-linecap="round"/>
 <path d="M148 86 C184 82 186 132 130 150" fill="none" stroke="${GD}" stroke-width="7.5" stroke-linecap="round"/>
 <path d="M51 88 C22 86 21 128 68 146" fill="none" stroke="${P[0]}" stroke-width="1.4" opacity=".7"/>
 <!-- corpo della coppa -->
 <path d="M46 72 Q46 150 88 182 L112 182 Q154 150 154 72 Z" fill="${G}" stroke="${S}" stroke-width="1.2"/>
 <path d="M60 80 Q60 140 92 172" fill="none" stroke="${P[0]}" stroke-width="3" opacity=".75" stroke-linecap="round"/>
 <path d="M56 100 Q100 112 144 100" fill="none" stroke="${S}" stroke-width="1" opacity=".55"/>
 <!-- alloro e stella -->
 <path d="M80 150 Q70 132 74 112 M120 150 Q130 132 126 112" fill="none" stroke="${S}" stroke-width="1.4"/>
 ${[0,1,2,3].map(i=>{const y=144-i*9;return`<ellipse cx="${75-i*.4}" cy="${y}" rx="5" ry="2.3" transform="rotate(-50 ${75-i*.4} ${y})" fill="${GD}" stroke="${S}" stroke-width=".5"/><ellipse cx="${125+i*.4}" cy="${y}" rx="5" ry="2.3" transform="rotate(50 ${125+i*.4} ${y})" fill="${GD}" stroke="${S}" stroke-width=".5"/>`}).join("")}
 <circle cx="100" cy="132" r="17" fill="${GD}" stroke="${P[0]}" stroke-width="1.2"/>
 <path d="M100 119 L103.8 128 L113.5 128.6 L106 134.8 L108.4 144.2 L100 139 L91.6 144.2 L94 134.8 L86.5 128.6 L96.2 128 Z" fill="${P[0]}" stroke="${S}" stroke-width=".6"/>
 <!-- orlo e pallone in cima -->
 <ellipse cx="100" cy="72" rx="54" ry="9.5" fill="${GD}" stroke="${S}" stroke-width="1"/>
 <ellipse cx="100" cy="72" rx="47" ry="6.5" fill="${P[3]}" opacity=".85"/>
 <circle cx="100" cy="50" r="20" fill="${GL}" stroke="${S}" stroke-width="1"/>
 <path d="M80 50 H120 M100 30 V70 M86 36 Q100 50 86 64 M114 36 Q100 50 114 64" fill="none" stroke="${S}" stroke-width="1.3"/>
 <path d="M88 38 Q92 33 99 32" fill="none" stroke="#fff" stroke-width="2" opacity=".55" stroke-linecap="round"/>
 </svg>`}
window.e16Coppa=coppa;

/* palmarès di una squadra: titoli, conference, record (righe con t uguale alla sigla) */
function palm(t){const f=L=>desc((L||[]).filter(r=>r.t===t));return{ti:f(ALBO.titoli),co:f(ALBO.conf),re:f(ALBO.record)}}
/* piazzamenti nelle classifiche finali (solo righe con la sigla) */
function piazz(t){const C=ALBO.CLASSIFICHE||{},o=[];for(const k in C){const R=C[k].righe||[];const i=R.findIndex(r=>r.t===t);if(i>=0)o.push({lab:C[k].lab||k,pos:i+1,n:R[i].n})}return o}
window.e16Palmares=t=>({...palm(t),piazz:piazz(t)});

function vCampioni(){const L=desc(ALBO.titoli||[]);if(!L.length)return"";
 return `<section class="st-sec"><h3 class="st-h"><span>Campioni</span><em>titoli della lega</em></h3><div class="st-champs">${L.map((r,i)=>`<div class="st-champ${i===0?" new":""}">
  <div class="st-ctro">${coppa("oro")}</div>
  <div class="st-cinfo"><span class="st-yr">${e(anno(r))}</span><small>stagione ${stag(r.a)}</small>${lg(r.t,"big")}<b>${nomeA(r.t,r.a)}</b><em>Campioni ESPN 16</em></div></div>`).join("")}</div></section>`}

function vConf(){const L=ALBO.conf||[];if(!L.length)return"";const Y=[...new Set(L.map(r=>r.a))].sort((a,b)=>b-a);
 return `<section class="st-sec"><h3 class="st-h"><span>Campioni di conference</span><em>Est e Ovest</em></h3><div class="st-confs">${Y.map(y=>{
  const R=L.filter(r=>r.a===y).sort((a,b)=>(TM[a.t]&&TM[a.t].conf==="E"?0:1)-(TM[b.t]&&TM[b.t].conf==="E"?0:1)),nt=R.find(r=>r.nota);
  return `<div class="st-cy"><div class="st-cyh"><b>${y}${nt?e(nt.nota):""}</b><small>${stag(y)}</small></div><div class="st-cyl">${R.map(r=>`<div class="st-cw"><span class="st-ctag ${TM[r.t]&&TM[r.t].conf==="E"?"e":"w"}">${confLab(r.t)}</span><span class="st-mini">${coppa("arg")}</span>${lg(r.t)}<b>${nomeA(r.t,r.a)}</b></div>`).join("")}</div></div>`}).join("")}</div></section>`}

function vRecord(){const L=desc(ALBO.record||[]);if(!L.length)return"";
 return `<section class="st-sec"><h3 class="st-h"><span>Miglior record</span><em>stagione regolare</em></h3><div class="st-plqs">${L.map(r=>`<div class="st-plq"><div class="st-plate"><i>★</i><small>Miglior record</small><span class="st-pyr">${e(anno(r))}</span>${lg(r.t)}<b>${nomeA(r.t,r.a)}</b><em>stagione ${stag(r.a)}</em></div></div>`).join("")}</div></section>`}

function vBacheca(){const tile=t=>{const p=palm(t.id),n=p.ti.length+p.co.length+p.re.length;
  return `<button class="st-tm${ST.sel===t.id?" on":""}${n?"":" none"}" data-sttm="${t.id}" aria-pressed="${ST.sel===t.id}" style="--tc:${TCOL[t.id]||"#333"}">${lg(t.id)}<b>${e(t.nome.split(" ").slice(-1)[0])}</b><span class="st-cnt">${n?`${p.ti.length?`<i class="ti">🏆${p.ti.length}</i>`:""}${p.co.length?`<i class="co">C${p.co.length}</i>`:""}${p.re.length?`<i class="re">★${p.re.length}</i>`:""}`:"<i class='z'>—</i>"}</span></button>`};
 const det=t=>{const p=palm(t),pz=piazz(t),it=[...p.ti.map(r=>({a:r.a,h:`<span class="st-ic ti">🏆</span><b>Campioni</b>`,r})),...p.co.map(r=>({a:r.a,h:`<span class="st-ic co">C</span><b>Campioni conference ${confLab(t)}</b>`,r})),...p.re.map(r=>({a:r.a,h:`<span class="st-ic re">★</span><b>Miglior record</b>`,r}))].sort((x,y)=>y.a-x.a);
  return `<div class="st-det" id="st-det" style="--tc:${TCOL[t]||"#333"}"><div class="st-deth">${lg(t,"big")}<div><b>${e(nome(t))}</b><small>${TM[t].conf==="E"?"Eastern":"Western"} Conference</small></div></div>
  ${it.length?`<ul class="st-hon">${it.map(x=>`<li>${x.h}<span class="st-hy">${e(anno(x.r))}${ex(t,x.a)?` <small>come ${e(ex(t,x.a))}</small>`:""}</span></li>`).join("")}</ul>`:`<p class="st-none">Ancora nessun trofeo</p>`}
  ${pz.length?`<div class="st-pz"><small>Classifiche finali</small>${pz.map(x=>`<span><b>${e(x.lab)}:</b> ${x.pos}° posto${x.n&&x.n!==nome(t)?` <em>(${e(x.n)})</em>`:""}</span>`).join("")}</div>`:""}</div>`};
 return `<section class="st-sec"><h3 class="st-h"><span>Bacheca per squadra</span><em>tocca una squadra</em></h3>
 <div class="st-leg"><span><i class="ti">🏆</i> titoli</span><span><i class="co">C</i> conference</span><span><i class="re">★</i> miglior record</span></div>
 <div class="st-grid">${TEAMS.map(tile).join("")}</div>${ST.sel&&TM[ST.sel]?det(ST.sel):""}</section>`}

function vClass(){const C=ALBO.CLASSIFICHE||{},K=Object.keys(C).filter(k=>(C[k].righe||[]).length);if(!K.length)return"";/* vuote: sezione nascosta */
 const ks=K.slice().reverse(),sel=ks.includes(ST.cl)?ST.cl:ks[0],R=C[sel].righe;
 return `<section class="st-sec"><h3 class="st-h"><span>Classifiche finali</span><em>dalla 1ª alla ${R.length}ª</em></h3>
 <div class="st-tabs">${ks.map(k=>`<button data-stcl="${k}" aria-pressed="${k===sel}">${e(C[k].lab||k)}</button>`).join("")}</div>
 <ol class="st-tab">${R.map((r,i)=>`<li class="${i<3?"p"+(i+1):""}"><span class="st-pos">${i+1}</span>${r.t&&TM[r.t]?lg(r.t):lgN(r.n)}<b>${e(r.n)}</b></li>`).join("")}</ol></section>`}

function vTrofei(){NID=0;const n=(ALBO.titoli||[]).length;
 return `<div class="st-room"><button class="gback" data-go="home">‹ Home</button>
 <div class="st-hero"><span class="st-spot l"></span><span class="st-spot r"></span><div class="st-htro">${coppa("oro")}</div><div class="st-ht"><small>ESPN 16 · FantaBasket USA</small><b>Sala Trofei</b><em>Albo d'oro · ${n} ${n===1?"titolo":"titoli"} assegnati</em></div></div>
 ${vCampioni()}${vConf()}${vRecord()}${vBacheca()}${vClass()}
 <p class="note">Nello stadio 3D (tasto viola «D» nel Campo di ogni squadra), in cima alle scale, la sala trofei mostra le stesse coppe e targhe.</p></div>`}
window.SCAMBIV=window.SCAMBIV||{};SCAMBIV.trofei=vTrofei;
(window.NAVX=window.NAVX||[]).push({k:"st",get:()=>({sel:ST.sel,cl:ST.cl}),set:o=>{ST.sel=o&&o.sel||"";ST.cl=o&&o.cl||""}});
const keep=()=>{const y=scrollY;render();scrollTo(0,y)};
document.addEventListener("click",ev=>{if(typeof cur==="undefined"||cur!=="trofei")return;const b=ev.target.closest("[data-sttm],[data-stcl]");if(!b)return;ev.preventDefault();
 if(b.dataset.stcl){ST.cl=b.dataset.stcl;keep();return}
 const t=b.dataset.sttm;ST.sel=ST.sel===t?"":t;keep();
 if(ST.sel){const d=document.getElementById("st-det");if(d)try{d.scrollIntoView({block:"nearest",behavior:"smooth"})}catch(_){}}});
})();
