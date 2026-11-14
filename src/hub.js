// ===================== «Вместе»: страницы с нижними вкладками =====================
var HUB={kind:null,sub:null,returnTo:null};
var HUBS={
 media:{t:"Смотрим и слушаем",tabs:[["movie","🎬","Кино"],["music","🎧","Музыка"],["room","🛋","Комната"]]},
 games:{t:"Игры вдвоём",tabs:[["chess","♟️","Шахматы"],["guess","✏️","Угадайка"],["duo","🎨","Раскраска"]]}
};
var MUSIC_IDS=["mFind","mHere","mNowCard","mQCard"];
function musicHome(){var h=$("musicHold");if(!h)return;MUSIC_IDS.forEach(function(id){var e=$(id);if(e&&e.parentNode!==h)h.appendChild(e)})}
// уборка перед закрытием или сменой страницы: музыка возвращается на место, видео и комната останавливаются
function hubCleanup(){musicHome();movieDestroy();var n=$("hubNav");if(n)n.remove();$("sheet").classList.remove("hub");HUB.kind=null;HUB.sub=null}
function hubOpen(kind,sub){
 var H=HUBS[kind];if(!H)return;
 SHEETS.hub={t:H.t,r:function(){}};openSheet("hub");HUB.returnTo=null;HUB.kind=kind;
 $("sheet").classList.add("hub");
 var nav=node('<div class="hubnav" id="hubNav"></div>');
 H.tabs.forEach(function(t){var b=node('<button type="button" data-s="'+t[0]+'"><span class="hi">'+t[1]+'</span><span>'+t[2]+'</span><i class="hbd"></i></button>');b.onclick=function(){if(HUB.sub!==t[0]){haptic();hubSub(t[0])}};nav.appendChild(b)});
 $("sheet").appendChild(nav);
 hubSub(sub||H.tabs[0][0]);hubBadges();
}
function hubSub(sub){
 var B=$("shB");musicHome();movieDestroy();clearInterval(GM.timer);GM.timer=null;
 HUB.sub=sub;Array.prototype.forEach.call($("hubNav").children,function(b){b.classList.toggle("on",b.getAttribute("data-s")===sub)});
 B.innerHTML="";B.scrollTop=0;B.classList.remove("hubin");void B.offsetWidth;B.classList.add("hubin");
 if(HUB.kind==="games"){cur={k:"g_"+sub,live:null};SHEETS["g_"+sub].r(B);return}
 if(sub==="music"){cur={k:"h_music",live:null};var w=node('<div class="hubmusic"></div>');B.appendChild(w);MUSIC_IDS.forEach(function(id){var e=$(id);if(e)w.appendChild(e)});return}
 if(sub==="movie"){cur={k:"h_movie",live:null};movieRender(B);return}
 cur={k:"h_room",live:null};roomRender(B);
}
// значки «тебя ждут» на нижних вкладках игр и на кнопках во «Вместе»
function hubBadges(){
 var sum=GM.sum||[],you={};sum.forEach(function(g){if(g.you)you[g.kind]=g.text});
 var nav=$("hubNav");if(nav&&HUB.kind==="games")Array.prototype.forEach.call(nav.children,function(b){b.querySelector(".hbd").classList.toggle("on",!!you[b.getAttribute("data-s")])});
 var n=Object.keys(you).length,gb=$("hubGamesBadge"),gs=$("hubGamesSub");
 if(gb){gb.textContent=n;gb.classList.toggle("on",n>0)}
 if(gs){var NM={chess:"в шахматах",guess:"в угадайке",duo:"в раскраске"};gs.textContent=n?"Тебя ждут "+Object.keys(you).map(function(k){return NM[k]}).join(", "):"Шахматы · Угадайка · Раскраска"}
 var ms=$("hubMediaSub"),M=S&&S.music;
 if(ms)ms.textContent=M&&M.vid&&M.playing?"🎧 Сейчас играет: "+(M.title||"трек"):"Кино · Музыка · Общая комната";
 var mc=$("hubMedia");if(mc)mc.classList.toggle("live",!!(M&&M.vid&&M.playing));
}

// ===================== кино вместе =====================
var MV={browse:null,st:null,P:null,kind:null,ref:null,rev:null,busy:false,ign:0,jt:null};
function movieApi(a,ex){var b={action:a};for(var k in ex||{})b[k]=ex[k];return call("/v2/pair/movie",b)}
function ytLoad(cb){
 if(window.YT&&window.YT.Player)return cb();
 (window.__ytq=window.__ytq||[]).push(cb);if(window.__ytl)return;window.__ytl=1;
 window.onYouTubeIframeAPIReady=function(){var q=window.__ytq||[];window.__ytq=[];q.forEach(function(f){try{f()}catch(e){}})};
 var s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";s.onerror=function(){toast("YouTube сейчас недоступен")};document.head.appendChild(s);
}
function movieDestroy(){clearTimeout(MV.jt);if(MV.P){try{MV.P.kill()}catch(e){}}MV.P=null;MV.kind=null;MV.ref=null;MV.rev=null}
function movieRender(B){
 B.innerHTML='<div class="mvhead"><b>🎬 Кино вместе</b><span id="mvHere"></span></div><div id="mvBox"><div class="hint">Загрузка…</div></div>';
 movieDestroy();
 movieApi("get").then(function(x){movieApply(x.movie,true)}).catch(gErr);
 gLoop("h_movie",function(){if(MV.busy)return;movieApi("get").then(function(x){movieApply(x.movie)}).catch(function(){})},2000);
}
function movieEmpty(){
 var box=$("mvBox");if(!box)return;
 box.innerHTML='<div class="card box mvempty"><div class="gbig">🍿</div><b>Что посмотрим?</b><div class="hint">Найди видео на YouTube или вставь ссылку. Пауза и перемотка общие — смотрите секунда в секунду.</div>'+
  '<form class="gguess" id="mvForm"><input class="in" id="mvQ" placeholder="Название или ссылка" autocomplete="off" enterkeyhint="search"><button class="btn" type="submit">Найти</button></form><div id="mvRes"></div></div>';
 $("mvForm").onsubmit=function(e){e.preventDefault();var v=$("mvQ").value.trim();if(!v)return;
  if(/^https?:\/\//i.test(v)||/youtu\.?be/i.test(v)){movieSet({url:v});return}
  $("mvRes").innerHTML='<div class="hint">Ищу…</div>';
  movieApi("search",{q:v}).then(function(x){var r=$("mvRes");if(!r)return;r.innerHTML="";
   if(!(x.results||[]).length){r.innerHTML='<div class="hint">Ничего не нашлось — попробуй иначе</div>';return}
   x.results.forEach(function(it){var row=node('<button type="button" class="mvrow"><img alt="" src="'+esc(it.thumb)+'"><span><b>'+esc(it.title)+'</b><small>'+esc(it.author||"")+(it.len?" · "+esc(it.len):"")+'</small></span></button>');
    row.onclick=function(){haptic();movieSet({vid:it.id,title:it.title,author:it.author})};r.appendChild(row)});
  }).catch(function(e){var r=$("mvRes");if(r)r.innerHTML='<div class="hint">'+esc(ERR[e.message]||"Поиск не отвечает, попробуй ссылку")+'</div>'});
 };
}
function movieSet(o){MV.browse=null;MV.busy=true;movieApi("set",o).then(function(x){MV.busy=false;haptic("medium");movieApply(x.movie,true)}).catch(function(e){MV.busy=false;gErr(e)})}
function movieTarget(m){var p=Number(m.pos)||0;if(m.playing)p+=Math.max(0,(m.now-m.at)/1000);return Math.max(0,p)}
function movieApply(m,first){
 MV.st=m;var me=S&&S.me&&S.me.id,hereEl=$("mvHere");
 if(hereEl)hereEl.textContent=m&&m.partner_here?"● "+name(S&&S.partner)+" смотрит с тобой":"";
 if(!m||!m.ref){MV.browse=null;if(MV.kind!==null||first||!$("mvForm")){movieDestroy();movieEmpty()}return}
 if(MV.browse&&m.ref===MV.browse)return; // выбираешь другое видео — текущее не перебивает поиск
 if(m.kind!==MV.kind||m.ref!==MV.ref){movieDestroy();movieBuild(m);return}
 if(!MV.P||!MV.P.ready||m.rev===MV.rev)return;
 MV.rev=m.rev;if(m.by===me)return; // своё действие уже применено у себя
 movieSync(m);
}
function movieSync(m){
 var P=MV.P;if(!P||!P.ready)return;MV.ign=Date.now()+1500;
 var t=movieTarget(m);try{if(Math.abs(P.time()-t)>1.5)P.seek(t)}catch(e){}
 if(m.playing){P.play();clearTimeout(MV.jt);MV.jt=setTimeout(function(){var j=$("mvJoin");if(j&&MV.P&&!MV.P.playing())j.style.display=""},1500)}
 else P.pause();
}
function movieSend(a){ // моё действие → партнёру
 if(Date.now()<MV.ign||!MV.P)return;var pos=0;try{pos=MV.P.time()}catch(e){}
 MV.busy=true;movieApi(a,{pos:pos}).then(function(x){MV.busy=false;MV.st=x.movie;MV.rev=x.movie.rev}).catch(function(){MV.busy=false});
}
function movieBuild(m){
 var box=$("mvBox");if(!box)return;MV.kind=m.kind;MV.ref=m.ref;MV.rev=null;
 box.innerHTML='<div class="mvp"><div id="mvSlot"></div><button type="button" class="mvjoin" id="mvJoin" style="display:none">▶ Подключиться к просмотру</button></div>'+
  '<div class="mvinfo"><b>'+esc(m.title||"Видео")+'</b><span>'+esc(m.author||"")+'</span></div>'+
  '<div class="gbtns"><button class="btn sec" id="mvChange" type="button">Другое видео</button><button class="btn danger" id="mvStop" type="button">Выключить</button></div>';
 $("mvStop").onclick=function(){confirmAsk("Выключить видео у вас обоих?",function(){movieApi("stop").then(function(x){movieApply(x.movie,true)}).catch(gErr)})};
 $("mvChange").onclick=function(){MV.browse=m.ref;movieDestroy();movieEmpty()};
 $("mvJoin").onclick=function(){this.style.display="none";var s=MV.st;if(s&&MV.P){MV.ign=Date.now()+1500;try{MV.P.seek(movieTarget(s))}catch(e){}MV.P.play()}};
 var P={ready:false};MV.P=P;
 var onReady=function(){P.ready=true;MV.rev=m.rev;movieSync(m)};
 if(m.kind==="yt"){
  ytLoad(function(){if(MV.P!==P)return;
   var yt=new YT.Player("mvSlot",{videoId:m.ref,width:"100%",height:"100%",playerVars:{playsinline:1,rel:0,modestbranding:1},events:{
    onReady:onReady,
    onStateChange:function(e){if(e.data===1){var j=$("mvJoin");if(j)j.style.display="none";movieSend("play")}else if(e.data===2)movieSend("pause")}}});
   P.time=function(){return yt.getCurrentTime()||0};P.seek=function(t){yt.seekTo(t,true)};P.play=function(){yt.playVideo()};P.pause=function(){yt.pauseVideo()};
   P.playing=function(){return yt.getPlayerState&&yt.getPlayerState()===1};P.kill=function(){yt.destroy()};
  });
 }else{
  var v=document.createElement("video");v.src=m.ref;v.controls=true;v.playsInline=true;v.setAttribute("playsinline","");v.preload="metadata";$("mvSlot").appendChild(v);
  P.time=function(){return v.currentTime||0};P.seek=function(t){v.currentTime=t};P.play=function(){var r=v.play();if(r&&r.catch)r.catch(function(){})};P.pause=function(){v.pause()};
  P.playing=function(){return !v.paused};P.kill=function(){v.pause();v.removeAttribute("src");v.load()};
  v.addEventListener("loadedmetadata",onReady,{once:true});v.addEventListener("error",function(){toast("Видео по этой ссылке не открывается")});
  v.addEventListener("play",function(){var j=$("mvJoin");if(j)j.style.display="none";movieSend("play")});v.addEventListener("pause",function(){movieSend("pause")});
  v.addEventListener("seeked",function(){if(!v.paused)movieSend("seek")});
 }
}

// ===================== общая комната =====================
var ROOM={since:0,here:false};
var ROOM_EMO=["❤️","😘","🥰","🤗","🥺","😂","🔥","✨"];
function roomScene(){
 var h=new Date().getHours(),night=h<7||h>=21,eve=h>=18&&h<21;
 var sky=night?["#2B2B57","#4A4370"]:eve?["#F2A08C","#B9A6EA"]:["#9FD3F2","#E3F3FC"];
 return '<svg class="rsvg" viewBox="0 0 360 260" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="rWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+(night?"#5D4E6E":"#F6DCD8")+'"/><stop offset="1" stop-color="'+(night?"#4A3E59":"#EFCFCB")+'"/></linearGradient><linearGradient id="rSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+sky[0]+'"/><stop offset="1" stop-color="'+sky[1]+'"/></linearGradient></defs>'+
  '<rect width="360" height="260" fill="url(#rWall)"/><rect y="200" width="360" height="60" fill="'+(night?"#3E3349":"#E2B9A8")+'"/>'+
  '<rect x="120" y="26" width="120" height="86" rx="10" fill="url(#rSky)" stroke="#fff" stroke-width="6"/><path d="M180 26 V112 M120 69 H240" stroke="#fff" stroke-width="4"/>'+
  (night?'<circle cx="215" cy="50" r="10" fill="#FFF3CF"/><circle cx="220" cy="46" r="9" fill="'+sky[0]+'"/><circle cx="140" cy="45" r="1.6" fill="#fff"/><circle cx="160" cy="90" r="1.3" fill="#fff"/><circle cx="200" cy="85" r="1.6" fill="#fff"/>':'<circle cx="210" cy="52" r="12" fill="#FFE07A"/><ellipse cx="150" cy="88" rx="16" ry="6" fill="#fff" opacity=".9"/>')+
  '<path d="M300 200 V120" stroke="#8A7E85" stroke-width="4"/><path d="M282 120 L318 120 L308 92 L292 92 Z" fill="'+(night?"#FFD66B":"#F6B8C8")+'"/>'+(night?'<circle cx="300" cy="125" r="40" fill="#FFD66B" opacity=".18"/>':"")+
  '<rect x="34" y="150" width="34" height="50" rx="6" fill="#C98291"/><path d="M51 150 Q30 120 40 100 Q55 118 51 150 Q60 112 76 104 Q74 132 51 150" fill="#7CCF8A"/>'+
  '<ellipse cx="180" cy="236" rx="140" ry="14" fill="'+(night?"#56456A":"#F4D2CC")+'"/>'+
  '<rect x="86" y="158" width="188" height="44" rx="16" fill="#D98C9A"/><rect x="78" y="146" width="28" height="62" rx="12" fill="#C97585"/><rect x="254" y="146" width="28" height="62" rx="12" fill="#C97585"/><rect x="96" y="130" width="168" height="40" rx="14" fill="#E9A7AE"/>'+
  '<path d="M100 208 v10 M260 208 v10" stroke="#8A6870" stroke-width="5" stroke-linecap="round"/></svg>';
}
function roomRender(B){
 var pn=esc(name(S&&S.partner));
 B.innerHTML='<div class="rroom" id="rmScene">'+roomScene()+'<div class="rseat me"><div class="rav" id="rmMe"></div><small>ты</small></div><div class="rseat pa" id="rmPaW"><div class="rav" id="rmPa"></div><small id="rmPaN">'+pn+'</small></div><div class="rfx" id="rmFx"></div></div>'+
  '<div class="rstat" id="rmStat">Ждём '+pn+'…</div><div class="rnow" id="rmNow"></div><div class="remo" id="rmEmo"></div><button class="btn sec" id="rmCall" type="button">Позвать '+pn+' в комнату</button>';
 setPhoto($("rmMe"),S&&S.me);setPhoto($("rmPa"),S&&S.partner);
 ROOM_EMO.forEach(function(em){var b=node('<button type="button">'+em+'</button>');b.onclick=function(){haptic();roomFly(em,true);call("/v2/pair/room",{action:"react",emoji:em,since:ROOM.since}).then(roomApply).catch(function(e){if(e.message!=="too_fast")gErr(e)})};$("rmEmo").appendChild(b)});
 $("rmCall").onclick=function(){var b=this;b.disabled=true;call("/v2/pair/room",{action:"call",since:ROOM.since}).then(function(x){roomApply(x);toast(x.called?"Позвали — бот напишет "+name(S&&S.partner)+" 💌":(x.partner_here?name(S&&S.partner)+" уже здесь ♡":"Уже звали недавно — подожди немного"))}).catch(gErr).then(function(){setTimeout(function(){b.disabled=false},3000)})};
 ROOM.since=0;ROOM.here=false;ROOM.ready=false;roomPoll();gLoop("h_room",roomPoll,2000);
}
function roomPoll(){var init=!ROOM.ready;call("/v2/pair/room",{action:"get",since:ROOM.since,init:init}).then(function(x){ROOM.ready=true;roomApply(x)}).catch(function(){})}
function roomApply(x){
 if(!$("rmScene"))return;var pn=name(S&&S.partner);
 if(x.partner_here&&!ROOM.here){haptic("medium");roomFly("👋",false)}
 ROOM.here=!!x.partner_here;$("rmPaW").classList.toggle("here",ROOM.here);
 $("rmStat").innerHTML=ROOM.here?"<b>Вы в комнате вдвоём 💞</b>":"Ждём "+esc(pn)+"… Позови — бот напишет";
 $("rmCall").style.display=ROOM.here?"none":"";
 var now=[];if(x.music)now.push("🎧 "+esc(x.music.title)+(x.music.playing?"":" (пауза)"));if(x.movie)now.push("🎬 "+esc(x.movie.title)+(x.movie.playing?"":" (пауза)"));
 $("rmNow").innerHTML=now.length?"Сейчас: "+now.join(" · "):"";
 (x.reacts||[]).forEach(function(r,i){setTimeout(function(){roomFly(r.emoji,false);haptic("light")},i*180)});
 if(x.cursor!=null){ROOM.since=x.cursor;var seen=Number(ls("ll_ping"))||0;if(x.cursor>seen)ls("ll_ping",String(x.cursor))}
}
function roomFly(em,mine){
 var fx=$("rmFx");if(!fx)return;
 for(var i=0;i<5;i++){var e=document.createElement("i");e.textContent=em;e.style.left=(mine?18:62)+Math.random()*18+"%";e.style.animationDelay=(i*.12)+"s";e.style.fontSize=(22+Math.random()*14)+"px";e.style.setProperty("--dx",((mine?1:-1)*(20+Math.random()*60)).toFixed(0)+"px");fx.appendChild(e);(function(e){setTimeout(function(){e.remove()},2300)})(e)}
}
