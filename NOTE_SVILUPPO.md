# ESPN 16 – note di sviluppo

(1) 10/11/2026 – Prima versione. App a parte (base grafica Dreamers), file unico index.html.
- Squadre: 16 (8 East, 8 West) in TEAMS, loghi ritagliati dagli screenshot ESPN in loghi/. Nomi tagliati da completare: Cleveland Cadav…, Albuquerque Blu….
- Dati: tools/espn.mjs scarica da ESPN (scoreboard + summary) i tabellini di ogni notte dal 20/10/2026 e scrive espn-data.js; tecnici e flagranti contati dalla cronaca (esclusi tiri liberi e difensivo 3 secondi; doppio tecnico = uno a testa). GitHub Action .github/workflows/espn.yml lo lancia da sola.
- Punti FFPS: funzione ffps() in index.html (unico posto con la formula). Verificata con l'esempio del regolamento (44).
- Home: East a sinistra, West a destra, finestra della notte al centro con tutti i giocatori in ordine di FFPS.
- Lega: classifica per conference, scontri diretti (in attesa del calendario ESPN), playoff provvisori con regole Dreamers per conference.
- Statistiche: tutti i giocatori NBA, FFPS per partita e totali, filtri stagione/7 notti/ultima notte, squadra NBA, minuti.
- sw.js: prima la rete, cache solo offline; cambiare V a ogni pubblicazione.

(2) 10/11/2026 – Rose delle 16 squadre e record (V-P) inseriti dagli screenshot ESPN (ROSE, REC in index.html). Scheda squadra con titolari/panchina/IR, media FFPS, partite, minuti, ultima partita. Da confermare: J. Williams OKC dei New York pandas (messo Jalen), J. Quaintance dei Santa Rosa.

(3) 10/11/2026 – Salary cap e scelte dal file della lega (FantaBasket_USA_2palle.pdf): cap-data.js generato con tools/cap_pdf.py + tools/cap_gen.py. Cap 190. Scheda squadra con schede ROSA / SALARY CAP / SCELTE; nuova pagina CAP & SCELTE con tutte le squadre per conference. Nel PDF: Seattle Sonics = Fallon Mavericks, Toronto Huskies = Quebec Ducks. Totali del PDF da verificare: Las Vegas (somma 165,0, foglio 157,8) e Alaska (somma 169,4, foglio 158,4).
