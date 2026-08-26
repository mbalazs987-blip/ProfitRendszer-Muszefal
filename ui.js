document.addEventListener('DOMContentLoaded',()=>{
  let deferredInstall=null;

  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js').then(reg=>reg.update()).catch(()=>{});
  }

  const top=document.querySelector('.topbar');
  if(top){
    const box=document.createElement('div');
    box.style.cssText='display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end';

    const net=document.createElement('span');
    net.className='pill';
    const paintNet=()=>{
      net.textContent=navigator.onLine?'● ONLINE':'● OFFLINE';
      net.style.color=navigator.onLine?'var(--ok)':'var(--warn)';
    };
    paintNet();
    window.addEventListener('online',paintNet);
    window.addEventListener('offline',paintNet);
    box.appendChild(net);

    const install=document.createElement('button');
    install.textContent='Telepítés';
    install.style.display='none';
    install.addEventListener('click',async()=>{
      if(!deferredInstall) return;
      deferredInstall.prompt();
      await deferredInstall.userChoice.catch(()=>null);
      deferredInstall=null;
      install.style.display='none';
    });
    box.appendChild(install);
    top.appendChild(box);

    window.addEventListener('beforeinstallprompt',event=>{
      event.preventDefault();
      deferredInstall=event;
      install.style.display='inline-block';
    });
    window.addEventListener('appinstalled',()=>{
      deferredInstall=null;
      install.style.display='none';
    });
  }

  const allTabs=[...document.querySelectorAll('.tabs button')];
  allTabs.forEach(b=>b.addEventListener('click',()=>{
    allTabs.forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('main>section').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    const target=document.getElementById(b.dataset.tab);
    if(target) target.classList.add('active');
    history.replaceState(null,'','#'+b.dataset.tab);
  }));

  const hash=location.hash.replace('#','');
  if(hash){
    const b=document.querySelector(`.tabs button[data-tab="${hash}"]`);
    if(b) b.click();
  }

  const observe=()=>{
    const status=document.getElementById('statusz');
    const dot=document.getElementById('rendszerjelzo');
    const hero=document.getElementById('foallapot');
    if(status&&dot&&hero){
      const txt=(status.textContent||'').trim();
      const bad=status.classList.contains('bad')||/HIBA|BLOKK|ELTÉR/i.test(txt);
      dot.style.color=bad?'var(--bad)':'var(--ok)';
      hero.className='card notice '+(bad?'bad':'ok');
      hero.textContent=bad
        ?'A rendszer hibát vagy blokkolást jelez. Nézd meg a Rendszer fület.'
        :'A rendszer fut. Internetkapcsolat esetén az adatok automatikusan frissülnek.';
    }

    document.querySelectorAll('#sportlista48 details').forEach(d=>{
      d.classList.add('sportrow');
      const t=(d.textContent||'').toUpperCase();
      d.dataset.filter=t.includes('PAPER-IG BIZONYÍTVA')||t.includes('PAPER OK')?'paper':
        t.includes('MODELL BIZONYÍTVA')||t.includes('MODELL OK')?'modell':
        t.includes('HIÁNY')?'hiany':
        t.includes('ODDS')&&t.includes('VÁR')?'odds':'all';
    });
  };

  new MutationObserver(observe).observe(document.body,{subtree:true,childList:true,characterData:true});
  setTimeout(observe,300);

  document.querySelectorAll('.sportfilters button').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('.sportfilters button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    const f=b.dataset.filter;
    document.querySelectorAll('#sportlista48 .sportrow').forEach(r=>{
      r.classList.toggle('hidden',f!=='all'&&r.dataset.filter!==f);
    });
  }));
});
