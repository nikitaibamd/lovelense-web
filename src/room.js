// ===================== общая комната v2 =====================
var ROOM={since:0,evs:0,here:false,ready:false,r:null,holding:false,holdT:null,candleOn:false,candleT:null,rec:null,wx:null,wxT:0,petX:50,hsince:0,holdTick:null};
var ROOM_EMO=["❤️","😘","🥰","🤗","🥺","😂","🔥","✨"];
var ROOM_MOODS=[["","Без статуса"],["😴","Хочу спать"],["🥺","Скучаю"],["💻","Работаю"],["🍿","Отдыхаю"],["🥰","Люблю"],["🤒","Болею"],["📚","Учусь"],["🍳","Готовлю"],["🚗","В дороге"]];
var ROOM_DN={sofa:["Диван",{pink:"Розовый",mint:"Мятный",lavender:"Лавандовый",velvet:"Бархатный"}],rug:["Ковёр",{round:"Круглый",heart:"Сердечко",stripes:"Полоски",cloud:"Облако"}],
 wall:["Обои",{blush:"Пудровые",cream:"Кремовые",dots:"Горошек",stars:"Звёзды"}],lights:["Свет",{none:"Без гирлянды",garland:"Гирлянда",fairy:"Огоньки",neon:"Неон «♡»"}],plant:["Растение",{fern:"Папоротник",cactus:"Кактус",flowers:"Цветы",tree:"Деревце"}]};
function rApi(a,ex){var b={action:a,since:ROOM.since,evs:ROOM.evs};for(var k in ex||{})b[k]=ex[k];return call("/v2/pair/room",b)}
function rMin(s){var m=Math.floor(s/60);return m<60?m+" мин":Math.floor(m/60)+" ч "+(m%60)+" мин"}

// ---------- сцена ----------
function roomScene(d,x){
 d=d||{};x=x||{};
 var h=x.hour!=null?x.hour:new Date().getHours(),night=h<7||h>=21,eve=h>=18&&h<21,w=x.wx;
 var sky=night?["#2B2B57","#4A4370"]:eve?["#F2A08C","#B9A6EA"]:w&&w.k==="rain"?["#9AA7B8","#C9D2DE"]:["#9FD3F2","#E3F3FC"];
 var wallC={blush:["#F6DCD8","#EFCFCB"],cream:["#FBF1E4","#F1E2CF"],dots:["#F3E3F0","#EAD3E6"],stars:["#2F3159","#24264A"]}[d.wall||"blush"];
 if(night&&d.wall!=="stars")wallC=["#5D4E6E","#4A3E59"];
 var sofa={pink:["#D98C9A","#C97585","#E9A7AE"],mint:["#7FBFA6","#6AAA91","#9ED6C0"],lavender:["#A795D8","#9280C6","#C3B6EC"],velvet:["#8E3D5C","#76304C","#A9567A"]}[d.sofa||"pink"];
 var s='<svg class="rsvg" viewBox="0 0 360 260" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="rWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+wallC[0]+'"/><stop offset="1" stop-color="'+wallC[1]+'"/></linearGradient><linearGradient id="rSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+sky[0]+'"/><stop offset="1" stop-color="'+sky[1]+'"/></linearGradient><clipPath id="rWin"><rect x="120" y="26" width="120" height="86" rx="10"/></clipPath></defs>'+
  '<rect width="360" height="260" fill="url(#rWall)"/>';
 if(d.wall==="dots")for(var i=0;i<40;i++)s+='<circle cx="'+(12+(i%10)*37)+'" cy="'+(14+Math.floor(i/10)*48+(i%2)*20)+'" r="3" fill="#fff" opacity=".55"/>';
 if(d.wall==="stars")for(var j=0;j<26;j++)s+='<text x="'+(10+(j*53)%350)+'" y="'+(16+(j*37)%180)+'" font-size="'+(6+j%3*3)+'" fill="#FFE9A8" opacity=".75">✦</text>';
 s+='<rect y="200" width="360" height="60" fill="'+(night?"#3E3349":"#E2B9A8")+'"/>';
 // окно в город партнёра: небо, погода
 s+='<g clip-path="url(#rWin)"><rect x="120" y="26" width="120" height="86" fill="url(#rSky)"/>'+
  (night?'<circle cx="215" cy="50" r="10" fill="#FFF3CF"/><circle cx="220" cy="46" r="9" fill="'+sky[0]+'"/><circle cx="140" cy="45" r="1.6" fill="#fff"/><circle cx="160" cy="90" r="1.3" fill="#fff"/><circle cx="200" cy="85" r="1.6" fill="#fff"/>':(w&&(w.k==="rain"||w.k==="cloud")?"":'<circle cx="210" cy="52" r="12" fill="#FFE07A"/>')+'<ellipse cx="150" cy="88" rx="16" ry="6" fill="#fff" opacity=".9"/>')+
  (w&&w.k!=="clear"&&w.k!=="cloud"?'<g class="rwx '+w.k+'">'+wxDrops(w.k)+'</g>':"")+(w&&w.k==="cloud"?'<ellipse cx="168" cy="52" rx="26" ry="10" fill="#fff" opacity=".85"/><ellipse cx="200" cy="64" rx="22" ry="8" fill="#fff" opacity=".8"/>':"")+
  '</g><rect x="120" y="26" width="120" height="86" rx="10" fill="none" stroke="#fff" stroke-width="6"/><path d="M180 26 V112 M120 69 H240" stroke="#fff" stroke-width="4"/>';
 // гирлянда
 if(d.lights==="garland"||d.lights==="fairy"){var cols=d.lights==="fairy"?["#FFF3C4"]:["#FF6B7A","#FFD36E","#7FD1A8","#8FB5DE"];s+='<path d="M10 14 Q95 40 180 14 Q265 40 350 14" stroke="#6B5A63" stroke-width="1.2" fill="none"/>';for(var g=0;g<15;g++){var gx=10+g*24,gy=14+Math.sin((gx-10)/170*Math.PI)*24*(gx<180?1:1);s+='<circle class="rbulb" cx="'+gx+'" cy="'+(gy+3)+'" r="'+(d.lights==="fairy"?2.4:3.6)+'" fill="'+cols[g%cols.length]+'"/>'}}
 if(d.lights==="neon")s+='<text x="300" y="70" font-size="34" fill="#FF7FB0" class="rneon" text-anchor="middle">♡</text>';
 // торшер
 s+='<path d="M300 200 V120" stroke="#8A7E85" stroke-width="4"/><path d="M282 120 L318 120 L308 92 L292 92 Z" fill="'+(night?"#FFD66B":"#F6B8C8")+'"/>'+(night?'<circle cx="300" cy="125" r="40" fill="#FFD66B" opacity=".18"/>':"");
 // растение
 var pl=d.plant||"fern";
 s+='<rect x="34" y="166" width="34" height="34" rx="6" fill="#C98291"/>';
 if(pl==="fern")s+='<path d="M51 166 Q30 136 40 116 Q55 134 51 166 Q60 128 76 120 Q74 148 51 166" fill="#7CCF8A"/>';
 if(pl==="cactus")s+='<rect x="44" y="124" width="14" height="44" rx="7" fill="#6DB585"/><rect x="32" y="138" width="10" height="18" rx="5" fill="#6DB585"/><rect x="60" y="132" width="10" height="16" rx="5" fill="#6DB585"/><circle cx="51" cy="122" r="4" fill="#F6A9B6"/>';
 if(pl==="flowers")s+='<path d="M44 166 V136 M51 166 V128 M58 166 V138" stroke="#6DB585" stroke-width="3"/><circle cx="44" cy="134" r="6" fill="#F6A9B6"/><circle cx="51" cy="126" r="6" fill="#FFE08A"/><circle cx="58" cy="136" r="6" fill="#CDB8F0"/>';
 if(pl==="tree")s+='<rect x="48" y="130" width="6" height="38" fill="#9C6A45"/><circle cx="51" cy="118" r="22" fill="#7CCF8A"/><circle cx="40" cy="126" r="12" fill="#6DB585"/><circle cx="62" cy="124" r="12" fill="#6DB585"/>';
 // тумба: проигрыватель и телевизор (живые, если что-то играет)
 s+='<g class="rmedia" data-go="music"><rect x="252" y="176" width="50" height="24" rx="4" fill="#B98A72"/><circle cx="268" cy="172" r="12" fill="#2A2228"/><circle cx="268" cy="172" r="4" fill="'+(x.music?"#F06E8C":"#8A7E85")+'"/>'+(x.music?'<g class="rspin"><path d="M268 162 A10 10 0 0 1 278 172" stroke="#5A4C55" stroke-width="1.5" fill="none"/></g>':'')+'</g>';
 s+='<g class="rmedia" data-go="movie"><rect x="306" y="150" width="40" height="28" rx="4" fill="#2A2228"/><rect x="309" y="153" width="34" height="22" rx="2" fill="'+(x.movie?"#8FD3F0":"#4A3E46")+'" class="'+(x.movie?"rtv":"")+'"/><rect x="322" y="178" width="8" height="6" fill="#2A2228"/></g>';
 // ковёр
 var rugC=night?"#56456A":"#F4D2CC",rug=d.rug||"round";
 if(rug==="round")s+='<ellipse cx="180" cy="236" rx="140" ry="14" fill="'+rugC+'"/>';
 if(rug==="heart")s+='<path d="M180 252 C120 236 120 214 150 220 C165 222 175 228 180 232 C185 228 195 222 210 220 C240 214 240 236 180 252 Z" fill="#F6A9B6" opacity=".85"/>';
 if(rug==="stripes")s+='<rect x="60" y="224" width="240" height="26" rx="4" fill="#FFF6F2"/><path d="M60 230 H300 M60 238 H300 M60 246 H300" stroke="#E9A7AE" stroke-width="3"/>';
 if(rug==="cloud")s+='<g fill="#FFFFFF" opacity=".85"><ellipse cx="140" cy="240" rx="50" ry="12"/><ellipse cx="200" cy="236" rx="56" ry="14"/><ellipse cx="250" cy="242" rx="40" ry="10"/></g>';
 // диван
 s+='<rect x="86" y="158" width="188" height="44" rx="16" fill="'+sofa[0]+'"/><rect x="78" y="146" width="28" height="62" rx="12" fill="'+sofa[1]+'"/><rect x="254" y="146" width="28" height="62" rx="12" fill="'+sofa[1]+'"/><rect x="96" y="130" width="168" height="40" rx="14" fill="'+sofa[2]+'"/>'+
  '<path d="M100 208 v10 M260 208 v10" stroke="#8A6870" stroke-width="5" stroke-linecap="round"/></svg>';
 return s;
}
function wxDrops(k){var s="";for(var i=0;i<14;i++){var x=124+i*8.5,y=30+(i*23)%70;s+=k==="snow"?'<circle cx="'+x+'" cy="'+y+'" r="1.8" fill="#fff"/>':'<path d="M'+x+' '+y+' l-2 6" stroke="#E3F0FF" stroke-width="1.4"/>'}return s}
// погода у партнёра (open-meteo, координаты грубо, раз в 15 минут)
function roomWeather(cb){
 var L=S&&S.partner_active!==false&&S.partner_loc;if(!L)return cb(null);
 if(ROOM.wx&&Date.now()-ROOM.wxT<15*60000)return cb(ROOM.wx);
 var u="https://api.open-meteo.com/v1/forecast?latitude="+L.lat.toFixed(1)+"&longitude="+L.lng.toFixed(1)+"&current=temperature_2m,weather_code&timezone=auto";
 fetch(u).then(function(r){return r.json()}).then(function(j){var c=j.current||{},code=c.weather_code|0;
  var k=code===0?"clear":code<=3||code===45||code===48?"cloud":code>=71&&code<=77||code===85||code===86?"snow":"rain";
  var ph=partnerHour(),nt=ph<7||ph>=21,em={clear:nt?"🌙":"☀️",cloud:"☁️",rain:"🌧",snow:"❄️"}[k];
  ROOM.wx={k:k,t:Math.round(c.temperature_2m),em:em};ROOM.wxT=Date.now();cb(ROOM.wx)}).catch(function(){cb(null)});
}
function partnerHour(){try{return Number(new Intl.DateTimeFormat("en-GB",{hour:"2-digit",hour12:false,timeZone:S&&S.partner_tz||undefined}).format(new Date()))%24}catch(e){return new Date().getHours()}}

// ---------- разметка ----------
function roomRender(B){
 var pn=esc(name(S&&S.partner));
 B.innerHTML='<div class="rroom" id="rmScene"><div id="rmSvg">'+roomScene({}, {hour:partnerHour()})+'</div>'+
  '<div class="rwin" id="rmWin"></div>'+
  '<div class="rhands" id="rmHands"><i class="rh me"></i><i class="rh pa"></i><b class="rhh">💞</b></div>'+
  '<div class="rseat me"><div class="rbub" id="rmBubMe"></div><div class="rav" id="rmMe"><span class="rmood" id="rmMoodMe"></span></div><small>ты</small></div>'+
  '<div class="rseat pa" id="rmPaW"><div class="rbub" id="rmBubPa"></div><div class="rav" id="rmPa"><span class="rmood" id="rmMoodPa"></span></div><small id="rmPaN">'+pn+'</small></div>'+
  '<div class="rpet" id="rmPet"></div><div class="rfx" id="rmFx"></div></div>'+
  '<div class="rstat" id="rmStat">Ждём '+pn+'…</div><div class="rnow" id="rmNow"></div>'+
  '<div class="rhint">Зажми свою аватарку — протянешь руку. Тапни по '+pn+' — кинешь подушку</div>'+
  '<div class="rsay"><input class="in" id="rmSay" maxlength="80" placeholder="Сказать вслух…" enterkeyhint="send" autocomplete="off"><button class="btn" id="rmSayB" type="button">↑</button></div>'+
  '<div class="rmic"><button type="button" id="rmMic"><span class="ri">🎙</span><span id="rmMicT">Зажми и говори</span></button></div>'+
  '<div class="ract"><button type="button" data-ev="pillow">🛏<span>Подушкой</span></button><button type="button" data-ev="tickle">🤭<span>Пощекотать</span></button><button type="button" data-ev="kiss">💋<span>Поцелуй</span></button></div>'+
  '<div class="remo" id="rmEmo"></div>'+
  '<button class="btn sec" id="rmCall" type="button">Позвать '+pn+' в комнату</button>'+
  '<div class="card box rcard"><div class="lab">Настроение над головой</div><div class="rmoods" id="rmMoods"></div></div>'+
  '<div class="card box rcard"><div class="rch"><b>🪟 Рисуем на запотевшем окне</b><button type="button" class="rclr" id="rmClr">Стереть</button></div><div class="rdraw"><canvas id="rmCv"></canvas></div><div class="rcols" id="rmCols"></div></div>'+
  '<div class="card box rcard rcandle"><div class="rch"><b>🕯 Свеча желаний</b><small id="rmWish"></small></div><div class="rcwrap"><div class="rcan" id="rmCan"><i class="fl"></i><i class="bd"></i></div></div><div class="hint" id="rmCanH">Зажмите свечу вдвоём, загадайте желание и отпустите</div></div>'+
  '<div class="card box rcard"><div class="rch"><b>🏡 Наша комната</b><small id="rmTog"></small></div><div id="rmDecor"></div></div>';
 setPhoto($("rmMe"),S&&S.me);setPhoto($("rmPa"),S&&S.partner);
 // восстанавливаем значки настроения внутри аватарок (setPhoto мог стереть текст)
 ["Me","Pa"].forEach(function(k){if(!$("rmMood"+k)){var m=node('<span class="rmood" id="rmMood'+k+'"></span>');$("rm"+k).appendChild(m)}});
 ROOM_EMO.forEach(function(em){var b=node('<button type="button">'+em+'</button>');b.onclick=function(){haptic();roomFly(em,true);rApi("react",{emoji:em}).then(roomApply).catch(function(e){if(e.message!=="too_fast")gErr(e)})};$("rmEmo").appendChild(b)});
 $("rmCall").onclick=function(){var b=this;b.disabled=true;rApi("call").then(function(x){roomApply(x);toast(x.called?"Позвали — бот напишет "+name(S&&S.partner)+" 💌":(x.partner_here?name(S&&S.partner)+" уже здесь ♡":"Уже звали недавно — подожди немного"))}).catch(gErr).then(function(){setTimeout(function(){b.disabled=false},3000)})};
 // фраза вслух
 var say=function(){var v=$("rmSay").value.trim();if(!v)return;$("rmSay").value="";haptic();roomBubble("Me",v);rApi("say",{text:v}).then(roomApply).catch(gErr)};
 $("rmSayB").onclick=say;$("rmSay").onkeydown=function(e){if(e.key==="Enter"){e.preventDefault();say()}};
 // действия
 Array.prototype.forEach.call(document.querySelectorAll(".ract button"),function(b){b.onclick=function(){var k=b.getAttribute("data-ev");haptic("medium");roomHit(k,true);rApi("ev",{k:k}).then(roomApply).catch(gErr)}});
 // настроение
 ROOM_MOODS.forEach(function(m){var b=node('<button type="button" data-m="'+m[0]+'">'+(m[0]||"✕")+'<span>'+m[1]+'</span></button>');b.onclick=function(){haptic();rApi("mood",{v:m[0]}).then(roomApply).catch(gErr)};$("rmMoods").appendChild(b)});
 // держаться за руки: зажать свою аватарку
 roomPress($("rmMe"),function(){roomHold(true)},function(){roomHold(false)});
 // подушка по партнёру
 $("rmPa").onclick=function(){haptic("medium");roomHit("pillow",true);rApi("ev",{k:"pillow"}).then(roomApply).catch(gErr)};
 // медиа на тумбе
 Array.prototype.forEach.call(document.querySelectorAll("#rmScene"),function(sc){sc.addEventListener("click",function(e){var g=e.target.closest&&e.target.closest(".rmedia");if(g){haptic();hubSub(g.getAttribute("data-go"))}})});
 // питомец
 $("rmPet").onclick=function(){var p=$("rmPet");p.classList.remove("hop");void p.offsetWidth;p.classList.add("hop");roomFly("🤍",true);if(typeof petAct==="function")try{petAct("pet")}catch(e){}};
 roomMic();roomDraw();roomCandle();
 ROOM.since=0;ROOM.evs=0;ROOM.here=false;ROOM.ready=false;ROOM.r=null;ROOM.holding=false;ROOM.candleOn=false;
 roomPoll();gLoop("h_room",roomPoll,2000);
 roomWeather(function(){roomScenery()});
 roomPetWalk();
}
function roomPress(el,down,up){
 var on=false,st=function(e){if(on)return;on=true;e.preventDefault();down()},en=function(){if(!on)return;on=false;up()};
 el.addEventListener("pointerdown",st);["pointerup","pointercancel","pointerleave"].forEach(function(t){el.addEventListener(t,en)});
 el.addEventListener("contextmenu",function(e){e.preventDefault()});
}

// ---------- опрос и применение ----------
function roomPoll(){var init=!ROOM.ready;rApi("get",{init:init}).then(function(x){ROOM.ready=true;roomApply(x,init)}).catch(function(){})}
function roomApply(x,init){
 if(!$("rmScene"))return;var pn=name(S&&S.partner),r=x.room||{};
 if(x.partner_here&&!ROOM.here){haptic("medium");roomFly("👋",false)}
 ROOM.here=!!x.partner_here;$("rmPaW").classList.toggle("here",ROOM.here);
 $("rmStat").innerHTML=ROOM.here?"<b>Вы в комнате вдвоём 💞</b>":"Ждём "+esc(pn)+"… Позови — бот напишет";
 $("rmCall").style.display=ROOM.here?"none":"";
 var now=[];if(x.music)now.push("🎧 "+esc(x.music.title)+(x.music.playing?"":" (пауза)"));if(x.movie)now.push("🎬 "+esc(x.movie.title)+(x.movie.playing?"":" (пауза)"));
 $("rmNow").innerHTML=now.length?"Сейчас: "+now.join(" · ")+' <button type="button" class="rjoin" id="rmJoin">Включить у себя</button>':"";
 if($("rmJoin"))$("rmJoin").onclick=function(){haptic();hubSub(x.movie&&x.movie.playing?"movie":"music")};
 (x.reacts||[]).forEach(function(rr,i){setTimeout(function(){roomFly(rr.emoji,false);haptic("light")},i*180)});
 if(x.cursor!=null){ROOM.since=x.cursor;var seen=Number(ls("ll_ping"))||0;if(x.cursor>seen)ls("ll_ping",String(x.cursor))}
 var prev=ROOM.r||{};ROOM.r=r;ROOM.media={music:x.music&&x.music.playing,movie:x.movie&&x.movie.playing};
 var sk=JSON.stringify([r.decor,ROOM.media]);if(ROOM.mkey!==sk){ROOM.mkey=sk;roomScenery()}
 // руки
 var hd=r.hold||{},hs=$("rmHands");
 hs.classList.toggle("me",!!(hd.me||ROOM.holding));hs.classList.toggle("pa",!!hd.pa);var both=(hd.me||ROOM.holding)&&hd.pa;
 if(both&&!hs.classList.contains("both")){haptic("heavy");roomFly("💞",true)}
 hs.classList.toggle("both",!!both);ROOM.hsince=both?(hd.since||Date.now()):0;
 if(hd.pa&&!(prev.hold&&prev.hold.pa)&&!ROOM.holding){haptic("medium");toast(pn+" протягивает тебе руку — зажми свою аватарку 🤝")}
 // фразы и настроение
 if(r.say){roomBubble("Pa",r.say.pa);if(!ROOM.sayLocal||Date.now()-ROOM.sayLocal>3000)roomBubble("Me",r.say.me)}
 if(r.mood){$("rmMoodMe").textContent=r.mood.me||"";$("rmMoodPa").textContent=r.mood.pa||"";Array.prototype.forEach.call($("rmMoods").children,function(b){b.classList.toggle("on",b.getAttribute("data-m")===(r.mood.me||""))})}
 // свеча
 var c=r.candle||{},can=$("rmCan");
 if(can){var lit=(c.me||ROOM.candleOn)&&c.pa;can.classList.toggle("lit",!!lit);can.classList.toggle("half",!lit&&!!(c.me||ROOM.candleOn||c.pa));
  $("rmCanH").textContent=lit?"Горит! Загадайте желание… и отпустите вместе ✨":c.pa?pn+" держит свечу — зажми и ты":ROOM.candleOn?"Ждём, когда "+pn+" тоже зажмёт свечу…":"Зажмите свечу вдвоём, загадайте желание и отпустите";
  $("rmWish").textContent=r.wishes?"Загадано: "+r.wishes:""}
 // время вместе и декор
 if(r.tog!=null){$("rmTog").textContent="вместе тут: "+rMin(r.tog);roomDecor(r)}
 // рисунок при входе
 if(init&&r.strokes){ROOM.strokes=r.strokes.map(function(s){try{return JSON.parse(s.v)}catch(e){return null}}).filter(Boolean);roomRedraw()}
 // события
 if(init){ROOM.evs=r.evCursor||0}
 else{(r.events||[]).forEach(function(e,i){if(e.id<=ROOM.evs)return;ROOM.evs=e.id;if(!e.mine)setTimeout(function(){roomEvent(e)},i*120)})}
}
function roomEvent(e){
 var pn=name(S&&S.partner);
 if(e.k==="pillow"||e.k==="tickle"||e.k==="kiss"){roomHit(e.k,false);haptic(e.k==="tickle"?"light":"heavy")}
 else if(e.k==="stroke"){try{var s=JSON.parse(e.v);(ROOM.strokes=ROOM.strokes||[]).push(s);roomStroke(s)}catch(x){}}
 else if(e.k==="clear"){ROOM.strokes=[];roomRedraw();toast(pn+" стёр(ла) окно")}
 else if(e.k==="voice"){try{var v=JSON.parse(e.v);roomVoicePlay(v.id,v.dur)}catch(x){}}
 else if(e.k==="wish"){roomFly("✨",true);roomFly("🌟",false);toast("Желание загадано ✨")}
}
function roomScenery(){
 var s=$("rmSvg");if(!s)return;var r=ROOM.r||{},m=ROOM.media||{};
 s.innerHTML=roomScene(r.decor,{hour:partnerHour(),wx:ROOM.wx,music:m.music,movie:m.movie});
 var w=$("rmWin");if(w){var t=S&&S.partner_tz?clock(S.partner_tz):"";w.innerHTML=t||ROOM.wx?esc(name(S&&S.partner))+": "+t+(ROOM.wx?" · "+ROOM.wx.em+" "+(ROOM.wx.t>0?"+":"")+ROOM.wx.t+"°":""):""}
}
function roomBubble(k,t){
 var b=$("rmBub"+k);if(!b)return;if(k==="Me"&&t)ROOM.sayLocal=Date.now();
 if((b.getAttribute("data-t")||"")===(t||""))return;b.setAttribute("data-t",t||"");
 b.textContent=t||"";b.classList.toggle("on",!!t);if(t&&k==="Pa")haptic("light");
 clearTimeout(b._t);if(t)b._t=setTimeout(function(){b.classList.remove("on");b.setAttribute("data-t","")},11000);
}
function roomHit(k,mine){
 var tgt=$(mine?"rmPa":"rmMe"),fx=$("rmFx");if(!tgt||!fx)return;
 var em={pillow:"🛏",tickle:"🤭",kiss:"💋"}[k],e=document.createElement("i");e.className="rthrow "+(mine?"toPa":"toMe");e.textContent=em;fx.appendChild(e);
 setTimeout(function(){e.remove();tgt.classList.remove("wob","tick");void tgt.offsetWidth;tgt.classList.add(k==="tickle"?"tick":"wob");if(k==="kiss")roomFly("💋",!mine)},650);
}
function roomFly(em,mine){
 var fx=$("rmFx");if(!fx)return;
 for(var i=0;i<5;i++){var e=document.createElement("i");e.textContent=em;e.style.left=(mine?18:62)+Math.random()*18+"%";e.style.animationDelay=(i*.12)+"s";e.style.fontSize=(22+Math.random()*14)+"px";e.style.setProperty("--dx",((mine?1:-1)*(20+Math.random()*60)).toFixed(0)+"px");fx.appendChild(e);(function(e){setTimeout(function(){e.remove()},2300)})(e)}
}

// ---------- держаться за руки ----------
function roomHold(on){
 ROOM.holding=on;$("rmHands").classList.toggle("me",on);haptic(on?"medium":"light");
 clearInterval(ROOM.holdT);
 if(on){ROOM.holdT=setInterval(function(){if(!$("rmScene")||!ROOM.holding){clearInterval(ROOM.holdT);return}rApi("hold",{on:true}).then(roomApply).catch(function(){});if($("rmHands").classList.contains("both"))haptic("soft")},1500)}
 rApi("hold",{on:on}).then(roomApply).catch(function(){});
 clearInterval(ROOM.holdTick);ROOM.holdTick=setInterval(function(){var h=$("rmHands");if(!h){clearInterval(ROOM.holdTick);return}var b=h.querySelector(".rhh");if(ROOM.hsince&&h.classList.contains("both")){var s=Math.max(0,Math.round((Date.now()-ROOM.hsince)/1000));b.setAttribute("data-t",Math.floor(s/60)+":"+String(s%60).padStart(2,"0"))}else b.removeAttribute("data-t")},500);
}

// ---------- рация ----------
function roomMic(){
 var b=$("rmMic"),T=$("rmMicT");if(!b)return;
 if(!navigator.mediaDevices||!window.MediaRecorder){T.textContent="Микрофон здесь недоступен";b.disabled=true;return}
 var st=null,chunks=[],rec=null,stream=null,timer=null,t0=0,cancel=false;
 var stop=function(){if(rec&&rec.state==="recording")rec.stop();clearInterval(timer);b.classList.remove("rec")};
 roomPress(b,function(){
  cancel=false;chunks=[];
  navigator.mediaDevices.getUserMedia({audio:true}).then(function(s){
   stream=s;if(cancel){s.getTracks().forEach(function(t){t.stop()});return}
   var mt=["audio/mp4","audio/webm;codecs=opus","audio/webm","audio/ogg"].filter(function(m){return MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(m)})[0];
   rec=mt?new MediaRecorder(s,{mimeType:mt,audioBitsPerSecond:32000}):new MediaRecorder(s);ROOM.rec=rec;
   rec.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data)};
   rec.onstop=function(){stream.getTracks().forEach(function(t){t.stop()});var dur=(Date.now()-t0)/1000;T.textContent="Зажми и говори";
    if(dur<0.6||!chunks.length){toast("Слишком коротко — держи кнопку, пока говоришь");return}
    var blob=new Blob(chunks,{type:rec.mimeType||mt||"audio/mp4"}),fr=new FileReader();
    fr.onload=function(){T.textContent="Отправляю…";rApi("voice",{data:String(fr.result).replace(/^data:([^;,]+)[^,]*,/,"data:$1;base64,"),dur:Math.round(dur*10)/10}).then(function(x){T.textContent="Зажми и говори";roomApply(x);roomFly("🎙",true);toast("🎙 Улетело "+name(S&&S.partner))}).catch(function(e){T.textContent="Зажми и говори";gErr(e)})};
    fr.readAsDataURL(blob)};
   t0=Date.now();rec.start();b.classList.add("rec");haptic("medium");
   timer=setInterval(function(){var s=(Date.now()-t0)/1000;T.textContent="🔴 "+s.toFixed(0)+" с — отпусти, чтобы отправить";if(s>=15)stop()},250);
  }).catch(function(){toast("Разреши доступ к микрофону — и говори 🎙")});
 },function(){cancel=true;stop()});
}
function roomVoicePlay(id,dur){
 var fx=$("rmBubPa");rApi("voiceget",{id:id}).then(function(x){
  if(!x.data)return;var a=new Audio(x.data);a.playsInline=true;
  var show=function(){var bt=node('<button type="button" class="rvoice">▶️ Голосовое '+Math.round(dur||x.dur||1)+' с</button>');bt.onclick=function(){a.currentTime=0;a.play().catch(function(){})};var w=$("rmNow");if(w)w.appendChild(bt)};
  haptic("medium");roomBubble("Pa","🎙 …");
  var p=a.play();if(p&&p.catch)p.catch(function(){show()});a.onended=function(){roomBubble("Pa","")};
 }).catch(function(){});
}

// ---------- рисунок на окне ----------
var ROOM_COLS=["#ffffff","#FF8FA8","#FFD36E","#8FD3F0","#A8E6B8"];
function roomDraw(){
 var cv=$("rmCv");if(!cv)return;ROOM.col=ROOM.col||"#ffffff";
 var fit=function(){var r=cv.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);cv.width=r.width*d;cv.height=r.height*d;cv.getContext("2d").setTransform(d,0,0,d,0,0);roomRedraw()};
 setTimeout(fit,30);
 ROOM_COLS.forEach(function(c){var b=node('<button type="button" class="'+(c===ROOM.col?"on":"")+'"></button>');b.style.background=c;b.onclick=function(){ROOM.col=c;Array.prototype.forEach.call($("rmCols").children,function(x){x.classList.toggle("on",x===b)})};$("rmCols").appendChild(b)});
 var pts=null,last=null;
 var pos=function(e){var r=cv.getBoundingClientRect();return [Math.max(0,Math.min(1000,Math.round((e.clientX-r.left)/r.width*1000))),Math.max(0,Math.min(1000,Math.round((e.clientY-r.top)/r.height*1000)))]};
 cv.addEventListener("pointerdown",function(e){e.preventDefault();cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);pts=pos(e);last=pts.slice()});
 cv.addEventListener("pointermove",function(e){if(!pts)return;var p=pos(e);if(Math.abs(p[0]-last[0])+Math.abs(p[1]-last[1])<6)return;roomSeg(last,p,ROOM.col,5);pts.push(p[0],p[1]);last=p;if(pts.length>=236)fin()});
 var fin=function(){if(!pts)return;var p=pts;pts=null;if(p.length<4)return;var s={c:ROOM.col,w:5,p:p};(ROOM.strokes=ROOM.strokes||[]).push(s);rApi("ev",{k:"stroke",v:s}).then(roomApply).catch(function(){})};
 cv.addEventListener("pointerup",fin);cv.addEventListener("pointercancel",fin);
 $("rmClr").onclick=function(){haptic();ROOM.strokes=[];roomRedraw();rApi("ev",{k:"clear"}).then(roomApply).catch(gErr)};
}
function roomSeg(a,b,c,w){var cv=$("rmCv");if(!cv)return;var g=cv.getContext("2d"),r=cv.getBoundingClientRect();g.strokeStyle=c;g.lineWidth=w;g.lineCap="round";g.lineJoin="round";g.shadowColor="rgba(255,255,255,.6)";g.shadowBlur=4;g.beginPath();g.moveTo(a[0]/1000*r.width,a[1]/1000*r.height);g.lineTo(b[0]/1000*r.width,b[1]/1000*r.height);g.stroke()}
function roomStroke(s){for(var i=2;i+1<s.p.length;i+=2)roomSeg([s.p[i-2],s.p[i-1]],[s.p[i],s.p[i+1]],s.c,s.w)}
function roomRedraw(){var cv=$("rmCv");if(!cv)return;var g=cv.getContext("2d");g.clearRect(0,0,cv.width,cv.height);(ROOM.strokes||[]).forEach(roomStroke)}

// ---------- свеча желаний ----------
function roomCandle(){
 var c=$("rmCan");if(!c)return;
 roomPress(c,function(){ROOM.candleOn=true;c.classList.add("half");haptic("medium");rApi("candle",{on:true}).then(roomApply).catch(function(){});
   clearInterval(ROOM.candleT);ROOM.candleT=setInterval(function(){if(!$("rmCan")||!ROOM.candleOn){clearInterval(ROOM.candleT);return}rApi("candle",{on:true}).then(roomApply).catch(function(){})},1500)},
  function(){ROOM.candleOn=false;clearInterval(ROOM.candleT);rApi("candle",{on:false}).then(roomApply).catch(function(){})});
}

// ---------- обустройство ----------
function roomDecor(r){
 var w=$("rmDecor");if(!w||!r.unlock)return;var key=JSON.stringify([r.decor,Math.floor(r.tog/60)]);if(w.getAttribute("data-k")===key)return;w.setAttribute("data-k",key);
 var h="",next=null;
 Object.keys(ROOM_DN).forEach(function(slot){var cur=(r.decor||{})[slot]||r.unlock[slot][0][0];
  h+='<div class="rdl">'+ROOM_DN[slot][0]+'</div><div class="rdo">';
  r.unlock[slot].forEach(function(o){var lock=r.tog<o[1]*60;if(lock&&(!next||o[1]<next[1]))next=[ROOM_DN[slot][1][o[0]],o[1]];
   h+='<button type="button" data-s="'+slot+'" data-v="'+o[0]+'" class="'+(o[0]===cur?"on":"")+(lock?" lock":"")+'">'+(lock?"🔒 ":"")+ROOM_DN[slot][1][o[0]]+(lock?"<small>"+rMin(o[1]*60)+" вместе</small>":"")+'</button>'});
  h+='</div>'});
 if(next)h+='<div class="hint">Следующее откроется: «'+next[0]+'» — после '+rMin(next[1]*60)+' вместе в комнате</div>';
 w.innerHTML=h;
 Array.prototype.forEach.call(w.querySelectorAll("button"),function(b){b.onclick=function(){if(b.classList.contains("lock")){toast("Откроется, когда проведёте больше времени вместе в комнате");return}haptic();rApi("decor",{slot:b.getAttribute("data-s"),v:b.getAttribute("data-v")}).then(roomApply).catch(gErr)}});
}

// ---------- Рыжий бегает по ковру ----------
function roomPetWalk(){
 var p=$("rmPet");if(!p)return;var pt=S&&S.pet;
 if(!pt){p.style.display="none";return}
 p.innerHTML=petSvg(pt.kind,moodOf(pt),{plain:1,level:pt.level||10});
 var step=function(){var e=$("rmPet");if(!e)return;
  var both=$("rmHands")&&$("rmHands").classList.contains("both");
  var x=both?50:(15+Math.random()*70);e.classList.toggle("flip",x<ROOM.petX);ROOM.petX=x;e.style.left=x+"%";e.classList.toggle("nap",!!both);
  setTimeout(step,both?3000:3500+Math.random()*3500)};
 setTimeout(step,800);
}
