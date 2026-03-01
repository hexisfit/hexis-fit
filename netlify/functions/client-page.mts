import { getStore } from "@netlify/blobs";
import type { Context, Config } from "@netlify/functions";

function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/</g, "\\x3c").replace(/>/g, "\\x3e").replace(/\n/g, "\\n");
}
function escH(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const alias = url.pathname.replace("/c/", "").replace(/\.html$/, "").toLowerCase();
  if (!alias) return new Response("Not found", { status: 404 });

  const clientStore = getStore({ name: "clients", consistency: "strong" });
  const recipeStore = getStore({ name: "recipes", consistency: "strong" });

  const client: any = await clientStore.get(alias, { type: "json" });
  if (!client) {
    return new Response(
      "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>404</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#f8f7f4;text-align:center}h1{font-size:4rem}p{color:#94a3b8}</style></head><body><div><h1>404</h1><p>Page not found</p></div></body></html>",
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const db: any = await recipeStore.get("database", { type: "json" });
  const cJson = JSON.stringify(client);
  const dbJson = db ? JSON.stringify(db) : "null";

  const c = client;
  const html = PAGE_HTML
    .replace("__CLIENT_JSON__", cJson)
    .replace("__DB_JSON__", dbJson)
    .replace("__NAME__", escH(c.name))
    .replace("__KCAL__", escH(c.kcal || "1500-1600"))
    .replace("__STATS__", escH((c.heightMet || "165 cm") + " \u00b7 " + (c.weightMet || "60 kg")))
    .replace("__CITY__", escH(c.city || ""))
    .replace("__LANG__", c.lang || "en");

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
};

const PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🌱 __NAME__ · Wellness · hexis.fit</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root{--bg:#f8f7f4;--card:#fff;--dark:#1a1a2e;--accent:#7c3aed;--accent2:#ec4899;--green:#22c55e;--blue:#3b82f6;--orange:#f59e0b;--text:#334155;--muted:#94a3b8;--border:#e2e8f0;--radius:20px}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Outfit',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;padding:0 0 40px}
.hero{background:linear-gradient(135deg,#1a1a2e 0%,#2d1b4e 50%,#1a1a2e 100%);color:white;padding:24px 20px 20px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-50%;right:-30%;width:80%;height:200%;background:radial-gradient(ellipse,rgba(124,58,237,0.15),transparent 70%);pointer-events:none}
.hero-inner{max-width:800px;margin:0 auto;position:relative;z-index:1}
.hero-top{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px}
.hero-name{font-size:1.8rem;font-weight:800;letter-spacing:-0.5px}
.hero-kcal{background:linear-gradient(135deg,var(--accent),var(--accent2));padding:8px 20px;border-radius:50px;font-weight:700;font-size:1rem}
.hero-stats{display:flex;gap:16px;font-size:0.9rem;opacity:0.75;flex-wrap:wrap}
.hero-controls{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;align-items:center}
.lang-btn{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.7);padding:5px 14px;border-radius:30px;font-weight:600;cursor:pointer;font-size:0.8rem;transition:0.2s;font-family:inherit}
.lang-btn.active{background:rgba(255,255,255,0.2);color:white;border-color:rgba(255,255,255,0.4)}
.info-bar{max-width:800px;margin:12px auto;padding:0 16px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:0.85rem;color:var(--muted)}
.info-chip{background:var(--card);padding:6px 14px;border-radius:30px;border:1px solid var(--border);font-weight:500}
.water{max-width:800px;margin:12px auto;padding:0 16px}
.water-bar{background:linear-gradient(135deg,#dbeafe,#ede9fe);border-radius:var(--radius);padding:14px 20px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px}
.water-title{font-weight:700;color:#1e40af;font-size:0.9rem}
.water-btns{display:flex;gap:6px;flex-wrap:wrap}
.water-btn{width:38px;height:38px;border-radius:50%;border:2px solid #93c5fd;background:white;color:#2563eb;font-weight:700;font-size:0.8rem;cursor:pointer;transition:0.2s;font-family:inherit}
.water-btn.active{background:#2563eb;color:white;border-color:#2563eb}
.water-count{font-weight:800;color:#1e40af;font-size:1rem}
.week-tabs{max-width:800px;margin:16px auto 8px;padding:0 16px;display:flex;gap:6px}
.week-tab{flex:1;padding:10px;border:2px solid var(--border);border-radius:14px;text-align:center;font-weight:700;font-size:0.85rem;cursor:pointer;transition:0.2s;background:var(--card);font-family:inherit;color:var(--text)}
.week-tab.active{border-color:var(--accent);background:linear-gradient(135deg,rgba(124,58,237,0.06),rgba(236,72,153,0.04));color:var(--accent)}
.day-tabs{max-width:800px;margin:8px auto;padding:0 16px;display:flex;gap:4px;flex-wrap:wrap}
.day-tab{flex:1;min-width:42px;padding:8px 4px;border:2px solid var(--border);border-radius:12px;text-align:center;font-weight:700;font-size:0.78rem;cursor:pointer;transition:0.2s;background:var(--card);font-family:inherit;color:var(--muted)}
.day-tab.active{border-color:var(--accent);color:var(--accent);background:rgba(124,58,237,0.04)}
.day-tab .day-num{display:block;font-size:1.1rem;font-weight:800;color:var(--text)}
.day-tab.active .day-num{color:var(--accent)}
.meals{max-width:800px;margin:16px auto;padding:0 16px}
.meal-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:18px;margin-bottom:12px}
.meal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.meal-type{font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--muted)}
.meal-kcal{font-size:0.8rem;font-weight:700;color:var(--accent);background:rgba(124,58,237,0.08);padding:3px 10px;border-radius:20px}
.meal-name{font-size:1.15rem;font-weight:700;margin-bottom:4px;color:var(--dark)}
.meal-macros{font-size:0.8rem;color:var(--muted);margin-bottom:10px}
.meal-macros span{margin-right:10px}
.meal-style{font-size:0.75rem;color:var(--muted);font-style:italic;margin-bottom:10px}
.meal-ing{background:#f8fafc;border-radius:14px;padding:12px 16px;margin-bottom:12px}
.meal-ing h4{font-size:0.8rem;font-weight:700;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px}
.ing-row{display:flex;justify-content:space-between;padding:3px 0;font-size:0.88rem;border-bottom:1px solid #f1f5f9}
.ing-row:last-child{border-bottom:none}
.ing-g{font-weight:600;color:var(--accent);font-family:'JetBrains Mono',monospace;font-size:0.82rem}
.done-btn{width:100%;padding:10px;border:2px solid var(--border);border-radius:14px;font-weight:700;font-size:0.85rem;cursor:pointer;transition:0.2s;background:var(--card);font-family:inherit;color:var(--text);text-align:center}
.done-btn:hover{border-color:var(--green);background:#f0fdf4}
.done-btn.active{background:var(--green);color:white;border-color:var(--green)}
.day-total{max-width:800px;margin:16px auto;padding:0 16px}
.total-bar{background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:2px solid #bbf7d0;border-radius:var(--radius);padding:16px 20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
.total-done{font-size:1.4rem;font-weight:800;color:var(--green)}
.total-plan{font-size:0.9rem;color:var(--muted);font-weight:600}
.grocery{max-width:800px;margin:16px auto;padding:0 16px}
.grocery-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:18px}
.grocery-title{font-weight:700;font-size:1rem;margin-bottom:12px}
.grocery-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:0.88rem}
.grocery-row:last-child{border-bottom:none}
.actions{max-width:800px;margin:20px auto;padding:0 16px;display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.action-btn{padding:12px 20px;border-radius:30px;font-weight:700;font-size:0.85rem;cursor:pointer;border:none;transition:0.2s;font-family:inherit;display:flex;align-items:center;gap:8px;text-decoration:none;color:white}
.action-btn.wa{background:#25D366}
.action-btn.share{background:var(--accent)}
.footer{text-align:center;padding:20px;color:var(--muted);font-size:0.75rem}
.footer a{color:var(--accent);text-decoration:none}
@media(max-width:600px){.hero-name{font-size:1.4rem}.hero-kcal{font-size:0.85rem;padding:6px 14px}.week-tab{padding:8px 4px;font-size:0.78rem}}
</style>
</head>
<body>
<div class="hero"><div class="hero-inner">
  <div class="hero-top"><div class="hero-name">__NAME__</div><div class="hero-kcal">🔥 __KCAL__ kcal</div></div>
  <div class="hero-stats"><span>__STATS__</span><span>📍 __CITY__</span></div>
  <div class="hero-controls">
    <button class="lang-btn" data-lang="en" onclick="setLang('en')">EN</button>
    <button class="lang-btn" data-lang="uk" onclick="setLang('uk')">UA</button>
    <button class="lang-btn" data-lang="ru" onclick="setLang('ru')">RU</button>
    <button class="lang-btn" data-lang="de" onclick="setLang('de')">DE</button>
    <button class="lang-btn" data-lang="es" onclick="setLang('es')">ES</button>
  </div>
</div></div>
<div class="info-bar" id="infoBar"></div>
<div class="water"><div class="water-bar">
  <div class="water-title">💧 <span id="waterLabel">Daily water</span></div>
  <div class="water-btns" id="waterBtns"></div>
  <div class="water-count" id="waterCount">0/8 💧</div>
</div></div>
<div class="week-tabs" id="weekTabs"></div>
<div class="day-tabs" id="dayTabs"></div>
<div class="meals" id="meals"></div>
<div class="day-total"><div class="total-bar" id="totalBar"></div></div>
<div class="grocery" id="grocery"></div>
<div class="actions" id="actions"></div>
<div class="footer">Powered by <a href="https://hexis.fit">hexis.fit</a></div>
<script>
var CLIENT=__CLIENT_JSON__;
var DB=__DB_JSON__;
var I={water:{en:'Daily water',uk:'Денна норма води',ru:'Дневная норма воды',de:'Wasserziel',es:'Meta de agua'},done:{en:'✅ Done',uk:'✅ Виконано',ru:'✅ Выполнено',de:'✅ Erledigt',es:'✅ Hecho'},total:{en:'TOTAL',uk:'ВСЬОГО',ru:'ИТОГО',de:'GESAMT',es:'TOTAL'},grocery:{en:'🛒 Grocery List',uk:'🛒 Список продуктів',ru:'🛒 Список продуктов',de:'🛒 Einkaufsliste',es:'🛒 Lista de compras'},wk:{en:'Week',uk:'Тиждень',ru:'Неделя',de:'Woche',es:'Semana'},Breakfast:{en:'Breakfast',uk:'Сніданок',ru:'Завтрак',de:'Frühstück',es:'Desayuno'},Lunch:{en:'Lunch',uk:'Обід',ru:'Обед',de:'Mittagessen',es:'Almuerzo'},Dinner:{en:'Dinner',uk:'Вечеря',ru:'Ужин',de:'Abendessen',es:'Cena'},Snack1:{en:'Snack',uk:'Перекус',ru:'Перекус',de:'Snack',es:'Snack'},Snack2:{en:'Snack',uk:'Перекус',ru:'Перекус',de:'Snack',es:'Snack'},ing:{en:'Ingredients',uk:'Інгредієнти',ru:'Ингредиенты',de:'Zutaten',es:'Ingredientes'}};
var ICONS={Breakfast:'🍳',Lunch:'🥗',Dinner:'🍽️',Snack1:'🍎',Snack2:'🍎'};
var DN={en:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],uk:['Пн','Вт','Ср','Чт','Пт','Сб','Нд'],ru:['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],de:['Mo','Di','Mi','Do','Fr','Sa','So'],es:['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']};
var lang='__LANG__',week=1,day=1,done={},water=0;
function t(k){return I[k]&&I[k][lang]||I[k]&&I[k].en||k}
function setLang(l){lang=l;document.querySelectorAll('.lang-btn').forEach(function(b){b.classList.toggle('active',b.dataset.lang===l)});document.getElementById('waterLabel').textContent=t('water');render()}
function init(){if(!DB){document.getElementById('meals').innerHTML='<p style="text-align:center;padding:40px;color:var(--muted)">⚠️ Recipe database not loaded</p>';return}setLang(lang);initWater();renderWeeks();renderDays();render();renderInfo();renderAct()}
function initWater(){var h='';for(var i=1;i<=8;i++)h+='<button class="water-btn" onclick="tw('+i+')">'+i+'</button>';document.getElementById('waterBtns').innerHTML=h}
function tw(n){water=water>=n?n-1:n;document.querySelectorAll('.water-btn').forEach(function(b,i){b.classList.toggle('active',i<water)});document.getElementById('waterCount').textContent=water+'/8 💧'}
function renderWeeks(){var h='';for(var w=1;w<=4;w++)h+='<button class="week-tab'+(w===week?' active':'')+'" onclick="sw('+w+')">'+t('wk')+' '+w+'</button>';document.getElementById('weekTabs').innerHTML=h}
function sw(w){week=w;day=(w-1)*7+1;renderWeeks();renderDays();render()}
function renderDays(){var s=(week-1)*7+1,dn=DN[lang]||DN.en,h='';for(var d=s;d<s+7;d++)h+='<button class="day-tab'+(d===day?' active':'')+'" onclick="sd('+d+')"><span class="day-num">'+d+'</span>'+dn[(d-1)%7]+'</button>';document.getElementById('dayTabs').innerHTML=h}
function sd(d){day=d;renderDays();render()}
function gm(d){return DB&&DB.menu28?DB.menu28.filter(function(m){return m.day===d}):[]}
function render(){
  var meals=gm(day),h='';
  meals.forEach(function(slot){
    var r=DB.recipes[slot.recipeId];if(!r)return;
    var nm=r.names?(r.names[lang]||r.names.en):'?';
    var f=slot.scaledFactor,kc=slot.scaledKcal;
    var p=Math.round(r.protein*f),fa=Math.round(r.fat*f),ca=Math.round(r.carbs*f);
    var dk=day+'-'+slot.slot,isd=!!done[dk];
    var ig='';
    if(r.ingredients){
      ig='<div class="meal-ing"><h4>'+t('ing')+'</h4>';
      r.ingredients.forEach(function(i){
        var n=DB.ingredientNames[i.key]?(DB.ingredientNames[i.key][lang]||DB.ingredientNames[i.key].en):i.key;
        ig+='<div class="ing-row"><span>'+n+'</span><span class="ing-g">'+Math.round(i.gramsBase*f)+' g</span></div>';
      });
      ig+='</div>';
    }
    var tags='';if(r.vegan)tags+=' 🌱';if(r.lactoseFree)tags+=' 🥛✕';
    h+='<div class="meal-card"><div class="meal-header"><span class="meal-type">'+(ICONS[slot.slot]||'🍴')+' '+t(slot.slot)+'</span><span class="meal-kcal">🔥 '+kc+' kcal</span></div>';
    h+='<div class="meal-name">'+nm+tags+'</div>';
    h+='<div class="meal-macros"><span>P '+p+'g</span><span>F '+fa+'g</span><span>C '+ca+'g</span><span>⏱ '+r.cookTimeMin+'min</span></div>';
    if(r.authorStyle)h+='<div class="meal-style">'+r.authorStyle+'</div>';
    h+=ig;
    h+='<button class="done-btn'+(isd?' active':'')+'" data-k="'+dk+'" data-c="'+kc+'" onclick="td(this)">'+t('done')+'</button></div>';
  });
  document.getElementById('meals').innerHTML=h||'<p style="text-align:center;padding:40px;color:var(--muted)">No meals</p>';
  ut();rg();
}
function td(b){var k=b.dataset.k;done[k]=!done[k];b.classList.toggle('active');ut()}
function ut(){
  var m=gm(day),d=0,p=0;
  m.forEach(function(s){p+=s.scaledKcal;if(done[day+'-'+s.slot])d+=s.scaledKcal});
  document.getElementById('totalBar').innerHTML='<div><span style="font-size:0.85rem;color:var(--muted)">📊 '+t('total')+'</span></div><div><span class="total-done">'+d+'</span> <span class="total-plan">/ '+p+' kcal</span></div>';
}
function rg(){
  var m=gm(day),items={};
  m.forEach(function(s){var r=DB.recipes[s.recipeId];if(!r||!r.ingredients)return;r.ingredients.forEach(function(i){var g=Math.round(i.gramsBase*s.scaledFactor);if(items[i.key])items[i.key].g+=g;else items[i.key]={k:i.key,g:g}})});
  var arr=Object.values(items).sort(function(a,b){var na=DB.ingredientNames[a.k]?(DB.ingredientNames[a.k][lang]||DB.ingredientNames[a.k].en):a.k;var nb=DB.ingredientNames[b.k]?(DB.ingredientNames[b.k][lang]||DB.ingredientNames[b.k].en):b.k;return na.localeCompare(nb)});
  if(!arr.length){document.getElementById('grocery').innerHTML='';return}
  var h='<div class="grocery-card"><div class="grocery-title">'+t('grocery')+' — Day '+day+'</div>';
  arr.forEach(function(i){var n=DB.ingredientNames[i.k]?(DB.ingredientNames[i.k][lang]||DB.ingredientNames[i.k].en):i.k;h+='<div class="grocery-row"><span>'+n+'</span><span class="ing-g">'+i.g+' g</span></div>'});
  document.getElementById('grocery').innerHTML=h+'</div>';
}
function renderInfo(){
  var now=new Date(),ds='',ts='';
  try{ds=now.toLocaleDateString(lang==='uk'?'uk-UA':lang==='ru'?'ru-RU':lang==='de'?'de-DE':'en-US',{timeZone:CLIENT.timezone,year:'numeric',month:'long',day:'numeric'});ts=now.toLocaleTimeString('en-US',{timeZone:CLIENT.timezone,hour12:false,hour:'2-digit',minute:'2-digit'})}catch(e){ds=now.toLocaleDateString();ts=now.toLocaleTimeString()}
  document.getElementById('infoBar').innerHTML='<span class="info-chip">📅 '+ds+'</span><span class="info-chip">🕐 '+ts+'</span>';
  setTimeout(renderInfo,60000);
}
function renderAct(){
  var wa=CLIENT.whatsapp||'';
  document.getElementById('actions').innerHTML='<a class="action-btn wa" href="https://wa.me/'+wa+'" target="_blank">💬 WhatsApp</a><button class="action-btn share" onclick="shr()">🔗 Share</button>';
}
function shr(){if(navigator.share)navigator.share({title:CLIENT.name+' Wellness',url:location.href}).catch(function(){});else{navigator.clipboard.writeText(location.href);alert('Link copied!')}}
window.onload=init;
</script>
</body>
</html>`;

export const config: Config = {
  path: "/c/*",
};
