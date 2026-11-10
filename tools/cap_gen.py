import json,re
d=json.load(open('fb/fb.json'))
MAP={'Seattle Sonics':'FAL','Cancun Mayans':'CAN','Santa Rosa Pirates':'SRO','Las Vegas Aliens':'LVA','Cleveland Cadavers':'CLE','Toronto Huskies':'QUE','Honolulu Monk Seal':'HON','Wichita Aviators':'WIC','Alaska Whales':'ALA','Charlotte Cougars':'CHA','Detroit Pythons':'DET','Albuquerque Bluesky':'ALB','Houston Orange Lions':'HOU','New York Samb':'NYS','New York Pandas':'NYP','Boston Teabags':'BOS'}
PRE=[('Honolulu MonkSeal','HON'),('Honolulu Monk Seal','HON'),('Alaska Wales','ALA'),('Albuquerque BlueSky','ALB'),('BlueSky','ALB'),('Orange Lions','HOU'),('Mayans','CAN')]+[(k,v) for k,v in MAP.items()]
PRE.sort(key=lambda x:-len(x[0]))
out={}
for team,v in d.items():
    T=MAP[team]
    pk=[]
    for y,L in v['picks'].items():
        for t in L:
            o=None
            for nm,id in PRE:
                if t.startswith(nm): o=id;t=t[len(nm):].strip();break
            m=re.search(r'(\d)°?\s*(?:GIRO|giro|Giro|SCELTA)',t) or re.search(r'SCELTA (\d)',t)
            r=1 if re.search(r'primo giro',t,re.I) else int(m.group(1)) if m else 0
            note=re.sub(r'^(SCELTA|scelta)\s*','',t)
            note=re.sub(r'^\d°?\s*(GIRO|giro|Giro|SCELTA)\s*','',note)
            note=re.sub(r'^primo giro\s*','',note,flags=re.I)
            note=re.sub(r'\b20(2[7-9]|3[01])\b','',note).strip(' -,')
            note=re.sub(r'\s+',' ',note)
            pk.append([int(y),r,o,note])
    pk.sort(key=lambda x:(x[0],x[1],x[2]!=T))
    out[T]={'nome_pdf':team,'pl':[[p['n'],p['c'],1 if p['r'] else 0] for p in v['pl']],
            'occ':v['tot'].get('TOTALE OCCUPATO',[]),'tagli':(v['tot'].get('TOTALE OCCUPATO TAGLI') or [0])[0],'libero':(v['tot'].get('TOTALE LIBERO') or [None])[0],'pk':pk}
json.dump(out,open('fb/cap.json','w'),ensure_ascii=False)
for T,v in out.items():
    print(T, v['occ'][:1], v['tagli'], v['libero'], [ (p[0],p[1],p[2],p[3]) for p in v['pk'] if p[3]][:4])
