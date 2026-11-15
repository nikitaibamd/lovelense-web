// ===================== «Мы двое» и «Рядом сейчас» =====================
HUBS.us={t:"Мы двое",tabs:[["q","💬","Вопрос"],["wish","🌟","Мечты"],["letter","💌","Письма"],["diary","📷","Дневник"]]};
HUBS.live={t:"Рядом сейчас",tabs:[["sleep","🌙","Засыпаем"],["focus","⏳","Фокус"],["date","📅","Свидание"]]};
var TG2={timer:null,photos:{}};
function tAdd(B,h){var d=document.createElement("div");d.innerHTML=h;while(d.firstChild)B.appendChild(d.firstChild)}
function togStop(){clearInterval(TG2.timer);TG2.timer=null}
function tWho(mine){return mine?"ты":pingName()}
function tDay(d){try{var p=String(d).split("-");return +p[2]+" "+["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"][+p[1]-1]}catch(e){return d}}
function tMin(ms){var s=Math.max(0,Math.round(ms/1000)),m=Math.floor(s/60);return m+":"+String(s%60).padStart(2,"0")}
var TOG={
 // --- вопрос дня + архив ---
 q:function(B){
  tAdd(B,'<div class="card box tq"><div class="lab">Вопрос дня</div><div class="tqq" id="tqQ">…</div><div id="tqBody"></div></div><div class="card box"><div class="lab">Наши ответы</div><div id="tqArch" class="hint">Здесь будут дни, когда ответили вы оба</div></div>');
  var draw=function(r){
   $("tqQ").textContent=r.question||"";var b=$("tqBody");b.innerHTML="";
   if(r.mine==null){
    b.appendChild(node('<textarea class="in" id="tqIn" rows="3" maxlength="1000" placeholder="Твой ответ… партнёр увидит его, когда ответит сам"></textarea>'));
    var s=node('<button class="btn" type="button">Ответить</button>');b.appendChild(s);
    if(r.partner_answered)b.appendChild(node('<div class="hint">💌 '+esc(pingName())+' уже ответил(а) — ответь, чтобы увидеть</div>'));
    s.onclick=function(){var t=$("tqIn").value.trim();if(!t)return;haptic("medium");call("/v2/pair/answer",{text:t}).then(draw).catch(function(){toast("Не получилось")})};
   }else{
    b.appendChild(node('<div class="tqa me"><small>ты</small><div></div></div>'));b.lastChild.lastChild.textContent=r.mine;
    if(r.partner!=null){b.appendChild(node('<div class="tqa pa"><small>'+esc(pingName())+'</small><div></div></div>'));b.lastChild.lastChild.textContent=r.partner}
    else b.appendChild(node('<div class="hint">🔒 Ответ откроется, когда ответит '+esc(pingName())+'</div>'));
   }
  };
  call("/v2/pair/question",{}).then(draw).catch(function(){});
  call("/v2/pair/answers",{}).then(function(r){var a=$("tqArch");if(!a||!r.days||!r.days.length)return;a.className="";a.innerHTML="";
   r.days.forEach(function(d){var e=node('<div class="tqd"><div class="tqdq"><b>'+tDay(d.day)+'</b> · <span></span></div><div class="tqa me"><small>ты</small><div></div></div><div class="tqa pa"><small>'+esc(pingName())+'</small><div></div></div></div>');
    e.querySelector("span").textContent=d.q;e.querySelectorAll(".tqa div")[0].textContent=d.mine;e.querySelectorAll(".tqa div")[1].textContent=d.partner;a.appendChild(e)})}).catch(function(){});
 },
 // --- список «Сделаем вместе» ---
 wish:function(B){
  tAdd(B,'<div class="card box"><div class="lab">Сделаем вместе</div><div class="trow"><input class="in" id="twIn" maxlength="80" placeholder="Поехать к морю, сходить на концерт…"><button class="tadd" id="twAdd" type="button">＋</button></div><div class="hint">Когда сделаете это вместе — нажми ✓, и мечта уйдёт в ваши воспоминания</div></div><div id="twList"></div>');
  var load=function(){call("/v2/pair/items",{kind:"wish"}).then(function(r){var L=$("twList");if(!L)return;L.innerHTML="";
   if(!r.items.length)L.appendChild(node('<div class="hint" style="text-align:center;margin-top:18px">Пока пусто — запишите первую общую мечту 🌟</div>'));
   r.items.forEach(function(it){var e=node('<div class="card twi"><button class="twok" type="button" aria-label="Сбылось">✓</button><div class="twt"><b></b><small>'+(it.mine?"добавил(а) ты":"добавил(а) "+esc(pingName()))+'</small></div>'+(it.mine?'<button class="twdel" type="button" aria-label="Удалить">×</button>':'')+'</div>');
    e.querySelector("b").textContent=it.title;
    e.querySelector(".twok").onclick=function(){haptic("heavy");e.classList.add("done");call("/v2/pair/item/done",{id:it.id}).then(function(){toast("Сбылось! Теперь это ваше воспоминание ✨");setTimeout(load,700)}).catch(function(){toast("Не получилось")})};
    var d=e.querySelector(".twdel");if(d)d.onclick=function(){haptic();call("/v2/pair/item/delete",{id:it.id}).then(load).catch(function(){})};
    L.appendChild(e)})}).catch(function(){})};
  $("twAdd").onclick=function(){var t=$("twIn").value.trim();if(!t)return;haptic("medium");call("/v2/pair/item/add",{kind:"wish",title:t,body:""}).then(function(){$("twIn").value="";load()}).catch(function(){toast("Не получилось")})};
  load();
 },
 // --- письма в будущее ---
 letter:function(B){
  var tm=new Date(Date.now()+864e5);
  tAdd(B,'<div class="card box"><div class="lab">Письмо в будущее</div><input class="in" id="tlT" maxlength="80" placeholder="Заголовок — например «Открой в день встречи»"><textarea class="in" id="tlB" rows="4" maxlength="2000" placeholder="Что ты хочешь сказать?" style="margin-top:8px"></textarea><div class="lab" style="margin-top:10px">Откроется</div><div class="dwrap"><input class="in" type="date" id="tlD" min="'+iso(tm)+'" value="'+iso(tm)+'"></div><button class="btn" id="tlS" type="button">Запечатать 💌</button></div><div id="tlList"></div>');
  var load=function(){call("/v2/pair/items",{kind:"letter"}).then(function(r){var L=$("tlList");if(!L)return;L.innerHTML="";
   r.items.forEach(function(it){var op=it.open_at?new Date(it.open_at):null;
    var e=node('<div class="card tli'+(it.locked?" lk":"")+'"><div class="tlh"><span>'+(it.locked?"🔒":"💌")+'</span><b></b></div><small>'+(it.mine?"пишешь ты":"пишет "+esc(pingName()))+(op?" · "+(it.locked?"откроется ":"открылось ")+op.toLocaleDateString("ru-RU",{day:"numeric",month:"long"}):"")+'</small><div class="tlb"></div></div>');
    e.querySelector("b").textContent=it.title||"Письмо";if(!it.locked)e.querySelector(".tlb").textContent=it.body||"";L.appendChild(e)})}).catch(function(){})};
  $("tlS").onclick=function(){var t=$("tlT").value.trim(),b=$("tlB").value.trim(),d=$("tlD").value;if(!b||!d){toast("Напиши письмо и выбери дату");return}
   var at=new Date(d+"T09:00:00").getTime();haptic("medium");
   call("/v2/pair/item/add",{kind:"letter",title:t||"Письмо",body:b,open_at:at}).then(function(){$("tlT").value="";$("tlB").value="";toast("Письмо запечатано 💌");load()}).catch(function(){toast("Не получилось")})};
  load();
 },
 // --- фото-дневник «день у тебя / день у меня» ---
 diary:function(B){
  tAdd(B,'<div class="card box"><div class="lab">Фото дня</div><div class="hint" style="margin-top:0">Одно фото в день от каждого — получается разворот вашей жизни на расстоянии</div><label class="btn" style="text-align:center">📷 Добавить моё фото дня<input type="file" accept="image/*" id="tdF" style="display:none"></label></div><div id="tdList"></div>');
  var load=function(){call("/v2/pair/photos",{}).then(function(r){var L=$("tdList");if(!L)return;L.innerHTML="";
   if(!r.days.length)L.appendChild(node('<div class="hint" style="text-align:center;margin-top:18px">Здесь появятся ваши дни ✨</div>'));
   r.days.forEach(function(d){var e=node('<div class="card tdd"><div class="lab">'+tDay(d.day)+(d.day===r.today?" · сегодня":"")+'</div><div class="tdp"><div class="tdi" data-id="'+(d.mine||"")+'"><small>ты</small></div><div class="tdi" data-id="'+(d.partner||"")+'"><small>'+esc(pingName())+'</small></div></div></div>');
    Array.prototype.forEach.call(e.querySelectorAll(".tdi"),function(x){var id=x.getAttribute("data-id");if(!id){x.classList.add("none");return}
     var put=function(u){x.style.backgroundImage='url("'+u+'")';x.onclick=function(){var v=node('<div class="tdv"><img alt=""></div>');v.firstChild.src=u;v.onclick=function(){v.remove()};document.body.appendChild(v)}};
     if(TG2.photos[id])put(TG2.photos[id]);else call("/v2/pair/photo",{id:+id}).then(function(p){TG2.photos[id]=p.data;put(p.data)}).catch(function(){})});
    L.appendChild(e)})}).catch(function(){})};
  $("tdF").onchange=function(){var f=this.files&&this.files[0];if(!f)return;toast("Загружаю…");
   var img=new Image();img.onload=function(){var k=Math.min(1,1080/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext("2d").drawImage(img,0,0,c.width,c.height);
    var q=.75,u=c.toDataURL("image/jpeg",q);while(u.length>440000&&q>.3){q-=.1;u=c.toDataURL("image/jpeg",q)}
    call("/v2/pair/photo/add",{data:u}).then(function(){haptic("heavy");toast("Фото дня добавлено 📷");load()}).catch(function(){toast("Не получилось загрузить")})};
   img.onerror=function(){toast("Не получилось открыть фото")};img.src=URL.createObjectURL(f)};
  load();
 },
 // --- засыпаем вместе ---
 sleep:function(B){
  tAdd(B,'<div class="card box tsl"><div class="tsm" id="tsMoon">🌙</div><div class="tst" id="tsT">Включи тихие звуки — у второго из вас заиграют такие же, а через выбранное время всё плавно стихнет у обоих</div><div class="lab">Звук</div><div class="seg" id="tsS"></div><div class="lab" style="margin-top:10px">Сколько</div><div class="seg" id="tsM"></div><button class="btn" id="tsGo" type="button">Засыпаем 🌙</button></div>');
  var SND=[["rain","🌧 Дождь"],["sea","🌊 Море"],["fire","🔥 Костёр"],["forest","🌲 Лес"],["noise","☁️ Шум"]],sel={s:"rain",m:30};
  var mk=function(id,opts,key){var e=$(id);opts.forEach(function(o){var x=node('<button type="button" class="'+(sel[key]===o[0]?"on":"")+'">'+o[1]+'</button>');x.onclick=function(){haptic();sel[key]=o[0];Array.prototype.forEach.call(e.children,function(y){y.classList.toggle("on",y===x)});if(SLP.on)sleepAudio(sel.s,SLP.end)};e.appendChild(x)})};
  mk("tsS",SND,"s");mk("tsM",[[15,"15 мин"],[30,"30 мин"],[60,"1 час"]],"m");
  var draw=function(r){var s=r&&r.sleep;var off=Date.now()-(r.now||Date.now());
   if(s){var end=s.end-(r.now-Date.now());SLP.end=end;sleepAudio(s.sound,end);$("tsGo").textContent="Выключить";$("tsGo").classList.add("sec");
    $("tsT").textContent=(s.partner_here?"Вы засыпаете вместе 💞 · ":"")+"стихнет через "+tMin(end-Date.now());$("tsMoon").classList.add("on")}
   else{sleepAudio(null);$("tsGo").textContent="Засыпаем 🌙";$("tsGo").classList.remove("sec");$("tsMoon").classList.remove("on")}
   SLP.state=s};
  $("tsGo").onclick=function(){haptic("medium");sleepUnlock();call("/v2/pair/sleep",SLP.state?{action:"stop"}:{action:"start",sound:sel.s,min:sel.m}).then(draw).catch(function(){toast("Не получилось")})};
  var tick=function(){call("/v2/pair/sleep",{action:"get"}).then(draw).catch(function(){})};tick();togStop();TG2.timer=setInterval(tick,5000);
 },
 // --- фокус вместе ---
 focus:function(B){
  tAdd(B,'<div class="card box tfo"><div class="tfr"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="bg"/><circle cx="60" cy="60" r="52" class="fg" id="tfC"/></svg><div class="tft"><b id="tfT">25:00</b><small id="tfS">готовы?</small></div></div><div class="tfw"><span id="tfMe">ты</span><span id="tfPa">'+esc(pingName())+'</span></div><div class="seg" id="tfM"></div><button class="btn" id="tfGo" type="button">Начать вместе</button><div class="hint">Общий таймер: каждый занят своим, но вы рядом — так проще не отвлекаться</div></div>');
  var min=25,st=null;
  var e=$("tfM");[[25,"25 мин"],[50,"50 мин"],[90,"90 мин"]].forEach(function(o){var x=node('<button type="button" class="'+(o[0]===min?"on":"")+'">'+o[1]+'</button>');x.onclick=function(){haptic();min=o[0];Array.prototype.forEach.call(e.children,function(y){y.classList.toggle("on",y===x)});if(!st)$("tfT").textContent=min+":00"};e.appendChild(x)});
  var draw=function(r){st=r&&r.focus;if(st)st.endL=st.end-(r.now-Date.now());paint()};
  var paint=function(){var C=$("tfC");if(!C)return;var go=$("tfGo");
   if(st){var left=st.endL-Date.now(),tot=st.min*60000;$("tfT").textContent=tMin(left);C.style.strokeDashoffset=(326.7*(1-Math.max(0,left)/tot)).toFixed(1);
    $("tfS").textContent=st.me&&st.partner?"вы в фокусе вдвоём 💞":st.me?"ты в фокусе":"партнёр в фокусе";go.textContent=st.me?"Закончить":"Присоединиться";go.classList.toggle("sec",!!st.me);
    $("tfMe").classList.toggle("on",!!st.me);$("tfPa").classList.toggle("on",!!st.partner);if(left<=0&&st.me){haptic("heavy");toast("Готово! Перерыв 🎉");st=null}}
   else{$("tfT").textContent=min+":00";C.style.strokeDashoffset=0;$("tfS").textContent="готовы?";go.textContent="Начать вместе";go.classList.remove("sec");$("tfMe").classList.remove("on");$("tfPa").classList.remove("on")}};
  $("tfGo").onclick=function(){haptic("medium");call("/v2/pair/focus",st?(st.me?{action:"stop"}:{action:"join"}):{action:"start",min:min}).then(draw).catch(function(){toast("Не получилось")})};
  var tick=function(){call("/v2/pair/focus",{action:"get"}).then(draw).catch(function(){})};tick();togStop();
  var n=0;TG2.timer=setInterval(function(){paint();if(++n%5===0)tick()},1000);
 },
 // --- свидание по расписанию ---
 date:function(B){
  var t=new Date(Date.now()+3*36e5);t.setMinutes(0,0,0);var loc=new Date(t.getTime()-t.getTimezoneOffset()*6e4).toISOString().slice(0,16);
  tAdd(B,'<div class="card box tdt" id="tdtNow" style="display:none"></div><div class="card box"><div class="lab">Назначить свидание</div><div class="dwrap"><input class="in" type="datetime-local" id="tdtA" value="'+loc+'"></div><div class="lab" style="margin-top:10px">Что делаем</div><div class="seg wrap" id="tdtW"></div><input class="in" id="tdtN" maxlength="120" placeholder="План: например «смотрим Амели и едим пиццу»" style="margin-top:10px"><button class="btn" id="tdtGo" type="button">Позвать на свидание 💞</button><div class="hint">За 10 минут и в назначенное время бот напомнит вам обоим</div></div>');
  var WH=[["movie","🎬 Кино"],["music","🎧 Музыка"],["room","🛋 Комната"],["call","📞 Звонок"],["games","🎮 Игры"]],what="movie";
  var e=$("tdtW");WH.forEach(function(o){var x=node('<button type="button" class="'+(o[0]===what?"on":"")+'">'+o[1]+'</button>');x.onclick=function(){haptic();what=o[0];Array.prototype.forEach.call(e.children,function(y){y.classList.toggle("on",y===x)})};e.appendChild(x)});
  var cur=null,off=0;
  var draw=function(r){cur=r&&r.date;off=(r&&r.now||Date.now())-Date.now();var n=$("tdtNow");if(!n)return;
   if(!cur){n.style.display="none";return}n.style.display="";var at=new Date(cur.at);var w=(WH.filter(function(x){return x[0]===cur.what})[0]||WH[0])[1];
   n.innerHTML='<div class="lab">Ближайшее свидание</div><div class="tdtb">'+w+'</div><div class="tdtw">'+at.toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long"})+' в '+at.toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"})+'</div><div class="tdtc" id="tdtC"></div>'+(cur.note?'<div class="hint"></div>':'')+'<button class="btn sec" id="tdtX" type="button">Отменить</button>';
   if(cur.note)n.querySelector(".hint").textContent="«"+cur.note+"»";
   $("tdtX").onclick=function(){haptic();call("/v2/pair/date",{action:"clear"}).then(draw).catch(function(){})};cnt()};
  var cnt=function(){var c=$("tdtC");if(!c||!cur)return;var ms=cur.at-(Date.now()+off);if(ms<=0){c.textContent="Время свидания! 💞";return}
   var h=Math.floor(ms/36e5),m=Math.floor(ms%36e5/6e4);c.textContent="через "+(h>=24?Math.floor(h/24)+" д "+(h%24)+" ч":h+" ч "+m+" мин")};
  $("tdtGo").onclick=function(){var v=$("tdtA").value;if(!v)return;var at=new Date(v).getTime();if(!(at>Date.now()+6e4)){toast("Выбери время в будущем");return}
   haptic("medium");call("/v2/pair/date",{action:"set",at:at,what:what,note:$("tdtN").value.trim()}).then(function(r){toast("Свидание назначено 💞");draw(r)}).catch(function(){toast("Не получилось")})};
  call("/v2/pair/date",{action:"get"}).then(draw).catch(function(){});togStop();TG2.timer=setInterval(cnt,15000);
 }
};
// ---------- звуки для сна: синтез прямо в браузере, без файлов ----------
var SLP={ctx:null,nodes:[],on:null,end:0,state:null};
function sleepUnlock(){try{if(!SLP.ctx)SLP.ctx=new (window.AudioContext||window.webkitAudioContext)();if(SLP.ctx.state==="suspended")SLP.ctx.resume()}catch(e){}}
function sleepAudio(sound,end){
 if(!sound){if(SLP.on){SLP.nodes.forEach(function(n){try{n.stop?n.stop():n.disconnect()}catch(e){}});clearInterval(SLP.fx);SLP.nodes=[];SLP.on=null}return}
 if(SLP.on===sound){SLP.end=end;return}
 sleepAudio(null);sleepUnlock();var C=SLP.ctx;if(!C)return;SLP.on=sound;SLP.end=end;
 var len=C.sampleRate*4,buf=C.createBuffer(1,len,C.sampleRate),d=buf.getChannelData(0),last=0;
 for(var i=0;i<len;i++){var w=Math.random()*2-1;if(sound==="rain"||sound==="forest")d[i]=w*.5;else{last=(last+.02*w)/1.02;d[i]=last*3.5}}
 var src=C.createBufferSource();src.buffer=buf;src.loop=true;
 var f=C.createBiquadFilter(),g=C.createGain();
 f.type=sound==="rain"?"bandpass":sound==="forest"?"highpass":"lowpass";
 f.frequency.value={rain:1400,sea:500,fire:320,forest:2600,noise:800}[sound];f.Q.value=sound==="rain"?.6:.7;
 g.gain.value={rain:.32,sea:.55,fire:.6,forest:.06,noise:.45}[sound];
 src.connect(f);f.connect(g);g.connect(C.destination);src.start();SLP.nodes=[src,f,g];SLP.gain=g;
 if(sound==="sea"){var l=C.createOscillator(),lg=C.createGain();l.frequency.value=.09;lg.gain.value=.3;l.connect(lg);lg.connect(g.gain);l.start();SLP.nodes.push(l,lg)}
 SLP.fx=setInterval(function(){
  var left=SLP.end-Date.now(),base={rain:.32,sea:.55,fire:.6,forest:.06,noise:.45}[sound];
  if(left<=0){sleepAudio(null);return}
  if(left<60000)try{g.gain.setTargetAtTime(base*left/60000,C.currentTime,.5)}catch(e){}
  if(sound==="fire"&&Math.random()<.5){var o=C.createBufferSource(),og=C.createGain();o.buffer=buf;og.gain.setValueAtTime(.5+Math.random()*.6,C.currentTime);og.gain.exponentialRampToValueAtTime(.001,C.currentTime+.06);o.connect(og);og.connect(C.destination);o.start(C.currentTime,Math.random()*3,.08)}
  if(sound==="forest"&&Math.random()<.15){var b=C.createOscillator(),bg=C.createGain(),t=C.currentTime,fq=2200+Math.random()*1800;b.frequency.setValueAtTime(fq,t);b.frequency.exponentialRampToValueAtTime(fq*1.4,t+.12);bg.gain.setValueAtTime(.0001,t);bg.gain.exponentialRampToValueAtTime(.05,t+.02);bg.gain.exponentialRampToValueAtTime(.0001,t+.18);b.connect(bg);bg.connect(C.destination);b.start(t);b.stop(t+.2)}
 },400);
}
(function(){
 var g=$("hubGames");if(!g)return;
 var us=node('<button class="card hubc" id="hubUs" type="button"><span class="hic">💞</span><span class="htx"><b>Мы двое</b><small>Вопрос дня · Мечты · Письма · Дневник</small></span><span class="chev">'+(g.querySelector(".chev")||{}).innerHTML+'</span></button>');
 var lv=node('<button class="card hubc" id="hubLive" type="button"><span class="hic">🌙</span><span class="htx"><b>Рядом сейчас</b><small>Засыпаем · Фокус · Свидание</small></span><span class="chev">'+(g.querySelector(".chev")||{}).innerHTML+'</span></button>');
 g.parentNode.insertBefore(us,g.nextSibling);g.parentNode.insertBefore(lv,us.nextSibling);
 us.onclick=function(){haptic();hubOpen("us","q")};lv.onclick=function(){haptic();hubOpen("live",SLP.state?"sleep":"date")};
})();
