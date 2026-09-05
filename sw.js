const CACHE='profitrendszer-pwa-v15';
const SHELL=['./','./index.html','./mobil.html','./app.js?v=15','./markets.js?v=15','./ui.js?v=15','./style.css?v=15','./manifest.webmanifest?v=15','./ikon.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);

  if(url.pathname.includes('/data/')){
    event.respondWith((async()=>{
      try{
        const response=await fetch(event.request,{cache:'no-store'});
        if(response&&response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});
        }
        return response;
      }catch(_){
        const hit=await caches.match(event.request);
        if(hit) return hit;
        return new Response(JSON.stringify({hiba:true,uzenet:'Az adatforrás átmenetileg nem érhető el.'}),{status:503,headers:{'Content-Type':'application/json; charset=utf-8'}});
      }
    })());
    return;
  }

  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
      if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});}return response;
    }).catch(async()=>await caches.match('./mobil.html')||await caches.match('./index.html')));
    return;
  }

  event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
    if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});}return response;
  }).catch(()=>caches.match(event.request)));
});