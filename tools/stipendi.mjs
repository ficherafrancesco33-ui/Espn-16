// ESPN 16 – (48) STIPENDI DI MERCATO con la formula della lega (file «Contratti due palle», foglio RIEPILOGO, colonna STIPENDIO FINALE).
// Verificata: con i dati del file la formula rifatta qui dà gli stessi stipendi su tutti i 644 giocatori.
// Dati da ESPN invece che da Basketball-Reference: AVG a partita (stessa formula) e partite di 4 stagioni:
//   1° = stagione in corso (espn-data.js; partite riportate su 82: ogni settimana vale il 3,5%), 2° = 25/26, 3° = 24/25, 4° = 23/24 (storico-*.js).
// Età come Basketball-Reference: anni compiuti al 1° febbraio della stagione (da eta-data.js).
// Le stagioni chiuse vengono riassunte una volta in tools/stip-passate.json (così su GitHub non servono i file grandi).
// Scrive stipendi-data.js (STIP). Lo lancia GitHub ogni domenica con i valori (valori.yml).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const U = f => new URL("../" + f, import.meta.url);
const load = (f, k) => { const w = {}; new Function("window", readFileSync(U(f), "utf8") + `;window.__x=${k};`)(w); return w.__x };
const html = readFileSync(U("index.html"), "utf8");
const ffps = new Function("return " + html.match(/function ffps\(r\)\{[^}]*\}/)[0])();
/* stagioni chiuse: riassunto [AVG, partite, nome] per id ESPN */
const PASS = U("tools/stip-passate.json");
let PAST = existsSync(PASS) ? JSON.parse(readFileSync(PASS, "utf8")) : {};
for (const k of ["2324", "2425", "2526"]) {
  if (!existsSync(U(`storico-${k}.js`))) continue;
  const S = load(`storico-${k}.js`, `STORICO["${k}"]`), A = {};
  for (const g of S.G) for (const x of g[5]) { if (!(x[3] > 0) || !S.P[x[0]]) continue; const r = [S.P[x[0]][0], ...x.slice(1)]; const o = A[x[0]] || (A[x[0]] = [0, 0, S.P[x[0]][0]]); o[0] += ffps(r); o[1]++ }
  for (const id in A) A[id][0] = Math.round(A[id][0] / A[id][1] * 100) / 100;
  PAST[k] = A;
}
writeFileSync(PASS, JSON.stringify(PAST));
/* stagione in corso */
const ESPN = load("espn-data.js", "ESPN"), CUR = {};
for (const d of Object.keys(ESPN.days)) for (const id of ESPN.days[d]) for (const r of ESPN.box[id] || []) { if (!(r[3] > 0)) continue; const o = CUR[r[20]] || (CUR[r[20]] = [0, 0, r[0]]); o[0] += ffps(r); o[1]++; o[2] = r[0] }
const START = "2026-10-20", today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
const days = Math.max(0, (Date.parse(today) - Date.parse(START)) / 864e5), wk = Math.max(1, Math.ceil((days + 1) / 7));
let NASC = {}; try { NASC = load("eta-data.js", "NASCITA") } catch (e) {}
const nn = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[.'’]/g, "").replace(/\s+(jr|sr|ii|iii|iv)$/, "").trim();
const NN = {}; for (const k in NASC) NN[nn(k)] = NASC[k];
const ageOf = n => { const b = NN[nn(n)]; if (!b) return null; const d = new Date(b + "T00:00:00Z"), f = new Date("2027-02-01T00:00:00Z"); let a = f.getUTCFullYear() - d.getUTCFullYear(); if (f.getUTCMonth() < d.getUTCMonth() || (f.getUTCMonth() === d.getUTCMonth() && f.getUTCDate() < d.getUTCDate())) a--; return a };
/* formula della lega (G..J = AVG stagione 4°..1°, K..N = partite 4°..1°, N riportata su 82) */
const avg = L => L.length ? L.reduce((a, b) => a + b, 0) / L.length : 0;
function stip(age, G, H, I, J, K, L, M, N) {
  const C = J !== 0 ? (J > 45 && N > 45 ? 1 : 0) : (avg([G, H, I]) > 45 ? 1 : 0);
  const D = I !== 0 ? (I > 45 ? 1 : (avg([G, H, J]) >= 45 ? 1 : 0)) : (avg([G, H, J]) >= 45 ? 1 : 0);
  const E = C + D, F = E >= 2 ? 3 : E === 1 ? 1 : 0;
  const pos = [G, H, I, J].filter(x => x > 0); if (!pos.length) return { s: 4, F };
  const ap = avg(pos), f0 = x => x === 0 ? ap : x;
  const O = [G, H, I, J].reduce((a, x) => a + f0(x), 0);
  const P = O <= 80 ? O * 1.1 : O <= 100 ? O : O <= 120 ? O * .85 : O <= 200 ? O * .8 : O * .9;
  const R = f0(G) * .08 + f0(H) * .1 + f0(I) * .15 + f0(J) * .25, S = (P / 4 + R) / 2.625;
  const kp = [K, L, M, N].filter(x => x > 0), ak = avg(kp), g0 = x => x === 0 ? ak : x;
  const T = kp.length ? g0(N) * .0008 + g0(K) * .001 + g0(L) * .003 + g0(M) * .0035 : 1, Uv = S * T;
  let V = 1; if (age <= 30) { const a20 = [K, L, M, N].filter(x => x >= 20), a30 = [K, L, M, N].filter(x => x >= 30);
    if ([K, L, M, N].some(x => x > 0 && x < 20) && a20.length && avg(a20) > 20) V = 1.1; else if ([K, L, M, N].some(x => x > 0 && x < 30) && a30.length && avg(a30) > 30) V = 1.05 }
  const W = age < 23 ? 1.1 : age <= 31 ? 1 : age <= 37 ? .95 : .85;
  const Y = G + H > 95 && age > 23 ? 1 : 0, Z = I + J > 80 && I + J < 95 ? 1 : I + J > 70 && I + J <= 80 ? .75 : 0;
  const X = ({ 3: .925, 1: .875, 0: .825 })[F] + (Y === 1 ? .25 : ({ 1: .15, 0: .075 })[F] ?? .2) + (Z === 1 && F === 0 ? .1 : Z > 0 && F === 0 ? .025 : 0) + (Uv < 10 && Z > 0 ? .05 : .025);
  const m3 = avg([G, H, I]); let AA;
  if (age > 30 || N <= 65) AA = 1; else if (I === 0) AA = 1; else if (J > m3 + 20) AA = 1.075; else if (J > m3 + 10) AA = 1.05; else if (J > m3 + 5) AA = 1.025;
  else if (H > I && I > J) AA = .95; else if (J < m3 - 10) AA = age <= 25 ? 1 : .85; else AA = 1;
  AA += Math.min(G, H, I, J) > 0 && G < H && H < I && I < J && age <= 30 ? .05 : 0; AA -= N + 17 < avg([K, L, M, N]) ? .05 : 0;
  let AB = 1; if (age <= 30 && N > 50 && I > 0) AB = J > 20 + I ? 1.15 : J > 15 + I ? 1.1 : J > 10 + I ? 1.05 : (J === 0 || I === 0) ? 1 : I > 15 + J ? (age <= 25 ? 1 : .95) : 1;
  const AC = age > 25 ? 1 : (I === 0 && H === 0 && G === 0) ? .75 : (H === 0 && G === 0) ? .85 : G === 0 ? .95 : 1;
  const AD = Math.min(30, Math.max(age >= 24 && Y === 1 ? 10 : 4, Uv * W * X * AA * AB * AC * V));
  const be = (hi, low) => ({ 1: 1, 1.5: hi[0], 1.15: hi[1], 1.1: hi[2], 1.05: hi[3] })[AB] ?? (age <= 25 ? 1 : low);
  const AE = AD > 10 ? be([1.3, 1.15, 1.175, 1.05], .85) : AD > 6 ? be([1.2, 1.15, 1.175, 1.1], .9) : AD > 3.9 ? be([1.4, 1.3, 1.2, 1.15], .95) : 1;
  return { s: Math.round(AD * AE * 10) / 10, F };
}
/* tutti i giocatori visti in una delle 4 stagioni */
const ids = new Set([...Object.keys(CUR), ...Object.keys(PAST["2526"] || {}), ...Object.keys(PAST["2425"] || {}), ...Object.keys(PAST["2324"] || {})]);
const OLD = existsSync(U("stipendi-data.js")) ? (() => { try { return load("stipendi-data.js", "STIP") } catch (e) { return null } })() : null;
const p = {}, z = x => x || 0;
for (const id of ids) {
  /* (50) i free agent aggiornano la richiesta solo dalla 3ª settimana (campione di partite più grande): prima conta solo il passato */
  const c = wk >= 3 ? CUR[id] : null, s2 = (PAST["2526"] || {})[id], s3 = (PAST["2425"] || {})[id], s4 = (PAST["2324"] || {})[id];
  const name = (c || CUR[id] || s2 || s3 || s4)[2], J = c ? Math.round(c[0] / c[1] * 100) / 100 : 0, N = c ? Math.max(4, Math.min(82, c[1] / (0.035 * wk))) : 0;
  let age = ageOf(name); if (age == null) continue; /* senza età la formula non si può fare: si salta (eta.mjs le aggiunge) */
  const r = stip(age, z(s4 && s4[0]), z(s3 && s3[0]), z(s2 && s2[0]), J, z(s4 && s4[1]), z(s3 && s3[1]), z(s2 && s2[1]), N);
  const prev = OLD && OLD.p && OLD.p[name] ? (OLD.wk === wk ? OLD.p[name][6] : OLD.p[name][0]) : null;
  p[name] = [r.s, J, c ? c[1] : 0, z(s2 && s2[0]), z(s3 && s3[0]), z(s4 && s4[0]), prev ?? r.s, r.F, age];
}
const STIP = { upd: new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", dateStyle: "short", timeStyle: "short" }).format(new Date()), wk, p };
writeFileSync(U("stipendi-data.js"), "/* ESPN 16 – stipendi di mercato con la formula della lega, generato da tools/stipendi.mjs. p: nome -> [stipendio, AVG 26/27, partite 26/27, AVG 25/26, AVG 24/25, AVG 23/24, stipendio della settimana prima, stella 0/1/3, età al 1/2/2027] */\nconst STIP=" + JSON.stringify(STIP) + ";\n");
console.log("stipendi:", Object.keys(p).length, "giocatori, settimana", wk);
