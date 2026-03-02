import type { VercelRequest, VercelResponse } from "@vercel/node";
import { list } from "@vercel/blob";

function escH(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function blobGet(key: string): Promise<any> {
  try {
    const result = await list({ prefix: key + ".json", token: process.env.BLOB_READ_WRITE_TOKEN! });
    if (!result.blobs.length) return null;
    const resp = await fetch(result.blobs[0].url);
    if (!resp.ok) return null;
    return await resp.json();
  } catch { return null; }
}

function buildPage(): string {
  const lines: string[] = [];
  const p = (s: string) => lines.push(s);

  p('<!DOCTYPE html>');
  p('<html lang="en">');
  p('<head>');
  p('<meta charset="UTF-8">');
  p('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
  p('<title>XNAMEX - Wellness - hexis.fit</title>');
  p('<style>');
  p('*{margin:0;padding:0;box-sizing:border-box;font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}');
  p('body{background:#f0f4fa;padding:16px 12px;display:flex;flex-direction:column;align-items:center}');
  p('.ctr{max-width:900px;width:100%;background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);border-radius:32px;box-shadow:0 20px 50px rgba(0,20,40,0.12);padding:20px 24px;border:1px solid rgba(255,255,255,0.5)}');
  p('.hero{display:flex;justify-content:space-between;align-items:center;background:linear-gradient(135deg,#1f2a3a 0%,#2d4055 100%);color:white;padding:14px 24px;border-radius:24px;margin-bottom:12px;flex-wrap:wrap;gap:10px}');
  p('.hero-left{display:flex;flex-direction:column;gap:4px}');
  p('.hero-name{font-size:1.8rem;font-weight:700}');
  p('.hero-sub{font-size:0.85rem;opacity:0.7}');
  p('.hero-stats{display:flex;gap:15px;font-size:0.95rem;opacity:0.85;flex-wrap:wrap}');
  p('.hero-kcal{background:rgba(255,255,255,0.15);padding:10px 22px;border-radius:50px;font-size:1.4rem;font-weight:800}');
  p('.cbar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px}');
  p('.lsw{display:flex;gap:4px;flex-wrap:wrap}');
  p('.lb{background:white;border:1px solid #ccd7e6;padding:5px 12px;border-radius:30px;font-weight:600;cursor:pointer;color:#1f2a3a;font-size:0.85rem;transition:0.2s;font-family:inherit}');
  p('.lb.active{background:#1f2a3a;color:white;border-color:#1f2a3a}');
  p('.ibar{background:white;border-radius:50px;padding:8px 18px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-bottom:12px;box-shadow:0 3px 8px rgba(0,0,0,0.02);border:1px solid #e2eaf3;gap:8px;font-size:0.9rem}');
  p('.today-badge{background:#fff5f5;padding:4px 12px;border-radius:50px;font-weight:700;color:#1f2a3a;border:2px solid #ff6b6b}');
  p('.clk{font-family:monospace;font-size:1rem;font-weight:600;color:#1f2a3a;background:#f0f5fc;padding:3px 10px;border-radius:30px}');
  p('.wt{background:#e3f2fd;border-radius:24px;padding:12px 18px;margin-bottom:12px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px}');
  p('.wt-title{font-weight:700;color:#0277bd;font-size:0.9rem}');
  p('.wt-goal{font-size:0.85rem;color:#01579b}');
  p('.wt-btns{display:flex;gap:6px;flex-wrap:wrap}');
  p('.wb{width:38px;height:38px;border-radius:50%;border:2px solid #90caf9;background:white;color:#1565c0;font-weight:700;font-size:0.75rem;cursor:pointer;transition:0.2s;font-family:inherit;display:flex;align-items:center;justify-content:center;flex-direction:column;line-height:1}');
  p('.wb .wv{font-size:0.55rem;color:#64b5f6}');
  p('.wb.on{background:#0288d1;color:white;border-color:#0288d1}');
  p('.wb.on .wv{color:rgba(255,255,255,0.7)}');
  p('.wt-cnt{font-weight:700;color:#01579b;background:white;padding:4px 12px;border-radius:30px}');
  p('.wbar{background:linear-gradient(135deg,#e0f2fe,#f0f9ff);border-radius:20px;padding:10px 18px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:8px;border:1px solid #bae6fd}');
  p('.wbar-info{display:flex;align-items:center;gap:10px}');
  p('.wbar-icon{font-size:1.8rem}');
  p('.wbar-temp{font-size:1.3rem;font-weight:800;color:#0c4a6e}');
  p('.wbar-desc{font-size:0.8rem;color:#0369a1}');
  p('.wbar-city{font-size:0.75rem;color:#7dd3fc}');
  p('.gnote{background:#f59e0b;color:white}');
  p('.dtabs{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:15px;justify-content:center}');
  p('.dt{background:white;padding:6px 8px;border-radius:16px;font-weight:700;font-size:0.78rem;cursor:pointer;border:2px solid #d0dae8;min-width:46px;text-align:center;transition:0.2s;font-family:inherit;line-height:1.2}');
  p('.dt .dn{display:block;font-size:0.65rem;color:#94a3b8;font-weight:500;margin-top:2px}');
  p('.dt.act{background:#1f2a3a;color:white;border-color:#1f2a3a}');
  p('.dt.act .dn{color:rgba(255,255,255,0.6)}');
  p('.dt.now{border-color:#ff4d4d;background:#fff5f5}');
  p('.dt.act.now{background:#1f2a3a;color:white;border-color:#ff4d4d}');
  p('.mg{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin:12px 0}');
  p('.mc{background:white;border-radius:24px;padding:18px;box-shadow:0 6px 16px rgba(0,0,0,0.02);border:1px solid #eef3f9;display:flex;flex-direction:column}');
  p('.mt{font-size:0.8rem;font-weight:700;text-transform:uppercase;color:#5f748b;margin-bottom:4px}');
  p('.mn{font-size:1.15rem;font-weight:700;color:#1f2a3a;margin-bottom:6px}');
  p('.mb{background:#edf2f9;padding:6px 12px;border-radius:20px;font-size:0.8rem;font-weight:600;display:inline-block;margin-bottom:8px}');
  p('.mtags{display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap}');
  p('.mtag{font-size:0.7rem;padding:2px 8px;border-radius:12px;font-weight:600}');
  p('.tv{background:#dcfce7;color:#166534}.th{background:#e0e7ff;color:#3730a3}.tl{background:#fef3c7;color:#92400e}');
  p('.mi{background:#f8fafc;border-radius:14px;padding:10px 14px;margin-bottom:10px;flex-grow:1}');
  p('.mi h4{font-size:0.75rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px}');
  p('.ir{display:flex;justify-content:space-between;padding:2px 0;font-size:0.85rem}');
  p('.ig{font-weight:600;color:#2563eb;font-family:monospace;font-size:0.82rem}');
  p('.db{padding:10px;border:2px solid #d0dae8;border-radius:16px;font-weight:700;font-size:0.85rem;cursor:pointer;transition:0.2s;background:white;font-family:inherit;color:#1f2a3a;text-align:center;width:100%;margin-top:auto}');
  p('.db:hover{border-color:#22c55e;background:#f0fdf4}');
  p('.db.on{background:#22c55e;color:white;border-color:#22c55e}');
  p('.dtot{background:#e3eaf3;padding:14px 22px;border-radius:40px;display:flex;justify-content:space-between;font-weight:700;margin:12px 0;flex-wrap:wrap}');
  p('.tdone{color:#22c55e;font-size:1.2rem}');
  p('.gs{background:#f0f7e8;border-radius:20px;padding:14px 20px;margin:12px 0;border-left:5px solid #6b8e6b}');
  p('.gs-t{font-size:1rem;font-weight:700;color:#2d4a2d;margin-bottom:10px;display:flex;justify-content:space-between}');
  p('.gp{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px}');
  p('.gpb{background:white;border:1px solid #c5d5c5;padding:5px 12px;border-radius:30px;font-weight:600;cursor:pointer;color:#2d4a2d;font-size:0.8rem;transition:0.2s;font-family:inherit}');
  p('.gpb.on{background:#2d4a2d;color:white}');
  p('.gg{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px}');
  p('.gi{display:flex;align-items:center;gap:8px;background:white;padding:6px 12px;border-radius:12px;font-size:0.85rem;cursor:pointer;transition:0.15s}');
  p('.gi.chk{opacity:0.5;text-decoration:line-through}');
  p('.gi input{width:18px;height:18px;accent-color:#6b8e6b;cursor:pointer;flex-shrink:0}');
  p('.gi .gn{flex:1}');
  p('.gshr{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}');
  p('.gshr button{padding:8px 16px;border-radius:30px;font-weight:600;font-size:0.85rem;cursor:pointer;border:none;font-family:inherit;transition:0.2s}');
  p('.gcb{background:#2d4a2d;color:white}.gsh{background:#25D366;color:white}.gck{background:#1565c0;color:white}');
  p('.abar{display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap}');
  p('.ab{background:white;border:1px solid #cbd5e2;padding:10px 18px;border-radius:50px;font-weight:600;font-size:0.9rem;cursor:pointer;display:inline-flex;align-items:center;gap:8px;color:#1f2a3a;text-decoration:none;transition:0.2s;font-family:inherit}');
  p('.ab:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.1)}');
  p('.ab.wa{background:#25D366;color:white;border:none}');
  p('.ft{text-align:center;margin-top:20px;color:#5f748b;font-size:0.8rem}');
  p('.ft a{color:#2563eb;text-decoration:none}');
  p('.fbadges{display:flex;gap:6px;margin-top:6px;flex-wrap:wrap}');
  p('.fb{padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600}');
  p('@media(max-width:600px){.hero-name{font-size:1.4rem}.hero-kcal{font-size:1.1rem;padding:8px 16px}.ctr{padding:14px;border-radius:20px}.hero{padding:12px 16px}}');
  p('</style>');
  p('</head>');
  p('<body>');
  p('<div class="ctr">');
  p('<div class="hero">');
  p('  <div class="hero-left">');
  p('    <div class="hero-name">XNAMEX</div>');
  p('    <div class="hero-sub" id="csub"></div>');
  p('    <div class="hero-stats"><span>XSTATSX</span><span>XCITYX</span></div>');
  p('    <div class="fbadges" id="fb"></div>');
  p('  </div>');
  p('  <div class="hero-kcal">XKCALX kcal</div>');
  p('</div>');
  p('<div class="cbar"><div class="lsw">');
  p('  <button class="lb" data-l="en" onclick="sl(\'en\')">EN</button>');
  p('  <button class="lb" data-l="uk" onclick="sl(\'uk\')">UA</button>');
  p('  <button class="lb" data-l="ru" onclick="sl(\'ru\')">RU</button>');
  p('  <button class="lb" data-l="de" onclick="sl(\'de\')">DE</button>');
  p('  <button class="lb" data-l="es" onclick="sl(\'es\')">ES</button>');
  p('</div></div>');
  p('<div class="ibar"><span id="fd"></span><span class="today-badge" id="tb"></span><span class="clk" id="ck"></span></div>');
  p('<div class="wbar" id="wbar" style="display:none"><div class="wbar-info"><span class="wbar-icon" id="wico"></span><div><span class="wbar-temp" id="wtemp"></span> <span class="wbar-desc" id="wdesc"></span><div class="wbar-city" id="wcity"></div></div></div></div>');
  p('<div class="wt">');
  p('  <div><div class="wt-title" id="wl"></div><div class="wt-goal" id="wg"></div></div>');
  p('  <div class="wt-btns" id="wbs"></div>');
  p('  <div class="wt-cnt" id="wc">0 / 2.4 L</div>');
  p('</div>');
  p('<div class="dtabs" id="dts"></div>');
  p('<div class="mg" id="ms"></div>');
  p('<div class="dtot" id="tot"></div>');
  p('<div id="gr"></div>');
  p('<div class="abar" id="acts"></div>');
  p('<div class="ft">Powered by <a href="https://hexis.fit">hexis.fit</a></div>');
  p('</div>');

  // Script injected separately to avoid escaping issues
  p('<script id="appdata" type="application/json">XAPPDATAX</script>');
  p('<script>');
  p('(function(){');
  p('var d=JSON.parse(document.getElementById("appdata").textContent);');
  p('var C=d.c,DB=d.db;');
  p('var L=d.lang,TZ=d.tz,WK=d.weeks,TD=d.days;');
  p('var cd=1,done={},wtr=0,gper="day";');
  p('var T={water:{en:"Water",uk:"Вода",ru:"Вода",de:"Wasser",es:"Agua"},wg:{en:"Target: 2.4 L (8 x 300ml)",uk:"2.4 л (8 x 300мл)",ru:"2.4 л (8 x 300мл)",de:"Ziel: 2.4 L",es:"Meta: 2.4 L"},dn:{en:"Done",uk:"Готово",ru:"Готово",de:"Erledigt",es:"Hecho"},ing:{en:"Ingredients",uk:"Iнгредiєнти",ru:"Ингредиенты",de:"Zutaten",es:"Ingredientes"},gl:{en:"Grocery list",uk:"Список продуктiв",ru:"Список продуктов",de:"Einkaufsliste",es:"Compras"},cp:{en:"Copy all",uk:"Копiювати",ru:"Копировать",de:"Kopieren",es:"Copiar"},sn:{en:"Share",uk:"Надiслати",ru:"Отправить",de:"Teilen",es:"Compartir"},sc:{en:"Send checked",uk:"Вiдмiченi",ru:"Отмеченные",de:"Markierte",es:"Marcados"},sv:{en:"Save to notes",uk:"Зберегти в нотатки",ru:"Сохранить в заметки",de:"In Notizen speichern",es:"Guardar en notas"},p1:{en:"1 day",uk:"1 день",ru:"1 день",de:"1 Tag",es:"1 dia"},p7:{en:"1 week",uk:"1 тиждень",ru:"1 неделя",de:"1 Woche",es:"1 semana"},p14:{en:"2 weeks",uk:"2 тижнi",ru:"2 недели",de:"2 Wochen",es:"2 semanas"},pa:{en:"All",uk:"Весь курс",ru:"Весь курс",de:"Alles",es:"Todo"},Breakfast:{en:"Breakfast",uk:"Снiданок",ru:"Завтрак",de:"Fruehstueck",es:"Desayuno"},Lunch:{en:"Lunch",uk:"Обiд",ru:"Обед",de:"Mittagessen",es:"Almuerzo"},Dinner:{en:"Dinner",uk:"Вечеря",ru:"Ужин",de:"Abendessen",es:"Cena"},Snack1:{en:"Snack",uk:"Перекус",ru:"Перекус",de:"Snack",es:"Snack"},Snack2:{en:"Snack 2",uk:"Перекус 2",ru:"Перекус 2",de:"Snack 2",es:"Snack 2"},crs:{en:"-week course",uk:"-тижневий курс",ru:"-недельный курс",de:"-Wochen-Kurs",es:" semanas"}};');
  p('var IC={Breakfast:"B",Lunch:"L",Dinner:"D",Snack1:"S",Snack2:"S"};');
  p('var DNM={en:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],uk:["Пн","Вт","Ср","Чт","Пт","Сб","Нд"],ru:["Пн","Вт","Ср","Чт","Пт","Сб","Вс"],de:["Mo","Di","Mi","Do","Fr","Sa","So"],es:["Lu","Ma","Mi","Ju","Vi","Sa","Do"]};');
  p('function t(k){return T[k]&&T[k][L]||T[k]&&T[k].en||k}');
  p('function sdate(){var d=C.courseStart?new Date(C.courseStart):new Date();if(!C.courseStart){var w=d.getDay();d.setDate(d.getDate()-(w===0?6:w-1))}d.setHours(0,0,0,0);return d}');
  p('function ddate(n){var s=new Date(sdate().getTime());s.setDate(s.getDate()+n-1);return s}');
  p('function tdn(){var n=new Date(),s=sdate(),dd=Math.floor((n-s)/86400000)+1;return dd>=1&&dd<=TD?dd:1}');
  p('window.sl=function(l){L=l;document.querySelectorAll(".lb").forEach(function(b){b.classList.toggle("active",b.dataset.l===l)});document.getElementById("wl").textContent=t("water");document.getElementById("wg").textContent=t("wg");document.getElementById("csub").textContent=WK+t("crs")+" - "+TD+" days";rdts();ren();clk()};');
  p('function init(){');
  p('  try{');
  p('    document.getElementById("ms").innerHTML="<p style=\'padding:10px;color:#999;text-align:center;grid-column:1/-1\'>Loading... DB="+(DB?"yes":"null")+" menu28="+(DB&&DB.menu28?DB.menu28.length:"none")+" recipes="+(DB&&DB.recipes?Object.keys(DB.recipes).length:"none")+"</p>";');
  p('    if(!DB||!DB.menu28||!DB.recipes){document.getElementById("ms").innerHTML="<p style=\'padding:40px;color:#e55;text-align:center;grid-column:1/-1\'>DB: "+(DB?"keys="+Object.keys(DB).join(","):"null")+"</p>";return}');
  p('    cd=tdn();');
  p('    var fb="";');
  p('    if(C.filterVegan)fb+="<span class=\'fb\' style=\'background:#dcfce7;color:#166534\'>Vegan</span>";');
  p('    if(C.filterHalal)fb+="<span class=\'fb\' style=\'background:#e0e7ff;color:#3730a3\'>Halal</span>";');
  p('    if(C.filterLF)fb+="<span class=\'fb\' style=\'background:#fef3c7;color:#92400e\'>LF</span>";');
  p('    document.getElementById("fb").innerHTML=fb;');
  p('    sl(L);iw();rdts();ren();clk();loadWeather();');
  p('    document.getElementById("acts").innerHTML="<a class=\'ab wa\' href=\'https://wa.me/"+C.whatsapp+"\' target=\'_blank\'>WhatsApp</a><button class=\'ab\' onclick=\'shr()\'>Share</button>";');
  p('  }catch(e){document.getElementById("ms").innerHTML="<p style=\'padding:40px;color:red;text-align:center;grid-column:1/-1\'>ERR: "+e.message+"</p>"}');
  p('}');
  p('function iw(){var h="";for(var i=1;i<=8;i++)h+="<button class=\'wb\' onclick=\'tw("+i+")\'>💧</button>";document.getElementById("wbs").innerHTML=h}');
  p('window.tw=function(n){wtr=wtr>=n?n-1:n;document.querySelectorAll(".wb").forEach(function(b,i){b.classList.toggle("on",i<wtr)});document.getElementById("wc").textContent=(wtr*0.3).toFixed(1)+" / 2.4 L"};');
  p('function rdts(){var dn=DNM[L]||DNM.en,td=tdn(),h="";for(var dd=1;dd<=TD;dd++){var dt=ddate(dd),ds=dt.getDate()+"."+(dt.getMonth()+1);var c="dt";if(dd===cd)c+=" act";if(dd===td)c+=" now";h+="<button class=\'"+c+"\' onclick=\'sd("+dd+")\'>"+dn[(dd-1)%7]+"<span class=\'dn\'>"+ds+"</span></button>"}document.getElementById("dts").innerHTML=h}');
  p('window.sd=function(dd){cd=dd;rdts();ren()};');
  p('function gm(dd){if(!DB||!DB.menu28)return[];var r=DB.menu28.filter(function(m){return m.day===dd});if(!r.length)r=DB.menu28.filter(function(m){return m.day===((dd-1)%28)+1});return r.filter(function(s){var rc=DB.recipes[s.recipeId];if(!rc)return false;if(C.filterVegan&&!rc.vegan)return false;if(C.filterHalal&&!rc.halal)return false;if(C.filterLF&&!rc.lactoseFree)return false;if(C.filterSpeed&&rc.cookSpeed!==C.filterSpeed)return false;return true})}');
  p('function ren(){');
  p('  var ms=gm(cd),h="";');
  p('  ms.forEach(function(s){');
  p('    var r=DB.recipes[s.recipeId];if(!r)return;');
  p('    var nm=r.names?(r.names[L]||r.names.en):"?";');
  p('    var f=s.scaledFactor,kc=s.scaledKcal;');
  p('    var pr=Math.round(r.protein*f),fa=Math.round(r.fat*f),ca=Math.round(r.carbs*f);');
  p('    var dk=cd+"-"+s.slot,isd=!!done[dk];');
  p('    var tg="";if(r.vegan)tg+="<span class=\'mtag tv\'>Vegan</span>";if(r.halal)tg+="<span class=\'mtag th\'>Halal</span>";if(r.lactoseFree)tg+="<span class=\'mtag tl\'>LF</span>";');
  p('    var ig="";');
  p('    if(r.ingredients){ig="<div class=\'mi\'><h4>"+t("ing")+"</h4>";r.ingredients.forEach(function(i){var n=DB.ingredientNames[i.key]?(DB.ingredientNames[i.key][L]||DB.ingredientNames[i.key].en):i.key;ig+="<div class=\'ir\'><span>"+n+"</span><span class=\'ig\'>"+Math.round(i.gramsBase*f)+" g</span></div>"});ig+="</div>"}');
  p('    h+="<div class=\'mc\'><div class=\'mt\'>"+IC[s.slot]+" "+t(s.slot)+"</div><div class=\'mn\'>"+nm+"</div><div class=\'mb\'>"+kc+" kcal - P"+pr+" F"+fa+" C"+ca+" - "+r.cookTimeMin+"min</div>";');
  p('    if(tg)h+="<div class=\'mtags\'>"+tg+"</div>";');
  p('    h+=ig;');
  p('    h+="<button class=\'db"+(isd?" on":"")+"\' data-k=\'"+dk+"\' onclick=\'td(this)\'>"+t("dn")+"</button></div>";');
  p('  });');
  p('  document.getElementById("ms").innerHTML=h||"<p style=\'padding:40px;color:#94a3b8;text-align:center;grid-column:1/-1\'>No meals</p>";');
  p('  ut();rg();');
  p('}');
  p('window.td=function(b){var k=b.dataset.k;done[k]=!done[k];b.classList.toggle("on");ut()};');
  p('function ut(){var m=gm(cd),dd=0,pp=0;m.forEach(function(s){pp+=s.scaledKcal;if(done[cd+"-"+s.slot])dd+=s.scaledKcal});document.getElementById("tot").innerHTML="<span>Day "+cd+"</span><span><span class=\'tdone\'>"+dd+"</span> / "+pp+" kcal</span>"}');
  p('function rg(){');
  p('  var df=cd,dt=cd;');
  p('  if(gper==="week"){df=cd;dt=Math.min(cd+6,TD)}');
  p('  else if(gper==="2week"){df=cd;dt=Math.min(cd+13,TD)}');
  p('  else if(gper==="all"){df=1;dt=TD}');
  p('  var items={};');
  p('  for(var dd=df;dd<=dt;dd++){gm(dd).forEach(function(s){var r=DB.recipes[s.recipeId];if(!r||!r.ingredients)return;r.ingredients.forEach(function(i){var g=Math.round(i.gramsBase*s.scaledFactor);if(items[i.key])items[i.key].g+=g;else items[i.key]={k:i.key,g:g}})})}');
  p('  var arr=Object.values(items);');
  p('  arr.forEach(function(a){a.n=DB.ingredientNames[a.k]?(DB.ingredientNames[a.k][L]||DB.ingredientNames[a.k].en):a.k});');
  p('  var loc=L==="uk"?"uk":L==="ru"?"ru":L==="de"?"de":L==="es"?"es":"en";');
  p('  arr.sort(function(a,b){return a.n.localeCompare(b.n,loc)});');
  p('  if(!arr.length){document.getElementById("gr").innerHTML="";return}');
  p('  var h="<div class=\'gs\'><div class=\'gs-t\'><span>"+t("gl")+"</span><span style=\'font-size:0.8rem;color:#5f748b\'>"+arr.length+"</span></div>";');
  p('  h+="<div class=\'gp\'>";');
  p('  h+="<button class=\'gpb"+(gper==="day"?" on":"")+"\' onclick=\'sgp(\"day\")\'>"+t("p1")+"</button>";');
  p('  h+="<button class=\'gpb"+(gper==="week"?" on":"")+"\' onclick=\'sgp(\"week\")\'>"+t("p7")+"</button>";');
  p('  h+="<button class=\'gpb"+(gper==="2week"?" on":"")+"\' onclick=\'sgp(\"2week\")\'>"+t("p14")+"</button>";');
  p('  h+="<button class=\'gpb"+(gper==="all"?" on":"")+"\' onclick=\'sgp(\"all\")\'>"+t("pa")+"</button>";');
  p('  h+="</div><div class=\'gg\'>";');
  p('  arr.forEach(function(i){h+="<label class=\'gi\'><input type=\'checkbox\' onchange=\'gc(this)\'><span class=\'gn\'>"+i.n+"</span><span class=\'ig\'>"+i.g+" g</span></label>"});');
  p('  h+="</div><div class=\'gshr\'>";');
  p('  h+="<button class=\'gcb\' onclick=\'gcp(false)\'>"+t("cp")+"</button>";');
  p('  h+="<button class=\'gsh\' onclick=\'gss(false)\'>"+t("sn")+"</button>";');
  p('  h+="<button class=\'gck\' onclick=\'gss(true)\'>"+t("sc")+"</button>";');
  p('  h+="<button class=\'gnote\' onclick=\'gsave()\'>"+t("sv")+"</button>";');
  p('  h+="</div></div>";');
  p('  document.getElementById("gr").innerHTML=h;');
  p('}');
  p('window.sgp=function(pp){gper=pp;rg()};');
  p('window.gc=function(cb){var el=cb.closest(".gi");if(el)el.classList.toggle("chk",cb.checked)};');
  p('function gtxt(only){');
  p('  var lines=[];');
  p('  document.querySelectorAll(".gi").forEach(function(el){');
  p('    var cb=el.querySelector("input");');
  p('    if(only&&!cb.checked)return;');
  p('    lines.push((cb.checked?"[x] ":"[ ] ")+el.querySelector(".gn").textContent+" - "+el.querySelector(".ig").textContent);');
  p('  });');
  p('  return t("gl")+" (Day "+cd+")\\n"+lines.join("\\n");');
  p('}');
  p('window.gcp=function(only){navigator.clipboard.writeText(gtxt(only)).then(function(){alert("OK")}).catch(function(){})};');
  p('window.gss=function(only){var tx=gtxt(only);if(navigator.share)navigator.share({title:t("gl"),text:tx}).catch(function(){gcp(only)});else gcp(only)};');
  // Save to notes - downloads as .txt file
  p('window.gsave=function(){');
  p('  var tx=gtxt(false);');
  p('  var blob=new Blob([tx],{type:"text/plain"});');
  p('  var url=URL.createObjectURL(blob);');
  p('  var a=document.createElement("a");');
  p('  a.href=url;');
  p('  a.download=t("gl")+"_Day"+cd+".txt";');
  p('  document.body.appendChild(a);');
  p('  a.click();');
  p('  document.body.removeChild(a);');
  p('  URL.revokeObjectURL(url);');
  p('};');
  // Weather function using Open-Meteo (free, no API key)
  p('function loadWeather(){');
  p('  var city=C.city||"";if(!city)return;');
  p('  fetch("https://geocoding-api.open-meteo.com/v1/search?name="+encodeURIComponent(city.split(",")[0].trim())+"&count=1")');
  p('  .then(function(r){return r.json()})');
  p('  .then(function(geo){');
  p('    if(!geo.results||!geo.results.length)return;');
  p('    var lat=geo.results[0].latitude,lon=geo.results[0].longitude;');
  p('    return fetch("https://api.open-meteo.com/v1/forecast?latitude="+lat+"&longitude="+lon+"&current=temperature_2m,weather_code&timezone=auto")');
  p('  })');
  p('  .then(function(r){if(r)return r.json()})');
  p('  .then(function(w){');
  p('    if(!w||!w.current)return;');
  p('    var temp=Math.round(w.current.temperature_2m);');
  p('    var code=w.current.weather_code;');
  p('    var icons={0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",48:"🌫️",51:"🌦️",53:"🌦️",55:"🌧️",61:"🌧️",63:"🌧️",65:"🌧️",71:"🌨️",73:"🌨️",75:"❄️",80:"🌦️",81:"🌧️",82:"⛈️",95:"⛈️",96:"⛈️"};');
  p('    var descs={en:{0:"Clear",1:"Mostly clear",2:"Partly cloudy",3:"Cloudy",45:"Foggy",51:"Light drizzle",61:"Rain",71:"Snow",80:"Showers",95:"Storm"},ru:{0:"Ясно",1:"Малооблачно",2:"Переменная обл.",3:"Облачно",45:"Туман",51:"Морось",61:"Дождь",71:"Снег",80:"Ливень",95:"Гроза"},uk:{0:"Ясно",1:"Малохмарно",2:"Мiнлива хм.",3:"Хмарно",45:"Туман",51:"Мряка",61:"Дощ",71:"Снiг",80:"Злива",95:"Гроза"},de:{0:"Klar",1:"Heiter",2:"Wolkig",3:"Bedeckt",45:"Nebel",51:"Niesel",61:"Regen",71:"Schnee",80:"Schauer",95:"Gewitter"},es:{0:"Despejado",1:"Despejado",2:"Nublado parcial",3:"Nublado",45:"Niebla",51:"Llovizna",61:"Lluvia",71:"Nieve",80:"Chubascos",95:"Tormenta"}};');
  p('    var dmap=descs[L]||descs.en;');
  p('    var nearest=[0,1,2,3,45,51,61,71,80,95].reduce(function(p,c){return Math.abs(c-code)<Math.abs(p-code)?c:p});');
  p('    document.getElementById("wico").textContent=icons[nearest]||"🌡️";');
  p('    document.getElementById("wtemp").textContent=temp+"°C";');
  p('    document.getElementById("wdesc").textContent=dmap[nearest]||"";');
  p('    document.getElementById("wcity").textContent=city;');
  p('    document.getElementById("wbar").style.display="flex";');
  p('  }).catch(function(){});');
  p('}');
  p('function clk(){');
  p('  var n=new Date();');
  p('  try{');
  p('    document.getElementById("fd").textContent=n.toLocaleDateString(L==="uk"?"uk-UA":L==="ru"?"ru-RU":L==="de"?"de-DE":"en-US",{timeZone:TZ,year:"numeric",month:"long",day:"numeric"});');
  p('    document.getElementById("ck").textContent=n.toLocaleTimeString("en-US",{timeZone:TZ,hour12:false,hour:"2-digit",minute:"2-digit"});');
  p('    var dnames={en:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],uk:["Недiля","Понедiлок","Вiвторок","Середа","Четвер","Пятниця","Субота"],ru:["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"],de:["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"]};');
  p('    var dn=dnames[L]||dnames.en;');
  p('    var ln=new Date(n.toLocaleString("en-US",{timeZone:TZ}));');
  p('    document.getElementById("tb").textContent=dn[ln.getDay()];');
  p('  }catch(e){}');
  p('  setTimeout(clk,30000);');
  p('}');
  p('window.shr=function(){if(navigator.share)navigator.share({title:"Wellness",url:location.href}).catch(function(){});else{navigator.clipboard.writeText(location.href);alert("Link copied")}};');
  p('window.onload=init;');
  p('})();');
  p('</script>');
  p('</body>');
  p('</html>');

  return lines.join('\n');
}

const PAGE = buildPage();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const p = req.query.path;
  const alias = (Array.isArray(p) ? p[0] : p || "").toLowerCase().replace(".html", "");
  if (!alias) return res.status(404).send("Not found");

  const client: any = await blobGet("clients/" + alias);
  if (!client) {
    return res.status(404).setHeader("Content-Type", "text/html; charset=utf-8")
      .send('<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh"><h1>404 - Not found</h1></body></html>');
  }

  const db: any = await blobGet("recipes/database");
  const c = client;
  const weeks = parseInt(c.courseWeeks) || 4;
  const totalDays = weeks * 7;

  // Build the data JSON that goes into <script type="application/json">
  const appData = JSON.stringify({
    c: c,
    db: db,
    lang: c.lang || "en",
    tz: c.timezone || "Europe/Berlin",
    weeks: weeks,
    days: totalDays
  });

  // Safe for embedding in HTML - escape </ sequences
  const safeAppData = appData.replace(/<\//g, "<\\/");

  let html = PAGE;
  html = html.replace(/XNAMEX/g, escH(c.name || "Client"));
  html = html.replace(/XKCALX/g, escH(c.kcal || "1600"));
  html = html.replace(/XSTATSX/g, escH((c.heightMet || "170") + " \u00b7 " + (c.weightMet || "60")));
  html = html.replace(/XCITYX/g, escH(c.city || ""));
  html = html.replace(/XAPPDATAX/g, safeAppData);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.send(html);
}
