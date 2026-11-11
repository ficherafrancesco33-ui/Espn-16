/* ESPN 16 – service worker: prima la rete (dati sempre freschi), la cache solo se si è offline. Cambia V a ogni pubblicazione. */
const V="espn16-v104";
self.addEventListener("install",e=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(K=>Promise.all(K.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!=="GET"||u.origin!==location.origin)return;
 /* (97) immagini, font, suoni e motore 3D (non cambiano: hanno ?v= nel nome quando cambiano): prima la copia salvata, aggiornata in sottofondo.
    Tutto il resto (pagine, codice, dati): rete con verifica veloce (cache:"no-cache" = se il file non è cambiato il server risponde 304, senza riscaricarlo), copia salvata solo offline. */
 const fisso=/\/(loghi|img|aud|vendor)\/|\.(webp|png|jpg|jpeg|svg|woff2?|ttf|mp3)$/i.test(u.pathname);
 if(fisso){e.respondWith(caches.open(V).then(x=>x.match(e.request).then(m=>{const n=fetch(e.request).then(r=>{if(r.ok)x.put(e.request,r.clone());return r}).catch(()=>m);return m||n})));return}
 e.respondWith(fetch(e.request,{cache:"no-cache"}).then(r=>{const c=r.clone();if(r.ok)caches.open(V).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)))});
