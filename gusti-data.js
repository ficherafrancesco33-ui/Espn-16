/* ESPN 16 – GUSTI DEI GM (come Dreamers, GM_GUSTI). Si riempie con i report dell Allenamento IA Trade che i GM girano a Claude.
   Per ogni squadra: role {G,F,C} preferenza per ruolo ricevuto (punti %), age = punti di valore per anno di età in più ricevuto,
   req = vantaggio % chiesto per dire sì al 50%, sc = scala della decisione, pl {nome: punti %} giocatori valutati più/meno dei valori,
   n = risposte date, agg = data. GM_DESCR: testi della scheda (rep, cerca, chiude[], inf, nota, manca).
   Finché una squadra non ha profilo, l IA usa il gusto medio della lega (segnato «stima»). */
const GM_GUSTI={};
const GM_DESCR={};
const GM_K={max:.6,n:150,sc:12.5};
window.SCAMBIV=window.SCAMBIV||{};
