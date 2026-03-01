import { getStore } from "@netlify/blobs";
import type { Context, Config } from "@netlify/functions";

function escH(s: string): string {
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
    return new Response("<!DOCTYPE html><html><head><meta charset='UTF-8'><title>404</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#f0f4fa;text-align:center}h1{font-size:4rem}p{color:#64748b}</style></head><body><div><h1>404</h1><p>Page not found</p></div></body></html>", { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  const db: any = await recipeStore.get("database", { type: "json" });
  const c = client;
  const weeks = parseInt(c.courseWeeks) || 4;
  const totalDays = weeks * 7;
  const clientLang = c.lang || "en";

  let html = PAGE;
  html = html.replace(/__NAME__/g, escH(c.name || "Client"));
  html = html.replace(/__KCAL__/g, escH(c.kcal || "1500-1600"));
  html = html.replace(/__STATS_MET__/g, escH((c.heightMet || "165 cm") + " \u00b7 " + (c.weightMet || "60 kg")));
  html = html.replace(/__CITY__/g, escH(c.city || ""));
  html = html.replace(/__LANG__/g, clientLang);
  html = html.replace(/__TZ__/g, c.timezone || "Europe/Berlin");
  html = html.replace(/__WA__/g, c.whatsapp || "");
  html = html.replace(/__WEEKS__/g, String(weeks));
  html = html.replace(/__DAYS__/g, String(totalDays));
  html = html.replace("__CLIENT_JSON__", JSON.stringify(c));
  html = html.replace("__DB_JSON__", db ? JSON.stringify(db) : "null");

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
};

const PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🌱 __NAME__ · Wellness · hexis.fit</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
body{background:#f0f4fa;padding:16px 12px;display:flex;flex-direction:column;align-items:center}
.container{max-width:900px;width:100%;background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);border-radius:32px;box-shadow:0 20px 50px rgba(0,20,40,0.12);padding:20px 24px;border:1px solid rgba(255,255,255,0.5)}
.hero-bar{display:flex;justify-content:space-between;align-items:center;background:linear-gradient(135deg,#1f2a3a 0%,#2d4055 100%);color:white;padding:14px 24px;border-radius:24px;margin-bottom:12px;flex-wrap:wrap;gap:10px}
.hero-left{display:flex;flex-direction:column;gap:4px}
.hero-name{font-size:1.8rem;font-weight:700}
.hero-course{font-size:0.85rem;opacity:0.7}
.hero-stats{display:flex;gap:15px;align-items:center;flex-wrap:wrap;font-size:0.95rem;opacity:0.85}
.hero-kcal{background:rgba(255,255,255,0.15);padding:10px 22px;border-radius:50px;font-size:1.4rem;font-weight:800}
.controls-bar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px}
.lang-switch{display:flex;gap:4px;flex-wrap:wrap}
.lang-btn{background:white;border:1px solid #ccd7e6;padding:5px 12px;border-radius:30px;font-weight:600;cursor:pointer;color:#1f2a3a;font-size:0.85rem;transition:0.2s;font-family:inherit}
.lang-btn.active{background:#1f2a3a;color:white;border-color:#1f2a3a}
.info-bar{background:white;border-radius:50px;padding:8px 18px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-bottom:12px;box-shadow:0 3px 8px rgba(0,0,0,0.02);border:1px solid #e2eaf3;gap:8px;font-size:0.9rem}
.current-day-highlight{background:#fff5f5;padding:4px 12px;border-radius:50px;font-weight:700;color:#1f2a3a;font-size:0.95rem;border:2px solid #ff6b6b}
.time{font-family:monospace;font-size:1rem;font-weight:600;color:#1f2a3a;background:#f0f5fc;padding:3px 10px;border-radius:30px}
.weather{display:flex;align-items:center;gap:6px}
.weather-icon{font-size:1.2rem}
.weather-temp{font-weight:700;font-size:1rem;color:#1f2a3a}
.weather-desc{color:#5f748b;font-size:0.82rem}
.water-tracker{background:#e3f2fd;border-radius:24px;padding:12px 18px;margin-bottom:12px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px}
.water-title{font-weight:700;color:#0277bd;display:flex;align-items:center;gap:8px;font-size:0.9rem}
.water-goal{font-size:0.85rem;font-weight:600;color:#01579b}
.water-btns{display:flex;gap:6px;flex-wrap:wrap}
.water-btn{width:38px;height:38px;border-radius:50%;border:2px solid #90caf9;background:white;color:#1565c0;font-weight:700;font-size:0.75rem;cursor:pointer;transition:0.2s;font-family:inherit;display:flex;align-items:center;justify-content:center;flex-direction:column;line-height:1}
.water-btn .vol{font-size:0.55rem;color:#64b5f6;font-weight:500}
.water-btn.active{background:#0288d1;color:white;border-color:#0288d1}
.water-btn.active .vol{color:rgba(255,255,255,0.7)}
.water-count{font-weight:700;color:#01579b;font-size:0.95rem;background:white;padding:4px 12px;border-radius:30px}
.day-tabs{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:15px;justify-content:center}
.day-tab{background:white;padding:6px 8px;border-radius:16px;font-weight:700;font-size:0.78rem;cursor:pointer;border:2px solid #d0dae8;min-width:46px;text-align:center;transition:0.2s;font-family:inherit;line-height:1.2}
.day-tab .dt-num{display:block;font-size:0.65rem;color:#94a3b8;font-weight:500;margin-top:2px}
.day-tab.active{background:#1f2a3a;color:white;border-color:#1f2a3a}
.day-tab.active .dt-num{color:rgba(255,255,255,0.6)}
.day-tab.today{border:2px solid #ff4d4d;background:#fff5f5}
.day-tab.active.today{background:#1f2a3a;color:white;border:2px solid #ff4d4d}
.meal-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin:12px 0}
.meal-card{background:white;border-radius:24px;padding:18px;box-shadow:0 6px 16px rgba(0,0,0,0.02);border:1px solid #eef3f9;display:flex;flex-direction:column}
.meal-type{font-size:0.8rem;font-weight:700;text-transform:uppercase;color:#5f748b;margin-bottom:4px}
.meal-name{font-size:1.15rem;font-weight:700;color:#1f2a3a;margin-bottom:6px}
.macro-badge{background:#edf2f9;padding:6px 12px;border-radius:20px;font-size:0.8rem;font-weight:600;display:inline-block;margin-bottom:8px}
.meal-style{font-size:0.75rem;color:#94a3b8;font-style:italic;margin-bottom:8px}
.meal-tags{display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap}
.meal-tag{font-size:0.7rem;padding:2px 8px;border-radius:12px;font-weight:600}
.tag-vegan{background:#dcfce7;color:#166534}
.tag-halal{background:#e0e7ff;color:#3730a3}
.tag-lf{background:#fef3c7;color:#92400e}
.meal-ing{background:#f8fafc;border-radius:14px;padding:10px 14px;margin-bottom:10px;flex-grow:1}
.meal-ing h4{font-size:0.75rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px}
.ing-row{display:flex;justify-content:space-between;padding:2px 0;font-size:0.85rem}
.ing-g{font-weight:600;color:#2563eb;font-family:monospace;font-size:0.82rem}
.done-btn{padding:10px;border:2px solid #d0dae8;border-radius:16px;font-weight:700;font-size:0.85rem;cursor:pointer;transition:0.2s;background:white;font-family:inherit;color:#1f2a3a;text-align:center;width:100%;margin-top:auto}
.done-btn:hover{border-color:#22c55e;background:#f0fdf4}
.done-btn.active{background:#22c55e;color:white;border-color:#22c55e}
.day-total{background:#e3eaf3;padding:14px 22px;border-radius:40px;display:flex;justify-content:space-between;font-weight:700;margin:12px 0;flex-wrap:wrap;font-size:0.95rem}
.total-done{color:#22c55e;font-size:1.2rem}
.grocery-section{background:#f0f7e8;border-radius:20px;padding:14px 20px;margin:12px 0;border-left:5px solid #6b8e6b}
.grocery-title{font-size:1rem;font-weight:700;color:#2d4a2d;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center}
.grocery-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px}
.grocery-item{display:flex;align-items:center;gap:8px;background:white;padding:6px 12px;border-radius:12px;font-size:0.85rem;cursor:pointer;transition:0.15s}
.grocery-item.checked{opacity:0.5;text-decoration:line-through}
.grocery-item input[type=checkbox]{width:18px;height:18px;accent-color:#6b8e6b;cursor:pointer;flex-shrink:0}
.grocery-item .gi-name{flex:1}
.grocery-share{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.grocery-share button{padding:8px 16px;border-radius:30px;font-weight:600;font-size:0.85rem;cursor:pointer;border:none;font-family:inherit;transition:0.2s;display:flex;align-items:center;gap:6px}
.grocery-period{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px}
.gp-btn{background:white;border:1px solid #c5d5c5;padding:5px 12px;border-radius:30px;font-weight:600;cursor:pointer;color:#2d4a2d;font-size:0.8rem;transition:0.2s;font-family:inherit}
.gp-btn.active{background:#2d4a2d;color:white;border-color:#2d4a2d}
.grocery-share .gs-copy{background:#2d4a2d;color:white}
.grocery-share .gs-share{background:#25D366;color:white}
.grocery-share .gs-checked{background:#1565c0;color:white}
.action-bar{display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap}
.action-btn{background:white;border:1px solid #cbd5e2;padding:10px 18px;border-radius:50px;font-weight:600;font-size:0.9rem;cursor:pointer;display:inline-flex;align-items:center;gap:8px;color:#1f2a3a;text-decoration:none;transition:0.2s;font-family:inherit}
.action-btn:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.1)}
.action-btn.wa{background:#25D366;color:white;border:none}
.footer{text-align:center;margin-top:20px;color:#5f748b;font-size:0.8rem}
.footer a{color:#2563eb;text-decoration:none}
@media(max-width:600px){.hero-name{font-size:1.4rem}.hero-kcal{font-size:1.1rem;padding:8px 16px}.container{padding:14px;border-radius:20px}.hero-bar{padding:12px 16px}}
</style>
</head>
<body>
<div class="container">
<div class="hero-bar">
  <div class="hero-left">
    <div class="hero-name">__NAME__</div>
    <div class="hero-course" id="courseLabel">__WEEKS__-week course · __DAYS__ days</div>
    <div class="hero-stats"><span>__STATS_MET__</span><span>📍 __CITY__</span></div>
    <div id="filterBadges" style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap"></div>
  </div>
  <div class="hero-kcal">🔥 __KCAL__ kcal</div>
</div>
<div class="controls-bar">
  <div class="lang-switch">
    <button class="lang-btn" data-lang="en" onclick="setLang('en')">EN</button>
    <button class="lang-btn" data-lang="uk" onclick="setLang('uk')">UA</button>
    <button class="lang-btn" data-lang="ru" onclick="setLang('ru')">RU</button>
    <button class="lang-btn" data-lang="de" onclick="setLang('de')">DE</button>
    <button class="lang-btn" data-lang="es" onclick="setLang('es')">ES</button>
  </div>
</div>
<div class="info-bar">
  <span id="fullDate"></span>
  <span class="current-day-highlight" id="todayBadge"></span>
  <div class="weather" id="weatherBox"><span class="weather-icon">🌱</span><span class="weather-temp" id="wTemp">--</span><span class="weather-desc" id="wDesc"></span></div>
  <span class="time" id="clock"></span>
</div>
<div class="water-tracker">
  <div><div class="water-title">💧 <span id="waterLabel">Water</span></div><div class="water-goal" id="waterGoal">Target: 2.4 L (8 × 300ml)</div></div>
  <div class="water-btns" id="waterBtns"></div>
  <div class="water-count" id="waterCount">0 / 2.4 L</div>
</div>
<div class="day-tabs" id="dayTabs"></div>
<div class="meal-grid" id="meals"></div>
<div class="day-total" id="dayTotal"></div>
<div id="grocery"></div>
<div class="action-bar" id="actions"></div>
<div class="footer">Powered by <a href="https://hexis.fit">hexis.fit</a></div>
</div>
<script>
var C=__CLIENT_JSON__,DB=__DB_JSON__;
var lang='__LANG__',tz='__TZ__',weeks=parseInt('__WEEKS__')||4,totalDays=parseInt('__DAYS__')||28,curDay=1,done={},water=0;
var I={water:{en:'Daily water',uk:'Денна вода',ru:'Дневная вода',de:'Wasser',es:'Agua'},wgoal:{en:'Target: 2.4 L (8 × 300ml)',uk:'Ціль: 2.4 л (8 × 300мл)',ru:'Цель: 2.4 л (8 × 300мл)',de:'Ziel: 2.4 L (8 × 300ml)',es:'Meta: 2.4 L (8 × 300ml)'},done:{en:'✅ Done',uk:'✅ Виконано',ru:'✅ Выполнено',de:'✅ Erledigt',es:'✅ Hecho'},ing:{en:'Ingredients',uk:'Інгредієнти',ru:'Ингредиенты',de:'Zutaten',es:'Ingredientes'},grocery:{en:'🛒 Grocery list',uk:'🛒 Список продуктів',ru:'🛒 Список продуктов',de:'🛒 Einkaufsliste',es:'🛒 Compras'},gcopy:{en:'📋 Copy list',uk:'📋 Копіювати',ru:'📋 Копировать',de:'📋 Kopieren',es:'📋 Copiar'},gshare:{en:'📤 Send to Notes',uk:'📤 В нотатки',ru:'📤 В заметки',de:'📤 Notizen',es:'📤 Notas'},gchecked:{en:'📤 Send checked',uk:'📤 Відмічені',ru:'📤 Отмеченные',de:'📤 Markierte',es:'📤 Marcados'},gday:{en:'1 day',uk:'1 день',ru:'1 день',de:'1 Tag',es:'1 día'},gweek:{en:'1 week',uk:'1 тиждень',ru:'1 неделя',de:'1 Woche',es:'1 semana'},g2week:{en:'2 weeks',uk:'2 тижні',ru:'2 недели',de:'2 Wochen',es:'2 semanas'},gall:{en:'All',uk:'Весь курс',ru:'Весь курс',de:'Alles',es:'Todo'},Breakfast:{en:'Breakfast',uk:'Сніданок',ru:'Завтрак',de:'Frühstück',es:'Desayuno'},Lunch:{en:'Lunch',uk:'Обід',ru:'Обед',de:'Mittagessen',es:'Almuerzo'},Dinner:{en:'Dinner',uk:'Вечеря',ru:'Ужин',de:'Abendessen',es:'Cena'},Snack1:{en:'Snack',uk:'Перекус',ru:'Перекус',de:'Snack',es:'Snack'},Snack2:{en:'Snack 2',uk:'Перекус 2',ru:'Перекус 2',de:'Snack 2',es:'Snack 2'},course:{en:'-week course',uk:'-тижневий курс',ru:'-недельный курс',de:'-Wochen-Kurs',es:' semanas'}};
var ICONS={Breakfast:'🍳',Lunch:'🥗',Dinner:'🍽️',Snack1:'🍎',Snack2:'🍎'};
var DN={en:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],uk:['Пн','Вт','Ср','Чт','Пт','Сб','Нд'],ru:['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],de:['Mo','Di','Mi','Do','Fr','Sa','So'],es:['Lu','Ma','Mi','Ju','Vi','Sá','Do']};
function t(k){return I[k]&&I[k][lang]||I[k]&&I[k].en||k}
function getStartDate(){
  var d=C.courseStart?new Date(C.courseStart):new Date();
  if(!C.courseStart){var dow=d.getDay();d.setDate(d.getDate()-(dow===0?6:dow-1));}
  d.setHours(0,0,0,0);return d;
}
function dayDate(dayNum){var s=new Date(getStartDate().getTime());s.setDate(s.getDate()+dayNum-1);return s;}
function todayDayNum(){
  var now=new Date(),start=getStartDate();
  var diff=Math.floor((now-start)/(86400000))+1;
  return diff>=1&&diff<=totalDays?diff:1;
}
function setLang(l){lang=l;document.querySelectorAll('.lang-btn').forEach(function(b){b.classList.toggle('active',b.dataset.lang===l)});document.getElementById('waterLabel').textContent=t('water');document.getElementById('waterGoal').textContent=t('wgoal');document.getElementById('courseLabel').textContent=weeks+t('course')+' · '+totalDays+' days';renderDays();render();clock()}
function init(){
  try{
  if(!DB||!DB.menu28||!DB.recipes){document.getElementById('meals').innerHTML='<p style="padding:40px;color:#e55;text-align:center;grid-column:1/-1">DB status: '+(DB?'loaded but menu28='+(DB.menu28?DB.menu28.length:'missing')+' recipes='+(DB.recipes?Object.keys(DB.recipes).length:'missing'):'NULL - recipe database not uploaded')+'</p>';return}
  curDay=todayDayNum();
  var fb='';
  if(C.filterVegan)fb+='<span style="background:#dcfce7;color:#166534;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600">🌱 Vegan</span>';
  if(C.filterHalal)fb+='<span style="background:#e0e7ff;color:#3730a3;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600">☪️ Halal</span>';
  if(C.filterLF)fb+='<span style="background:#fef3c7;color:#92400e;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600">🥛✕ Lactose-free</span>';
  if(C.filterSpeed)fb+='<span style="background:#f0f4ff;color:#4338ca;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600">⏱ '+C.filterSpeed+'</span>';
  document.getElementById('filterBadges').innerHTML=fb;
  setLang(lang);initWater();renderDays();render();clock();
  try{loadWeather()}catch(we){}
  document.getElementById('actions').innerHTML='<a class="action-btn wa" href="https://wa.me/__WA__" target="_blank">💬 WhatsApp</a><button class="action-btn" onclick="shr()">🔗 Share</button>';
  }catch(err){document.getElementById('meals').innerHTML='<p style="padding:40px;color:red;text-align:center;grid-column:1/-1">Error: '+err.message+'</p>'}
}
function initWater(){
  var h='';for(var i=1;i<=8;i++)h+='<button class="water-btn" onclick="tw('+i+')"><span>'+i+'</span><span class="vol">'+i*300+'ml</span></button>';
  document.getElementById('waterBtns').innerHTML=h;
}
function tw(n){water=water>=n?n-1:n;document.querySelectorAll('.water-btn').forEach(function(b,i){b.classList.toggle('active',i<water)});document.getElementById('waterCount').textContent=(water*0.3).toFixed(1)+' / 2.4 L'}
function renderDays(){
  var dn=DN[lang]||DN.en,today=todayDayNum(),h='';
  for(var d=1;d<=totalDays;d++){
    var dt=dayDate(d),dd=dt.getDate()+'.'+(dt.getMonth()+1);
    var cls='day-tab';if(d===curDay)cls+=' active';if(d===today)cls+=' today';
    h+='<button class="'+cls+'" onclick="sd('+d+')">'+dn[(d-1)%7]+'<span class="dt-num">'+dd+'</span></button>';
  }
  document.getElementById('dayTabs').innerHTML=h;
}
function sd(d){curDay=d;renderDays();render()}
function gm(d){
  if(!DB||!DB.menu28)return[];
  var raw=DB.menu28.filter(function(m){return m.day===d});
  if(!raw.length){raw=DB.menu28.filter(function(m){return m.day===((d-1)%28)+1})}
  return raw.filter(function(slot){
    var r=DB.recipes[slot.recipeId];if(!r)return false;
    if(C.filterVegan&&!r.vegan)return false;
    if(C.filterHalal&&!r.halal)return false;
    if(C.filterLF&&!r.lactoseFree)return false;
    if(C.filterSpeed&&r.cookSpeed!==C.filterSpeed)return false;
    return true;
  });
}
function render(){
  var meals=gm(curDay),h='';
  meals.forEach(function(slot){
    var r=DB.recipes[slot.recipeId];if(!r)return;
    var nm=r.names?(r.names[lang]||r.names.en):'?';
    var f=slot.scaledFactor,kc=slot.scaledKcal;
    var p=Math.round(r.protein*f),fa=Math.round(r.fat*f),ca=Math.round(r.carbs*f);
    var dk=curDay+'-'+slot.slot,isd=!!done[dk];
    var tags='';
    if(r.vegan)tags+='<span class="meal-tag tag-vegan">🌱 Vegan</span>';
    if(r.halal)tags+='<span class="meal-tag tag-halal">Halal</span>';
    if(r.lactoseFree)tags+='<span class="meal-tag tag-lf">LF</span>';
    var ig='';
    if(r.ingredients){
      ig='<div class="meal-ing"><h4>'+t('ing')+'</h4>';
      r.ingredients.forEach(function(i){
        var n=DB.ingredientNames[i.key]?(DB.ingredientNames[i.key][lang]||DB.ingredientNames[i.key].en):i.key;
        ig+='<div class="ing-row"><span>'+n+'</span><span class="ing-g">'+Math.round(i.gramsBase*f)+' g</span></div>';
      });
      ig+='</div>';
    }
    h+='<div class="meal-card"><div class="meal-type">'+(ICONS[slot.slot]||'🍴')+' '+t(slot.slot)+'</div>';
    h+='<div class="meal-name">'+nm+'</div>';
    h+='<div class="macro-badge">🔥 '+kc+' kcal · P'+p+' · F'+fa+' · C'+ca+' · ⏱'+r.cookTimeMin+'min</div>';
    if(tags)h+='<div class="meal-tags">'+tags+'</div>';
    if(r.authorStyle)h+='<div class="meal-style">'+r.authorStyle+'</div>';
    h+=ig;
    h+='<button class="done-btn'+(isd?' active':'')+'" data-k="'+dk+'" data-c="'+kc+'" onclick="td(this)">'+t('done')+'</button></div>';
  });
  document.getElementById('meals').innerHTML=h||'<p style="padding:40px;color:#94a3b8;text-align:center;grid-column:1/-1">No meals</p>';
  ut();rg();
}
function td(b){var k=b.dataset.k;done[k]=!done[k];b.classList.toggle('active');ut()}
function ut(){
  var m=gm(curDay),d=0,p=0;
  m.forEach(function(s){p+=s.scaledKcal;if(done[curDay+'-'+s.slot])d+=s.scaledKcal});
  document.getElementById('dayTotal').innerHTML='<span>📊 Day '+curDay+'</span><span><span class="total-done">'+d+'</span> / '+p+' kcal</span>';
}
function rg(){
  var m=gm(curDay);
  var items={};
  var dFrom=curDay,dTo=curDay;
  if(groceryPeriod==='week'){dFrom=curDay;dTo=Math.min(curDay+6,totalDays)}
  else if(groceryPeriod==='2week'){dFrom=curDay;dTo=Math.min(curDay+13,totalDays)}
  else if(groceryPeriod==='all'){dFrom=1;dTo=totalDays}
  for(var dd=dFrom;dd<=dTo;dd++){
    var dm=gm(dd);
    dm.forEach(function(s){var r=DB.recipes[s.recipeId];if(!r||!r.ingredients)return;r.ingredients.forEach(function(i){var g=Math.round(i.gramsBase*s.scaledFactor);if(items[i.key])items[i.key].g+=g;else items[i.key]={k:i.key,g:g}})});
  }
  var arr=Object.values(items);
  arr.forEach(function(a){a.n=DB.ingredientNames[a.k]?(DB.ingredientNames[a.k][lang]||DB.ingredientNames[a.k].en):a.k});
  var loc=lang==='uk'?'uk-UA':lang==='ru'?'ru-RU':lang==='de'?'de-DE':lang==='es'?'es-ES':'en-US';
  arr.sort(function(a,b){return a.n.localeCompare(b.n,loc)});
  if(!arr.length){document.getElementById('grocery').innerHTML='';return}
  var h='<div class="grocery-section"><div class="grocery-title"><span>'+t('grocery')+'</span><span style="font-size:0.8rem;font-weight:500;color:#5f748b">'+arr.length+' items</span></div>';
  h+='<div class="grocery-period">';
  h+='<button class="gp-btn'+(groceryPeriod==='day'?' active':'')+'" onclick="setGP(\'day\')">'+t('gday')+'</button>';
  h+='<button class="gp-btn'+(groceryPeriod==='week'?' active':'')+'" onclick="setGP(\'week\')">'+t('gweek')+'</button>';
  h+='<button class="gp-btn'+(groceryPeriod==='2week'?' active':'')+'" onclick="setGP(\'2week\')">'+t('g2week')+'</button>';
  h+='<button class="gp-btn'+(groceryPeriod==='all'?' active':'')+'" onclick="setGP(\'all\')">'+t('gall')+'</button>';
  h+='</div>';
  h+='<div class="grocery-grid">';
  arr.forEach(function(i,idx){
    h+='<label class="grocery-item" id="gi-'+idx+'"><input type="checkbox" onchange="gcheck(this)"><span class="gi-name">'+i.n+'</span><span class="ing-g">'+i.g+' g</span></label>';
  });
  h+='</div><div class="grocery-share">';
  h+='<button class="gs-copy" onclick="gcopy(false)">'+t('gcopy')+'</button>';
  h+='<button class="gs-share" onclick="gshareList(false)">'+t('gshare')+'</button>';
  h+='<button class="gs-checked" onclick="gshareList(true)">'+t('gchecked')+'</button>';
  h+='</div></div>';
  document.getElementById('grocery').innerHTML=h;
}
var groceryPeriod='day';
function setGP(p){groceryPeriod=p;rg()}
function gcheck(cb){var el=cb.closest('.grocery-item');if(el)el.classList.toggle('checked',cb.checked)}
function gtext(onlyChecked){
  var lines=[];
  document.querySelectorAll('.grocery-item').forEach(function(el){
    var cb=el.querySelector('input[type=checkbox]');
    if(onlyChecked && !cb.checked) return;
    var nm=el.querySelector('.gi-name').textContent;
    var gr=el.querySelector('.ing-g').textContent;
    lines.push((cb.checked?'\\u2705 ':'\\u2610 ')+nm+' \\u2014 '+gr);
  });
  var label=groceryPeriod==='day'?'Day '+curDay:groceryPeriod==='week'?t('gweek'):groceryPeriod==='2week'?t('g2week'):t('gall');
  return t('grocery')+' ('+label+')\\n'+lines.join('\\n');
}
function gcopy(onlyChecked){
  var txt=gtext(onlyChecked);
  navigator.clipboard.writeText(txt).then(function(){alert(lang==='uk'?'Скопійовано!':lang==='ru'?'Скопировано!':'Copied!')}).catch(function(){});
}
function gshareList(onlyChecked){
  var txt=gtext(onlyChecked);
  if(navigator.share){navigator.share({title:t('grocery'),text:txt}).catch(function(){gcopy(onlyChecked)})}
  else{gcopy(onlyChecked)}
}
function loadWeather(){
  var city=C.city||'Kleve';
  city=city.split(',')[0].trim();
  try{
    fetch('https://wttr.in/'+encodeURIComponent(city)+'?format=j1').then(function(r){return r.json()}).then(function(d){
      var cur=d.current_condition&&d.current_condition[0];
      if(!cur)return;
      var temp=cur.temp_C;
      var code=parseInt(cur.weatherCode)||0;
      var icon=code===113?'\\u2600\\ufe0f':code<300?'\\u26c5':code<600?'\\ud83c\\udf27\\ufe0f':code<700?'\\u2744\\ufe0f':'\\ud83c\\udf2b\\ufe0f';
      var desc=cur.weatherDesc&&cur.weatherDesc[0]?cur.weatherDesc[0].value:'';
      document.getElementById('wTemp').textContent=temp+'\\u00b0C';
      document.getElementById('wDesc').textContent=desc;
      document.querySelector('.weather-icon').textContent=icon;
    }).catch(function(){});
  }catch(e){}
}
function clock(){
  var now=new Date();
  try{
    document.getElementById('fullDate').textContent=now.toLocaleDateString(lang==='uk'?'uk-UA':lang==='ru'?'ru-RU':lang==='de'?'de-DE':'en-US',{timeZone:tz,year:'numeric',month:'long',day:'numeric'});
    document.getElementById('clock').textContent=now.toLocaleTimeString('en-US',{timeZone:tz,hour12:false,hour:'2-digit',minute:'2-digit'});
    var dayNames={en:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],uk:['Неділя','Понеділок','Вівторок','Середа','Четвер','Пʼятниця','Субота'],ru:['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],de:['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],es:['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']};
    var dn=dayNames[lang]||dayNames.en;
    var localNow=new Date(now.toLocaleString('en-US',{timeZone:tz}));
    document.getElementById('todayBadge').textContent=dn[localNow.getDay()];
  }catch(e){}
  setTimeout(clock,30000);
}
function shr(){if(navigator.share)navigator.share({title:C.name+' Wellness',url:location.href}).catch(function(){});else{navigator.clipboard.writeText(location.href);alert('Link copied!')}}
window.onload=init;
</script>
</body>
</html>`;

export const config: Config = {
  path: "/c/*",
};
