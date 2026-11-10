// ESPN 16 – scarica da ESPN i tabellini NBA della stagione e scrive espn-data.js
// Lo lancia da solo GitHub (.github/workflows/espn.yml) più volte al giorno: non serve farlo a mano.
// Uso manuale (prova):  node tools/espn.mjs
//
// Per ogni notte (data USA, fuso di New York) dal primo giorno di stagione a oggi:
//   - scoreboard ESPN  -> partite della notte (squadre, punteggio, stato)
//   - summary ESPN     -> tabellino di ogni giocatore + cronaca (play-by-play) per i falli tecnici e flagranti
// Le notti già chiuse (tutte le partite finite) restano come sono nel file e non si riscaricano.
// I punti fantasy (FFPS) NON si calcolano qui: li calcola l'app (funzione ffps in index.html), così la formula sta in un posto solo.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const START = process.env.ESPN_START || "2026-10-20";       // prima notte della regular season 2026/27
const OUT = new URL("../espn-data.js", import.meta.url);
const SB = d => `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${d.replace(/-/g, "")}`;
const SUM = id => `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${id}`;

async function get(url) {
  for (let i = 0; i < 4; i++) {
    try { const r = await fetch(url, { headers: { "user-agent": "espn16-app" } }); if (r.ok) return await r.json(); }
    catch (e) {}
    await new Promise(r => setTimeout(r, 1500 * (i + 1)));
  }
  throw new Error("ESPN non risponde: " + url);
}

/* dati già scaricati */
let OLD = { days: {}, box: {}, games: {} };
if (existsSync(OUT)) { try { OLD = new Function(readFileSync(OUT, "utf8") + ";return ESPN")() } catch (e) {} }

/* oggi a New York */
const nyToday = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
const days = [];
/* anche i prossimi 21 giorni (solo calendario: Dynasty TV e (47) formazione consigliata della settimana dopo) */
const lastDay = (() => { const x = new Date(nyToday + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + 21); return x.toISOString().slice(0, 10) })();
for (let d = new Date(START + "T12:00:00Z"); ; d.setUTCDate(d.getUTCDate() + 1)) {
  const s = d.toISOString().slice(0, 10); if (s > lastDay) break; days.push(s);
}

const n = v => { const x = +v; return Number.isFinite(x) ? x : 0 };
const mm = s => { const [a, b] = String(s || "").split("-"); return [n(a), n(b)] };

/* riga del tabellino: [nome, squadra NBA, titolare 1/0, minuti, PTS, FGM, FGA, 3PM, 3PA, FTM, FTA, OREB, DREB, AST, STL, BLK, TO, PF, TF, FF, idESPN, +/-, ruolo NBA, minuti mm:ss] */
function boxOf(sum) {
  const out = [], idx = {};
  for (const t of (sum.boxscore && sum.boxscore.players) || []) {
    const ab = t.team.abbreviation, S = t.statistics && t.statistics[0]; if (!S) continue;
    const L = S.labels || S.names || [], k = x => L.indexOf(x);
    for (const a of S.athletes || []) {
      const st = a.stats || []; if (!st.length || a.didNotPlay) continue;
      const g = x => st[k(x)];
      const [fgm, fga] = mm(g("FG")), [tpm, tpa] = mm(g("3PT")), [ftm, fta] = mm(g("FT"));
      const row = [a.athlete.displayName, ab, a.starter ? 1 : 0, n(g("MIN")), n(g("PTS")), fgm, fga, tpm, tpa, ftm, fta, n(g("OREB")), n(g("DREB")), n(g("AST")), n(g("STL")), n(g("BLK")), n(g("TO")), n(g("PF")), 0, 0, a.athlete.id, n(String(g("+/-")||"0").replace("+","")), (a.athlete.position && a.athlete.position.abbreviation) || ""];
      idx[a.athlete.id] = row; out.push(row);
    }
  }
  /* falli tecnici e flagranti dalla cronaca (il tabellino ESPN non li ha).
     Tecnico: tipi con "Technical" tranne il difensivo 3 secondi (è un tecnico di squadra, non del giocatore).
     Flagrante: tipi con "Flagrant" (tipo 1 e tipo 2). */
  for (const p of sum.plays || []) {
    const t = (p.type && p.type.text) || ""; if (!/technical|flagrant/i.test(t)) continue;
    if (/3[- ]?second|free throw/i.test(t)) continue;   // tiri liberi del tecnico/flagrante: non sono falli
    /* doppio tecnico: un tecnico a ciascuno dei due giocatori; altrimenti conta solo il primo (chi commette il fallo) */
    const P = (p.participants || []).slice(0, /double/i.test(t) ? 2 : 1);
    for (const q of P) {
      const r = q && q.athlete && idx[q.athlete.id]; if (!r) continue;
      if (/flagrant/i.test(t)) r[19]++; else r[18]++;
    }
  }
  return out;
}

const ESPN = { upd: "", days: {}, box: {}, games: {}, teams: OLD.teams || {} };   // teams: sigla -> [nome breve, colore, record V-P]
for (const d of days) {
  const old = OLD.days[d];
  const closed = old && old.length && old.every(id => OLD.games[id] && OLD.games[id][4] === "F" && OLD.box[id]);
  if (closed) { ESPN.days[d] = old; for (const id of old) { ESPN.games[id] = OLD.games[id]; ESPN.box[id] = OLD.box[id] } continue }
  const sb = await get(SB(d)); const ids = [];
  for (const e of sb.events || []) {
    const c = e.competitions[0], h = c.competitors.find(x => x.homeAway === "home"), a = c.competitors.find(x => x.homeAway === "away");
    const stt = e.status.type, st = stt.completed ? "F" : stt.state === "in" ? "L" : "S";
    for (const x of [a, h]) ESPN.teams[x.team.abbreviation] = [x.team.shortDisplayName || x.team.name, "#" + (x.team.color || "333333"), ((x.records || []).find(r => r.type === "total") || {}).summary || (ESPN.teams[x.team.abbreviation] || [])[2] || ""];
    /* partita: [ospite, casa, punti ospite, punti casa, stato F/L/S, ora d'inizio ISO, periodo/orologio] */
    ESPN.games[e.id] = [a.team.abbreviation, h.team.abbreviation, n(a.score), n(h.score), st, e.date, st === "L" ? stt.shortDetail : ""];
    ids.push(e.id);
    if (st !== "S") { try { ESPN.box[e.id] = boxOf(await get(SUM(e.id))) } catch (err) { if (OLD.box[e.id]) ESPN.box[e.id] = OLD.box[e.id] } }
  }
  ESPN.days[d] = ids;
}
/* infortuni NBA (Centro Medico): [nome, squadra NBA, stato, commento, tipo, data rientro] */
/* (96) in espn-data.js gli infortuni si aggiornano la mattina (7-9 italiane): la lista sempre aggiornata è infortuni-data.js (GitHub ogni 5 minuti) */
const oraIt = +new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", hour: "2-digit", hour12: false }).format(new Date());
if (OLD.inj && OLD.inj.length && !(oraIt >= 7 && oraIt < 9) && !process.env.INFORTUNI) ESPN.inj = OLD.inj; else
try { const J = await get("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/injuries"); ESPN.inj = [];
  for (const tm of J.injuries || []) for (const x of tm.injuries || []) { const a = x.athlete || {}; ESPN.inj.push([a.displayName || "", (a.team && a.team.abbreviation) || "", x.status || "", x.shortComment || x.longComment || "", (x.details && x.details.type) || "", (x.details && x.details.returnDate) || "", (x.details && x.details.side) || "", (x.details && x.details.detail) || "", x.date || ""]) }
} catch (e) { if (OLD.inj) ESPN.inj = OLD.inj }
ESPN.upd = new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", dateStyle: "short", timeStyle: "short" }).format(new Date());
writeFileSync(OUT, "/* ESPN 16 – generato da tools/espn.mjs (GitHub), non modificare a mano */\nconst ESPN=" + JSON.stringify(ESPN) + ";\n");
console.log("notti", days.length, "partite", Object.keys(ESPN.games).length, "tabellini", Object.keys(ESPN.box).length);
