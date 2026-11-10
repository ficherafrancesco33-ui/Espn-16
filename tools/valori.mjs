// ESPN 16 – VALORI DEI GIOCATORI per il calcolatore trade, l IA trade e il valore delle squadre.
// Lo lancia da solo GitHub ogni domenica alle 18 italiane (.github/workflows/valori.yml). Uso manuale: node tools/valori.mjs
//
// Come si calcola (idea presa dai valori Dreamers, adattata all AVG della lega):
//  1) AVG pesato degli ultimi 2 anni: stagione in corso (26/27) e stagione scorsa (25/26), più peso all ultima.
//     Il peso della stagione in corso cresce con le partite giocate: 65% da 20 partite in su, meno prima (campione piccolo).
//     Chi non ha giocato la stagione scorsa (rookie) parte da un AVG «da rookie» (22) che si sposta verso il suo AVG reale partita dopo partita.
//  2) Presenza: chi ha giocato poco la scorsa stagione perde un po' (infortuni), fino a −15%.
//  2b) Giovani: fino a 22 anni l AVG atteso sale di 1,5 punti per ogni anno sotto i 23 (crescita).
//  3) Età: in una dynasty i giovani valgono di più (vedi ETA): 1,35 a 20 anni, 1,00 a 27, 0,50 a 35.
//  4) Valore = 1000 × (AVG pesato / 35)^1,7 × età × presenza. Arrotondato a 5.
// Scrive valori-data.js con il valore di ogni giocatore e la storia delle ultime 12 settimane (per le frecce su/giù).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const root = new URL("../", import.meta.url);
const load = (f, name) => new Function("window", readFileSync(new URL(f, root), "utf8") + ";return " + name)({});
const ESPN = load("espn-data.js", "ESPN"), ST = load("storico-2526.js", "STORICO")["2526"];
const ffps = r => r[4] + 2 * r[5] - r[6] + r[7] + r[9] - r[10] + 2.5 * r[11] + 2 * r[12] + 2 * r[13] + 4 * r[14] + 4 * r[15] - 2 * r[16] - r[17] - r[18] - 3 * r[19];
const nrm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[.'’]/g, "").replace(/\s+(jr|sr|ii|iii|iv)$/, "").trim();
/* età: dalle rose NBA di ESPN */
const TEAMS = ["ATL","BOS","BKN","CHA","CHI","CLE","DAL","DEN","DET","GS","HOU","IND","LAC","LAL","MEM","MIA","MIL","MIN","NO","NY","OKC","ORL","PHI","PHX","POR","SAC","SA","TOR","UTAH","WSH"];
async function get(u) { for (let i = 0; i < 4; i++) { try { const r = await fetch(u); if (r.ok) return await r.json() } catch (e) {} await new Promise(r => setTimeout(r, 1500 * (i + 1))) } return null }
const AGE = {}, NBA = {};
for (const t of TEAMS) { const J = await get(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${t.toLowerCase()}/roster`); for (const a of (J && J.athletes) || []) { const k = nrm(a.displayName); if (a.dateOfBirth) AGE[k] = (Date.now() - Date.parse(a.dateOfBirth)) / 31557600000; NBA[k] = t } }
/* partite per giocatore e stagione */
const P = {};
const add = (name, s, f) => { const k = nrm(name); const p = P[k] || (P[k] = { n: name, s: {} }); const x = p.s[s] || (p.s[s] = { g: 0, f: 0 }); x.g++; x.f += f };
for (const g of ST.G) for (const x of g[5]) { if (!ST.P[x[0]]) continue; add(ST.P[x[0]][0], "prev", ffps([0, ...x.slice(1)])) }
for (const id in ESPN.box) { const G = ESPN.games[id]; if (!G || G[4] === "S") continue; for (const r of ESPN.box[id]) add(r[0], "cur", ffps(r)) }
/* età: 1,35 a 20 anni … 1,00 a 27 … 0,50 a 35 */
const ETA = a => a == null ? 1 : a <= 20 ? 1.35 : a <= 27 ? 1.35 - (a - 20) * 0.05 : a <= 35 ? 1 - (a - 27) * 0.0625 : 0.5;
const out = {};
for (const k in P) { const p = P[k], c = p.s.cur || { g: 0, f: 0 }, v = p.s.prev || { g: 0, f: 0 };
  const ac = c.g ? c.f / c.g : null, av = v.g ? v.f / v.g : null;
  let A;
  if (av != null && v.g >= 10) { const w = ac != null ? 0.65 * Math.min(1, c.g / 20) : 0; A = w * ac + (1 - w) * av }
  else if (ac != null) { const w = Math.min(1, c.g / 25); A = w * ac + (1 - w) * 22 }
  else continue;
  /* crescita dei giovani (dynasty): fino a 22 anni l AVG atteso sale di 1,5 punti per ogni anno sotto i 23 */
  if (AGE[k] != null && AGE[k] < 23) A += (23 - AGE[k]) * 1.5;
  const pres = v.g >= 10 ? Math.min(1, 0.85 + 0.15 * v.g / 60) : 1;
  const age = AGE[k] != null ? AGE[k] : null;
  const val = Math.max(0, Math.round(1000 * Math.pow(Math.max(A, 0) / 35, 1.7) * ETA(age) * pres / 5) * 5);
  if (val < 15 && !(c.g || 0)) continue;
  out[p.n] = [val, +A.toFixed(1), age != null ? +age.toFixed(1) : null, NBA[k] || "", v.g, av != null ? +av.toFixed(1) : null, c.g, ac != null ? +ac.toFixed(1) : null];
}
/* storia settimanale (ultime 12) */
const OUT = new URL("valori-data.js", root);
let OLD = null; if (existsSync(OUT)) try { OLD = load("valori-data.js", "VAL") } catch (e) {}
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date());
const hist = (OLD && OLD.h) || {}, wks = (OLD && OLD.w) || [];
if (!wks.length || wks[wks.length - 1] !== today) { wks.push(today); for (const n in out) (hist[n] = hist[n] || []).push(out[n][0]) }
else for (const n in out) { const h = hist[n] = hist[n] || []; if (h.length) h[h.length - 1] = out[n][0]; else h.push(out[n][0]) }
while (wks.length > 12) { wks.shift(); for (const n in hist) hist[n].shift() }
for (const n in hist) if (!out[n]) delete hist[n];
const VAL = { upd: new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", dateStyle: "short", timeStyle: "short" }).format(new Date()), w: wks, p: out, h: hist };
writeFileSync(OUT, "/* ESPN 16 – valori dei giocatori, generato da tools/valori.mjs ogni domenica alle 18. p: nome -> [valore, AVG pesato, età, squadra NBA, partite 25/26, AVG 25/26, partite 26/27, AVG 26/27]; w: date degli aggiornamenti; h: storia dei valori */\nconst VAL=" + JSON.stringify(VAL) + ";\n");
const top = Object.entries(out).sort((a, b) => b[1][0] - a[1][0]).slice(0, 15).map(([n, v]) => `${n} ${v[0]} (avg ${v[1]}, ${v[2]})`);
console.log("giocatori", Object.keys(out).length, "età trovate", Object.keys(AGE).length); console.log(top.join("\n"));
