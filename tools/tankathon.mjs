// ESPN 16 – (57) ROOKIE DEL DRAFT 2027 da Tankathon (big board + pagina di ogni giocatore) per la Sala Draft.
// Scrive rookie-data.js (ROOKIE). Lo lancia GitHub ogni domenica (valori.yml). Prova a mano: node tools/tankathon.mjs
// Dalla pagina del giocatore si prendono le medie a partita (G, MP, FGM-FGA, 3PM-3PA, FTM-FTA, REB, AST, BLK, STL, TO, PF, PTS):
// l AVG si calcola nell app con la formula della lega (Tankathon non divide i rimbalzi in offensivi/difensivi: REB × 2,1).
import { writeFileSync } from "node:fs";
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
  list.push({ rk, slug, n: name, pos: sp[0] || m[1], sc: sp[1] || "", yr: ya[1] || m[2], age: num(ya[2]), h: (hw[1] || "").replace(/&#39;/g, "'").replace(/&quot;/g, '"'), w: num(hw[2]) });
}
list.sort((a, b) => a.rk - b.rk);
const top = list.slice(0, N), out = [];
for (const x of top) {
  await sleep(400);
  let t = ""; try { t = strip(await get(`${BASE}/players/${x.slug}`)) } catch (e) { console.log("salto", x.slug); }
  const i = t.indexOf("PER GAME AVERAGES"), j = t.indexOf("PER 36 MINUTES", i), blk = i >= 0 ? t.slice(i, j > i ? j : i + 600) : "";
  const v = k => { const m = blk.match(new RegExp("\\|" + k + "\\|([^|]*)")); return m ? m[1].trim() : "" };
  const pr = s => { const [a, b] = String(s).split("-"); return [num(a), num(b)] };
  const [fgm, fga] = pr(v("FGM-FGA")), [tpm, tpa] = pr(v("3PM-3PA")), [ftm, fta] = pr(v("FTM-FTA"));
  const md = t.match(/MOCK DRAFT\|Rd\|\s*(\d+)\s*\|Pick\|\s*(\d+)/) || [], bb = t.match(/BIG BOARD\|Ovr\|\s*(\d+)/) || [];
  /* s = [G, MP, FGM, FGA, 3PM, 3PA, FTM, FTA, REB, AST, BLK, STL, TO, PF, PTS] (medie a partita) */
  out.push([x.n, x.pos, x.sc, x.yr, x.age, x.h, x.w, x.rk, md[1] ? +md[1] : 0, md[2] ? +md[2] : 0,
    [num(v("G")), num(v("MP")), fgm, fga, tpm, tpa, ftm, fta, num(v("REB")), num(v("AST")), num(v("BLK")), num(v("STL")), num(v("TO")), num(v("PF")), num(v("PTS"))], x.slug]);
}
const ROOKIE = { upd: new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", dateStyle: "short", timeStyle: "short" }).format(new Date()), src: "Tankathon", draft: 2027,
  campi: "p: [nome, ruolo, college/squadra, anno, età al draft, altezza, peso, posto nel big board, mock giro, mock scelta, [G, MP, FGM, FGA, 3PM, 3PA, FTM, FTA, REB, AST, BLK, STL, TO, PF, PTS], slug]", p: out };
writeFileSync(new URL("../rookie-data.js", import.meta.url), "/* ESPN 16 – rookie del Draft 2027 da Tankathon, generato da tools/tankathon.mjs, non modificare a mano */\nconst ROOKIE=" + JSON.stringify(ROOKIE) + ";\n");
console.log("rookie:", out.length, "con statistiche:", out.filter(x => x[10][0] > 0).length);
