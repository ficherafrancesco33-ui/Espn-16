import re
src=open('raw.css').read()
P='html.e16x:not(#e1):not(#e2)'
def split_top(s):
  out=[];i=0;n=len(s)
  while i<n:
    while i<n and s[i] in ' \n\t':i+=1
    if i>=n:break
    j=s.find('{',i);head=s[i:j].strip();d=0;k=j
    while True:
      if s[k]=='{':d+=1
      elif s[k]=='}':
        d-=1
        if d==0:break
      k+=1
    out.append((head,s[j+1:k]));i=k+1
  return out
def fixsel(sel):
  parts=re.split(r',(?![^(]*\))',sel);res=[]
  for q in parts:
    q=q.strip()
    q=re.sub(r':not\(\s*\.notte\s*\)','',q)
    q=re.sub(r'^:root',"html",q)
    if q.startswith('html'):
      m=re.match(r'html([^\s>+~]*)(.*)$',q,re.S);q=P+m.group(1)+m.group(2)
    else:q=P+' '+q
    res.append(q)
  return ', '.join(res)
def proc(css):
  o=[]
  for head,body in split_top(css):
    if head.startswith('@keyframes') or head.startswith('@font-face') or head.startswith('@-webkit-keyframes'):o.append(head+'{'+body+'}')
    elif head.startswith('@'):o.append(head+'{'+proc(body)+'}')
    elif re.search(r'\.(hmp|lvh|lvx|lvs|bxs|hmscroll|hmnn4|hmnv|hmnt|hso|mnb|gv|gb)\b',head):continue
    else:o.append(fixsel(head)+'{'+body+'}')
  return '\n'.join(o)
out='/* ESPN 16 – (131) stile scuro di Dreamers (Carbone e oro / Cyber), regole estratte dalle sue pagine con lo stile Cyber attivo; valgono solo con html.e16x. Rigenerare con lo script in scratchpad, non modificare a mano. */\n'+proc(src)
open('/home/user/espn-16/skin-scuro.css','w').write(out);print(len(out))
