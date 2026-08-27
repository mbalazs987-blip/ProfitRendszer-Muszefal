document.addEventListener('DOMContentLoaded',()=>{
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js').then(reg=>reg.update()).catch(()=>{});
  }

  const tabs=[...document.querySelectorAll('.tabs button')];
  tabs.forEach(b=>b.addEventListener('click',()=>{
    tabs.forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('main>section').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    const target=document.getElementById(b.dataset.tab);
    if(target) target.classList.add('active');
  }));

  const updateStatus=()=>{
    const status=document.getElementById('statusz');
    const dot=document.getElementById('rendszerjelzo');
    const hero=document.getElementById('foallapot');
    if(!status||!dot||!hero) return;
    const txt=(status.textContent||'').trim();
    const bad=status.classList.contains('bad')||/HIBA|BLOKK|ELTÉR/i.test(txt);
    const newText=bad
      ?'A rendszer hibát jelez. A részletek a Rendszer fülön láthatók.'
      :'A rendszer működik, az adatok betöltődtek.';
    const newClass='card notice '+(bad?'bad':'ok');
    const newColor=bad?'var(--bad)':'var(--ok)';
    if(hero.textContent!==newText) hero.textContent=newText;
    if(hero.className!==newClass) hero.className=newClass;
    if(dot.style.color!==newColor) dot.style.color=newColor;
  };

  setTimeout(updateStatus,500);
  setInterval(updateStatus,5000);
});
