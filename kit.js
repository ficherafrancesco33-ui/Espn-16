/* ===== ESPN 16 – (57) MAGLIE: il tasto maglia di Dreamers per tutte le 16 squadre =====
   Portato da Dreamers (index.html: KIT_N, NBA_KIT, NBA_KIT_90, NBA_BIANCA, NBA_NOME, nbaDeco, kitDi/kitLista/kitNome/kitIco/kitBtn, jersey()).
   Ogni squadra: 0 Casa (la maglia di sempre di campo.js, colori COL), 1 Notte (base scura), 2 Alternativa (base bianca con dettagli nel colore
   della squadra; se la casa è già bianca, base nel colore della squadra), 3 NBA 2026 e 4 Anni 90 (ogni giocatore veste la maglia della SUA squadra NBA,
   colonna 2 di ROSE, con il nome della squadra NBA sul petto). Senza scelta: Casa di giorno, Notte in modalità notte (E16N), come Dreamers.
   La scelta vale per quella squadra sola, in tutte le sezioni, ed è ricordata sul telefono (localStorage "e16_kit").
   Quebec Ducks: le loro maglie restano quelle disegnate (CAMPO_ART jersey0 giorno / jersey1 notte) + le rosse di que-kit.js (QUE_ROSSE) + NBA 2026 e Anni 90.
   Maglia dei free agent (COL.FA bianca «FREE AGENT»): invariata, senza tasto. */
(function(){
const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const KIT_N=["Casa","Notte","Alternativa","NBA 2026","Anni 90"];
let KIT={};try{KIT=JSON.parse(localStorage.getItem("e16_kit")||"{}")||{}}catch(_){KIT={}}
function kitSalva(){try{localStorage.setItem("e16_kit",JSON.stringify(KIT))}catch(_){}}
const notte=()=>typeof E16N!=="undefined"&&!!E16N;
const COLB=t=>{const C=window.E16COL||{};return C[t]||C.FAL||{bg:"#0b1022",fg:"#ffffff",trim:"#f97316"}};
/* (57) le 2 maglie in più di ogni squadra, disegnate sui colori COL: [Notte, Alternativa]. hem = fascia in basso (sulla Casa è il colore dei bordi) */
const KIT_SQ={
 DET:[{bg:"#0e1630",fg:"#ffffff",trim:"#dc2626",jstroke:"#000000",outer:"#1d3fa0",hem:"#1d3fa0"},{bg:"#f7f7f5",fg:"#1d3fa0",trim:"#dc2626",jstroke:"#dc2626",jsw:2.4,hem:"#1d3fa0"}],
 CLE:[{bg:"#1a1a1a",fg:"#f5f5f4",trim:"#7f1d1d",jstroke:"#000000",outer:"#7f1d1d",hem:"#7f1d1d"},{bg:"#f4f4f2",fg:"#111827",trim:"#9ca3af",jstroke:"#ffffff",hem:"#111827"}],
 BOS:[{bg:"#121512",fg:"#ffffff",trim:"#ca8a04",jstroke:"#000000",outer:"#166534",hem:"#166534"},{bg:"#f7f7f5",fg:"#166534",trim:"#ca8a04",jstroke:"#ffffff",hem:"#166534"}],
 NYS:[{bg:"#151515",fg:"#ffffff",trim:"#c2410c",jstroke:"#000000",outer:"#c2410c",hem:"#1e3a8a"},{bg:"#f7f7f5",fg:"#c2410c",trim:"#1e3a8a",jstroke:"#1e3a8a",jsw:2.4,hem:"#c2410c"}],
 CHA:[{bg:"#141414",fg:"#ffffff",trim:"#f59e0b",jstroke:"#000000",outer:"#f59e0b",hem:"#f59e0b"},{bg:"#f7f7f5",fg:"#0f172a",trim:"#f59e0b",jstroke:"#f59e0b",jsw:2.4,hem:"#0f172a"}],
 /* pandas: casa già bianca, l alternativa è blu (colore della squadra) */
 NYP:[{bg:"#121212",fg:"#ffffff",trim:"#2a62c4",jstroke:"#000000",outer:"#2a62c4",hem:"#2a62c4"},{bg:"#2a62c4",fg:"#ffffff",trim:"#111111",jstroke:"#111111",hem:"#111111"}],
 CAN:[{bg:"#151515",fg:"#fde68a",trim:"#0f766e",jstroke:"#000000",outer:"#0f766e",hem:"#7c2d12"},{bg:"#f7f7f5",fg:"#0f766e",trim:"#7c2d12",jstroke:"#ffffff",hem:"#0f766e"}],
 HOU:[{bg:"#151515",fg:"#ea580c",trim:"#ea580c",jstroke:"#000000",hem:"#ea580c"},{bg:"#f7f7f5",fg:"#ea580c",trim:"#111111",jstroke:"#111111",jsw:2.4,hem:"#111111"}],
 LVA:[{bg:"#111214",fg:"#fbbf24",trim:"#1e3a8a",jstroke:"#000000",outer:"#1e3a8a",hem:"#fbbf24"},{bg:"#f7f7f5",fg:"#1e3a8a",trim:"#fbbf24",jstroke:"#fbbf24",jsw:2.4,hem:"#1e3a8a"}],
 HON:[{bg:"#151515",fg:"#ffffff",trim:"#fb923c",jstroke:"#000000",outer:"#0e7490",hem:"#0e7490"},{bg:"#f7f7f5",fg:"#0e7490",trim:"#fb923c",jstroke:"#ffffff",hem:"#fb923c"}],
 ALB:[{bg:"#141414",fg:"#38bdf8",trim:"#7f1d1d",jstroke:"#000000",hem:"#38bdf8"},{bg:"#f7f7f5",fg:"#38bdf8",trim:"#7f1d1d",jstroke:"#0b1022",jsw:2.6,hem:"#7f1d1d"}],
 ALA:[{bg:"#141414",fg:"#ffffff",trim:"#93c5fd",jstroke:"#000000",outer:"#1d4ed8",hem:"#1d4ed8"},{bg:"#f7f7f5",fg:"#1d4ed8",trim:"#93c5fd",jstroke:"#ffffff",hem:"#1d4ed8"}],
 WIC:[{bg:"#151515",fg:"#ffffff",trim:"#ea580c",jstroke:"#000000",outer:"#ea580c",hem:"#9ca3af"},{bg:"#f7f7f5",fg:"#ea580c",trim:"#9ca3af",jstroke:"#ffffff",hem:"#ea580c"}],
 FAL:[{bg:"#1b1b1b",fg:"#f97316",trim:"#ffffff",jstroke:"#000000",hem:"#f97316"},{bg:"#f7f7f5",fg:"#0b1022",trim:"#f97316",jstroke:"#f97316",jsw:2.4,hem:"#0b1022"}],
 SRO:[{bg:"#141414",fg:"#ffffff",trim:"#b91c1c",jstroke:"#000000",outer:"#b91c1c",hem:"#b91c1c"},{bg:"#f7f7f5",fg:"#0f172a",trim:"#b91c1c",jstroke:"#ffffff",hem:"#b91c1c"}]};
function kitC(t,k){const T=COLB(t);if((k===1||k===2)&&KIT_SQ[t])return{...T,...KIT_SQ[t][k-1]};return T}
/* 4ª maglia "NBA 2026" e 5ª "Anni 90": tabelle copiate da Dreamers (solo colori e disegni generici, niente loghi) */
const NBA_KIT={
 ATL:{bg:"#d0202e",fg:"#ffffff",jstroke:"#8a0f19",trim:"#fdb927",p2:"#fdb927"},
 BKN:{bg:"#111111",fg:"#ffffff",jstroke:"#111111",trim:"#ffffff",p2:"#777d84"},
 BOS:{bg:"#0a6c33",fg:"#ffffff",jstroke:"#05401c",trim:"#ffffff",p2:"#ffffff",d:"plain"},
 CHA:{bg:"#11a5b2",fg:"#ffffff",jstroke:"#0b5f6b",trim:"#ffffff",p2:"#1d1160",d:"plain"},
 CHI:{bg:"#d4101d",fg:"#ffffff",jstroke:"#111111",trim:"#ffffff",p2:"#111111",d:"plain"},
 CLE:{bg:"#6f1d36",fg:"#fdbb30",jstroke:"#2a0a14",trim:"#fdbb30",p2:"#2a0a14",d:"plain"},
 DAL:{bg:"#0a6bd0",fg:"#c9cccb",jstroke:"#ffffff",nf:"#ffffff",ns:"#052e5c",trim:"#052e5c",p2:"#ffffff",d:"dal"},
 DEN:{bg:"#0f2550",fg:"#ffffff",jstroke:"#8b2131",jsw:2,nf:"#f2bd2c",ns:"#0a1a3a",trim:"#f2f2f0",tline:"#8b2131",tlw:1.3,p2:"#8b2131",d:"none"},
 DET:{bg:"#1d42ba",fg:"#d4212e",jstroke:"#ffffff",nf:"#ffffff",ns:"#0c2a7a",trim:"#d4212e",p2:"#ffffff"},
 GSW:{bg:"#1d55b8",fg:"#ffc72c",jstroke:"#12357a",trim:"#ffc72c",p2:"#ffffff",d:"plain"},
 HOU:{bg:"#d02a1c",fg:"#ffffff",jstroke:"#7d1108",trim:"#edc630",p2:"#edc630",d:"pind"},
 IND:{bg:"#002d62",fg:"#fdbb30",jstroke:"#001a3a",trim:"#fdbb30",p2:"#fdbb30",d:"plain"},
 LAC:{bg:"#0f1f4b",fg:"#ffffff",jstroke:"#c8102e",ns:"#06102a",trim:"#c8102e",p2:"#ffffff",d:"plain"},
 LAL:{bg:"#fdb927",fg:"#552583",jstroke:"#ffffff",trim:"#552583",p2:"#ffffff",d:"plain"},
 MEM:{bg:"#12173f",fg:"#8db1e6",jstroke:"#ffffff",nf:"#ffffff",ns:"#12173f",trim:"#8db1e6",p2:"#ffffff",d:"plain"},
 MIA:{bg:"#141414",fg:"#ffffff",jstroke:"#98002e",ns:"#000000",trim:"#98002e",p2:"#98002e"},
 MIL:{bg:"#21472c",fg:"#ffffff",jstroke:"#12291a",trim:"#e0dccb",p2:"#e0dccb",d:"mil"},
 MIN:{bg:"#1450d8",fg:"#ffffff",jstroke:"#0c2340",nf:"#78be20",trim:"#78be20",p2:"#9ea2a2",d:"plain"},
 NOP:{bg:"#0c2340",fg:"#ffffff",jstroke:"#0c2340",trim:"#b4975a",p2:"#c8102e"},
 NYK:{bg:"#1d63c4",fg:"#f58426",jstroke:"#ffffff",nf:"#ffffff",ns:"#0e3a7a",trim:"#f58426",p2:"#ffffff",d:"plain"},
 OKC:{bg:"#007ac1",fg:"#ffffff",jstroke:"#002d62",trim:"#ef3b24",p2:"#ef3b24",d:"plain"},
 ORL:{bg:"#0f60c8",fg:"#ffffff",jstroke:"#0a2d6b",trim:"#ffffff",p2:"#ffffff",d:"pin"},
 PHI:{bg:"#1268d0",fg:"#ffffff",jstroke:"#ed174c",ns:"#0a3a80",trim:"#ffffff",p2:"#ed174c",d:"plain"},
 PHX:{bg:"#4b2a8f",fg:"#f26b1f",jstroke:"#ffffff",nf:"#ffffff",ns:"#2b1660",trim:"#f26b1f",p2:"#f9ad1b",d:"sun"},
 POR:{bg:"#141414",fg:"#e03a3e",jstroke:"#ffffff",nf:"#ffffff",ns:"#111111",trim:"#ffffff",p2:"#e03a3e",d:"por"},
 SAC:{bg:"#5a2d81",fg:"#ffffff",jstroke:"#2b1a3d",trim:"#c4ced4",p2:"#2b1a3d"},
 SAS:{bg:"#111111",fg:"#ffffff",jstroke:"#111111",trim:"#c4ced4",p2:"#ffffff",d:"plain"},
 TOR:{bg:"#d01f3c",fg:"#ffffff",jstroke:"#111111",trim:"#111111",p2:"#111111",d:"tor"},
 UTA:{bg:"#5b3aa8",fg:"#ffffff",jstroke:"#2c1766",trim:"#ffffff",p2:"#c7b9f2",d:"uta"},
 WAS:{bg:"#002b5c",fg:"#002b5c",jstroke:"#ffffff",nf:"#ffffff",ns:"#001634",trim:"#ffffff",p2:"#e31837",d:"was"}
};
/* 5ª maglia "Anni 90": maglie storiche; le squadre non ancora fatte vestono la maglia bianca NBA_BIANCA */
const NBA_KIT_90={
 CLE:{bg:"#b02a2c",fg:"#ffffff",jstroke:"#d4b066",jsw:2.4,trim:"#1f2a5c",tstr:[["#d4b066",3]],p2:"#d4b066",d:"cle"},
 CHI:{bg:"#141414",fg:"#ce1126",jstroke:"#ffffff",jsw:2.6,outer:"#141414",trim:"#ce1126",tstr:[["#ffffff",3],["#141414",1.2]],pc:"#ce1126",ps:7.5,p2:"#ce1126",d:"pins"},
 HOU:{bg:"#1f2540",fg:"#ffffff",jstroke:"#c0282c",jsw:2.4,ns:"#c0282c",trim:"#c0282c",tline:"#ffffff",tlw:2.2,p2:"#ffffff",d:"houc"},
 MIL:{bg:"#1c1d1c",fg:"#eee1c6",jstroke:"#2e6b3f",nf:"#eee1c6",ns:"#141414",trim:"#1c1d1c",tline:"#e8d9a8",tlw:1.4,p2:"#e8d9a8",d:"milb"},
 TOR:{bg:"#52297a",fg:"#ffffff",jstroke:"#141414",nf:"#b0aeb2",ns:"#141414",trim:"#141414",tline:"#c8323a",p2:"#a9a6a8",d:"torc"},
 DEN:{bg:"#1c3f98",fg:"#ffffff",jstroke:"#f2c230",ns:"#f2c230",outer:"#0b2a6c",trim:"#f2c230",p2:"#f2c230",d:"den"},
 MIN:{bg:"#14191d",fg:"#ffffff",jstroke:"#8fb0d8",outer:"#1d2f56",trim:"#14191d",tline:"#2f9a5c",tlw:4.2,tld:"2.2 1.3",p2:"#2f9a5c",d:"none"},
 ATL:{ws:1.07,bg:"#f5bd22",fg:"#161616",jstroke:"#cd1d24",jsw:2.2,trim:"#161616",tline:"#cd1d24",tlw:2.4,p2:"#cd1d24",d:"none"},
 SAS:{bg:"#4bb7a6",fg:"#ffffff",jstroke:"#141414",trim:"#141414",arm:["#f39a3a","#ee6f8f"],p2:"#ffffff",d:"sas"},
 IND:{bg:"#ffd914",fg:"#1b2440",jstroke:"#ffffff",jsw:2.6,trim:"#1b2440",pc:"#1b2440",ps:5.6,p2:"#1b2440",d:"pins"},
 DET:{bg:"#1279a3",fg:"#ffffff",jstroke:"#141414",trim:"#141414",tline:"#e6a422",tlw:1.6,tline2:"#b52a1c",p2:"#e6a422",d:"det"},
/* aggiunte 27/10/2026 (ricalcate sulle foto dell utente) */
 NYK:{bg:"#2748c9",fg:"#f2661c",jstroke:"#ffffff",jsw:2.4,nf:"#f2661c",ns:"#ffffff",trim:"#141414",tstr:[["#f2661c",2.6]],p2:"#f2661c",d:"default"},
 LAL:{bg:"#4b2a8c",fg:"#ffffff",jstroke:"#fdb927",jsw:2.8,nf:"#fdb927",ns:"#ffffff",trim:"#fdb927",tstr:[["#ffffff",2.2],["#fdb927",1]],d:"none"},
 BOS:{bg:"#1c9640",fg:"#ffffff",jstroke:"#1c9640",jsw:1,trim:"#ffffff",tstr:[["#1c9640",1.8]],d:"none"},
 CHA:{bg:"#2a9d98",fg:"#ffffff",jstroke:"#2b1a6b",jsw:2.6,trim:"#2b1a6b",tstr:[["#ffffff",3],["#2b1a6b",1.2]],d:"cha"},
 LAC:{bg:"#cc2229",fg:"#ffffff",jstroke:"#1d4fc0",jsw:2.8,trim:"#1d4fc0",p2:"#1d4fc0",d:"default"},
 OKC:{bg:"#4a90d9",fg:"#ffffff",jstroke:"#12234f",jsw:2.4,trim:"#12234f",tstr:[["#f4801f",2.6],["#f7c500",1.1]],p2:"#4a90d9",d:"default"},
 WAS:{bg:"#cdb069",fg:"#ffffff",jstroke:"#141414",jsw:2.6,nf:"#ffffff",ns:"#cdb069",trim:"#ffffff",tstr:[["#141414",1.2]],d:"wasg"},
 DAL:{bg:"#2c9a52",fg:"#ffffff",jstroke:"#2d3fd6",jsw:2.6,trim:"#2d3fd6",tstr:[["#ffffff",2.2]],d:"none"},
 ORL:{bg:"#0d0d12",fg:"#2b53c8",jstroke:"#ffffff",jsw:2.8,nf:"#2b53c8",ns:"#ffffff",trim:"#2b53c8",tstr:[["#ffffff",2.2]],pc:"#ffffff",ps:5.6,d:"pins"},
 GSW:{bg:"#13254f",fg:"#fbc531",jstroke:"#e98a52",jsw:2,trim:"#e8571f",tstr:[["#fbc531",1.1]],p2:"#fbc531",d:"default"},
 NOP:{bg:"#2a2250",fg:"#ffffff",jstroke:"#2a2250",jsw:2.6,trim:"#6a3fa0",tstr:[["#2d8a3e",3.4],["#f2b61c",1.6]],d:"nop"},
 BKN:{bg:"#14224d",fg:"#ffffff",jstroke:"#c8203a",jsw:2.8,trim:"#c8203a",tstr:[["#c8ccd4",2.2]],d:"bkn"},
 UTA:{bg:"#4b2a85",fg:"#ffffff",jstroke:"#2aa7b8",jsw:2.8,nf:"#5b2d91",ns:"#2aa7b8",trim:"#4b2a85",tstr:[["#2aa7b8",2.8],["#ffffff",1.2]],d:"utm"},
 MEM:{bg:"#62c5bb",fg:"#ffffff",jstroke:"#141414",jsw:2.8,nf:"#ffffff",ns:"#141414",trim:"#141414",tline:"#f0e6d2",tlw:1.6,tld:"2 2",d:"none"},
 POR:{bg:"#111114",fg:"#ffffff",jstroke:"#c8102e",jsw:2.4,nf:"#ffffff",ns:"#c8102e",trim:"#d6202e",d:"por90"},
 PHI:{bg:"#0d0d0d",fg:"#ffffff",jstroke:"#c8102e",jsw:2.6,nf:"#ffffff",ns:"#c8102e",trim:"#c8102e",tstr:[["#141414",1.4],["#c9a24b",.8]],d:"none"},
 PHX:{bg:"#43278a",fg:"#ffffff",jstroke:"#2b1760",jsw:2,trim:"#f26b1f",tstr:[["#141414",1.1]],d:"phx"},
 MIA:{bg:"#d11f2e",fg:"#ffffff",jstroke:"#141414",jsw:3.4,nf:"#141414",ns:"#ffffff",trim:"#141414",tstr:[["#ffffff",2.4]],p2:"#ffffff",d:"default"},
 SAC:{bg:"#141418",fg:"#ffffff",jstroke:"#6a3fb5",jsw:2.8,trim:"#5b2d91",tstr:[["#ffffff",2.2]],d:"none"}
};
const NBA_KIT_90_ALT={CHA:{bg:"#6b3fa0",fg:"#f3efdc",jstroke:"#2f9d97",jsw:2.6,trim:"#2b3fc7",tstr:[["#ffffff",2.4],["#141414",.9]],d:"none"}};
const NBA_NOME={ATL:"HAWKS",BOS:"CELTICS",BKN:"NETS",CHA:"HORNETS",CHI:"BULLS",CLE:"CAVALIERS",DAL:"MAVERICKS",DEN:"NUGGETS",DET:"PISTONS",GSW:"WARRIORS",HOU:"ROCKETS",IND:"PACERS",LAC:"CLIPPERS",LAL:"LAKERS",MEM:"GRIZZLIES",MIA:"HEAT",MIL:"BUCKS",MIN:"WOLVES",NOP:"PELICANS",NYK:"KNICKS",OKC:"THUNDER",ORL:"MAGIC",PHI:"76ERS",PHX:"SUNS",POR:"BLAZERS",SAC:"KINGS",SAS:"SPURS",TOR:"RAPTORS",UTA:"JAZZ",WAS:"WIZARDS"};
const NBA_BIANCA={bg:"#f4f4f2",fg:"#141414",jstroke:"#ffffff",trim:"#d6d6d2",p2:"#d6d6d2",d:"none"};
/* motivi delle maglie NBA (solo colori e disegni generici, niente loghi), disegnati dentro la canotta */
function nbaDeco(c){const sd=`<path d="M0 44 L14 48 L17 146 L0 146Z M120 44 L106 48 L103 146 L120 146Z" fill="${c.trim}"/><path d="M14 48 L17 146 M106 48 L103 146" stroke="${c.p2||c.fg}" stroke-width="2.2" fill="none"/>`;
  switch(c.d){
   case"plain":return`<path d="M7 50 L9 146 M113 50 L111 146" stroke="${c.trim}" stroke-width="3" fill="none"/>`;
   case"mil":return`<path d="M9 50 L11 146 M111 50 L109 146" stroke="${c.p2}" stroke-width="2.2" fill="none"/><path d="M0 84H24V90H0Z M0 96H24V102H0Z M120 84H96V90H120Z M120 96H96V102H120Z" fill="${c.p2}"/>`;
   case"dal":return`<path d="M22 12 C23 34 16 46 6 50 M98 12 C97 34 104 46 114 50" fill="none" stroke="${c.trim}" stroke-width="13" stroke-linecap="round"/>`;
   case"den":{const C=["#c43333","#e06a3a","#e9ba38","#02603c","#1d2b5a","#201634"];return C.map((x,i)=>`<rect y="${100+i*4.4}" width="120" height="4.5" fill="${x}"/>`).join("")}
   case"torc":return[[23,"#141414"],[41,c.p2],[59,"#141414"],[77,c.p2],[96,"#141414"]].map(([x,col])=>{let d=`M${x} 18`;for(let y=18;y<146;y+=16)d+=`L${x} ${y+11}L${x+1.4} ${y+12.5}L${x-0.8} ${y+14}L${x} ${y+16}`;return`<path d="${d}" stroke="${col}" stroke-width="2" fill="none" stroke-linejoin="bevel"/>`}).join("");
   case"none":return"";
   case"nop":return`<rect y="36" width="120" height="22" fill="#6a3fa0"/><rect y="58" width="120" height="22" fill="#2d8a3e"/><rect y="80" width="120" height="17" fill="#e8a820"/>`;
   case"bkn":{let d="";for(let y=56;y<140;y+=12)d+=`M3 ${y}L9 ${y+6}L3 ${y+12}M117 ${y}L111 ${y+6}L117 ${y+12}`;return`<path d="M12 50V146M108 50V146" stroke="#c8ccd4" stroke-width="3.2"/><path d="M9.4 50V146M110.6 50V146" stroke="#c8203a" stroke-width="1.4"/><path d="${d}" stroke="#c8ccd4" stroke-width="1" fill="none"/>`}
   case"utm":return`<defs><linearGradient id="utg" x1="0" y1="0" x2="0" y2="1"><stop offset=".3" stop-color="#ffffff"/><stop offset=".62" stop-color="#7a4fb0"/><stop offset="1" stop-color="#4b2a85"/></linearGradient></defs><path d="M0 62 L14 56 L26 40 L40 52 L54 30 L68 46 L82 36 L96 48 L120 40 L120 146 L0 146Z" fill="url(#utg)"/><path d="M26 40 L30 47 L36 46 L40 52 L34 50Z M54 30 L60 40 L66 38 L68 46 L58 40Z M82 36 L88 44 L92 42 L96 48 L86 43Z" fill="#7cc4ef"/>`;
   case"por90":return`<path d="M0 84 L120 120 L120 134 L0 98Z" fill="#d6202e"/><path d="M0 98 L120 134 L120 150 L0 112Z" fill="#ffffff"/>`;
   case"phx":{let d="";for(let i=0;i<6;i++){const y=66+i*5.5;d+=`M0 ${y+14} L96 ${y-10} L96 ${y-6} L0 ${y+17}Z `}return`<path d="${d}" fill="#e8481c" fill-opacity=".9"/><path d="M96 20 L120 36 L112 62 L120 92 L98 80 L84 100 L80 70 L70 48 L88 50Z" fill="#f5a623"/><circle cx="100" cy="50" r="15" fill="#d9381e"/><path d="M88 46 Q100 40 110 52 M92 58 Q102 50 112 56" stroke="#141414" stroke-width="2" fill="none"/>`}
   case"cha":return[[28,"#69b7e8",2.6],[44,"#4a2a85",2.6],[60,"#38a34a",2.6],[76,"#4a2a85",2.6],[92,"#69b7e8",2.6]].map(([x,col,w])=>`<path d="M${x} 20V146" stroke="${col}" stroke-width="${w}"/>`).join("");
   case"wasg":return`<rect width="120" height="40" fill="#ffffff"/><path d="M22 0H44V34H22Z M76 0H98V34H76Z" fill="#141414"/><rect y="70" width="120" height="40" fill="#141414"/>`;
   case"default":return sd;
   case"sas":{const sp=(x0,x1,o)=>{let z="",t="";for(let y=46,i=0;y<146;y+=11,i++){const a=i%2?x1:x0,b=i%2?x0:x1;z+=(i?"L":"M")+a+" "+y;t+=`<path d="M${(x0+x1)/2-2.6} ${y+7.5}h5.2l-2.6 -4.6z" fill="#f39a3a"/>`}return`<path d="M${Math.min(x0,x1)-1} 40H${Math.max(x0,x1)+1}V146H${Math.min(x0,x1)-1}Z" fill="#141414"/><path d="${z}" stroke="#ffffff" stroke-width="1.6" fill="none"/>${t}<path d="M${o} 40V146" stroke="#ffffff" stroke-width="1.6"/>`};return sp(5,19,20.6)+sp(115,101,99.4)}
   case"houc":{let w="",b="";[8,21,34,47,73,86,99,112].forEach((x,i)=>{w+=`M${x} ${62+(i%3)*6}V146`;b+=`M${x} ${20+(i%2)*8}V${52+(i%3)*6}`});return`<path d="${b}" stroke="#6ec6e8" stroke-width="1.6" stroke-opacity=".75" stroke-dasharray="7 4"/><path d="${w}" stroke="#ffffff" stroke-width="1.3" stroke-opacity=".9"/>`}
   case"pins":{let d="";for(let x=c.ps/2;x<120;x+=c.ps)d+=`M${x.toFixed(1)} 0V146`;return`<path d="${d}" stroke="${c.pc}" stroke-width=".85"/>`}
   case"det":return`<path d="M0 40H15V146H0Z M120 40H105V146H120Z" fill="#141414"/><path d="M15.8 44V146 M104.2 44V146" stroke="#e6a422" stroke-width="1.3"/><path d="M17.3 44V146 M102.7 44V146" stroke="#b52a1c" stroke-width="1.1"/>`;
   case"milb":return[[63,3,"#3a66d6"],[67.8,3.8,"#2e6b3f"],[71.6,4.1,"#f0f0ea"],[75.7,4.1,"#e8d9a8"],[79.8,5.4,"#2e6b3f"]].map(([y,h,col])=>`<rect y="${y}" width="120" height="${h}" fill="${col}"/>`).join("");
   case"cle":return`<path d="M0 40H13V146H0Z M120 40H107V146H120Z" fill="#d4b066"/><path d="M15.8 44V146 M19.6 44V146 M104.2 44V146 M100.4 44V146" stroke="#ffffff" stroke-width="1.5"/>`;
   case"pind":{let d="";for(let x=5;x<120;x+=8)d+=`M${x} 0V146`;return`<path d="${d}" stroke="#000" stroke-opacity=".13" stroke-width="1.4"/><path d="M7 50 L9 146 M113 50 L111 146" stroke="${c.trim}" stroke-width="2" fill="none"/>`}
   case"pin":{let d="";for(let x=4;x<120;x+=7)d+=`M${x} 0V146`;return`<path d="${d}" stroke="#ffffff" stroke-opacity=".38" stroke-width="1.1"/>`}
   case"was":return`<rect y="64" width="120" height="40" fill="#ffffff"/><rect y="104" width="120" height="42" fill="#e31837"/><path d="M0 69H120M0 99H120" stroke="#e31837" stroke-width="2.4"/>`;
   case"tor":return`<path d="M0 96 L120 64 L120 146 L0 146Z" fill="#141414"/><path d="M0 96 L120 64" stroke="#ffffff" stroke-opacity=".8" stroke-width="1.6"/>`;
   case"uta":return`<rect width="120" height="70" fill="#8b6ad6" opacity=".45"/><path d="M0 120 L20 104 L32 112 L52 88 L66 100 L80 90 L98 108 L120 96 L120 146 L0 146Z" fill="#ffffff"/><path d="M0 128 L20 114 L32 121 L52 100 L66 111 L80 102 L98 118 L120 107 L120 146 L0 146Z" fill="${c.p2}"/>`;
   case"sun":{let d="";for(let i=0;i<5;i++){const y=74+i*9;d+=`M14 ${y+10} Q60 ${y-2} 120 ${y}`}return`${sd}<path d="${d}" stroke="${c.trim}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`}
   case"por":return`<path d="M0 66 L80 146 L62 146 L0 84Z" fill="#e03a3e"/><path d="M0 88 L58 146 L48 146 L0 98Z" fill="#ffffff"/><path d="M0 104 L42 146 L30 146 L0 116Z" fill="#e03a3e"/>`;
   default:return sd}}
/* sigle ESPN della squadra NBA (ROSE: colonna 2) → chiavi NBA_KIT */
const E16_NBA={GS:"GSW",NY:"NYK",SA:"SAS",NO:"NOP",UTAH:"UTA",WSH:"WAS",PHO:"PHX"};
const nbaKey=a=>{a=String(a||"").toUpperCase();return E16_NBA[a]||a};
function nbaDi(t,pl){if(!pl)return null;const R=typeof ROSE!=="undefined"&&ROSE[t]||[],K=typeof __ownKey==="function"?__ownKey:x=>x;const r=R.find(x=>x[0]===pl)||R.find(x=>K(x[0])===K(pl));return r?nbaKey(r[1]):null}
/* Quebec Ducks: elenco delle loro maglie (modelli SVG con __NUM__ e, nelle nuove, __K__). Codici: 0 Casa, 1 Notte, poi 10, 11, ... (indice+8) per quelle in più.
   Per aggiungerne una (es. la terza disegnata con l utente) basta un {nome,svg,ico} in fondo a QUE_KITS. */
/* colore del bordo dell icona del tasto, dal nome della maglia */
const queTrim=nm=>/^rossa/i.test(nm)?(/viola/i.test(nm)?"#6d28d9":"#ffffff"):/^viola/i.test(nm)?(/rosse/i.test(nm)?"#e11d2e":"#111111"):/viola fuori/i.test(nm)?"#8b3dff":/rosso/i.test(nm)?"#e11d2e":"#ffffff";
/* (61) tolta la vecchia Casa viola col gessato nero (CAMPO_ART.jersey0): la Casa ora è la «Viola · lettere nere» col gessato bianco (tolta dalle maglie in più) */
const QUE_CASA=(window.QUE_ROSSE||[]).find(x=>x.nome==="Viola · lettere nere");
const QUE_KITS=[{nome:"Casa",svg:()=>QUE_CASA?QUE_CASA.svg:CAMPO_ART.jersey0,ico:{bg:"#7c3aed",fg:"#ffffff",trim:"#111111"}},{nome:"Notte",svg:()=>CAMPO_ART.jersey1,ico:{bg:"#f8fafc",fg:"#6d28d9",trim:"#111111"}}]
 .concat((window.QUE_ROSSE||[]).filter(x=>x!==QUE_CASA).map(x=>({nome:x.nome,svg:()=>x.svg,ico:{bg:((x.svg.match(/stop-color="(#[0-9a-fA-F]{6})"/)||[])[1])||"#6d28d9",fg:"#ffffff",trim:queTrim(x.nome)}})));
window.QUE_KITS=QUE_KITS;
const queCod=i=>i<2?i:i+8,queIdx=k=>k<2?k:k>=10?k-8:-1;
const kitLista=t=>t==="FA"?[0]:t==="QUE"?QUE_KITS.map((_,i)=>queCod(i)).concat([3,4]):[0,1,2,3,4];
function kitDi(t){if(t==="FA")return 0;const v=KIT[t];if(v!=null&&kitLista(t).includes(v))return v;return notte()?1:0}
const kitNome=(t,k)=>t==="QUE"&&k!==3&&k!==4?(QUE_KITS[queIdx(k)]||QUE_KITS[0]).nome:KIT_N[k]||KIT_N[0];
/* icona del tastino: piccola maglietta con i colori della divisa scelta (come Dreamers) */
function kitIco(t){const kd0=kitDi(t),c=t==="QUE"?((QUE_KITS[queIdx(kd0)]||QUE_KITS[0]).ico):kitC(t,kd0),n3=kd0===3||kd0===4,n9=kd0===4;return`<svg viewBox="0 0 24 24" aria-hidden="true">${n9?`<defs><pattern id="kit90" width="2.4" height="24" patternUnits="userSpaceOnUse"><rect width="2.4" height="24" fill="#141414"/><rect width=".6" height="24" fill="#ce1126"/></pattern></defs>`:n3?`<defs><linearGradient id="kitnba" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c8102e"/><stop offset=".33" stop-color="#c8102e"/><stop offset=".33" stop-color="#fdb927"/><stop offset=".66" stop-color="#fdb927"/><stop offset=".66" stop-color="#1d428a"/><stop offset="1" stop-color="#1d428a"/></linearGradient></defs>`:""}<path d="M6.6 2.2h3.2c.2 2.6 4.2 2.6 4.4 0h3.2c-.1 3.4 1 5.4 3 6.4v12.6c-5.6 1.1-11.2 1.1-16.8 0V8.6c2-1 3.1-3 3-6.4z" fill="${n9?"url(#kit90)":n3?"url(#kitnba)":c.bg}" stroke="${c.trim||c.fg}" stroke-width="1.6" stroke-linejoin="round"/><text x="12" y="16.6" text-anchor="middle" font-family="Barlow Condensed,Arial Narrow,sans-serif" font-weight="800" font-style="italic" font-size="8.5" fill="${n3?"#ffffff":c.fg}"${n3?' stroke="#111" stroke-width="1.4" paint-order="stroke"':""}>${n9?"90":"23"}</text></svg>`}
/* (60) colore del tasto maglia: quello della squadra (TCOL), schiarito se troppo scuro; Ducks viola acceso */
const kitBtnCol=t=>{let h=t==="QUE"?"#8b5cf6":((typeof TCOL!=="undefined"?TCOL:{})[t]||"#475569");const n=parseInt(h.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255,l=(.299*r+.587*g+.114*b)/255;if(l<.38){const k=Math.min(.45,.38-l+.15),f=x=>Math.round(x+(255-x)*k).toString(16).padStart(2,"0");h="#"+f(r)+f(g)+f(b)}return h};
const kitBtn=t=>t==="FA"?"":`<button class="kitbtn" id="kitbtn" type="button" data-kitt="${t}" aria-label="Cambia maglia: ${e(kitNome(t,kitDi(t)))}" title="Maglia: ${e(kitNome(t,kitDi(t)))}">${kitIco(t)}</button>`;
let JID=0;
/* maglia (stessa sagoma e luci delle maglie Dreamers). t = squadra, num = numero, nick = nome della squadra sul petto, pl = giocatore (serve per NBA 2026 / Anni 90) */
function jersey(t,num,nick,pl){
 let kd=kitDi(t);const n=num==null?"":String(num);
 const nba=(kd===3||kd===4)?nbaDi(t,pl):null,nk=nba?(kd===4?(NBA_KIT_90[nba]||NBA_BIANCA):NBA_KIT[nba]):null;
 if(t==="QUE"&&!nk){const Q=QUE_KITS[queIdx(kd)]||QUE_KITS[notte()?1:0];return Q.svg().replace(/__K__/g,"qk"+(JID++)).replace(/__NUM__/g,n)}
 const c=nk?{...COLB(t),jstroke:undefined,outer:undefined,jsw:undefined,ns:undefined,nf:undefined,...nk}:kitC(t,(kd===3||kd===4)?0:kd),k="e"+(JID++),fs=n.length>1?38:44;
 const lum=h=>{const x=parseInt(h.slice(1),16);return(0.299*(x>>16)+0.587*((x>>8)&255)+0.114*(x&255))/255};
 const ol=c.jstroke||(lum(c.fg)<0.45?"#ffffff":"#0a0f1f");
 const word=(nk&&NBA_NOME[nba])?NBA_NOME[nba]:String(nick||"").toUpperCase();/* su ogni maglia il nome della squadra (NBA se divisa NBA/Anni 90), mai il cognome */
 const L=word.length,wfs=(L<=6?17:L<=9?15:L<=12?13:11)*(c.ws||1),wlen=Math.min(74,Math.round(L*wfs*.62));
 const body="M38 6 C42 27 78 27 82 6 L98 12 C97 34 104 46 114 50 L112 126 Q60 137 8 126 L6 50 C16 46 23 34 22 12 Z";
 const deco=nk?nbaDeco(c):`<rect x="0" y="112" width="120" height="6" fill="${c.hem||c.trim}" opacity=".9"/>`;/* maglie della squadra: fascia in basso, come la Casa di sempre */
 return `<svg viewBox="0 0 120 146" aria-hidden="true"><defs><linearGradient id="${k}s" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".22" stop-color="#000" stop-opacity=".08"/><stop offset=".5" stop-color="#fff" stop-opacity=".18"/><stop offset=".78" stop-color="#000" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient><linearGradient id="${k}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient><linearGradient id="${k}n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient><pattern id="${k}m" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".55" fill="#000" fill-opacity=".16"/></pattern><clipPath id="${k}c"><path d="${body}"/></clipPath><filter id="${k}b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter><filter id="${k}d" x="-20%" y="-10%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter></defs>
 <ellipse cx="60" cy="136" rx="46" ry="5" fill="#000" opacity=".55" filter="url(#${k}d)"/><path d="${body}" fill="${c.bg}"/>
 <g clip-path="url(#${k}c)">${deco}<rect width="120" height="146" fill="url(#${k}m)"/><path d="M30 40 C36 70 34 100 40 132" stroke="#000" stroke-opacity=".25" stroke-width="5" fill="none" filter="url(#${k}b)"/><path d="M90 40 C84 72 88 100 82 132" stroke="#000" stroke-opacity=".2" stroke-width="5" fill="none" filter="url(#${k}b)"/><rect width="120" height="146" fill="url(#${k}s)"/><rect width="120" height="146" fill="url(#${k}v)"/></g>
 <path d="M38 6 C42 27 78 27 82 6" fill="none" stroke="${c.trim}" stroke-width="6" stroke-linecap="round"/><path d="M39 6 C43 25 77 25 81 6" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.2"/><path d="M22 12 C23 34 16 46 6 50 M98 12 C97 34 104 46 114 50" fill="none" stroke="${c.trim}" stroke-width="6" stroke-linecap="round"/><path d="M22 12 C23 34 16 46 6 50 M98 12 C97 34 104 46 114 50" fill="none" stroke="url(#${k}n)" stroke-width="6" stroke-linecap="round"/>
 ${c.arm?`<path d="M22 12 C23 34 16 46 6 50" fill="none" stroke="${c.arm[0]}" stroke-width="6" stroke-linecap="round"/><path d="M98 12 C97 34 104 46 114 50" fill="none" stroke="${c.arm[1]}" stroke-width="6" stroke-linecap="round"/>`:""}
 ${c.tline2?`<path d="M38 6 C42 27 78 27 82 6" transform="translate(0 2.3)" fill="none" stroke="${c.tline2}" stroke-width="1.2"/><path d="M22 12 C23 34 16 46 6 50" transform="translate(2.2 -.6)" fill="none" stroke="${c.tline2}" stroke-width="1.2"/><path d="M98 12 C97 34 104 46 114 50" transform="translate(-2.2 -.6)" fill="none" stroke="${c.tline2}" stroke-width="1.2"/>`:""}
 ${c.tstr?c.tstr.map(([col,w])=>`<path d="M38 6 C42 27 78 27 82 6 M22 12 C23 34 16 46 6 50 M98 12 C97 34 104 46 114 50" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`).join(""):""}
 ${c.tline?`<path d="M38 6 C42 27 78 27 82 6 M22 12 C23 34 16 46 6 50 M98 12 C97 34 104 46 114 50" fill="none" stroke="${c.tline}" stroke-width="${c.tlw||1.8}"${c.tld?` stroke-dasharray="${c.tld}"`:' stroke-linecap="round"'}/>`:""}
 <g font-family="Barlow Condensed,Arial Narrow,sans-serif" font-weight="800" font-style="italic">${c.outer?`<text x="60" y="60" text-anchor="middle" font-style="normal" font-size="${wfs}" letter-spacing=".6" fill="${c.outer}" stroke="${c.outer}" stroke-width="5.6" stroke-linejoin="round" textLength="${wlen}" lengthAdjust="spacingAndGlyphs">${e(word)}</text>`:""}<text x="60" y="60" text-anchor="middle" font-style="normal" font-size="${wfs}" letter-spacing=".6" fill="${c.nf||c.fg}" stroke="${c.ns||ol}" stroke-width="${c.jsw||3.2}" paint-order="stroke" stroke-linejoin="round" textLength="${wlen}" lengthAdjust="spacingAndGlyphs">${e(word)}</text><text x="61.5" y="106.5" font-size="${fs}" text-anchor="middle" fill="#000" fill-opacity=".45" filter="url(#${k}b)">${n}</text>${c.outer?`<text x="60" y="104" font-size="${fs}" text-anchor="middle" fill="${c.outer}" stroke="${c.outer}" stroke-width="6.4" stroke-linejoin="round">${n}</text>`:""}<text x="60" y="104" font-size="${fs}" text-anchor="middle" fill="${c.fg}" stroke="${ol}" stroke-width="${c.jsw?c.jsw*1.1:3.6}" paint-order="stroke" stroke-linejoin="round">${n}</text><text x="60" y="104" font-size="${fs}" text-anchor="middle" fill="url(#${k}n)">${n}</text></g>
 <path d="${body}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="1"/></svg>`}
window.E16KIT={jersey,kitBtn,kitDi,kitLista,kitNome,kitIco,KIT_N,NBA_KIT,NBA_KIT_90,NBA_BIANCA,NBA_NOME,nbaKey,
 set(t,k){KIT[t]=k;kitSalva()},reset(t){delete KIT[t];kitSalva()}};
/* tasto maglia (Campo): ogni tocco passa alla maglia dopo della lista di quella squadra, come Dreamers */
document.addEventListener("click",ev=>{if(typeof cur==="undefined"||cur!=="campo")return;const kb=ev.target.closest("#kitbtn");if(!kb)return;ev.preventDefault();
 const t=kb.dataset.kitt,L=kitLista(t),i=L.indexOf(kitDi(t));KIT[t]=L[(i+1)%L.length];kitSalva();const y=scrollY;render();scrollTo(0,y)});
})();
