const CACHE='profitrendszer-pwa-v2';
const SHELL=['./mobil.html','./manifest.webmanifest','./ikon.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>cache.addAll(SHELL))
      .then(()=>self.skipWaiting())
  );
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

  // A PAPER- és sportágadatok soha nem szolgálhatók ki régi cache-ből.
  if(url.pathname.includes('/data/')){
    event.respondWith(fetch(event.request,{cache:'no-store'}));
    return;
  }

  // Az alkalmazás váza hálózat-első, offline esetben a legutóbbi app-shell.
  event.respondWith(
    fetch(event.request,{cache:'no-store'})
      .then(response=>{
        if(response && response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});
        }
        return response;
      })
      .catch(async()=>{
        const hit=await caches.match(event.request);
        return hit || caches.match('./mobil.html');
      })
  );
});
