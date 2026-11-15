// ===================== «Вместе»: страницы с нижними вкладками =====================
var HUB={kind:null,sub:null,returnTo:null};
var HUBS={
 media:{t:"Смотрим и слушаем",tabs:[["movie","🎬","Кино"],["music","🎧","Музыка"],["room","🛋","Комната"]]},
 games:{t:"Игры вдвоём",tabs:[["chess","♟️","Шахматы"],["guess","✏️","Угадайка"],["duo","🎨","Раскраска"]]}
};
var MUSIC_IDS=["mFind","mHere","mNowCard","mQCard"];
function musicHome(){var h=$("musicHold");if(!h)return;MUSIC_IDS.forEach(function(id){var e=$(id);if(e&&e.parentNode!==h)h.appendChild(e)})}
// уборка перед закрытием или сменой страницы: музыка возвращается на место, видео и комната останавливаются
function hubCleanup(){if(typeof togStop==="function")togStop();musicHome();movieDestroy();var n=$("hubNav");if(n)n.remove();$("sheet").classList.remove("hub");HUB.kind=null;HUB.sub=null}
function hubOpen(kind,sub){
 var H=HUBS[kind];if(!H)return;
 SHEETS.hub={t:H.t,r:function(){}};openSheet("hub");HUB.returnTo=null;HUB.kind=kind;
 $("sheet").classList.add("hub");
 var nav=node('<div class="hubnav'+(H.tabs.length>4?' many':'')+'" id="hubNav"></div>');
 H.tabs.forEach(function(t){var b=node('<button type="button" data-s="'+t[0]+'"><span class="hi">'+t[1]+'</span><span>'+t[2]+'</span></button>');b.onclick=function(){if(HUB.sub!==t[0]){haptic();hubSub(t[0])}};nav.appendChild(b)});
 $("sheet").appendChild(nav);
 hubSub(sub||H.tabs[0][0]);hubBadges();
}
function hubSub(sub){
 var B=$("shB");if(typeof togStop==="function")togStop();musicHome();movieDestroy();clearInterval(GM.timer);GM.timer=null;
 HUB.sub=sub;Array.prototype.forEach.call($("hubNav").children,function(b){b.classList.toggle("on",b.getAttribute("data-s")===sub)});
 B.innerHTML="";B.scrollTop=0;B.classList.remove("hubin");void B.offsetWidth;B.classList.add("hubin");
 if(HUB.kind==="games"){cur={k:"g_"+sub,live:null};SHEETS["g_"+sub].r(B);return}
 if(sub==="music"){cur={k:"h_music",live:null};var w=node('<div class="hubmusic"></div>');B.appendChild(w);MUSIC_IDS.forEach(function(id){var e=$(id);if(e)w.appendChild(e)});return}
 if(sub==="movie"){cur={k:"h_movie",live:null};movieRender(B);return}
 if(typeof TOG!=="undefined"&&TOG[sub]){cur={k:"t_"+sub,live:null};TOG[sub](B);return}
 cur={k:"h_room",live:null};roomRender(B);
}
// значки «тебя ждут» на нижних вкладках игр и на кнопках во «Вместе»
function hubBadges(){
 var sum=GM.sum||[],you={};sum.forEach(function(g){if(g.you)you[g.kind]=g.text});
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

