// ===================== LoveLense для Mac: настольная раскладка =====================
// Боковое меню слева, главная — панель из карточек, разделы открываются справа (не поверх всего экрана).
// Включается в Mac-приложении (window.LL_MAC) или в предпросмотре с ?desk=1.
var DESK=!!(window.LL_MAC||/[?&]desk=1/.test(location.search));
if(DESK){(function(){
 var h=document.documentElement;h.classList.add("desk");
 var ITEMS=[
  ["home","🏠","Главная"],["map","🗺","Карта"],["media","🎬","Кино и музыка"],["games","🎮","Игры"],
  ["us","💞","Мы двое"],["live","🌙","Рядом сейчас"],["pet","🦊","Питомец"],["ryzhiy","🧺","Рыжий на Mac"],
  ["look","🎨","Оформление"],["prof","👤","Профиль"]
 ];
 if(!window.llPet)ITEMS=ITEMS.filter(function(i){return i[0]!=="ryzhiy"});
 // стиль Mac-версии: «Розовый» (как в Telegram) или «Стекло» (графитовое жидкое стекло)
 PREF_DEF.mstyle="pink";
 // фоны «Стекло» — в общем списке фонов (только на Mac)
 BGS.graphite={n:"Графит",tone:"dark",dark:true,css:"radial-gradient(circle at 93% 112%,rgba(255,255,255,.78) 0,rgba(226,226,232,.5) 14%,rgba(160,161,168,.35) 26%,rgba(255,255,255,.55) 29.6%,transparent 30.4%),radial-gradient(circle at 2% 106%,rgba(255,255,255,.6) 0,rgba(210,210,216,.35) 13%,rgba(255,255,255,.4) 19.6%,transparent 20.4%),radial-gradient(circle at 80% -12%,rgba(255,255,255,.35) 0,rgba(255,255,255,.12) 22%,transparent 34%),linear-gradient(118deg,transparent 30%,rgba(255,255,255,.14) 44%,transparent 56%),linear-gradient(135deg,#86878c 0%,#5b5c61 36%,#404145 64%,#707176 100%)"};
 BGS.obsidian={n:"Обсидиан",tone:"dark",dark:true,css:"radial-gradient(circle at 90% 110%,rgba(170,175,190,.55) 0,rgba(90,94,108,.35) 18%,rgba(200,205,220,.4) 27.6%,transparent 28.4%),radial-gradient(circle at 6% 0%,rgba(150,155,175,.35) 0,transparent 30%),linear-gradient(118deg,transparent 35%,rgba(255,255,255,.08) 48%,transparent 60%),linear-gradient(135deg,#2c2e35 0%,#17181d 55%,#24262d 100%)"};
 BGS.silver={n:"Серебро",tone:"light",css:"radial-gradient(circle at 92% 110%,#ffffff 0,rgba(235,236,240,.8) 16%,rgba(205,207,214,.7) 27%,rgba(255,255,255,.9) 29.6%,transparent 30.4%),radial-gradient(circle at 4% 104%,rgba(255,255,255,.9) 0,rgba(220,222,228,.6) 15%,transparent 20.4%),linear-gradient(118deg,transparent 30%,rgba(255,255,255,.5) 46%,transparent 58%),linear-gradient(135deg,#e9eaee 0%,#cfd1d7 45%,#bfc1c8 70%,#dfe0e5 100%)"};
 BGS.mist={n:"Туманное стекло",tone:"light",css:"radial-gradient(circle at 88% 108%,rgba(255,255,255,.95) 0,rgba(214,226,240,.7) 16%,rgba(255,255,255,.85) 26.6%,transparent 27.4%),radial-gradient(ellipse 50% 40% at 10% 10%,rgba(255,255,255,.7),transparent 70%),linear-gradient(135deg,#dfe6ee 0%,#c7d1dd 50%,#e8ecf2 100%)"};
 BG_GROUPS.unshift(["Стекло (для Mac)",["graphite","obsidian","silver","mist"]]);
 var _alM=applyLook;applyLook=function(){_alM();h.setAttribute("data-mstyle",prefs().mstyle==="glass"?"glass":"pink");var q=$("dStyle");if(q)Array.prototype.forEach.call(q.children,function(b){b.classList.toggle("on",b.getAttribute("data-s")===prefs().mstyle)})};
 // при выборе «Стекла» ставим графитовый фон; дальше любой фон можно сменить в «Оформлении»
 var GLASS_BG=["graphite","obsidian","silver","mist"];
 window.deskStyle=function(v){haptic();var p=prefs();
  if(v==="glass"&&GLASS_BG.indexOf(p.bg)<0){var pp={};try{pp=JSON.parse(ls("ll_prefs")||"{}")||{}}catch(e){}pp.bgPink=p.bg;pp.bg="graphite";pp.mstyle="glass";ls("ll_prefs",JSON.stringify(pp));applyLook();return}
  if(v==="pink"&&GLASS_BG.indexOf(p.bg)>=0){var q={};try{q=JSON.parse(ls("ll_prefs")||"{}")||{}}catch(e){}q.bg=q.bgPink&&BGS[q.bgPink]?q.bgPink:"pearl";q.mstyle="pink";ls("ll_prefs",JSON.stringify(q));applyLook();return}
  setPref("mstyle",v)};
 var side=node('<aside class="dside" id="dSide"><div class="dbrand"><span class="dlogo">LoveLense</span><small>вместе на любом расстоянии</small></div>'+
  '<div class="dstyle" id="dStyle"><button type="button" data-s="pink">🌸 Розовый</button><button type="button" data-s="glass">◐ Стекло</button></div><nav class="dnav" id="dNav"></nav>'+
  '<div class="dpart" id="dPart"><div class="dpav" id="dPav">♡</div><div class="dpt"><b id="dPn">Партнёр</b><small id="dPs">—</small></div></div></aside>');
 document.body.appendChild(side);
 Array.prototype.forEach.call($("dStyle").children,function(b){b.onclick=function(){deskStyle(b.getAttribute("data-s"))}});
 applyLook();
 // «Оформление»: выбор стиля для Mac сверху
 var _look=SHEETS.look.r;
 SHEETS.look.r=function(B){
  var b=box(B,'<div class="lab">Стиль LoveLense для Mac</div><div class="mstyles"><button type="button" class="pink" data-s="pink"><div class="pv"><i></i><i></i></div><b>🌸 Розовый</b></button><button type="button" class="glass" data-s="glass"><div class="pv"><i></i><i></i></div><b>◐ Стекло</b></button></div><div class="hint">Переключать можно и вверху бокового меню</div>');
  Array.prototype.forEach.call(b.querySelectorAll("[data-s]"),function(x){x.classList.toggle("on",x.getAttribute("data-s")===prefs().mstyle);x.onclick=function(){deskStyle(x.getAttribute("data-s"));Array.prototype.forEach.call(b.querySelectorAll("[data-s]"),function(y){y.classList.toggle("on",y===x)})}});
  _look(B);
 };
 ITEMS.forEach(function(it,i){
  var b=node('<button type="button" data-k="'+it[0]+'"><span class="di">'+it[1]+'</span><span>'+it[2]+'</span>'+(i<9?'<kbd>⌘'+(i+1)+'</kbd>':'')+'</button>');
  b.onclick=function(){deskGo(it[0])};$("dNav").appendChild(b);
 });
 $("dPart").onclick=function(){deskGo("partner")};
 // главная: «герой» (вы двое) + карточки разделов в одной сетке
 var home=$("v-home"),hero=node('<div class="card dhero" id="dHero"></div>');
 ["ctimes","couple","thint"].forEach(function(c){var e=home.querySelector("."+c)||$(c==="thint"?"tHint":"");if(e)hero.appendChild(e)});
 var top=home.querySelector(".top");home.insertBefore(hero,top?top.nextSibling:home.firstChild);
 var grid=node('<div class="dgrid" id="dGrid"></div>');home.appendChild(grid);
 ["daysCard","meetCard","petRow","hubMedia","hubGames","hubUs","hubLive"].forEach(function(id){var e=$(id);if(e)grid.appendChild(e)});
 // приветствие
 var hi=node('<div class="dhi"><h1 id="dHi">Привет ♡</h1><small id="dDate"></small></div>');home.insertBefore(hi,home.firstChild);
 function greet(){var hr=new Date().getHours(),n=S&&S.me?name(S.me):"";$("dHi").textContent=(hr<5?"Доброй ночи":hr<12?"Доброе утро":hr<18?"Добрый день":"Добрый вечер")+(n?", "+n:"")+" ♡";
  $("dDate").textContent=new Date().toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long"})}
 // переходы
 var curK="home";
 window.deskGo=function(k){
  haptic();curK=k;Array.prototype.forEach.call($("dNav").children,function(b){b.classList.toggle("on",b.getAttribute("data-k")===k)});
  if($("sheet").classList.contains("on")){HUB.returnTo=null;closeSheet()}
  var tab=function(t){var b=document.querySelector('.nav button[data-tab="'+t+'"]');if(b)b.click()};
  if(k==="home"||k==="map"||k==="prof"){tab(k);return}
  tab("home");
  if(k==="media")hubOpen("media","movie");else if(k==="games")hubOpen("games");else if(k==="us")hubOpen("us");else if(k==="live")hubOpen("live");
  else openSheet(k);
 };
 // назад из раздела — снова главная (раздел закрыли кнопкой ← или Esc)
 var obs=new MutationObserver(function(){if(!$("sheet").classList.contains("on")&&["home","map","prof"].indexOf(curK)<0){var t=document.querySelector(".nav button.on");var k=t?t.getAttribute("data-tab"):"home";curK=k;Array.prototype.forEach.call($("dNav").children,function(b){b.classList.toggle("on",b.getAttribute("data-k")===k)})}});
 obs.observe($("sheet"),{attributes:true,attributeFilter:["class"]});
 // ⌘1…⌘9
 document.addEventListener("keydown",function(e){if(e.metaKey&&!e.shiftKey&&!e.altKey&&/^[1-9]$/.test(e.key)){var it=ITEMS[+e.key-1];if(it){e.preventDefault();deskGo(it[0])}}});
 // карточка партнёра внизу меню
 function part(){
  if(!S)return;var p=S.partner;greet();
  if(!p){$("dPn").textContent="Добавь партнёра";$("dPs").textContent="Нажми, чтобы пригласить";setPhoto($("dPav"),null);return}
  setPhoto($("dPav"),p);$("dPn").textContent=name(p);
  var bits=[online()?"● в сети":"не в сети"];if(S.partner_tz)bits.push(clock(S.partner_tz));var bt=batTxt(S.partner_bat);if(bt)bits.push(bt);
  $("dPs").textContent=bits.join(" · ");$("dPart").classList.toggle("on",online());
 }
 setInterval(part,3000);setTimeout(part,600);
 var _render=render;render=function(){var r=_render.apply(this,arguments);try{part()}catch(e){}return r};
 $("dNav").children[0].classList.add("on");
})()}

// ===================== Рыжий на Mac: настройки =====================
if(window.llPet){
 var RZ={st:null};
 window.__llPetState=function(j){try{RZ.st=typeof j==="string"?JSON.parse(j):j}catch(e){RZ.st=null}if(cur&&cur.k==="ryzhiy")rzRender($("shB"))};
 SHEETS.ryzhiy={t:"Рыжий на Mac",r:function(B){B.innerHTML='<div class="hint" style="margin-top:0">Связываюсь с Рыжим…</div>';window.llPet({cmd:"get"});setTimeout(function(){if(cur&&cur.k==="ryzhiy"&&!RZ.st)rzRender(B)},1500)}};
 function rzRender(B){
  B.innerHTML="";var s=RZ.st;
  if(!s){box(B,'<div class="dbig">🧺</div><div class="lab" style="text-align:center">Рыжий сейчас не запущен</div><div class="hint" style="text-align:center">Рыжий живёт на рабочем столе: гуляет по окнам, спит в лукошке, приносит весточки от партнёра.</div><button class="btn" id="rzRun" type="button">Запустить Рыжего</button>');
   $("rzRun").onclick=function(){haptic();window.llPet({cmd:"launch"});setTimeout(function(){window.llPet({cmd:"get"})},2500)};return}
  var c=s.cfg||{},pn=S&&S.pet?S.pet.name:"Рыжий";
  var top=box(B,'<div class="rzhead"><div class="rzpic" id="rzPic"></div><div><b>'+esc(pn)+' на рабочем столе</b><small>'+(s.connected?"Подключён к LoveLense ♡":"Не подключён к LoveLense")+'</small></div></div>'+
   '<div class="ract" style="margin-top:12px"><button type="button" data-c="feed">🍖<span>Покормить</span></button><button type="button" data-c="play">🎾<span>Поиграть</span></button><button type="button" data-c="call">👋<span>Позвать сюда</span></button></div>'+
   '<div class="ract"><button type="button" data-c="home">🧺<span>В лукошко</span></button><button type="button" data-c="toggle">'+(s.visible?"🙈<span>Спрятать</span>":"👀<span>Показать</span>")+'</button><button type="button" data-c="pet">🎨<span>Вид и имя</span></button></div>');
  if(S&&S.pet)$("rzPic").innerHTML=petSvg(S.pet.kind,"happy",S.pet);
  Array.prototype.forEach.call(top.querySelectorAll("[data-c]"),function(b){b.onclick=function(){var k=b.getAttribute("data-c");haptic();
   if(k==="pet"){deskGo("pet");return}window.llPet({cmd:k});toast({feed:"Ням! 🍖",play:"Играем! 🎾",call:"Бежит к тебе 🦊",home:"Пошёл в лукошко 🧺",toggle:s.visible?"Спрятался":"Вернулся"}[k]);setTimeout(function(){window.llPet({cmd:"get"})},400)}});
  var cf=box(B,'<div class="lab">Характер и вид</div>'+
   '<div class="opt"><div class="lab">Размер</div><div class="seg" id="rzSize"></div></div>'+
   '<div class="opt"><div class="lab">Скорость</div><div class="seg" id="rzSpeed"></div></div>'+
   '<div class="opt"><div class="lab">Разговорчивость</div><div class="seg" id="rzChat"></div></div>'+
   '<div class="opt"><div class="lab">Ночью</div><div class="seg" id="rzSleep"></div></div>'+
   '<div class="opt"><div class="lab">Обои «небо партнёра»</div><div class="seg" id="rzSky"></div></div>'+
   '<div class="opt"><div class="lab">Запускать при входе в Mac</div><div class="seg" id="rzLogin"></div></div>');
  var seg=function(id,key,opts,val){var e=$(id);opts.forEach(function(o){var x=node('<button type="button" class="'+(String(val)===String(o[0])?"on":"")+'">'+o[1]+'</button>');
   x.onclick=function(){haptic();Array.prototype.forEach.call(e.children,function(y){y.classList.toggle("on",y===x)});var m={cmd:"set"};m[key]=o[0];window.llPet(m)};e.appendChild(x)})};
  seg("rzSize","size",[[0.75,"S"],[1,"M"],[1.3,"L"],[1.6,"XL"]],c.size||1);
  seg("rzSpeed","speed",[[0.6,"Спокойный"],[1,"Обычный"],[1.6,"Шустрый"]],c.speed||1);
  seg("rzChat","chat",[[0,"Молчун"],[1,"Обычный"],[2,"Болтун"]],c.chat==null?1:c.chat);
  seg("rzSleep","sleep",[[true,"Спит в лукошке"],[false,"Не спит"]],c.sleep!==false);
  seg("rzSky","sky",[[true,"Вкл"],[false,"Выкл"]],s.sky!==false);
  seg("rzLogin","login",[[true,"Да"],[false,"Нет"]],!!s.login);
  box(B,'<div class="hint" style="margin-top:0">Рыжий — тот же питомец, что у вас в LoveLense: его вид, имя и наряд общие для пары. Гладь его кликом, двойной клик — разбудить, зажми — подержать, перетащи файл на него — отнесёт партнёру. ⌥⇧H — сердечко партнёру из любой программы.</div>');
 }
}
