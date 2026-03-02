import { list } from "@vercel/blob";

function escH(s: string): string {
  return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;").split('"').join("&quot;");
}

async function blobGet(key: string): Promise<any> {
  try {
    const result = await list({ prefix: key + ".json", token: process.env.BLOB_READ_WRITE_TOKEN });
    if (!result.blobs.length) return null;
    const resp = await fetch(result.blobs[0].url);
    if (!resp.ok) return null;
    return await resp.json();
  } catch { return null; }
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const alias = url.pathname.replace("/c/", "").replace(".html", "").toLowerCase();
  if (!alias) return new Response("Not found", { status: 404 });

  const client: any = await blobGet("clients/" + alias);
  if (!client) {
    return new Response("<html><body style='font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh'><h1>404 - Not found</h1></body></html>", { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  const db: any = await blobGet("recipes/database");
  const c = client;
  const weeks = parseInt(c.courseWeeks) || 4;
  const totalDays = weeks * 7;

  const cJson = JSON.stringify(c).split("</").join("<\\/");
  const dbJson = db ? JSON.stringify(db).split("</").join("<\\/") : "null";

  let html = PAGE;
  html = html.split("XNAMEX").join(escH(c.name || "Client"));
  html = html.split("XKCALX").join(escH(c.kcal || "1600"));
  html = html.split("XSTATSX").join(escH((c.heightMet || "170") + " · " + (c.weightMet || "60")));
  html = html.split("XCITYX").join(escH(c.city || ""));
  html = html.split("XLANGX").join(c.lang || "en");
  html = html.split("XTZX").join(c.timezone || "Europe/Berlin");
  html = html.split("XWAX").join(c.whatsapp || "");
  html = html.split("XWEEKSX").join(String(weeks));
  html = html.split("XDAYSX").join(String(totalDays));
  html = html.split("XCLIENTJSONX").join(cJson);
  html = html.split("XDBJSONX").join(dbJson);

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export const runtime = "nodejs";

const PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>XNAMEX - Wellness - hexis.fit</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
body{background:#f0f4fa;padding:16px 12px;display:flex;flex-direction:column;align-items:center}
.ctr{max-width:900px;width:100%;background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);border-radius:32px;box-shadow:0 20px 50px rgba(0,20,40,0.12);padding:20px 24px;border:1px solid rgba(255,255,255,0.5)}
.hero{display:flex;justify-content:space-between;align-items:center;background:linear-gradient(135deg,#1f2a3a 0%,#2d4055 100%);color:white;padding:14px 24px;border-radius:24px;margin-bottom:12px;flex-wrap:wrap;gap:10px}
.hero-left{display:flex;flex-direction:column;gap:4px}
.hero-name{font-size:1.8rem;font-weight:700}
.hero-sub{font-size:0.85rem;opacity:0.7}
.hero-stats{display:flex;gap:15px;font-size:0.95rem;opacity:0.85;flex-wrap:wrap}
.hero-kcal{background:rgba(255,255,255,0.15);padding:10px 22px;border-radius:50px;font-size:1.4rem;font-weight:800}
.cbar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px}
.lsw{display:flex;gap:4px;flex-wrap:wrap}
.lb{background:white;border:1px solid #ccd7e6;padding:5px 12px;border-radius:30px;font-weight:600;cursor:pointer;color:#1f2a3a;font-size:0.85rem;transition:0.2s;font-family:inherit}
.lb.active{background:#1f2a3a;color:white;border-color:#1f2a3a}
.ibar{background:white;border-radius:50px;padding:8px 18px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-bottom:12px;box-shadow:0 3px 8px rgba(0,0,0,0.02);border:1px solid #e2eaf3;gap:8px;font-size:0.9rem}
.today-badge{background:#fff5f5;padding:4px 12px;border-radius:50px;font-weight:700;color:#1f2a3a;border:2px solid #ff6b6b}
.clk{font-family:monospace;font-size:1rem;font-weight:600;color:#1f2a3a;background:#f0f5fc;padding:3px 10px;border-radius:30px}
.wt{background:#e3f2fd;border-radius:24px;padding:12px 18px;margin-bottom:12px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px}
.wt-title{font-weight:700;color:#0277bd;font-size:0.9rem}
.wt-goal{font-size:0.85rem;color:#01579b}
.wt-btns{display:flex;gap:6px;flex-wrap:wrap}
.wb{width:38px;height:38px;border-radius:50%;border:2px solid #90caf9;background:white;color:#1565c0;font-weight:700;font-size:0.75rem;cursor:pointer;transition:0.2s;font-family:inherit;display:flex;align-items:center;justify-content:center;flex-direction:column;line-height:1}
.wb .wv{font-size:0.55rem;color:#64b5f6}
.wb.on{background:#0288d1;color:white;border-color:#0288d1}
.wb.on .wv{color:rgba(255,255,255,0.7)}
.wt-cnt{font-weight:700;color:#01579b;background:white;padding:4px 12px;border-radius:30px}
.dtabs{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:15px;justify-content:center}
.dt{background:white;padding:6px 8px;border-radius:16px;font-weight:700;font-size:0.78rem;cursor:pointer;border:2px solid #d0dae8;min-width:46px;text-align:center;transition:0.2s;font-family:inherit;line-height:1.2}
.dt .dn{display:block;font-size:0.65rem;color:#94a3b8;font-weight:500;margin-top:2px}
.dt.act{background:#1f2a3a;color:white;border-color:#1f2a3a}
.dt.act .dn{color:rgba(255,255,255,0.6)}
.dt.now{border-color:#ff4d4d;background:#fff5f5}
.dt.act.now{background:#1f2a3a;color:white;border-color:#ff4d4d}
.mg{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin:12px 0}
.mc{background:white;border-radius:24px;padding:18px;box-shadow:0 6px 16px rgba(0,0,0,0.02);border:1px solid #eef3f9;display:flex;flex-direction:column}
.mt{font-size:0.8rem;font-weight:700;text-transform:uppercase;color:#5f748b;margin-bottom:4px}
.mn{font-size:1.1rem;font-weight:700;color:#1f2a3a;margin-bottom:4px}
.mb{font-size:0.9rem;color:#64748b}
.mtags{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
.mtag{padding:2px 10px;border-radius:30px;font-size:0.75rem;font-weight:600}
.tv{background:#d1fae5;color:#065f46}
.th{background:#fef3c7;color:#92400e}
.tl{background:#dbeafe;color:#1e40af}
.db{width:100%;margin-top:12px;padding:10px;border:none;border-radius:50px;background:#1f2a3a;color:white;font-weight:700;cursor:pointer;transition:0.2s}
.db.on{background:#10b981}
.gs{margin-top:20px;padding:16px;background:white;border-radius:24px;box-shadow:0 4px 12px rgba(0,0,0,0.05)}
.gs-t{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;font-weight:700;color:#1f2a3a}
.gp{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
.gpb{padding:6px 12px;border-radius:30px;border:2px solid #d0dae8;background:white;cursor:pointer;transition:0.2s}
.gpb.on{background:#1f2a3a;color:white;border-color:#1f2a3a}
.gg{display:flex;flex-direction:column;gap:8px}
.gi{display:flex;justify-content:space-between;align-items:center;padding:10px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0}
.gi.chk{background:#e0f2fe;border-color:#3b82f6}
.gn{font-weight:600;color:#1f2a3a}
.ig{color:#64748b}
.gshr{display:flex;gap:12px;margin-top:16px;flex-wrap:wrap}
.gcb,.gsh,.gck{padding:10px 16px;border-radius:50px;font-weight:700;cursor:pointer}
.gcb{background:#1f2a3a;color:white}
.gsh{background:#10b981;color:white}
.gck{background:#f59e0b;color:white}
</style>
</head>
<body>
<div class="ctr">
  <div class="hero">
    <div class="hero-left">
      <div class="hero-name">XNAMEX</div>
      <div class="hero-sub">Wellness Program</div>
    </div>
    <div class="hero-stats">
      <div>XKCALX kcal</div>
      <div>XSTATSX</div>
    </div>
  </div>

  <div class="cbar">
    <div class="lsw">
      <button class="lb active">Week 1</button>
    </div>
    <div class="today-badge">Today</div>
  </div>

  <div class="ibar">
    <div class="clk" id="ck">00:00</div>
    <div id="fd">Loading date...</div>
    <div id="tb">Monday</div>
  </div>

  <div class="wt">
    <div class="wt-title">Water Intake</div>
    <div class="wt-goal">Goal: 2.5L</div>
    <div class="wt-btns">
      <button class="wb"><span class="wv">+250</span>ml</button>
    </div>
    <div class="wt-cnt">0 / 2500 ml</div>
  </div>

  <div class="dtabs" id="dts"></div>

  <div class="mg" id="ms"></div>

  <div id="gr"></div>
</div>

<script>
let cd = new Date().getDate();
let TD = XDAYSX;
let L = XLANGX;
let TZ = XTZX;
let C = XCLIENTJSONX ? JSON.parse(XCLIENTJSONX) : {};
let DB = XDBJSONX ? JSON.parse(XDBJSONX) : null;
let done = {};
let gper = 'day';

const IC = { breakfast: '🍳', lunch: '🍲', dinner: '🍽️', snack: '🍎' };

function t(key) {
  const dict = {
    en: { breakfast:'Breakfast', lunch:'Lunch', dinner:'Dinner', snack:'Snack', ing:'Ingredients', dn:'Done', gl:'Grocery List', p1:'Day', p7:'Week', p14:'2 Weeks', pa:'All', cp:'Copy', sn:'Share', sc:'Share Checked' },
    ru: { breakfast:'Завтрак', lunch:'Обед', dinner:'Ужин', snack:'Перекус', ing:'Ингредиенты', dn:'Готово', gl:'Список покупок', p1:'День', p7:'Неделя', p14:'2 Недели', pa:'Всё', cp:'Копировать', sn:'Поделиться', sc:'Поделиться отмеченным' }
  };
  return dict[L]?.[key] || dict.en[key] || key;
}

function init() { rdts(); ren(); clk(); rg(); }

function rdts() {
  let h = '';
  let td = new Date().getDate();
  for (let d = 1; d <= TD; d++) {
    let dd = d < 10 ? '0'+d : d;
    let c = 'dt';
    if (d === cd) c += ' act';
    if (d === td) c += ' now';
    h += '<button class="'+c+'" onclick="sd('+d+')">'+dd+'</button>';
  }
  document.getElementById('dts').innerHTML = h;
}

function sd(d){cd=d;rdts();ren();}

function gm(d){
  if(!DB||!DB.menu28)return[];
  var r=DB.menu28.filter(function(m){return m.day===d});
  if(!r.length)r=DB.menu28.filter(function(m){return m.day===((d-1)%28)+1});
  return r.filter(function(s){var rc=DB.recipes[s.recipeId];if(!rc)return false;if(C.filterVegan&&!rc.vegan)return false;if(C.filterHalal&&!rc.halal)return false;if(C.filterLF&&!rc.lactoseFree)return false;if(C.filterSpeed&&rc.cookSpeed!==C.filterSpeed)return false;return true})
}

function ren(){
  var ms=gm(cd),h='';
  ms.forEach(function(s){
    var r=DB.recipes[s.recipeId];if(!r)return;
    var nm=r.names?(r.names[L]||r.names.en):'?';
    var f=s.scaledFactor,kc=s.scaledKcal;
    var p=Math.round(r.protein*f),fa=Math.round(r.fat*f),ca=Math.round(r.carbs*f);
    var dk=cd+'-'+s.slot,isd=!!done[dk];
    var tg='';if(r.vegan)tg+='<span class="mtag tv">Vegan</span>';if(r.halal)tg+='<span class="mtag th">Halal</span>';if(r.lactoseFree)tg+='<span class="mtag tl">LF</span>';
    var ig='';
    if(r.ingredients){ig='<div class="mi"><h4>'+t('ing')+'</h4>';r.ingredients.forEach(function(i){var n=DB.ingredientNames[i.key]?(DB.ingredientNames[i.key][L]||DB.ingredientNames[i.key].en):i.key;ig+='<div class="ir"><span>'+n+'</span><span class="ig">'+Math.round(i.gramsBase*f)+' g</span></div>'});ig+='</div>'}
    h+='<div class="mc"><div class="mt">'+IC[s.slot]+' '+t(s.slot)+'</div><div class="mn">'+nm+'</div><div class="mb">'+kc+' kcal - P'+p+' F'+fa+' C'+ca+' - '+r.cookTimeMin+'min</div>';
    if(tg)h+='<div class="mtags">'+tg+'</div>';
    h+=ig;
    h+='<button class="db'+(isd?' on':'')+'" data-k="'+dk+'" onclick="td(this)">'+t('dn')+'</button></div>';
  });
  document.getElementById('ms').innerHTML=h||'<p style="padding:40px;color:#94a3b8;text-align:center;grid-column:1/-1">No meals</p>';
  ut();rg();
}

function td(b){var k=b.dataset.k;done[k]=!done[k];b.classList.toggle('on');ut()}

function ut(){var m=gm(cd),d=0,p=0;m.forEach(function(s){p+=s.scaledKcal;if(done[cd+'-'+s.slot])d+=s.scaledKcal});document.getElementById('tot').innerHTML='<span>Day '+cd+'</span><span><span class="tdone">'+d+'</span> / '+p+' kcal</span>'}

function rg(){
  var df=cd,dt=cd;
  if(gper==='week'){df=cd;dt=Math.min(cd+6,TD)}
  else if(gper==='2week'){df=cd;dt=Math.min(cd+13,TD)}
  else if(gper==='all'){df=1;dt=TD}
  var items={};
  for(var dd=df;dd<=dt;dd++){gm(dd).forEach(function(s){var r=DB.recipes[s.recipeId];if(!r||!r.ingredients)return;r.ingredients.forEach(function(i){var g=Math.round(i.gramsBase*s.scaledFactor);if(items[i.key])items[i.key].g+=g;else items[i.key]={k:i.key,g:g}})})}
  var arr=Object.values(items);
  arr.forEach(function(a){a.n=DB.ingredientNames[a.k]?(DB.ingredientNames[a.k][L]||DB.ingredientNames[a.k].en):a.k});
  var loc=L==='uk'?'uk':L==='ru'?'ru':L==='de'?'de':L==='es'?'es':'en';
  arr.sort(function(a,b){return a.n.localeCompare(b.n,loc)});
  if(!arr.length){document.getElementById('gr').innerHTML='';return}
  var h='<div class="gs"><div class="gs-t"><span>'+t('gl')+'</span><span style="font-size:0.8rem;color:#5f748b">'+arr.length+'</span></div>';
  h+='<div class="gp">';
  h+='<button class="gpb'+(gper==='day'?' on':'')+'" onclick="sgp(\'day\')">'+t('p1')+'</button>';
  h+='<button class="gpb'+(gper==='week'?' on':'')+'" onclick="sgp(\'week\')">'+t('p7')+'</button>';
  h+='<button class="gpb'+(gper==='2week'?' on':'')+'" onclick="sgp(\'2week\')">'+t('p14')+'</button>';
  h+='<button class="gpb'+(gper==='all'?' on':'')+'" onclick="sgp(\'all\')">'+t('pa')+'</button>';
  h+='</div><div class="gg">';
  arr.forEach(function(i){h+='<label class="gi"><input type="checkbox" onchange="gc(this)"><span class="gn">'+i.n+'</span><span class="ig">'+i.g+' g</span></label>'});
  h+='</div><div class="gshr">';
  h+='<button class="gcb" onclick="gcp(false)">'+t('cp')+'</button>';
  h+='<button class="gsh" onclick="gss(false)">'+t('sn')+'</button>';
  h+='<button class="gck" onclick="gss(true)">'+t('sc')+'</button>';
  h+='</div></div>';
  document.getElementById('gr').innerHTML=h;
}
function sgp(p){gper=p;rg()}
function gc(cb){var el=cb.closest('.gi');if(el)el.classList.toggle('chk',cb.checked)}
function gtxt(only){
  var lines=[];
  document.querySelectorAll('.gi').forEach(function(el){
    var cb=el.querySelector('input');
    if(only&&!cb.checked)return;
    lines.push((cb.checked?'[x] ':'[ ] ')+el.querySelector('.gn').textContent+' - '+el.querySelector('.ig').textContent);
  });
  return t('gl')+' (Day '+cd+')\n'+lines.join('\n');
}
function gcp(only){navigator.clipboard.writeText(gtxt(only)).then(function(){alert('OK')}).catch(function(){})}
function gss(only){var tx=gtxt(only);if(navigator.share)navigator.share({title:t('gl'),text:tx}).catch(function(){gcp(only)});else gcp(only)}
function clk(){
  var n=new Date();
  try{
    document.getElementById('fd').textContent=n.toLocaleDateString(L==='uk'?'uk-UA':L==='ru'?'ru-RU':L==='de'?'de-DE':'en-US',{timeZone:TZ,year:'numeric',month:'long',day:'numeric'});
    document.getElementById('ck').textContent=n.toLocaleTimeString('en-US',{timeZone:TZ,hour12:false,hour:'2-digit',minute:'2-digit'});
    var dnames={en:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],uk:['Недiля','Понедiлок','Вiвторок','Середа','Четвер','П\'ятниця','Субота'],ru:['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятниця','Субота'],de:['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag']};
    var dn=dnames[L]||dnames.en;
    var ln=new Date(n.toLocaleString('en-US',{timeZone:TZ}));
    document.getElementById('tb').textContent=dn[ln.getDay()];
  }catch(e){}
  setTimeout(clk,30000);
}
function shr(){if(navigator.share)navigator.share({title:'Wellness',url:location.href}).catch(function(){});else{navigator.clipboard.writeText(location.href);alert('Link copied')}}
window.onload=init;
</script>
</body>
</html>`;
