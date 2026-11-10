import pdfplumber,json,re
P=pdfplumber.open('/root/.claude/uploads/d871a373-8600-5d53-bde7-73bb5b51caf2/4aa0ebd2-FantaBasket_USA_2palle.pdf')
STARTS=('Seattle','Cancun','Cancùn','Santa','Las','Cleveland','Toronto','Honolulu','Wichita','Alaska','Charlotte','Detroit','Albuquerque','Houston','New','Boston','Milwaukee','Quebec','Fallon')
out={}
for n in range(16):
    pg=P.pages[n];W=pg.extract_words(x_tolerance=1.5,y_tolerance=1.5)
    team=pg.extract_text().split('\n')[0].strip()
    yrs=[w for w in W if w['text'] in ('2027','2028','2029','2030','2031') and w['top']<min(x['top'] for x in W if x['text']=='1')+3]
    yrs.sort(key=lambda w:w['x0']);ycx=[(w['x0']+w['x1'])/2 for w in yrs];ytop=yrs[0]['top']
    left=yrs[0]['x0']-(ycx[1]-ycx[0])/2
    # righe
    lines={}
    for w in W:
        k=round(w['top']/1.6);lines.setdefault(k,[]).append(w)
    rows=sorted(lines.items())
    # giocatori: parte sinistra
    pl=[];tot={}
    for k,ws in rows:
        L=sorted([w for w in ws if w['x1']<left-2],key=lambda w:w['x0']);
        if not L: continue
        t=' '.join(w['text'] for w in L)
        m=re.match(r'^(\d{1,2}) (.+?)((?: [\d,]+)*)( R)?$',t)
        if m and 1<=int(m.group(1))<=20:
            nums=[float(x.replace(',','.')) for x in m.group(3).split()]
            pl.append({'n':m.group(2).strip(),'c':nums,'r':bool(m.group(4))});continue
        for key in ('TOTALE OCCUPATO TAGLI','TOTALE OCCUPATO','TOTALE LIBERO'):
            if t.startswith(key):
                tot[key]=[float(x.replace(',','.')) for x in t[len(key):].split()];break
    # scelte: ogni scelta inizia con il nome di una squadra; l anno è quello scritto nel testo, altrimenti la colonna
    NM=[x.split() for x in ["Seattle Sonics","Cancun Mayans","Santa Rosa Pirates","Las Vegas Aliens","Cleveland Cadavers","Toronto Huskies","Honolulu Monk Seal","Honolulu MonkSeal","Wichita Aviators","Alaska Whales","Alaska Wales","Charlotte Cougars","Detroit Pythons","Albuquerque Bluesky","Albuquerque BlueSky","Houston Orange Lions","New York Samb","New York Pandas","Boston Teabags","Mayans","BlueSky","Orange Lions"]]
    picks=[]  # [x, testo]
    for k,ws in rows:
        R=sorted([w for w in ws if w['x0']>=left-2 and w['top']>ytop+2 and w['text']!='SCELTE'],key=lambda w:w['x0'])
        if not R: continue
        T=[w['text'] for w in R];st=[]
        q=0
        while q<len(T):
            hit=None
            for nm in NM:
                if T[q:q+len(nm)]==nm and (len(nm)>1 or q==0 or T[q-1] not in ('Cancun','Albuquerque','Houston')) and q+len(nm)<len(T) and T[q+len(nm)].lower() in ('scelta','3°','2°','1°'):
                    hit=nm;break
            if hit: st.append(q);q+=len(hit)
            else: q+=1
        if not st or st[0]>0:
            # inizio riga senza squadra: continua la scelta più vicina (stessa colonna) della riga sopra
            e=st[0] if st else len(T);cx=(R[0]['x0']+R[e-1]['x1'])/2
            if picks:
                b=min(range(len(picks)),key=lambda z:abs(picks[z][0]-cx)+(0 if z>=len(picks)-6 else 999));picks[b][1]+=' '+' '.join(T[:e])
        for a,b in zip(st,st[1:]+[len(T)]):
            picks.append([(R[a]['x0']+R[b-1]['x1'])/2,' '.join(T[a:b])])
    P2={y['text']:[] for y in yrs}
    for cx,t in picks:
        m=re.search(r'20(2[7-9]|3[01])',t)
        y=('20'+m.group(1)) if m else yrs[min(range(len(ycx)),key=lambda j:abs(ycx[j]-cx))]['text']
        P2[y].append(t)
    picks=P2
    out[team]={'pl':pl,'tot':tot,'picks':picks}
json.dump(out,open('fb/fb.json','w'),ensure_ascii=False,indent=1)
for t,v in out.items():
    s=sum(p['c'][0] for p in v['pl'] if p['c'])
    print(t,len(v['pl']),round(s,1),v['tot'].get('TOTALE OCCUPATO'),v['tot'].get('TOTALE OCCUPATO TAGLI'),v['tot'].get('TOTALE LIBERO'),{y:len(x) for y,x in v['picks'].items()})

# giocatori dal testo impaginato (più affidabile): pdftotext -layout, una pagina per volta
import subprocess
for n,team in enumerate(list(out)):
    txt=subprocess.run(['pdftotext','-layout','-f',str(n+1),'-l',str(n+1),'/root/.claude/uploads/d871a373-8600-5d53-bde7-73bb5b51caf2/4aa0ebd2-FantaBasket_USA_2palle.pdf','-'],capture_output=True,text=True).stdout
    pl=[];tot={}
    for ln in txt.split('\n'):
        m=re.match(r'^\s*(\d{1,2})\s+(\S.*?\S)\s{2,}([\d,]+(?:\s+[\d,]+)*)(\s+R)?(\s{2,}|$)',ln)
        if m and int(m.group(1))<=20:
            pl.append({'n':m.group(2),'c':[v for v in (float(x.replace(',','.')) for x in m.group(3).split()) if v<100][:5],'r':bool(m.group(4)) or bool(re.search(r'\s R(\s|$)',ln[:120]))});continue  # niente anni del draft (2027…) presi dall intestazione delle scelte
        for key in ('TOTALE OCCUPATO TAGLI','TOTALE OCCUPATO','TOTALE LIBERO'):
            s=ln.strip()
            if s.startswith(key):
                tot[key]=[float(x.replace(',','.')) for x in re.findall(r'[\d,]+',s[len(key):s.find('  ',len(key)+12) if False else None])[:5]];break
    out[team]['pl']=pl;out[team]['tot']=tot
json.dump(out,open('fb/fb.json','w'),ensure_ascii=False,indent=1)
print('----')
for t,v in out.items():
    s=sum(p['c'][0] for p in v['pl'] if p['c'])
    print(t,len(v['pl']),round(s,1),v['tot'].get('TOTALE OCCUPATO'),v['tot'].get('TOTALE OCCUPATO TAGLI'),v['tot'].get('TOTALE LIBERO'))
