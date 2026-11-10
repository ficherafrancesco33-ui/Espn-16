# ESPN 16 – genera listino-data.js dal foglio «Listone Dunkest» del file della lega (2palle.xlsx).
# Uso: python3 -I tools/listino.py <file.xlsx>   (dalla cartella dell app)
# LISTINO: nome → [prezzo Cr, rookie 1/0, ruolo (Guard/Forward/Center), squadra NBA, libero 1 / a roster 0]
import sys,json,openpyxl
wb=openpyxl.load_workbook(sys.argv[1],data_only=True);ws=wb['Listone Dunkest'];L={}
for r in ws.iter_rows(min_row=2,values_only=True):
  if not r[0] or r[5] is None:continue
  n=str(r[0]).strip();L[n]=[float(r[5]),1 if r[9]=='rookie' else 0,r[3] or '',r[4] or '',1 if r[8]=='Libero' else 0]
open('listino-data.js','w').write('/* ESPN 16 – listino prezzi dei giocatori (foglio «Listone Dunkest» del file della lega), generato da tools/listino.py.\n   nome → [prezzo Cr, rookie 1/0, ruolo, squadra NBA, libero 1 / a roster 0]. Prezzo = costo per firmare uno svincolato (all anno, ipotesi). */\nconst LISTINO='+json.dumps(L,ensure_ascii=False,separators=(',',':'))+';\n')
print(len(L),sum(v[4] for v in L.values()))
