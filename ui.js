document.addEventListener('DOMContentLoaded',()=>{
  if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').catch(()=>{});}

  const allTabs=[...document.querySelectorAll('.tabs button')];
  allTabs.forEach(b=>b.addEventListener('click',()=>{
    allTabs.forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('main>section').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    const target=document.getElementById(b.dataset.tab);if(target)target.classList.add('active');
    history.replaceState(null,'','#'+b.dataset.tab);
  }));
  const hash=location.hash.replace('#','');
  if(hash){const b=document.querySelector(`.tabs button[data-tab="${hash}"]`);if(b)b.click();}

  const observe=()=>{
    const status=document.getElementById('statusz');
    const dot=document.getElementById('rendszerjelzo');
    const hero=document.getElementById('foallapot');
    if(status&&dot&&hero){
      const txt=(status.textContent||'').trim();
      const bad=status.classList.contains('bad')||/HIBA|BLOKK|ELTÉR/i.test(txt);
      dot.style.color=bad?'var(--bad)':'var(--ok)';
      hero.className='card notice '+(bad?'bad':'ok');
      hero.textContent=bad?'A rendszer hibát vagy blokkolást jelez. Nézd meg a Rendszer fület.':'A rendszer fut. Az aktív PAPER tétek és sportágállapotok automatikusan frissülnek.';
    }
    document.querySelectorAll('#sportlista48 details').forEach(d=>{
      d.classList.add('sportrow');
      const t=(d.textContent||'').toUpperCase();
      d.dataset.filter=t.includes('PAPER-IG BIZONYÍTVA')||t.includes('PAPER OK')?'paper':t.includes('MODELL BIZONYÍTVA')||t.includes('MODELL OK')?'modell':t.includes('HIÁNY')?'hiany':t.includes('ODDS')&&t.includes('VÁR')?'odds':'all';
    });
  };
  new MutationObserver(observe).observe(document.body,{subtree:true,childList:true,characterData:true});
  setTimeout(observe,500);

  document.querySelectorAll('.sportfilters button').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('.sportfilters button').forEach(x=>x.classList.remove('active'));b.classList.add('active');
    const f=b.dataset.filter;
    document.querySelectorAll('#sportlista48 .sportrow').forEach(r=>{r.classList.toggle('hidden',f!=='all'&&r.dataset.filter!==f)});
  }));
});
