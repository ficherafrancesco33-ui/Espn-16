// ESPN 16 – date di nascita dei giocatori NBA (per età precise e regola della tribuna: under 25).
// Legge le rose delle 30 squadre NBA da ESPN e scrive eta-data.js: nome -> "AAAA-MM-GG". Gira con l aggiornamento ESPN (tools/espn.mjs).
import { writeFileSync, readFileSync, existsSync } from "node:fs";
const OUT = new URL("../eta-data.js", import.meta.url);
const T = ["ATL","BOS","BKN","CHA","CHI","CLE","DAL","DEN","DET","GS","HOU","IND","LAC","LAL","MEM","MIA","MIL","MIN","NO","NY","OKC","ORL","PHI","PHX","POR","SAC","SA","TOR","UTAH","WSH"];
let D = {}; if (existsSync(OUT)) try { D = new Function(readFileSync(OUT, "utf8") + ";return NASCITA")() } catch (e) {}
for (const t of T) { for (let i = 0; i < 3; i++) { try { const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${t.toLowerCase()}/roster`); if (r.ok) { const J = await r.json(); for (const a of J.athletes || []) if (a.dateOfBirth) D[a.displayName] = a.dateOfBirth.slice(0, 10); break } } catch (e) {} } }
/* giocatori delle nostre rose che non sono nelle rose NBA (G League, appena firmati…): ricerca ESPN e scheda del giocatore */
const nk = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[.'’]/g, "").replace(/\s+(jr|sr|ii|iii|iv)$/, "").trim();
try { const html = readFileSync(new URL("../index.html", import.meta.url), "utf8"); const ROSE = new Function(html.match(/const ROSE=\{[\s\S]*?\n\};/)[0] + ";return ROSE")();
  const have = new Set(Object.keys(D).map(nk));
  /* (44) anche i giocatori della lega ESPN: rose di oggi e free agent (lega-data.js, tools/lega.mjs), per l età e la regola dei 3 under 25 */
  const NAMES = new Set(), IDS = {}; for (const t in ROSE) for (const g of ROSE[t]) NAMES.add(g[0]);
  try { const LEGA = new Function(readFileSync(new URL("../lega-data.js", import.meta.url), "utf8") + ";return LEGA")();
    for (const t in LEGA.rose || {}) for (const g of LEGA.rose[t]) NAMES.add(g[0]); for (const x of LEGA.fa || []) { NAMES.add(x[0]); if (x[5]) IDS[x[0]] = x[5] } } catch (e) {}
  for (const n of NAMES) { const g = [n]; if (have.has(nk(g[0]))) continue;
    /* se dalla lega ESPN conosciamo l id del giocatore, scheda diretta (la ricerca per nome a volte sbaglia) */
    if (IDS[n]) { try { const A = await (await fetch(`https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/athletes/${IDS[n]}`)).json(); if (A.dateOfBirth) { D[n] = A.dateOfBirth.slice(0, 10); have.add(nk(n)); continue } } catch (e) {} }
    try { const S = await (await fetch(`https://site.web.api.espn.com/apis/common/v3/search?query=${encodeURIComponent(g[0])}&limit=3&type=player`)).json();
      const it = (S.items || []).find(x => /nba/.test(x.league || "")); if (!it) continue;
      const A = await (await fetch(`https://sports.core.api.espn.com/v2/sports/basketball/leagues/${it.league}/athletes/${it.id}`)).json();
      if (A.dateOfBirth) { D[g[0]] = A.dateOfBirth.slice(0, 10); have.add(nk(g[0])) } } catch (e) {} } } catch (e) {}
writeFileSync(OUT, "/* ESPN 16 – date di nascita dei giocatori NBA (rose ESPN), generato da tools/eta.mjs. Non modificare a mano. */\nconst NASCITA=" + JSON.stringify(D) + ";\n");
console.log("date di nascita", Object.keys(D).length);
