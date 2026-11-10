/* ===== ESPN 16 – STORICO TRADE (come «Trade Alert · Operazioni chiuse» di Dreamers) =====
   TRADES: una riga per operazione, la più recente in cima: {data:"gg/mm/aaaa",ora:"hh:mm",titolo:"Scambio",lati:[["QUE",["Giocatore","Scelta 1° giro 2027"]],["HOU",[...]]]}
   (ogni lato = squadra e ciò che RICEVE). Si aggiunge quando un GM manda lo scambio con «Copia per Claude» del Pic-Trade. */
const TRADES=[];
(function(){
const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const sur=n=>{const p=String(n).replace(/\s+(Jr\.?|II|III|IV)$/i,"").split(" ");return p.length>1?p.slice(1).join(" "):p[0]};
const wedge=t=>`<span class="wedge" style="--tc:${TCOL[t]}"><span class="badge logo lg-${t}"></span></span>`;
function vStorico(){
 const cell=x=>x&&TM[x[0]]?`<div class="tc">${wedge(x[0])}<div class="tct"><small>${e(TM[x[0]].nome.split(" ").slice(-1)[0])}</small><div class="trc"><div>${x[1].map(n=>`<span${OWNH&&OWNH[__ownKey(n)]!==undefined||VAL.p[n]?"":` class="tcr2"`}>${e(VAL.p[n]?sur(n):n)}</span>`).join("")}</div></div></div></div>`:`<div class="tc"></div>`;
 const rows=TRADES.map(x=>`<div class="tr3"><div class="tty3"><span>${e(x.titolo||"Scambio")}${x.data?" "+x.data.slice(0,5):""}</span></div>${cell(x.lati[0])}${cell(x.lati[1])}</div>`).join("");
 return `<button class="gback" data-go="home">‹ Home</button><h2><span class="t"><span>Trade Alert</span></span><em>Operazioni chiuse</em></h2>`+
  (rows?`<div class="tbl-wrap ttab">${rows}</div>`:`<p class="note">Nessuno scambio registrato finora. Quando due GM chiudono uno scambio, lo preparano nel Pic-Trade e con «Copia per Claude» lo mandano: comparirà qui, con data e squadre.</p>`)}
window.SCAMBIV=window.SCAMBIV||{};SCAMBIV.storico=vStorico;
})();
