const piacCimke=p=>({moneyline:'Győztes piac',h2h:'Győztes piac','1x2':'1X2 piac',one_x_two:'1X2 piac',match_winner:'Győztes piac',spread:'Hendikep',handicap:'Hendikep',asian_handicap:'Ázsiai hendikep',runline:'Run line',puckline:'Puck line',total:'Összes gól/pont',team_total:'Csapat gól/pont',draw_no_bet:'Döntetlennél tét vissza',double_chance:'Kétesély',both_teams_to_score:'Mindkét csapat szerez gólt',corners_total:'Összes szöglet',team_corners:'Csapat szögletei',corner_handicap:'Szöglethendikep',cards_total:'Összes lap',team_cards:'Csapat lapjai',player_goal:'Játékos gólt szerez',player_goals:'Játékos gólok',player_shots:'Játékos lövések',player_shots_on_target:'Kaput eltaláló lövések',player_points:'Játékos pontok',player_assists:'Játékos gólpasszok',player_rebounds:'Játékos lepattanók',sets_handicap:'Szetthendikep',games_handicap:'Gémhendikep',total_games:'Összes gém',total_sets:'Összes szett',total_points:'Összes pont',total_runs:'Összes futás',outright:'Végső győztes',race_winner:'Futamgyőztes',event_winner:'Versenyszám győztese'})[p]||String(p||'–').replaceAll('_',' ');
const htmlEsc=s=>String(s??'–').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nfmt=(x,d=1)=>Number.isFinite(+x)?(+x).toFixed(d):'–';
const pp=x=>Number.isFinite(+x)?(+x*100).toFixed(1)+'%':'–';
const ertekfmt=x=>Number.isFinite(+x)?((+x>=0?'+':'')+(+x).toFixed(1)+'%'):'–';
const ajanlasMeccs=x=>x.esemeny_nev||x.meccs||((x.hazai&&x.vendeg)?`${x.hazai} – ${x.vendeg}`:'–');
const ajanlasEllenfel=x=>{const t=String(x.valasztas||x.kimenetel||'').trim().toLocaleLowerCase('hu-HU');const par=[x.hazai,x.vendeg].filter(Boolean);return par.find(n=>String(n).trim().toLocaleLowerCase('hu-HU')!==t)||'–'};
const piacEsemenyKulcs=x=>{
  const sportag=String(x?.sportag||'').trim().toLowerCase();
  const id=String(x?.esemeny_azonosito||x?.event_id||'').trim();
  if(id)return `${sportag}|${id}`;
  const nev=String(ajanlasMeccs(x)||'').trim().toLowerCase();
  return nev&&nev!=='–'?`${sportag}|nev:${nev}`:'';
};

function ajanlasKartya(x,i){
  const cim=ajanlasMeccs(x);
  const ellenfel=ajanlasEllenfel(x);
  const ok=x.ajanlhato!==false;
  const okClass=ok?'ok':'bad';
  const allapot=ok?'AJÁNLHATÓ':'KIZÁRVA';
  return `<article class="bet"><span class="rank">#${i+1}</span><span class="pill">${htmlEsc(typeof sport==='function'?sport(x.sportag):x.sportag)}</span><span class="pill">${htmlEsc(piacCimke(x.piac))}</span><h3>${htmlEsc(cim)}</h3><p class="muted mini"><b>Javasolt fogadás:</b> ${htmlEsc(x.valasztas||x.kimenetel||'–')} <b>• Ellenfél:</b> ${htmlEsc(ellenfel)}${x.vonal!=null?` • Határ: ${htmlEsc(x.vonal)}`:''}</p><div class="facts"><div class="fact">Mérkőzés<b>${htmlEsc(cim)}</b></div><div class="fact">Állapot<b class="${okClass}">${allapot}</b></div><div class="fact">Szorzó<b>${htmlEsc(x.szorzo)}</b></div><div class="fact">A rendszer szerint ennyi az esélye<b>${pp(x.becsult_esely)}</b></div><div class="fact">A fogadóirodák szerint ennyi az esélye<b>${pp(x.piaci_esely)}</b></div><div class="fact">Mennyire éri meg ez a fogadás?<b>${ertekfmt(x.varhato_ertek_szazalek)}</b></div><div class="fact">Adat- és saját esélybecslés minősége<b>${pp(x.megbizhatosag??x.minoseg)}</b></div></div><p class="muted mini">A százalék azt mutatja, mekkora becsült hosszú távú előnyt adhat a szorzó a rendszer által számolt esélyhez képest. Nem a nyerés valószínűsége, és nem garancia. ${htmlEsc(x.indoklas||x.megjegyzes||'A fogadási lehetőség értékelése az elérhető adatok alapján történt.')}</p></article>`;
}

function kategoriak(rows){
  const m=new Map();
  for(const x of rows){const k=piacCimke(x.piac);m.set(k,(m.get(k)||0)+1)}
  return [...m.entries()].sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="fact">${htmlEsc(k)}<b>${v} kimenetel</b></div>`).join('');
}

async function loadMarkets(){
  let d;
  try{d=await J('data/piac_ajanlasok.json')}catch(e){
    const ids=['piacdb','esemenydb','ajanlhatoDb','piacOsszes','esemenyOsszes','piacAdatos','piacKizart','piacAjanlhato'];
    ids.forEach(id=>{const el=document.getElementById(id);if(el)el.textContent='0'});
    const a=document.getElementById('ajanlasKartyak');if(a)a.innerHTML='<div class="card empty">A többféle fogadást vizsgáló rész már elő van készítve. Ajánlás akkor jelenik meg, amikor a főprogram valódi, megfelelő minőségű adatból készít ilyen számítást.</div>';
    const k=document.getElementById('piacKategoriak');if(k)k.innerHTML='<p class="muted">Még nincs élő többpiacos adat.</p>';
    const h=document.getElementById('piacHibak');if(h)h.innerHTML='<p class="muted">Még nincs kizárási adat.</p>';
    return;
  }
  const rows=Array.isArray(d)?d:Array.isArray(d.ajanlasok)?d.ajanlasok:[];
  const ajanl=rows.filter(x=>x.ajanlhato!==false);
  const kiz=rows.filter(x=>x.ajanlhato===false);
  const adatos=rows.filter(x=>x.elegendo_adat!==false);
  const esemenyek=new Set(rows.map(piacEsemenyKulcs).filter(Boolean));
  const set=(id,val)=>{const el=document.getElementById(id);if(el)el.textContent=val};
  set('piacdb',rows.length);set('esemenydb',esemenyek.size);set('ajanlhatoDb',ajanl.length);set('piacOsszes',rows.length);set('esemenyOsszes',esemenyek.size);set('piacAdatos',adatos.length);set('piacKizart',kiz.length);set('piacAjanlhato',ajanl.length);
  const a=document.getElementById('ajanlasKartyak');if(a)a.innerHTML=ajanl.length?ajanl.slice().sort((x,y)=>(+y.rangsor_pont||+y.varhato_ertek_szazalek||0)-(+x.rangsor_pont||+x.varhato_ertek_szazalek||0)).map(ajanlasKartya).join(''):'<div class="card empty">Jelenleg nincs olyan fogadási lehetőség, amely minden biztonsági feltételnek megfelel.</div>';
  const k=document.getElementById('piacKategoriak');if(k)k.innerHTML=rows.length?`<div class="facts">${kategoriak(rows)}</div><p class="muted mini">A számok piaci kimeneteleket jelentenek, nem külön mérkőzéseket. A külön mérkőzések/események száma fent külön látható.</p>`:'<p class="muted">Nincs piacadat.</p>';
  const h=document.getElementById('piacHibak');if(h)h.innerHTML=kiz.length?kiz.map(x=>`<details><summary>${htmlEsc(piacCimke(x.piac))} — ${htmlEsc(ajanlasMeccs(x))} — ${htmlEsc(x.valasztas||x.kimenetel||'–')}</summary><p class="muted mini">${htmlEsc(x.kizarasi_ok||x.indoklas||'Nem volt elég megbízható adat, vagy valamelyik biztonsági feltétel nem teljesült.')}</p></details>`).join(''):'<p class="muted">Jelenleg nincs kizárt fogadási lehetőség.</p>';
}

async function recoverCoreDashboard(){
  const set=(id,val)=>{const el=document.getElementById(id);if(el)el.textContent=val};
  try{
    const [allapotRes,paperRes]=await Promise.all([
      fetch('data/allapot.json?t='+Date.now(),{cache:'no-store'}),
      fetch('data/paper.json?t='+Date.now(),{cache:'no-store'})
    ]);
    if(!allapotRes.ok) throw new Error('allapot HTTP '+allapotRes.status);
    const a=await allapotRes.json();
    let p=[];
    if(paperRes.ok){try{const raw=await paperRes.json();if(Array.isArray(raw))p=raw}catch(_){}}
    const cel=Number(a.cel)||500;
    const lezart=Number(a.lezart)||0;
    const nyitott=Number(a.nyitott)||p.filter(x=>x&&x.statusz==='NYITOTT').length;
    set('minta',`${lezart} / ${cel}`);
    const bar=document.getElementById('bar');if(bar)bar.style.width=Math.min(100,100*lezart/cel)+'%';
    set('nyitott',nyitott);set('nyert',Number(a.nyert)||0);set('vesztett',Number(a.vesztett)||0);set('lezart',lezart);set('hatra',Math.max(0,cel-lezart));set('meresdb',Number(a.meresek)||0);set('sportdb',Number(a.sportag_db)||0);
    if(a.talalati_arany!=null)set('talalat',(Number(a.talalati_arany)*100).toFixed(1)+'%');
    if(a.roi!=null){const v=(Number(a.roi)*100);set('penz',(v>=0?'+':'')+v.toFixed(1)+'%');}
    set('sport48',`${Number(a.statikus_sportag_ok)||0} / ${Number(a.registry_sportag_db)||48}`);
    set('sportelo',`${Number(a.elo_paper_bizonyitott)||0} / 48`);
    set('statusz',a.integritas_ok===false?'HIBÁT TALÁLT':'RENDBEN');
    set('integritas',a.integritas_ok===false?'HIBÁT TALÁLT':'RENDBEN');
    set('szamlalo',a.szamlalo_egyezik===true?'RENDBEN':a.szamlalo_egyezik===false?'ELTÉRÉS VAN':'–');
    set('frissites','frissítve: '+new Date(a.frissitve).toLocaleString('hu-HU'));
    const status=document.getElementById('statusz');if(status)status.className='value '+(a.integritas_ok===false?'bad':'ok');
    const integ=document.getElementById('integritas');if(integ)integ.className='value '+(a.integritas_ok===false?'bad':'ok');
    const penz=document.getElementById('penz');if(penz)penz.className='value '+(Number(a.roi)>=0?'ok':'bad');
    const fo=document.getElementById('foallapot');if(fo&&/Adatok betöltése|adatbetöltési hiba/i.test(fo.textContent||'')){fo.textContent='A fő PAPER-adatok helyreálltak és megjeleníthetők.';fo.className='card notice ok';}
  }catch(err){
    console.error('Core dashboard recovery failed',err);
  }
}

document.addEventListener('DOMContentLoaded',()=>{loadMarkets();recoverCoreDashboard();});
setInterval(loadMarkets,60000);
setInterval(recoverCoreDashboard,60000);