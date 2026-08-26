const CACHE='profitrendszer-pwa-v1';
const SHELL=['./','./index.html','./style.css','./app.js','./ui.js','./manifest.webmanifest'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);

  // A ProfitRendszer adatai mindig hálózatról frissüljenek. Ha nincs internet,
  // az alkalmazás váza továbbra is megnyitható marad.
  if(url.pathname.includes('/data/')){
    event.respondWith(fetch(event.request,{cache:'no-store'}));
    return;
  }

  event.respondWith(
    fetch(event.request,{cache:'no-store'})
      .then(response=>{
        if(response && response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});
        }
        return response;
      })
      .catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html')))
  );
});
