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

  let kivalasztottSport='__mind__';
  let sportNevek=new Map();

  const sportSzuroAlkalmaz=()=>{
    const lista=document.getElementById('sportlista48');
    if(!lista) return;
    const cel=sportNevek.get(kivalasztottSport)||'';
    [...lista.querySelectorAll('details')].forEach(elem=>{
      if(kivalasztottSport==='__mind__'){
        elem.style.display='';
        return;
      }
      const osszefoglalo=elem.querySelector('summary');
      const szoveg=(osszefoglalo?.textContent||'').trim();
      elem.style.display=szoveg.startsWith(cel+' —')?'':'none';
    });
  };

  const sportValasztoLetrehoz=async()=>{
    const sportSzekcio=document.getElementById('sportok');
    const lista=document.getElementById('sportlista48');
    if(!sportSzekcio||!lista) return;
    let adat;
    try{
      const r=await fetch('data/sportagok.json?t='+Date.now(),{cache:'no-store'});
      if(!r.ok) throw new Error('sportagok HTTP '+r.status);
      adat=await r.json();
    }catch(_){return;}
    const sportagak=Array.isArray(adat.sportagak)?adat.sportagak.filter(x=>x&&x.sportag):[];
    if(!sportagak.length) return;
    sportNevek=new Map(sportagak.map(x=>[String(x.sportag),typeof sport==='function'?sport(x.sportag):String(x.sportag).replaceAll('_',' ')]));

    let blokk=document.getElementById('sportvalaszto-blokk');
    if(!blokk){
      blokk=document.createElement('div');
      blokk.id='sportvalaszto-blokk';
      blokk.className='card spaced';
      blokk.innerHTML='<label for="sportvalaszto"><b>Sportág kiválasztása</b></label><select id="sportvalaszto" style="width:100%;margin-top:10px;padding:12px;border-radius:10px;font-size:16px"><option value="__mind__">Mind a 48 sportág</option></select><p class="muted mini" id="sportvalaszto-info"></p>';
      lista.parentElement.insertBefore(blokk,lista);
      blokk.querySelector('#sportvalaszto').addEventListener('change',e=>{
        kivalasztottSport=e.target.value;
        sportSzuroAlkalmaz();
      });
    }
    const select=blokk.querySelector('#sportvalaszto');
    const jelenlegi=select.value;
    select.innerHTML='<option value="__mind__">Mind a 48 sportág</option>'+sportagak
      .slice()
      .sort((a,b)=>(sportNevek.get(String(a.sportag))||'').localeCompare(sportNevek.get(String(b.sportag))||'','hu'))
      .map(x=>`<option value="${String(x.sportag)}">${sportNevek.get(String(x.sportag))}</option>`).join('');
    select.value=[...select.options].some(o=>o.value===jelenlegi)?jelenlegi:'__mind__';
    kivalasztottSport=select.value;
    const info=blokk.querySelector('#sportvalaszto-info');
    if(info) info.textContent=`${sportagak.length} / 48 sportág választható.`;
    sportSzuroAlkalmaz();

    const figyelo=new MutationObserver(()=>sportSzuroAlkalmaz());
    figyelo.observe(lista,{childList:true,subtree:false});
  };

  const eloAdatKartyaLetrehoz=()=>{
    const grid=document.querySelector('#attekintes .grid.stats');
    if(!grid||document.getElementById('eloadatdb')) return;
    const card=document.createElement('div');
    card.className='card';
    card.innerHTML='<div class="muted">Élő sportadat-megfigyelések</div><div class="value" id="eloadatdb">–</div><p class="muted mini" id="eloadatido">betöltés…</p>';
    grid.appendChild(card);
  };

  const eloAdatFrissit=async()=>{
    eloAdatKartyaLetrehoz();
    const szamlalo=document.getElementById('eloadatdb');
    const ido=document.getElementById('eloadatido');
    if(!szamlalo||!ido) return;
    try{
      const r=await fetch('data/sportagok.json?t='+Date.now(),{cache:'no-store'});
      if(!r.ok) throw new Error('sportagok HTTP '+r.status);
      const adat=await r.json();
      const rows=Array.isArray(adat.sportagak)?adat.sportagak:[];
      const osszes=rows.reduce((n,x)=>n+(Number(x?.sportadat)||0),0);
      const sportDb=rows.filter(x=>(Number(x?.sportadat)||0)>0).length;
      szamlalo.textContent=String(osszes);
      ido.textContent=`${sportDb} sportág • ellenőrizve: ${new Date().toLocaleTimeString('hu-HU',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}`;
    }catch(_){
      ido.textContent='élő adat lekérése sikertelen';
    }
  };

  setTimeout(updateStatus,500);
  setInterval(updateStatus,5000);
  setTimeout(sportValasztoLetrehoz,700);
  setTimeout(eloAdatFrissit,900);
  setInterval(eloAdatFrissit,60000);
});
