// ESPN 16 – archivio di una stagione NBA passata (regular season) da ESPN, per le statistiche e i profili giocatore.
// Uso:  node tools/storico.mjs 2025-10-21 2026-04-12 2526      -> scrive storico-2526.js
// Si lancia una volta sola per stagione chiusa (i dati non cambiano più). La stagione in corso sta in espn-data.js.
// Formato compatto (per tenere il file leggero):
//   STORICO["2526"] = { P:{idESPN:[nome, squadra NBA ultima]}, G:[[data, ospite, casa, punti osp., punti casa, [righe]]] }
//   riga = [idESPN, squadra NBA, titolare, MIN, PTS, FGM, FGA, 3PM, 3PA, FTM, FTA, OREB, DREB, AST, STL, BLK, TO, PF, TF, FF]
//   (stesso ordine di espn-data.js dalla colonna 1, così ffps() funziona uguale dopo aver rimesso il nome davanti)
import { writeFileSync } from "node:fs";
const [FROM, TO, KEY] = process.argv.slice(2);
if (!FROM || !TO || !KEY) { console.log("uso: node tools/storico.mjs AAAA-MM-GG AAAA-MM-GG chiave"); process.exit(1) }
const SB = d => `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${d.replace(/-/g, "")}`;
const SUM = id => `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${id}`;
async function get(url) {
  for (let i = 0; i < 5; i++) {
    try { const r = await fetch(url, { headers: { "user-agent": "espn16-app" } }); if (r.ok) return await r.json() } catch (e) {}
    await new Promise(r => setTimeout(r, 1500 * (i + 1)));
  }
  throw new Error("ESPN non risponde: " + url);
}
const n = v => { const x = +v; return Number.isFinite(x) ? x : 0 };
const mm = s => { const [a, b] = String(s || "").split("-"); return [n(a), n(b)] };
const P = {};
function boxOf(sum) {
  const out = [], idx = {};
  for (const t of (sum.boxscore && sum.boxscore.players) || []) {
    const ab = t.team.abbreviation, S = t.statistics && t.statistics[0]; if (!S) continue;
    const L = S.labels || S.names || [], k = x => L.indexOf(x);
    for (const a of S.athletes || []) {
      const st = a.stats || []; if (!st.length || a.didNotPlay) continue;
      const g = x => st[k(x)];
      const [fgm, fga] = mm(g("FG")), [tpm, tpa] = mm(g("3PT")), [ftm, fta] = mm(g("FT"));
      const id = a.athlete.id; if (!id) continue;   // righe senza giocatore (capita in qualche tabellino ESPN)
      P[id] = [a.athlete.displayName, ab];
      const row = [id, ab, a.starter ? 1 : 0, n(g("MIN")), n(g("PTS")), fgm, fga, tpm, tpa, ftm, fta, n(g("OREB")), n(g("DREB")), n(g("AST")), n(g("STL")), n(g("BLK")), n(g("TO")), n(g("PF")), 0, 0];
      idx[id] = row; out.push(row);
    }
  }
  /* tecnici e flagranti dalla cronaca: stesse regole di tools/espn.mjs */
  for (const p of sum.plays || []) {
    const t = (p.type && p.type.text) || ""; if (!/technical|flagrant/i.test(t)) continue;
    if (/3[- ]?second|free throw/i.test(t)) continue;
    for (const q of (p.participants || []).slice(0, /double/i.test(t) ? 2 : 1)) {
      const r = q && q.athlete && idx[q.athlete.id]; if (!r) continue;
      if (/flagrant/i.test(t)) r[19]++; else r[18]++;
    }
  }
  return out;
}
const days = [];
for (let d = new Date(FROM + "T12:00:00Z"); d.toISOString().slice(0, 10) <= TO; d.setUTCDate(d.getUTCDate() + 1)) days.push(d.toISOString().slice(0, 10));
const jobs = [];
for (const d of days) {
  const sb = await get(SB(d));
  for (const e of sb.events || []) {
    if (!e.season || e.season.type !== 2 || !e.status.type.completed) continue;   // solo regular season, partite finite
    const c = e.competitions[0], h = c.competitors.find(x => x.homeAway === "home"), a = c.competitors.find(x => x.homeAway === "away");
    jobs.push({ d, id: e.id, g: [d, a.team.abbreviation, h.team.abbreviation, n(a.score), n(h.score)] });
  }
}
console.log("partite", jobs.length);
let i = 0;
async function worker() { while (i < jobs.length) { const j = jobs[i++]; j.g.push(boxOf(await get(SUM(j.id)))) } }
await Promise.all(Array.from({ length: 6 }, worker));
const G = jobs.map(j => j.g);
writeFileSync(new URL(`../storico-${KEY}.js`, import.meta.url), `/* ESPN 16 – archivio stagione ${KEY} (regular season ${FROM} → ${TO}), generato da tools/storico.mjs. Non modificare a mano. */\nvar STORICO=window.STORICO||{};STORICO["${KEY}"]=` + JSON.stringify({ P, G }) + ";\n");
console.log("giocatori", Object.keys(P).length);
