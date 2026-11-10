// ESPN 16 – (44) dati della LEGA ESPN (pubblica): rose, formazioni del lunedì, punteggi ufficiali delle sfide, free agent, movimenti.
// Scrive lega-data.js. Lo lancia GitHub insieme a tools/espn.mjs (.github/workflows/espn.yml). Prova a mano: node tools/lega.mjs
// Regola della lega: la formazione si mette il lunedì prima della prima partita e resta bloccata fino al lunedì dopo,
// quindi per ogni settimana si legge la formazione del primo giorno della settimana (scoringPeriod del lunedì; settimana 1 = martedì 20/10).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const LID = 1609471983, SEASON = 2027, START = "2026-10-20";
const B = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/${SEASON}/segments/0/leagues/${LID}`;
const OUT = new URL("../lega-data.js", import.meta.url);
async function get(q, filter) {
  for (let i = 0; i < 4; i++) {
    try { const h = { "user-agent": "espn16-app" }; if (filter) h["x-fantasy-filter"] = JSON.stringify(filter);
      const r = await fetch(B + q, { headers: h }); if (r.ok) return await r.json(); } catch (e) {}
    await new Promise(r => setTimeout(r, 1500 * (i + 1)));
  }
  throw new Error("ESPN lega non risponde: " + q);
}
let OLD = {};
if (existsSync(OUT)) { try { OLD = new Function(readFileSync(OUT, "utf8") + ";return LEGA")() } catch (e) {} }
/* squadre ESPN -> sigle dell app (dal nome) */
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const TEAMS = [...html.matchAll(/\{id:"([A-Z]{3})",nome:"([^"]+)"/g)].map(m => ({ id: m[1], nome: m[2] }));
const nn = s => String(s).replace(/\\u00a0|\u00a0/g, " ").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z ]/g, "").replace(/\s+/g, " ").trim();
const PRO = { 1: "ATL", 2: "BOS", 3: "NO", 4: "CHI", 5: "CLE", 6: "DAL", 7: "DEN", 8: "DET", 9: "GS", 10: "HOU", 11: "IND", 12: "LAC", 13: "LAL", 14: "MIA", 15: "MIL", 16: "MIN", 17: "BKN", 18: "NY", 19: "ORL", 20: "PHI", 21: "PHX", 22: "POR", 23: "SAC", 24: "SA", 25: "OKC", 26: "UTAH", 27: "WSH", 28: "TOR", 29: "MEM", 30: "CHA", 0: "FA" };
const SLOT = { 0: "PG", 1: "SG", 2: "SF", 3: "PF", 4: "C", 5: "G", 6: "F", 7: "SG/SF", 8: "G/F", 9: "PF/C", 10: "F/C", 11: "UTIL", 12: "BE", 13: "IR" };
const POS = { 1: "PG", 2: "SG", 3: "SF", 4: "PF", 5: "C" };
const pos = p => { const d = POS[p.defaultPositionId]; const L = [0, 1, 2, 3, 4].filter(s => (p.eligibleSlots || []).includes(s)).map(s => SLOT[s]); return [d, ...L.filter(x => x !== d)].filter(Boolean).join(",") };
const day = d => new Date(d + "T12:00:00Z").getTime(), spOf = d => Math.round((day(d) - day(START)) / 864e5) + 1;
const dOf = sp => new Date(day(START) + (sp - 1) * 864e5).toISOString().slice(0, 10);
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
const weekStart = w => w === 1 ? START : dOf(spOf("2026-10-26") + (w - 2) * 7);

const T = await get("?view=mTeam");
const MAP = {};
for (const t of T.teams) { const n = nn(t.name || (t.location + " " + t.nickname)); const m = TEAMS.find(x => nn(x.nome) === n) || TEAMS.find(x => n.includes(nn(x.nome).split(" ").slice(-1)[0])); if (m) MAP[t.id] = m.id }
/* (91) controllo: tutte le 16 squadre devono essere riconosciute (col nome «Monk\u00a0Seals» Honolulu era sparita senza avvisi). Se ne manca una lo script si ferma e GitHub manda la mail di errore */
if (Object.keys(MAP).length !== TEAMS.length) { const miss = TEAMS.filter(x => !Object.values(MAP).includes(x.id)).map(x => x.nome); throw new Error("Squadre ESPN non riconosciute: " + miss.join(", ")) }
const ent = e => { const p = e.playerPoolEntry.player; return [p.fullName, PRO[p.proTeamId] || "FA", SLOT[e.lineupSlotId] || "BE", pos(p)] };
/* rose di adesso */
const R = await get("?view=mRoster"), rose = {};
for (const t of R.teams) if (MAP[t.id]) rose[MAP[t.id]] = t.roster.entries.map(ent);
/* sfide e punteggi ufficiali */
const M = await get("?view=mMatchupScore"), match = {}, score = {}, live = {};
for (const x of M.schedule) { const w = x.matchupPeriodId, h = MAP[x.home && x.home.teamId], a = MAP[x.away && x.away.teamId]; if (!h || !a) continue;
  (match[w] = match[w] || []).push([h, a]);
  /* (91) punteggio ESPN della settimana in corso (totalPointsLive), preso a ogni giro: è il punteggio vero di ESPN, formazioni comprese */
  if (!(x.winner && x.winner !== "UNDECIDED")) { const lv = v => v && (v.totalPointsLive ?? v.totalPoints); if (lv(x.home) != null) { (live[w] = live[w] || {})[h] = lv(x.home); live[w][a] = lv(x.away) } }
  if (x.winner && x.winner !== "UNDECIDED") { (score[w] = score[w] || {})[h] = x.home.totalPoints; score[w][a] = x.away.totalPoints } }
/* formazioni del lunedì: per ogni settimana iniziata, i titolari del primo giorno (le settimane chiuse non si riscaricano) */
const line = OLD.line || {};
const curW = Object.keys(match).map(Number).filter(w => weekStart(w) <= today).sort((a, b) => a - b);
for (const w of curW) { const done = score[w] && line[w]; if (done) continue;
  const RR = await get(`?view=mRoster&scoringPeriodId=${spOf(weekStart(w))}`), L = {};
  for (const t of RR.teams) if (MAP[t.id]) L[MAP[t.id]] = t.roster.entries.filter(e => e.lineupSlotId !== 12 && e.lineupSlotId !== 13).map(e => e.playerPoolEntry.player.fullName);
  line[w] = L }
/* free agent (i 400 più posseduti nelle leghe ESPN) */
const F = await get("?view=kona_player_info", { players: { filterStatus: { value: ["FREEAGENT", "WAIVERS"] }, limit: 400, sortPercOwned: { sortPriority: 1, sortAsc: false } } });
const fa = (F.players || []).map(x => { const p = x.player; return [p.fullName, PRO[p.proTeamId] || "FA", pos(p), Math.round(((p.ownership || {}).percentOwned || 0) * 10) / 10, p.injuryStatus || "", p.id] });
/* movimenti: firme e tagli di free agent, scambi (giocatori arrivati con uno scambio e ancora in rosa, raggruppati per ora) */
const ID = {}; for (const t of R.teams) for (const e of t.roster.entries) ID[e.playerId] = e.playerPoolEntry.player.fullName;
for (const x of F.players || []) ID[x.player.id] = x.player.fullName;
const mov = [];
for (let sp = 0; sp <= spOf(today); sp++) { let X; try { X = await get(`?view=mTransactions2&scoringPeriodId=${sp}`) } catch (e) { continue }
  for (const t of X.transactions || []) { if (t.status !== "EXECUTED") continue;
    if (t.type === "FREEAGENT" || t.type === "WAIVER") for (const i of t.items) mov.push({ d: t.proposedDate, ty: i.type === "ADD" ? "add" : "drop", t: MAP[i.type === "ADD" ? i.toTeamId : i.fromTeamId] || "", p: ID[i.playerId] || String(i.playerId) });
    if (t.type === "TRADE_ACCEPT") mov.push({ d: t.proposedDate, ty: "trade", t: MAP[t.teamId] || "" }) } }
const tr = {}; for (const t of R.teams) for (const e of t.roster.entries) if (e.acquisitionType === "TRADE" && MAP[t.id]) { const k = Math.round(e.acquisitionDate / 6e4); (tr[k] = tr[k] || []).push([MAP[t.id], e.playerPoolEntry.player.fullName]) }
const trades = Object.keys(tr).sort((a, b) => b - a).map(k => ({ d: +k * 6e4, l: tr[k] }));
mov.sort((a, b) => b.d - a.d);
/* (91) controllo prima di salvare: formazione del lunedì di tutte e 16 le squadre per ogni settimana iniziata */
for (const w of curW) { const n = Object.keys(line[w] || {}).length; if (n !== TEAMS.length) throw new Error(`Settimana ${w}: formazioni ESPN di ${n} squadre su ${TEAMS.length}`) }
const LEGA = { liveTs: Date.now(), live, upd: new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", dateStyle: "short", timeStyle: "short" }).format(new Date()), map: MAP, rose, match, score, line, fa, mov: mov.slice(0, 300), trades };
writeFileSync(OUT, "/* ESPN 16 – generato da tools/lega.mjs dalla lega ESPN (pubblica), non modificare a mano */\nconst LEGA=" + JSON.stringify(LEGA) + ";\n");
console.log("lega:", Object.keys(rose).length, "squadre,", Object.keys(line).length, "settimane di formazioni,", fa.length, "free agent,", mov.length, "movimenti,", trades.length, "scambi");
