// ESPN 16 – (57) ROOKIE DEL DRAFT 2027 da Tankathon (big board + pagina di ogni giocatore) per la Sala Draft.
// Scrive rookie-data.js (ROOKIE). Lo lancia GitHub ogni domenica (valori.yml). Prova a mano: node tools/tankathon.mjs
// Dalla pagina del giocatore si prendono le medie a partita (G, MP, FGM-FGA, 3PM-3PA, FTM-FTA, REB, AST, BLK, STL, TO, PF, PTS):
// Salva anche il game log della stagione e uno storico settimanale (h) per il trend ▲/▼.
// l AVG si calcola nell app con la formula della lega (Tankathon non divide i rimbalzi in offensivi/difensivi: REB × 2,1).
import { writeFileSync, readFileSync } from "node:fs";
const BASE = "https://www.tankathon.com", N = 60, UA = { "user-agent": "Mozilla/5.0" };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(url) {
  for (let i = 0; i < 4; i++) {
    try { const r = await fetch(url, { headers: UA }); if (r.ok) return await r.text() } catch (e) {}
    await sleep(1500 * (i + 1));
  }
  throw new Error("Tankathon non risponde: " + url);
}
const strip = s => s.replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/<[^>]+>/g, "|").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s*\|[\s|]*/g, "|");
const num = v => { const x = parseFloat(v); return Number.isFinite(x) ? x : 0 };
const MES = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
/* una stagione "2026-27" va da novembre ad aprile: i mesi dopo luglio sono del primo anno */
const isoD = (d, y0) => { const [m, g] = d.trim().split(/\s+/), mm = MES[m] || 0; return mm ? `${mm > 7 ? y0 : y0 + 1}-${String(mm).padStart(2, "0")}-${String(+g).padStart(2, "0")}` : d };
const pr = s => { const [a, b] = String(s).split("-"); return [num(a), num(b)] };
const AVG = s => +(s[14] + 2 * s[2] - s[3] + s[4] + s[6] - s[7] + 2.1 * s[8] + 2 * s[9] + 4 * s[11] + 4 * s[10] - 2 * s[12] - s[13]).toFixed(2);
/* storico settimanale: si riparte da quello già scritto in rookie-data.js */
let OLD = { h: {} };
try { OLD = new Function(readFileSync(new URL("../rookie-data.js", import.meta.url), "utf8") + ";return ROOKIE")() || OLD } catch (e) {}
const html = await get(BASE + "/big_board");
const rows = [...html.matchAll(/<div class="mock-row" data-pos="([^"]*)" data-year="([^"]*)">([\s\S]*?)(?=<div class="mock-row" |<\/div><\/div><\/div><div id|$)/g)];
const list = [];
for (const m of rows) {
  const r = m[3], rk = +((r.match(/mock-row-pick-number">(\d+)/) || [])[1] || 0), slug = (r.match(/href="\/players\/([^"]+)"/) || [])[1];
  if (!rk || !slug || list.some(x => x.slug === slug)) continue;
  const name = ((r.match(/mock-row-name">([^<]*)/) || [])[1] || "").trim();
  const sp = ((r.match(/mock-row-school-position">([^<]*)/) || [])[1] || "").split("|").map(x => x.trim());
  const ya = r.match(/year-age desktop"><div>([^<]*)<\/div><div>([^<]*)/) || [];
  const hw = r.match(/height-weight"><div>([^<]*)<\/div><div>(\d+)/) || [];
  list.push({ rk, slug, n: name, pos: sp[0] || m[1], sc: (sp[1] || "").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&"), /* (72) niente entità HTML nei nomi dei college (St. John's) */ yr: ya[1] || m[2], age: num(ya[2]), h: (hw[1] || "").replace(/&#39;/g, "'").replace(/&quot;/g, '"'), w: num(hw[2]) });
}
list.sort((a, b) => a.rk - b.rk);
const top = list.slice(0, N), out = [];
for (const x of top) {
  await sleep(400);
  let t = "", raw = ""; try { raw = await get(`${BASE}/players/${x.slug}`); t = strip(raw) } catch (e) { console.log("salto", x.slug); }
  const i = t.indexOf("PER GAME AVERAGES"), j = t.indexOf("PER 36 MINUTES", i), blk = i >= 0 ? t.slice(i, j > i ? j : i + 600) : "";
  const v = k => { const m = blk.match(new RegExp("\\|" + k + "\\|([^|]*)")); return m ? m[1].trim() : "" };
  const [fgm, fga] = pr(v("FGM-FGA")), [tpm, tpa] = pr(v("3PM-3PA")), [ftm, fta] = pr(v("FTM-FTA"));
  /* game log della stagione in corso (tabella "GAME LOG" nella pagina del giocatore) */
  /* ci possono essere più stagioni (un div "stats" per anno): si prende la più recente */
  const gl = [], gs = raw.indexOf("GAME LOG"), ge = raw.lastIndexOf("game-log-note");
  const seg = gs >= 0 ? raw.slice(gs, ge > gs ? ge : undefined).split(/<div class="stats" /).slice(1) : [];
  const yr = z => +((z.match(/^data-year="(\d{4})/) || [])[1] || 0), cur = seg.reduce((a, z) => yr(z) > yr(a) ? z : a, seg[0] || "");
  const y0 = +((cur.match(/^data-year="(\d{4})/) || [])[1] || 2026), stag = cur ? (cur.match(/^data-year="([^"]*)"/) || [])[1] || "" : "";
  if (cur) for (const g of cur.matchAll(/<tr class="game">([\s\S]*?)<\/tr>/g)) {
    const c = [...g[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>(?=<td|$)/g)].map(z => z[1]);
    const dt = ((c[0] || "").match(/class="desktop">([^<]*)/) || [])[1] || "", opp = strip(c[1] || "").split("|").filter(Boolean);
    const [a1, b1] = pr(strip(c[4] || "").replace(/\|/g, "")), [a2, b2] = pr(strip(c[5] || "").replace(/\|/g, "")), [a3, b3] = pr(strip(c[6] || "").replace(/\|/g, ""));
    const n = k => num(strip(c[k] || "").replace(/\|/g, ""));
    /* [data, avversario, V/S, MIN, FGM, FGA, 3PM, 3PA, FTM, FTA, REB, AST, BLK, STL, TO, PF, PTS] */
    gl.push([isoD(dt, y0), opp[0] || "", opp[1] || "", n(2), a1, b1, a2, b2, a3, b3, n(7), n(8), n(10), n(9), n(11), n(12), n(13)]);
  }
  const md = t.match(/MOCK DRAFT\|Rd\|\s*(\d+)\s*\|Pick\|\s*(\d+)/) || [], bb = t.match(/BIG BOARD\|Ovr\|\s*(\d+)/) || [];
  /* s = [G, MP, FGM, FGA, 3PM, 3PA, FTM, FTA, REB, AST, BLK, STL, TO, PF, PTS] (medie a partita) */
  out.push([x.n, x.pos, x.sc, x.yr, x.age, x.h, x.w, x.rk, md[1] ? +md[1] : 0, md[2] ? +md[2] : 0,
    [num(v("G")), num(v("MP")), fgm, fga, tpm, tpa, ftm, fta, num(v("REB")), num(v("AST")), num(v("BLK")), num(v("STL")), num(v("TO")), num(v("PF")), num(v("PTS"))], x.slug, gl, stag]);
}
const oggi = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome" }).format(new Date()), H = OLD.h || {};
/* snapshot della settimana: {d, G, MP, a (AVG a partita), s (medie)}; stessa data = si sovrascrive, massimo 40 settimane */
for (const r of out) {
  const s = r[10]; if (!(s[0] > 0)) continue;
  const L = (H[r[11]] || []).filter(z => z.d !== oggi); L.push({ d: oggi, G: s[0], MP: s[1], a: AVG(s), s });
  H[r[11]] = L.slice(-40);
}
const ROOKIE = { upd: new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", dateStyle: "short", timeStyle: "short" }).format(new Date()), src: "Tankathon", draft: 2027,
  campi: "p: [nome, ruolo, college/squadra, anno, età al draft, altezza, peso, posto nel big board, mock giro, mock scelta, [G, MP, FGM, FGA, 3PM, 3PA, FTM, FTA, REB, AST, BLK, STL, TO, PF, PTS], slug, game log [[data, avversario, V/S, MIN, FGM, FGA, 3PM, 3PA, FTM, FTA, REB, AST, BLK, STL, TO, PF, PTS]], stagione del game log]; h: {slug: [{d, G, MP, a, s}]} storico settimanale", p: out, h: H };
writeFileSync(new URL("../rookie-data.js", import.meta.url), "/* ESPN 16 – rookie del Draft 2027 da Tankathon, generato da tools/tankathon.mjs, non modificare a mano */\nconst ROOKIE=" + JSON.stringify(ROOKIE) + ";\n");
console.log("rookie:", out.length, "con statistiche:", out.filter(x => x[10][0] > 0).length, "partite nel game log:", out.reduce((a, x) => a + x[12].length, 0));
