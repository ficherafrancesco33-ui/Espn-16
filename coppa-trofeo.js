/* ===== ESPN 16 – TROFEO della McGEE CUP (80) =====
   Disegno vettoriale "nostro" ispirato al trofeo ufficiale: busto dorato del giocatore (fascia in testa, treccine, barba, canotta) che sorride,
   palla sotto il braccio e l altra mano aperta; sotto, la retina del canestro che diventa il corpo della coppa, montagne alla base
   e piedistallo in marmo nero con corona e scritta JAVALE McGEE CUP. window.mcgeeTrofeo(id) restituisce l SVG (id unico per i gradienti). */
(function(){
window.mcgeeTrofeo=function(k){k=k||"mt"+Math.random().toString(36).slice(2,7);
 const G=`url(#${k}g)`,GD=`url(#${k}d)`,GL=`url(#${k}l)`;
 /* retina: rombi tra due profili (largo in alto, stretto al centro, di nuovo largo in basso) */
 const prof=y=>{const t=(y-128)/104;return 56-34*Math.sin(Math.min(1,t)*Math.PI*.62)+ (t>.62?(t-.62)*40:0)};
 let net="";for(let i=0;i<=8;i++){const a=-1+i/4;net+=`<path d="M${(100+a*56).toFixed(1)} 128 Q${(100+a*24).toFixed(1)} 178 ${(100-a*26).toFixed(1)} 232" fill="none" stroke="${G}" stroke-width="2.2"/>`}
 for(let i=0;i<=8;i++){const a=-1+i/4;net+=`<path d="M${(100+a*56).toFixed(1)} 128 Q${(100-a*10).toFixed(1)} 178 ${(100+a*26).toFixed(1)} 232" fill="none" stroke="${GD}" stroke-width="1.6" opacity=".9"/>`}
 let knots="";for(let r=0;r<4;r++){const y=146+r*20,w=prof(y)-6;for(let i=0;i<5;i++){const x=100-w+i*(w*2/4);knots+=`<circle cx="${x.toFixed(1)}" cy="${y}" r="1.8" fill="${G}"/>`}}
 return `<svg viewBox="0 0 200 300" class="mctrofeo" role="img" aria-label="Trofeo JaVale McGee Cup"><defs>
 <linearGradient id="${k}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6c4"/><stop offset=".35" stop-color="#f6c845"/><stop offset=".7" stop-color="#c58a12"/><stop offset="1" stop-color="#7a4d06"/></linearGradient>
 <linearGradient id="${k}d" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8b23a"/><stop offset="1" stop-color="#6b4204"/></linearGradient>
 <radialGradient id="${k}l" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fffbe0"/><stop offset=".45" stop-color="#f3c040"/><stop offset="1" stop-color="#8a5a08"/></radialGradient>
 <linearGradient id="${k}m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2a2e"/><stop offset=".5" stop-color="#0d0d10"/><stop offset="1" stop-color="#1c1c20"/></linearGradient>
 <filter id="${k}s" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter></defs>
 <ellipse cx="100" cy="150" rx="88" ry="120" fill="#f5c542" opacity=".18" filter="url(#${k}s)"/>
 <!-- piedistallo in marmo nero -->
 <ellipse cx="100" cy="292" rx="70" ry="6" fill="#000" opacity=".45"/>
 <path d="M34 246 H166 L170 286 H30 Z" fill="url(#${k}m)" stroke="${G}" stroke-width="2.4"/>
 <path d="M44 252 Q70 262 96 256 T150 270" stroke="#4a4a52" stroke-width=".8" fill="none" opacity=".7"/>
 <rect x="30" y="282" width="140" height="7" rx="2" fill="${G}"/><rect x="38" y="240" width="124" height="8" rx="2" fill="${G}"/>
 <path d="M90 256 L88 247 L94 251 L100 245 L106 251 L112 247 L110 256 Z" fill="${G}"/><circle cx="88" cy="246.5" r="1.3" fill="${G}"/><circle cx="100" cy="244.5" r="1.3" fill="${G}"/><circle cx="112" cy="246.5" r="1.3" fill="${G}"/>
 <text x="100" y="270" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="11.5" font-weight="700" fill="${G}" letter-spacing=".5">JaVALE McGEE</text>
 <line x1="62" y1="275" x2="84" y2="275" stroke="${G}" stroke-width="1"/><line x1="116" y1="275" x2="138" y2="275" stroke="${G}" stroke-width="1"/>
 <text x="100" y="279" text-anchor="middle" font-family="Georgia,serif" font-size="7.5" font-weight="700" fill="${G}" letter-spacing="1">CUP</text>
 <!-- corpo: la retina del canestro -->
 <path d="M44 128 Q72 182 74 232 L126 232 Q128 182 156 128 Z" fill="#2a1a04" opacity=".55"/>
 ${net}${knots}
 <path d="M44 128 Q72 182 74 232" fill="none" stroke="${G}" stroke-width="3.2"/><path d="M156 128 Q128 182 126 232" fill="none" stroke="${GD}" stroke-width="3.2"/>
 <!-- base della coppa e montagne -->
 <path d="M58 240 Q100 228 142 240 Z" fill="${GD}"/>
 <path d="M62 238 L78 212 L86 222 L100 196 L114 222 L122 212 L138 238 Z" fill="${G}" stroke="#7a4d06" stroke-width=".8"/>
 <path d="M100 196 L94 214 L100 210 L106 216 Z M78 212 L75 222 L81 220 Z M122 212 L119 220 L125 222 Z" fill="#fff6c4" opacity=".75"/>
 <!-- busto: canotta -->
 <path d="M62 132 Q58 96 72 84 Q86 76 100 80 Q114 76 128 84 Q142 96 138 132 Z" fill="${G}" stroke="#7a4d06" stroke-width="1"/>
 <path d="M84 82 Q100 104 116 82" fill="none" stroke="#fff6c4" stroke-width="2.2"/><path d="M76 86 Q74 106 66 124 M124 86 Q126 106 134 124" fill="none" stroke="#a46d0a" stroke-width="1.6"/>
 <!-- braccio sinistro che tiene la palla -->
 <path d="M66 90 Q48 96 46 118 Q52 128 64 124" fill="${G}" stroke="#7a4d06" stroke-width="1"/>
 <circle cx="50" cy="114" r="17" fill="${GL}" stroke="#7a4d06" stroke-width="1"/>
 <path d="M33 114 H67 M50 97 V131 M38 102 Q50 114 38 126 M62 102 Q50 114 62 126" fill="none" stroke="#8a5a08" stroke-width="1.3"/>
 <!-- braccio destro aperto -->
 <path d="M132 92 Q150 104 154 120 Q160 112 172 100 L176 104 Q166 118 158 128 Q148 128 140 112" fill="${G}" stroke="#7a4d06" stroke-width="1"/>
 <path d="M172 100 l4 -14 M175 102 l7 -12 M176 105 l9 -8 M176 108 l9 -3 M168 101 l-1 -12" stroke="#c58a12" stroke-width="3" stroke-linecap="round"/>
 <!-- testa: collo, viso, barba, sorriso, fascia e treccine -->
 <path d="M91 70 L91 82 Q100 88 109 82 L109 70 Z" fill="${GD}"/>
 <ellipse cx="100" cy="52" rx="17" ry="21" fill="${G}" stroke="#7a4d06" stroke-width="1"/>
 <path d="M84 56 Q86 76 100 78 Q114 76 116 56 Q112 66 100 67 Q88 66 84 56 Z" fill="#7a4d06"/>
 <path d="M92 62 Q100 70 108 62 Q100 66 92 62 Z" fill="#fff6c4"/>
 <path d="M90 49 q4 -3 8 0 M102 49 q4 -3 8 0" stroke="#7a4d06" stroke-width="1.4" fill="none"/>
 <rect x="82" y="34" width="36" height="8" rx="3" fill="${GD}" stroke="#fff3b0" stroke-width=".8"/>
 <path d="M84 33 q-6 10 -4 24 M88 31 q-5 12 -5 22 M112 31 q5 12 5 22 M116 33 q6 10 4 24 M90 33 q-1 -4 3 -6 M96 32 q0 -5 4 -6 M104 32 q1 -5 5 -5 M110 33 q2 -4 -1 -6" stroke="${G}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
 <!-- bordo del canestro (davanti al busto) -->
 <ellipse cx="100" cy="128" rx="58" ry="9" fill="none" stroke="${G}" stroke-width="5"/>
 <ellipse cx="100" cy="128" rx="58" ry="9" fill="none" stroke="#fff6c4" stroke-width="1" opacity=".7"/>
 </svg>`};
})();
