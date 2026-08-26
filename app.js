const $=s=>document.querySelector(s);
const pontok=[72,48,24,12,6,3,1];
const pct=x=>Number.isFinite(+x)?(+x*100).toFixed(1)+'%':'–';
const dt=x=>x?new Date(x).toLocaleString('hu-HU'):'–';
const sport=s=>({soccer:'Labdarúgás',baseball:'Baseball',basketball:'Kosárlabda',tennis:'Tenisz',mma:'MMA'})[s]||s||'–';
const money=x=>Number.isFinite(+x)?((+x>=0?'+':'')+(+x).toFixed(2)):'–';
async function J(p){const r=await fetch(p+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error(p);return r.json()}

document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('nav button,section').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  $('#'+b.dataset.tab).classList.add('active');
});

function betKartya(x,i){
  return `<article class="bet"><span class="rank">#${i+1}</span><span class="pill">${sport(x.sportag)}</span><span class="pill">${x.piac||'–'}</span><h3>${x.kimenetel||'–'}</h3><div class="facts"><div class="fact">Szorzó<b>${x.szorzo??'–'}</b></div><div class="fact">Becsült esély<b>${pct(x.becsult_esely)}</b></div><div class="fact">Piaci esély<b>${pct(x.piaci_esely)}</b></div><div class="fact">Megbízhatóság<b>${pct(x.megbizhatosag)}</b></div><div class="fact">Becsült előny<b>${Number.isFinite(+x.varhato_ertek_szazalek)?(+x.varhato_ertek_szazalek).toFixed(1)+'%':'–'}</b></div><div class="fact">PAPER összeg<b>${x.tet_osszeg??'–'}</b></div></div><p class="muted mini">Iroda: ${x.iroda||'–'} • Döntés: ${dt(x.dontesi_ido)} • Kezdés: ${dt(x.esemeny_ideje)}</p></article>`;
}

async function load(){
  try{
    const[a,p,m]=await Promise.all([J('data/allapot.json'),J('data/paper.json'),J('data/meresek.json')]);
    const lez=p.filter(x=>x.statusz!=='NYITOTT');
    const ny=p.filter(x=>x.statusz==='NYITOTT');
    const w=lez.filter(x=>String(x.statusz).includes('NYERT'));
    const l=lez.filter(x=>String(x.statusz).includes('VESZTETT'));
    const cel=Number(a.cel)||500;
    const lezart=Number(a.lezart)||0;
    const sportok=Array.isArray(a.sportagak)?a.sportagak:[...new Set(p.map(x=>x.sportag).filter(Boolean))];

    $('#minta').textContent=lezart+' / '+cel;
    $('#bar').style.width=Math.min(100,100*lezart/cel)+'%';
    $('#nyitott').textContent=Number.isFinite(+a.nyitott)?a.nyitott:ny.length;
    $('#talalat').textContent=a.talalati_arany==null?'–':pct(a.talalati_arany);
    $('#penz').textContent=money(a.profit);
    $('#roi').textContent=a.roi==null?'–':pct(a.roi);
    $('#meresdb').textContent=Number(a.meresek)||0;
    $('#nyert').textContent=Number.isFinite(+a.nyert)?a.nyert:w.length;
    $('#vesztett').textContent=Number.isFinite(+a.vesztett)?a.vesztett:l.length;
    $('#lezart').textContent=lezart;
    $('#hatra').textContent=Math.max(0,cel-lezart);
    $('#validacio').textContent=lezart>=cel
      ?'Az 500-as kanonikus PAPER minta összegyűlt. A végső minősítés a rögzített küszöbök szerint elvégezhető.'
      :'Még '+Math.max(0,cel-lezart)+' lezárt PAPER esemény szükséges. Addig a találati arány és ROI csak folyamatközi adat, nem bizonyított profitabilitási ítélet.';

    $('#statusz').textContent=a.allapot||a.uzemmod||'PAPER VALIDÁCIÓ';
    $('#statusz').className='value '+(a.integritas_ok===false?'bad':'ok');
    $('#megjegyzes').textContent=(a.uzemmod||'PAPER VALIDÁCIÓ')+' • Forrásfrissítés: '+dt(a.frissitve)+' • Kanonikus státusz: '+dt(a.kanonikus_statusz_frissitve);
    $('#sportdb').textContent=Number.isFinite(+a.sportag_db)?a.sportag_db:sportok.length;
    $('#sportlista').textContent=sportok.length?sportok.map(sport).join(', '):'Még nincs PAPER sportág.';
    $('#integritas').textContent=`${a.duplikalt_sorok??0} / ${a.hibas_azonositoju_sorok??0}`;
    $('#integritas').className='value '+(a.integritas_ok?'ok':'bad');
    $('#szamlalo').textContent=a.szamlalo_egyezik===true?'EGYEZIK':a.szamlalo_egyezik===false?'ELTÉR':'–';
    $('#szamlalo').className='value '+(a.szamlalo_egyezik===true?'ok':a.szamlalo_egyezik===false?'bad':'');

    $('#kartyak').innerHTML=ny.length?ny.map(betKartya).join(''):'<div class="card empty">Nincs aktív PAPER tét.</div>';
    $('#lezartlista').innerHTML=lez.length?lez.slice().reverse().map(x=>`<details><summary>${sport(x.sportag)} — ${x.kimenetel||'–'} — ${x.statusz}</summary><div class="facts"><div class="fact">Szorzó<b>${x.szorzo??'–'}</b></div><div class="fact">Eredmény<b>${x.eredmeny??'–'}</b></div><div class="fact">P/L<b>${money(x.nyereseg_veszteseg)}</b></div><div class="fact">Tét<b>${x.tet_osszeg??'–'}</b></div></div><p class="muted mini">Döntés: ${dt(x.dontesi_ido)} • Kezdés: ${dt(x.esemeny_ideje)}</p></details>`).join(''):'<p class="muted">Még nincs lezárt PAPER tét.</p>';

    const pontDb=a.meresi_pontok||{};
    $('#timeline').innerHTML=pontok.map(h=>{const n=Number(pontDb[String(h)]||0);return `<div class="tp ${n>0?'have':''}"><b>${h}h</b><br>${n} mérés</div>`}).join('');
    $('#meresosszefoglalo').textContent=`Összesen ${Number(a.meresek)||0} rögzített időponti snapshot. Egy tét egy mérési ponton legfeljebb egyszer szerepelhet.`;
    $('#mereslista').innerHTML=m.length?m.slice().sort((a,b)=>new Date(b.adat_ideje)-new Date(a.adat_ideje)).map(x=>`<details><summary>${sport(x.sportag)} — ${x.kimenetel||'–'} — ${x.meresi_pont_ora??'–'} órás mérés</summary><div class="facts"><div class="fact">Szorzó<b>${x.szorzo??'–'}</b></div><div class="fact">Becsült esély<b>${pct(x.becsult_esely)}</b></div><div class="fact">Piaci esély<b>${pct(x.piaci_esely)}</b></div><div class="fact">Becsült előny<b>${Number.isFinite(+x.becsult_elony_szazalek)?(+x.becsult_elony_szazalek).toFixed(1)+'%':'–'}</b></div></div><p class="muted mini">Adat: ${dt(x.adat_ideje)} • Kezdés: ${dt(x.esemeny_ideje)}</p></details>`).join(''):'<p class="muted">Még nincs időbeli mérési adat.</p>';

    $('#frissites').textContent='adatforrás frissítve: '+dt(a.frissitve);
  }catch(e){
    console.error(e);
    $('#frissites').textContent='adatbetöltési hiba';
  }
}

load();
setInterval(load,60000);
