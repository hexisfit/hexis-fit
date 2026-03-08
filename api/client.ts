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
  html = html.split("XSTATSX").join(escH((c.heightMet || "170") + " \u00b7 " + (c.weightMet || "60")));
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

export const config = { runtime: "edge" };

const PAGE = `
<!DOCTYPE html>
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
.mn{font-size:1.15rem;font-weight:700;color:#1f2a3a;margin-bottom:6px}
.mb{background:#edf2f9;padding:6px 12px;border-radius:20px;font-size:0.8rem;font-weight:600;display:inline-block;margin-bottom:8px}
.mtags{display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap}
.mtag{font-size:0.7rem;padding:2px 8px;border-radius:12px;font-weight:600}
.tv{background:#dcfce7;color:#166534}.th{background:#e0e7ff;color:#3730a3}.tl{background:#fef3c7;color:#92400e}
.mi{background:#f8fafc;border-radius:14px;padding:10px 14px;margin-bottom:10px;flex-grow:1}
.mi h4{font-size:0.75rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px}
.ir{display:flex;justify-content:space-between;padding:2px 0;font-size:0.85rem}
.ig{font-weight:600;color:#2563eb;font-family:monospace;font-size:0.82rem}
.db{padding:10px;border:2px solid #d0dae8;border-radius:16px;font-weight:700;font-size:0.85rem;cursor:pointer;transition:0.2s;background:white;font-family:inherit;color:#1f2a3a;text-align:center;width:100%;margin-top:auto}
.db:hover{border-color:#22c55e;background:#f0fdf4}
.db.on{background:#22c55e;color:white;border-color:#22c55e}
.dtot{background:#e3eaf3;padding:14px 22px;border-radius:40px;display:flex;justify-content:space-between;font-weight:700;margin:12px 0;flex-wrap:wrap}
.tdone{color:#22c55e;font-size:1.2rem}
.gs{background:#f0f7e8;border-radius:20px;padding:14px 20px;margin:12px 0;border-left:5px solid #6b8e6b}
.gs-t{font-size:1rem;font-weight:700;color:#2d4a2d;margin-bottom:10px;display:flex;justify-content:space-between}
.gp{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px}
.gpb{background:white;border:1px solid #c5d5c5;padding:5px 12px;border-radius:30px;font-weight:600;cursor:pointer;color:#2d4a2d;font-size:0.8rem;transition:0.2s;font-family:inherit}
.gpb.on{background:#2d4a2d;color:white}
.gg{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px}
.gi{display:flex;align-items:center;gap:8px;background:white;padding:6px 12px;border-radius:12px;font-size:0.85rem;cursor:pointer;transition:0.15s}
.gi.chk{opacity:0.5;text-decoration:line-through}
.gi input{width:18px;height:18px;accent-color:#6b8e6b;cursor:pointer;flex-shrink:0}
.gi .gn{flex:1}
.gshr{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.gshr button{padding:8px 16px;border-radius:30px;font-weight:600;font-size:0.85rem;cursor:pointer;border:none;font-family:inherit;transition:0.2s}
.gcb{background:#2d4a2d;color:white}.gsh{background:#25D366;color:white}.gck{background:#1565c0;color:white}
.abar{display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap}
.ab{background:white;border:1px solid #cbd5e2;padding:10px 18px;border-radius:50px;font-weight:600;font-size:0.9rem;cursor:pointer;display:inline-flex;align-items:center;gap:8px;color:#1f2a3a;text-decoration:none;transition:0.2s;font-family:inherit}
.ab:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.1)}
.ab.wa{background:#25D366;color:white;border:none}
.ft{text-align:center;margin-top:20px;color:#5f748b;font-size:0.8rem}
.ft a{color:#2563eb;text-decoration:none}
.fbadges{display:flex;gap:6px;margin-top:6px;flex-wrap:wrap}
.fb{padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600}
@media(max-width:600px){.hero-name{font-size:1.4rem}.hero-kcal{font-size:1.1rem;padding:8px 16px}.ctr{padding:14px;border-radius:20px}.hero{padding:12px 16px}}
</style>
</head>
<body>
<div class="ctr">
<div class="hero">
  <div class="hero-left">
    <div class="hero-name">XNAMEX</div>
    <div class="hero-sub" id="csub"></div>
    <div class="hero-stats"><span>XSTATSX</span><span>XCITYX</span></div>
    <div class="fbadges" id="fb"></div>
  </div>
  <div class="hero-kcal">XKCALX kcal</div>
</div>
<div class="cbar"><div class="lsw">
  <button class="lb" data-l="en" onclick="sl('en')">EN</button>
  <button class="lb" data-l="uk" onclick="sl('uk')">UA</button>
  <button class="lb" data-l="ru" onclick="sl('ru')">RU</button>
  <button class="lb" data-l="de" onclick="sl('de')">DE</button>
  <button class="lb" data-l="es" onclick="sl('es')">ES</button>
</div></div>
<div class="ibar"><span id="fd"></span><span class="today-badge" id="tb"></span><span class="clk" id="ck"></span></div>
<div class="wt">
  <div><div class="wt-title" id="wl"></div><div class="wt-goal" id="wg"></div></div>
  <div class="wt-btns" id="wbs"></div>
  <div class="wt-cnt" id="wc">0 / 2.4 L</div>
</div>
<div class="dtabs" id="dts"></div>
<div class="mg" id="ms"></div>
<div class="dtot" id="tot"></div>
<div id="gr"></div>
<div class="abar" id="acts"></div>
<div class="ft">Powered by <a href="https://hexis.fit">hexis.fit</a></div>
</div>
<script>
var C=XCLIENTJSONX;
var DB=XDBJSONX;
var L='XLANGX',TZ='XTZX',WK=parseInt('XWEEKSX')||4,TD=parseInt('XDAYSX')||28;
var cd=1,done={},wtr=0,gper='day';
var T={water:{en:'Water',uk:'Вода',ru:'Вода',de:'Wasser',es:'Agua'},wg:{en:'Target: 2.4 L (8 x 300ml)',uk:'2.4 л (8 x 300мл)',ru:'2.4 л (8 x 300мл)',de:'Ziel: 2.4 L',es:'Meta: 2.4 L'},dn:{en:'Done',uk:'Готово',ru:'Готово',de:'Erledigt',es:'Hecho'},ing:{en:'Ingredients',uk:'Iнгредiєнти',ru:'Ингредиенты',de:'Zutaten',es:'Ingredientes'},gl:{en:'Grocery list',uk:'Список продуктiв',ru:'Список продуктов',de:'Einkaufsliste',es:'Compras'},cp:{en:'Copy all',uk:'Копiювати',ru:'Копировать',de:'Kopieren',es:'Copiar'},sn:{en:'Share',uk:'Надiслати',ru:'Отправить',de:'Teilen',es:'Compartir'},sc:{en:'Send checked',uk:'Вiдмiченi',ru:'Отмеченные',de:'Markierte',es:'Marcados'},p1:{en:'1 day',uk:'1 день',ru:'1 день',de:'1 Tag',es:'1 dia'},p7:{en:'1 week',uk:'1 тиждень',ru:'1 неделя',de:'1 Woche',es:'1 semana'},p14:{en:'2 weeks',uk:'2 тижнi',ru:'2 недели',de:'2 Wochen',es:'2 semanas'},pa:{en:'All',uk:'Весь курс',ru:'Весь курс',de:'Alles',es:'Todo'},Breakfast:{en:'Breakfast',uk:'Снiданок',ru:'Завтрак',de:'Fruehstueck',es:'Desayuno'},Lunch:{en:'Lunch',uk:'Обiд',ru:'Обед',de:'Mittagessen',es:'Almuerzo'},Dinner:{en:'Dinner',uk:'Вечеря',ru:'Ужин',de:'Abendessen',es:'Cena'},Snack1:{en:'Snack',uk:'Перекус',ru:'Перекус',de:'Snack',es:'Snack'},Snack2:{en:'Snack 2',uk:'Перекус 2',ru:'Перекус 2',de:'Snack 2',es:'Snack 2'},crs:{en:'-week course',uk:'-тижневий курс',ru:'-недельный курс',de:'-Wochen-Kurs',es:' semanas'}};
var IC={Breakfast:'B',Lunch:'L',Dinner:'D',Snack1:'S',Snack2:'S'};
var DNM={en:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],uk:['Пн','Вт','Ср','Чт','Пт','Сб','Нд'],ru:['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],de:['Mo','Di','Mi','Do','Fr','Sa','So'],es:['Lu','Ma','Mi','Ju','Vi','Sa','Do']};
function t(k){return T[k]&&T[k][L]||T[k]&&T[k].en||k}
function sdate(){var d=C.courseStart?new Date(C.courseStart):new Date();if(!C.courseStart){var w=d.getDay();d.setDate(d.getDate()-(w===0?6:w-1))}d.setHours(0,0,0,0);return d}
function ddate(n){var s=new Date(sdate().getTime());s.setDate(s.getDate()+n-1);return s}
function tdn(){var n=new Date(),s=sdate(),d=Math.floor((n-s)/86400000)+1;return d>=1&&d<=TD?d:1}
function sl(l){L=l;document.querySelectorAll('.lb').forEach(function(b){b.classList.toggle('active',b.dataset.l===l)});document.getElementById('wl').textContent=t('water');document.getElementById('wg').textContent=t('wg');document.getElementById('csub').textContent=WK+t('crs')+' - '+TD+' days';rdts();ren();clk()}
function init(){
  try{
    if(!DB||!DB.menu28||!DB.recipes){document.getElementById('ms').innerHTML='<p style="padding:40px;color:#e55;text-align:center;grid-column:1/-1">DB: '+(DB?'keys='+Object.keys(DB).join(','):'null')+'</p>';return}
    cd=tdn();
    var fb='';
    if(C.filterVegan)fb+='<span class="fb" style="background:#dcfce7;color:#166534">Vegan</span>';
    if(C.filterHalal)fb+='<span class="fb" style="background:#e0e7ff;color:#3730a3">Halal</span>';
    if(C.filterLF)fb+='<span class="fb" style="background:#fef3c7;color:#92400e">LF</span>';
    document.getElementById('fb').innerHTML=fb;
    sl(L);iw();rdts();ren();clk();
    document.getElementById('acts').innerHTML='<a class="ab wa" href="https://wa.me/XWAX" target="_blank">WhatsApp</a><button class="ab" onclick="shr()">Share</button>';
  }catch(e){document.getElementById('ms').innerHTML='<p style="padding:40px;color:red;text-align:center;grid-column:1/-1">ERR: '+e.message+'</p>'}
}
function iw(){var h='';for(var i=1;i<=8;i++)h+='<button class="wb" onclick="tw('+i+')"><span>'+i+'</span><span class="wv">'+(i*300)+'ml</span></button>';document.getElementById('wbs').innerHTML=h}
function tw(n){wtr=wtr>=n?n-1:n;document.querySelectorAll('.wb').forEach(function(b,i){b.classList.toggle('on',i<wtr)});document.getElementById('wc').textContent=(wtr*0.3).toFixed(1)+' / 2.4 L'}
function rdts(){var dn=DNM[L]||DNM.en,td=tdn(),h='';for(var d=1;d<=TD;d++){var dt=ddate(d),dd=dt.getDate()+'.'+(dt.getMonth()+1);var c='dt';if(d===cd)c+=' act';if(d===td)c+=' now';h+='<button class="'+c+'" onclick="sd('+d+')">'+dn[(d-1)%7]+'<span class="dn">'+dd+'</span></button>'}document.getElementById('dts').innerHTML=h}
function sd(d){cd=d;rdts();ren()}
function passF(rc){if(!rc)return false;if(C.filterVegan&&!rc.vegan)return false;if(C.filterHalal&&!rc.halal)return false;if(C.filterLF&&!rc.lactoseFree)return false;if(C.filterSpeed&&rc.cookSpeed!==C.filterSpeed)return false;return true}
function slotMeal(sl){if(sl==='Breakfast')return'Breakfast';if(sl==='Lunch')return'Lunch';if(sl==='Dinner')return'Dinner';return'Snack'}
function findAlt(slot,kcal){var ml=slotMeal(slot);var best=null,bd=9999;Object.values(DB.recipes).forEach(function(rc){if(rc.meal===ml&&passF(rc)){var d=Math.abs(rc.baseKcal-kcal);if(d<bd){bd=d;best=rc}}});return best}
function gm(d){if(!DB||!DB.menu28)return[];var mx=Math.max.apply(null,DB.menu28.map(function(m){return m.day}));var r=DB.menu28.filter(function(m){return m.day===d});if(!r.length&&mx>0)r=DB.menu28.filter(function(m){return m.day===((d-1)%mx)+1});var out=[];r.forEach(function(s){var rc=DB.recipes[s.recipeId];if(rc&&passF(rc)){out.push(s)}else{var alt=findAlt(s.slot,s.scaledKcal||(rc&&rc.baseKcal?rc.baseKcal:400));if(alt){var f=alt.baseKcal>0?(s.scaledKcal||400)/alt.baseKcal:1;out.push({day:s.day,slot:s.slot,recipeId:alt.id,scaledFactor:Math.round(f*100)/100,scaledKcal:s.scaledKcal||Math.round(alt.baseKcal*f)})}}});return out}
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
    var dnames={en:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],uk:['Недiля','Понедiлок','Вiвторок','Середа','Четвер','Пятниця','Субота'],ru:['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],de:['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag']};
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
