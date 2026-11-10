// ESPN 16 – (93) INFORTUNI NBA da ESPN, salvati nell app ogni 5 minuti (GitHub, .github/workflows/infortuni.yml).
// Scrive infortuni-data.js solo se la lista è cambiata (l ora dell aggiornamento da sola non conta), così non si creano aggiornamenti inutili.
// Formato come ESPN.inj di tools/espn.mjs: [nome, squadra NBA, stato, commento, tipo, data rientro, lato, dettaglio, data]. Prova a mano: node tools/infortuni.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const OUT = new URL("../infortuni-data.js", import.meta.url);
let J = null;
for (let i = 0; i < 4 && !J; i++) { try { const r = await fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/nba/injuries", { headers: { "user-agent": "espn16-app" } }); if (r.ok) J = await r.json() } catch (e) {} if (!J) await new Promise(r => setTimeout(r, 2000 * (i + 1))) }
if (!J) throw new Error("ESPN infortuni non risponde");
const L = [];
for (const tm of J.injuries || []) for (const x of tm.injuries || []) { const a = x.athlete || {}; L.push([a.displayName || "", (a.team && a.team.abbreviation) || "", x.status || "", x.shortComment || x.longComment || "", (x.details && x.details.type) || "", (x.details && x.details.returnDate) || "", (x.details && x.details.side) || "", (x.details && x.details.detail) || "", x.date || ""]) }
if (L.length < 5) throw new Error("Lista infortuni ESPN troppo corta (" + L.length + "): non sovrascrivo");
L.sort((a, b) => (a[1] + a[0]).localeCompare(b[1] + b[0]));
let old = null; if (existsSync(OUT)) { try { old = new Function(readFileSync(OUT, "utf8") + ";return INFLIVE")() } catch (e) {} }
if (old && JSON.stringify(old.l) === JSON.stringify(L)) { console.log("infortuni: nessuna novità (" + L.length + ")"); process.exit(0) }
const INFLIVE = { ts: Date.now(), upd: new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", dateStyle: "short", timeStyle: "short" }).format(new Date()), l: L };
writeFileSync(OUT, "/* ESPN 16 – infortuni NBA, generato da tools/infortuni.mjs (GitHub ogni 5 minuti), non modificare a mano */\nconst INFLIVE=" + JSON.stringify(INFLIVE) + ";\n");
console.log("infortuni aggiornati:", L.length);
