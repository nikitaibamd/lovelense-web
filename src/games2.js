// ===================== Ещё игры вдвоём =====================
HUBS.games.tabs=HUBS.games.tabs.concat([["who","🤔","Кто из нас"],["ttt","⭕","5×5"],["sea","🚢","Бой"],["where","📍","Где я?"]]);
function g2(kind,action,x){var b=x||{};b.kind=kind;b.action=action||"get";return call("/v2/pair/play",b)}
function g2poll(kind,draw){var last=-1;var t=function(){g2(kind).then(function(r){if(r.rev!==last){last=r.rev;draw(r)}}).catch(function(){})};clearInterval(GM.timer);GM.timer=setInterval(t,3000);return function(r){last=r.rev;draw(r)}}
function g2head(B,title,sub){tAdd(B,'<div class="card box g2h"><b>'+title+'</b><small>'+sub+'</small></div><div id="g2b"></div>')}
var G2ERR={bad_move:"Сейчас так нельзя",no_location:"Нет твоей геопозиции — включи её, чтобы загадать место",bad_photo:"Фото не подошло"};
function g2err(e){toast(G2ERR[e&&e.message]||"Не получилось")}

// --- «Кто из нас?» ---
SHEETS.g_who={t:"Кто из нас?",r:function(B){
 g2head(B,"🤔 Кто из нас?","Честно отвечай про вас двоих. Когда ответите оба — увидите, где совпали");
 var sel=[];
 var draw=g2poll("who",function(r){var W=$("g2b");if(!W)return;W.innerHTML="";
  if(!r.mine){
   if(sel.length!==r.qs.length)sel=r.qs.map(function(){return -1});
   r.qs.forEach(function(q,i){var e=node('<div class="card g2q"><div class="g2qt"></div><div class="g2ab"><button type="button" data-v="1">🙋 Я</button><button type="button" data-v="0">👉 '+esc(pingName())+'</button></div></div>');
    e.querySelector(".g2qt").textContent=(i+1)+". "+q;
    Array.prototype.forEach.call(e.querySelectorAll("button"),function(b){b.classList.toggle("on",sel[i]===+b.getAttribute("data-v"));b.onclick=function(){haptic();sel[i]=+b.getAttribute("data-v");Array.prototype.forEach.call(e.querySelectorAll("button"),function(y){y.classList.toggle("on",y===b)})}});
    W.appendChild(e)});
   var go=node('<button class="btn" type="button">Готово ✨</button>');W.appendChild(go);
   if(r.partner_done)W.appendChild(node('<div class="hint" style="text-align:center">'+esc(pingName())+' уже ответил(а) 👀</div>'));
   go.onclick=function(){if(sel.indexOf(-1)>=0){toast("Ответь на все вопросы");return}haptic("medium");g2("who","answer",{ans:sel}).then(draw).catch(g2err)};
  }else if(!r.partner){W.appendChild(node('<div class="card box g2wait">⏳ Ждём ответы '+'партнёра'+'…<br><small>Как только '+esc(pingName())+' ответит, здесь появятся совпадения</small></div>'))}
  else{var same=0;
   r.qs.forEach(function(q,i){var me=r.mine[i],pa=r.partner[i],ok=me!==pa;if(ok)same++; // «я» у меня = «ты» у партнёра — значит совпали
    var e=node('<div class="card g2q res'+(ok?" ok":"")+'"><div class="g2qt"></div><div class="g2r"><span>ты: '+(me?"я":esc(pingName()))+'</span><span>'+esc(pingName())+': '+(pa?esc(pingName()):"ты")+'</span><b>'+(ok?"💞":"🤔")+'</b></div></div>');
    e.querySelector(".g2qt").textContent=q;W.appendChild(e)});
   W.insertBefore(node('<div class="card box g2score"><b>'+same+' из '+r.qs.length+'</b><small>'+(same>=r.qs.length-1?"Вы чувствуете друг друга 💞":same>=r.qs.length/2?"Неплохо! Есть что обсудить 😊":"Ого, вот это разные взгляды 😄")+'</small></div>'),W.firstChild);
   var nx=node('<button class="btn" type="button">Новые вопросы</button>');nx.onclick=function(){haptic();sel=[];g2("who","new").then(draw).catch(g2err)};W.appendChild(nx);
  }});
 g2("who").then(draw).catch(function(){});
}};

// --- крестики-нолики 5×5 (4 в ряд) ---
SHEETS.g_ttt={t:"5×5",r:function(B){
 g2head(B,"⭕ Крестики-нолики 5×5","Собери 4 в ряд — по горизонтали, вертикали или диагонали");
 var draw=g2poll("ttt",function(r){var W=$("g2b");if(!W)return;W.innerHTML="";
  var st=r.win==="me"?"Ты победил(а)! 🏆":r.win==="partner"?esc(pingName())+" победил(а) 🙈":r.win==="draw"?"Ничья 🤝":r.my_turn?"Твой ход — ты "+(r.me===1?"✕":"◯"):"Ход партнёра…";
  W.appendChild(node('<div class="g2st'+(r.my_turn?" you":"")+'">'+st+'</div>'));
  var g=node('<div class="g2ttt"></div>');
  r.b.forEach(function(v,i){var c=node('<button type="button" class="'+(v?"f":"")+'">'+(v===1?"✕":v===2?"◯":"")+'</button>');
   c.onclick=function(){if(!r.my_turn||v)return;haptic("medium");c.textContent=r.me===1?"✕":"◯";c.classList.add("f");g2("ttt","move",{i:i}).then(draw).catch(g2err)};g.appendChild(c)});
  W.appendChild(g);
  if(r.win){var nx=node('<button class="btn" type="button">Ещё партию</button>');nx.onclick=function(){haptic();g2("ttt","new").then(draw).catch(g2err)};W.appendChild(nx)}
 });
 g2("ttt").then(draw).catch(function(){});
}};

// --- морской бой 7×7 ---
SHEETS.g_sea={t:"Морской бой",r:function(B){
 g2head(B,"🚢 Морской бой","Корабли расставлены сами. Попал — стреляешь ещё раз");
 var draw=g2poll("sea",function(r){var W=$("g2b");if(!W)return;W.innerHTML="";
  var st=r.win==="me"?"Флот партнёра потоплен! 🏆":r.win==="partner"?"Твой флот потоплен 🏴‍☠️":r.my_turn?"Твой выстрел 🎯":"Стреляет "+esc(pingName())+"…";
  W.appendChild(node('<div class="g2st'+(r.my_turn?" you":"")+'">'+st+'</div>'));
  var grid=function(cells,shoot,label){var w=node('<div class="g2sw"><div class="lab">'+label+'</div><div class="g2sea" style="grid-template-columns:repeat('+r.n+',1fr)"></div></div>'),g=w.lastChild;
   cells.forEach(function(v,i){var c=node('<button type="button" class="s'+v+'">'+(v===2?"·":v===3?"✹":v===4?"✖":"")+'</button>');
    if(shoot&&!v)c.onclick=function(){if(!r.my_turn)return;haptic("heavy");c.classList.add("s2");g2("sea","shoot",{i:i}).then(function(x){draw(x);var nv=x.theirs[i];if(nv>=3){haptic("heavy");toast(nv===4?"Потоплен! 💥":"Попал! 🔥")}}).catch(g2err)};
    g.appendChild(c)});return w};
  W.appendChild(grid(r.theirs,true,"Флот "+esc(pingName())));
  W.appendChild(grid(r.mine,false,"Твой флот"));
  if(r.win){var nx=node('<button class="btn" type="button">Новый бой</button>');nx.onclick=function(){haptic();g2("sea","new").then(draw).catch(g2err)};W.appendChild(nx)}
 });
 g2("sea").then(draw).catch(function(){});
}};

// --- «Угадай, где я» ---
SHEETS.g_where={t:"Где я?",r:function(B){
 g2head(B,"📍 Угадай, где я","Сфоткай, что вокруг, — партнёр поставит точку на карте. Чем ближе, тем больше очков");
 var map=null;
 var draw=g2poll("where",function(r){var W=$("g2b");if(!W)return;W.innerHTML="";map=null;var R=r.round;
  var newBtn=function(t){var l=node('<label class="btn" style="text-align:center">'+t+'<input type="file" accept="image/*" style="display:none"></label>');
   l.querySelector("input").onchange=function(){var f=this.files&&this.files[0];if(!f)return;toast("Загружаю…");var img=new Image();
    img.onload=function(){var k=Math.min(1,900/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext("2d").drawImage(img,0,0,c.width,c.height);
     var q=.7,u=c.toDataURL("image/jpeg",q);while(u.length>290000&&q>.3){q-=.1;u=c.toDataURL("image/jpeg",q)}
     g2("where","new",{photo:u}).then(function(x){toast("Загадано! Ждём догадку 📍");draw(x)}).catch(g2err)};img.src=URL.createObjectURL(f)};return l};
  if(!R){W.appendChild(newBtn("📷 Загадать моё место"));return}
  W.appendChild(node('<div class="card g2ph"><img alt=""></div>'));W.lastChild.firstChild.src=R.photo;
  if(R.mine&&!R.guess){W.appendChild(node('<div class="g2st">Ждём, где тебя поищет '+esc(pingName())+'…</div>'));W.appendChild(newBtn("Загадать другое место"));return}
  W.appendChild(node('<div class="g2map" id="g2map"></div>'));
  setTimeout(function(){if(!$("g2map")||typeof L==="undefined")return;map=L.map("g2map",{zoomControl:false}).setView([50,50],2);tiles(map);
   if(R.guess){var a=[R.answer.lat,R.answer.lng],g=[R.guess.lat,R.guess.lng];L.marker(a).addTo(map).bindTooltip("было тут");L.circleMarker(g,{radius:8,color:"#C98291"}).addTo(map).bindTooltip("догадка");L.polyline([a,g],{color:"#C98291",dashArray:"6 6"}).addTo(map);map.fitBounds([a,g],{padding:[30,30],maxZoom:12})}
   else{var mk=null;map.on("click",function(e){if(!mk)mk=L.circleMarker(e.latlng,{radius:9,color:"#C98291"}).addTo(map);else mk.setLatLng(e.latlng);var b=$("g2go");if(b){b.disabled=false;b.dataset.ll=e.latlng.lat+","+e.latlng.lng}})}},50);
  if(R.guess){var km=R.guess.km;W.appendChild(node('<div class="card box g2score"><b>'+(km<1?Math.round(km*1000)+" м":Math.round(km)+" км")+'</b><small>'+R.guess.score+' очков из 5000 '+(km<20?"— почти в точку! 🎯":km<300?"— тепло 🔥":"— далековато 😄")+'</small></div>'));W.appendChild(newBtn("📷 Теперь моя очередь загадать"))}
  else{var go=node('<button class="btn" id="g2go" type="button" disabled>Я думаю, это здесь 📍</button>');W.appendChild(go);
   go.onclick=function(){var p=(go.dataset.ll||"").split(",");if(p.length<2)return;haptic("medium");g2("where","guess",{lat:+p[0],lng:+p[1]}).then(draw).catch(g2err)}}
 });
 g2("where").then(draw).catch(function(){});
}};
