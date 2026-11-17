const {chromium}=require('playwright');const fs=require('fs');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:430,height:1400}});p.on('pageerror',e=>{});
await p.goto('http://localhost:8766/index.html');await p.waitForTimeout(1500);
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('dl_pq_uff','1');localStorage.setItem('dl_team','DOL');localStorage.setItem('dl_set',JSON.stringify({th:"cyber"}))});await p.reload();await p.waitForTimeout(3500);
await p.evaluate(()=>{window.__KEEP=new Set();window.__ALL=[];
 const walk=(list,path)=>{[...list].forEach((r,i)=>{const id=path+'.'+i;if((r instanceof CSSMediaRule||r instanceof CSSSupportsRule))walk(r.cssRules,id);else __ALL.push([id,r])})};
 [...document.styleSheets].forEach((s,i)=>{try{walk(s.cssRules,'s'+i)}catch(e){}});
 window.__scan=()=>{for(const [id,r] of __ALL){if(__KEEP.has(id))continue;if(!(r instanceof CSSStyleRule)){continue}
   const parts=r.selectorText.split(/,(?![^(]*\))/);for(let q of parts){q=q.replace(/::?(before|after|placeholder|-webkit-[\w-]+|selection|marker|backdrop)\b/g,'').replace(/:(hover|active|focus|focus-visible|focus-within|visited|link|checked|disabled|first-letter|first-line)\b/g,'').trim();if(!q||/^[>+~]/.test(q))q='*';try{if(document.querySelector(q)){__KEEP.add(id);break}}catch(e){}}}return __KEEP.size}});
const views=await p.evaluate(()=>Object.keys(VIEWS));
for(const v of views){for(const t of ["DUC","DOL"]){try{await p.evaluate(([v,t])=>{cur=v;curTeam=t;try{render()}catch(e){}},[v,t]);await p.waitForTimeout(350);await p.evaluate(()=>__scan())}catch(e){}}}
for(const tab of ["turno","cal","class","po"]){try{await p.evaluate(tab=>{cur="giochi";GAME="dream";DR.tab=tab;render()},tab);await p.waitForTimeout(500);await p.evaluate(()=>__scan())}catch(e){}}
const n=await p.evaluate(()=>__scan());console.log('kept',n);
/* serialize in order, keeping media/supports wrappers */
const css=await p.evaluate(()=>{const out=[];const ser=(list,path)=>{let s="";[...list].forEach((r,i)=>{const id=path+'.'+i;
  if(r instanceof CSSKeyframesRule||r instanceof CSSFontFaceRule){s+=r.cssText+"\n";return}
  if(r instanceof CSSMediaRule||r instanceof CSSSupportsRule){const inner=ser(r.cssRules,id);if(inner){const head=r.cssText.slice(0,r.cssText.indexOf('{'));s+=head+"{\n"+inner+"}\n"}return}
  if(__KEEP.has(id))s+=r.cssText+"\n"});return s};
  let s="";[...document.styleSheets].forEach((sh,i)=>{try{s+=ser(sh.cssRules,'s'+i)}catch(e){}});return s});
fs.writeFileSync('/tmp/claude-0/ext/raw.css',css);
const vars={};for(const th of ["oro","cyber"]){vars[th]=await p.evaluate(th=>{DLS.th=th;CNT=false;dlsApply();return document.documentElement.getAttribute('style')},th)}
fs.writeFileSync('/tmp/claude-0/ext/vars.json',JSON.stringify(vars));console.log(css.length);await b.close()})();
