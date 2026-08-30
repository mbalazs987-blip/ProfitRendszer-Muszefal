const piacCimke=p=>({moneyline:'Győztes',h2h:'Győztes','1x2':'1X2',one_x_two:'1X2',match_winner:'Győztes',spread:'Hendikep',handicap:'Hendikep',asian_handicap:'Ázsiai hendikep',runline:'Run line',puckline:'Puck line',total:'Összes gól/pont',team_total:'Csapat gól/pont',draw_no_bet:'Döntetlennél tét vissza',double_chance:'Kétesély',both_teams_to_score:'Mindkét csapat szerez gólt',corners_total:'Összes szöglet',team_corners:'Csapat szögletei',corner_handicap:'Szöglethendikep',cards_total:'Összes lap',team_cards:'Csapat lapjai',player_goal:'Játékos gólt szerez',player_goals:'Játékos gólok',player_shots:'Játékos lövések',player_shots_on_target:'Kaput eltaláló lövések',player_points:'Játékos pontok',player_assists:'Játékos gólpasszok',player_rebounds:'Játékos lepattanók',sets_handicap:'Szetthendikep',games_handicap:'Gémhendikep',total_games:'Összes gém',total_sets:'Összes szett',total_points:'Összes pont',total_runs:'Összes futás',outright:'Végső győztes',race_winner:'Futamgyőztes',event_winner:'Versenyszám győztese'})[p]||String(p||'–').replaceAll('_',' ');
const htmlEsc=s=>String(s??'–').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nfmt=(x,d=1)=>Number.isFinite(+x)?(+x).toFixed(d):'–';
const pp=x=>Number.isFinite(+x)?(+x*100).toFixed(1)+'%':'–';
const evfmt=x=>Number.isFinite(+x)?((+x>=0?'+':'')+(+x).toFixed(1)+'%'):'–';

function ajanlasKartya(x,i){
  const cim=x.esemeny_nev||x.meccs||((x.hazai&&x.vendeg)?`${x.hazai} – ${x.vendeg}`:'–');
  const ok=x.ajanlhato!==false;
  const okClass=ok?'ok':'bad';
  const allapot=ok?'AJÁNLHATÓ':'KIZÁRVA';
  return `<article class="bet"><span class="rank">#${i+1}</span><span class="pill">${htmlEsc(typeof sport==='function'?sport(x.sportag):x.sportag)}</span><span class="pill">${htmlEsc(piacCimke(x.piac))}</span><h3>${htmlEsc(cim)}</h3><p class="muted mini"><b>Javasolt piac:</b> ${htmlEsc(x.valasztas||x.kimenetel||'–')}${x.vonal!=null?` • Határ: ${htmlEsc(x.vonal)}`:''}</p><div class="facts"><div class="fact">Állapot<b class="${okClass}">${allapot}</b></div><div class="fact">Szorzó<b>${htmlEsc(x.szorzo)}</b></div><div class="fact">Modell esély<b>${pp(x.becsult_esely)}</b></div><div class="fact">Piaci esély<b>${pp(x.piaci_esely)}</b></div><div class="fact">Becsült EV<b>${evfmt(x.varhato_ertek_szazalek)}</b></div><div class="fact">Adat- és modellminőség<b>${pp(x.megbizhatosag??x.minoseg)}</b></div></div><p class="muted mini">${htmlEsc(x.indoklas||x.megjegyzes||'A piac értékelése az elérhető adatok alapján történt.')}</p></article>`;
}

function kategoriak(rows){
  const m=new Map();
  for(const x of rows){const k=piacCimke(x.piac);m.set(k,(m.get(k)||0)+1)}
  return [...m.entries()].sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="fact">${htmlEsc(k)}<b>${v}</b></div>`).join('');
}

async function loadMarkets(){
  let d;
  try{d=await J('data/piac_ajanlasok.json')}catch(e){
    const ids=['piacdb','ajanlhatoDb','piacOsszes','piacAdatos','piacKizart','piacAjanlhato'];
    ids.forEach(id=>{const el=document.getElementById(id);if(el)el.textContent='0'});
    const a=document.getElementById('ajanlasKartyak');if(a)a.innerHTML='<div class="card empty">A többpiacos elemző motor már elő van készítve a műszerfalon. Élő ajánlás akkor jelenik meg, amikor a főprogram elkészíti a piac_ajanlasok.json adatot.</div>';
    const k=document.getElementById('piacKategoriak');if(k)k.innerHTML='<p class="muted">Még nincs többpiacos élő adat.</p>';
    const h=document.getElementById('piacHibak');if(h)h.innerHTML='<p class="muted">Még nincs kizárási adat.</p>';
    return;
  }
  const rows=Array.isArray(d)?d:Array.isArray(d.ajanlasok)?d.ajanlasok:[];
  const ajanl=rows.filter(x=>x.ajanlhato!==false);
  const kiz=rows.filter(x=>x.ajanlhato===false);
  const adatos=rows.filter(x=>x.elegendo_adat!==false);
  const set=(id,val)=>{const el=document.getElementById(id);if(el)el.textContent=val};
  set('piacdb',rows.length);set('ajanlhatoDb',ajanl.length);set('piacOsszes',rows.length);set('piacAdatos',adatos.length);set('piacKizart',kiz.length);set('piacAjanlhato',ajanl.length);
  const a=document.getElementById('ajanlasKartyak');if(a)a.innerHTML=ajanl.length?ajanl.slice().sort((x,y)=>(+y.rangsor_pont||+y.varhato_ertek_szazalek||0)-(+x.rangsor_pont||+x.varhato_ertek_szazalek||0)).map(ajanlasKartya).join(''):'<div class="card empty">Jelenleg nincs biztonságosan ajánlható piac.</div>';
  const k=document.getElementById('piacKategoriak');if(k)k.innerHTML=rows.length?`<div class="facts">${kategoriak(rows)}</div>`:'<p class="muted">Nincs piacadat.</p>';
  const h=document.getElementById('piacHibak');if(h)h.innerHTML=kiz.length?kiz.map(x=>`<details><summary>${htmlEsc(piacCimke(x.piac))} — ${htmlEsc(x.valasztas||x.kimenetel||'–')}</summary><p class="muted mini">${htmlEsc(x.kizarasi_ok||x.indoklas||'Biztonsági vagy adatminőségi feltétel nem teljesült.')}</p></details>`).join(''):'<p class="muted">Jelenleg nincs kizárt piac.</p>';
}

document.addEventListener('DOMContentLoaded',loadMarkets);
setInterval(loadMarkets,60000);
