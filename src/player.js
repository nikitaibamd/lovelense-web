// ===== Плеер «пластинка на двоих»: винил, ваши аватарки, волна, реакции и мини-плеер =====
var STREAMC={};
// ссылки на поток кэшируем: следующий трек подгружается заранее, переключение без паузы
function streamUrl(id){
 var c=STREAMC[id];if(c&&Date.now()-c.t<240000)return c.p;
 var p=call("/v2/pair/music",{action:"stream",id:id});STREAMC[id]={t:Date.now(),p:p};
 p.catch(function(){delete STREAMC[id]});return p;
}
(function(){
 var card=$("mNowCard");if(!card)return;card.classList.add("vinyl");
 var mv=card.querySelector(".mvid");
 mv.appendChild(node('<div class="vdisc" id="vDisc"><div class="vgroove"></div><div class="vlabel" id="vLabel"></div><i class="vhole"></i></div>'));
 mv.appendChild(node('<div class="varm"><i></i></div>'));
 mv.appendChild(node('<div class="vav me" id="vAvMe"></div>'));
 mv.appendChild(node('<div class="vav pa" id="vAvPa"></div>'));
 var wave=node('<div class="vwave" id="vWave"></div>');
 for(var i=0;i<46;i++){var b=document.createElement("i");b.style.height=(28+Math.round(68*Math.abs(Math.sin(i*1.7)*Math.cos(i*.45))))+"%";wave.appendChild(b)}
 var bar=card.querySelector(".mbar");bar.classList.add("vbar");bar.insertBefore(wave,$("mSeek"));
 var ctl=card.querySelector(".mctl");
 var prev=node('<button type="button" id="mPrev" aria-label="С начала"><svg viewBox="0 0 24 24"><path d="M6 5h2.2v14H6zM19 5.6v12.8L9.6 12z" fill="currentColor"/></svg></button>');
 ctl.insertBefore(prev,$("mPlay"));
 var stop=$("mStop");stop.classList.add("vstop");card.insertBefore(stop,card.firstChild);
 var rx=node('<div class="vreact"></div>');
 ["❤️","🔥","🥰","😂","✨"].forEach(function(e){var b=node('<button type="button">'+e+'</button>');
  b.onclick=function(){haptic();vFloat(e);call("/v2/pair/ping",{emoji:e}).catch(function(){})};rx.appendChild(b)});
 card.appendChild(rx);
 prev.onclick=function(){haptic();if(M&&M.vid)mSeekTo(0)};
 function vFloat(e){var f=node('<span class="vfly">'+e+'</span>');f.style.left=(25+Math.random()*50)+"%";mv.appendChild(f);setTimeout(function(){f.remove()},1700)}
 window.vFloat=vFloat;

 // мини-плеер над нижним меню — виден на всех вкладках, пока играет музыка
 var mini=node('<div class="vmini" id="vMini"><div class="vma" id="vMiniArt"></div><div class="vmt"><b id="vMiniT"></b><small id="vMiniS"></small></div><button type="button" id="vMiniP" aria-label="Пауза"></button><i class="vmp" id="vMiniPr"></i></div>');
 document.body.appendChild(mini);
 mini.onclick=function(e){if(e.target.closest("#vMiniP"))return;haptic();hubOpen("media","music")};
 $("vMiniP").onclick=function(){haptic("medium");mToggle()};

 var rm=renderMusic;
 renderMusic=function(){rm();vRender()};
 var tk=mTick;
 mTick=function(){tk();vTick()};
 function vRender(){
  var has=!!(M&&M.vid),spin=has&&M.playing&&(!mine()||!au.paused);
  card.classList.toggle("has",has);
  $("vDisc").classList.toggle("spin",!!spin);card.classList.toggle("playing",!!spin);
  var lb=$("vLabel");
  if(has&&M.art){if(lb.dataset.u!==M.art){lb.dataset.u=M.art;lb.style.backgroundImage='url("'+String(M.art).replace(/"/g,"")+'")';lb.textContent=""}}
  else{lb.dataset.u="";lb.style.backgroundImage="";lb.textContent=has?"♪":""}
  var me=$("vAvMe"),pa=$("vAvPa");
  if(S&&S.me&&!me.dataset.set){me.dataset.set=1;try{setPhoto(me,S.me)}catch(e){}}
  if(S&&S.partner&&pa.dataset.set!==String(S.partner.id)){pa.dataset.set=String(S.partner.id);try{setPhoto(pa,S.partner)}catch(e){}}
  me.classList.toggle("on",!!(has&&mine()&&!au.paused));
  pa.classList.toggle("on",!!(M&&M.partner_here));pa.style.display=S&&S.partner?"":"none";
  // мини-плеер
  var hold=$("musicHold"),inMusic=hold&&hold.offsetParent!==null;
  mini.classList.toggle("on",has&&!inMusic&&!document.querySelector(".sheet.on:not(.hub)"));
  if(has){
   $("vMiniT").textContent=M.title||"Трек";
   $("vMiniS").textContent=M.partner_here?"слушаете вместе ♡":(M.author||"");
   var ma=$("vMiniArt");if(M.art)ma.style.backgroundImage='url("'+String(M.art).replace(/"/g,"")+'")';else ma.style.backgroundImage="";
   ma.classList.toggle("spin",!!spin);
   $("vMiniP").innerHTML=M.playing?IC_PAUSE:IC_PLAY;
  }
 }
 function vTick(){
  if(!M||!M.vid){paint(0);return}
  var d=mine()&&isFinite(au.duration)?au.duration:(M.dur?M.dur/1000:0),c=mine()&&!au.paused?au.currentTime:mExp();
  var p=d?Math.min(1,c/d):0;paint(p);
  $("vMiniPr").style.width=(p*100).toFixed(1)+"%";
  // за 25 секунд до конца заранее готовим следующий трек
  if(d&&d-c<25&&MQ&&MQ[0]&&MQ[0].vid)streamUrl(MQ[0].vid);
 }
 function paint(p){var bs=wave.children,n=Math.round(p*bs.length);if(wave.dataset.n==n)return;wave.dataset.n=n;for(var i=0;i<bs.length;i++)bs[i].classList.toggle("on",i<n)}
 // мини-плеер обновляется и когда «Музыка» закрыта
 setInterval(function(){if(M&&M.vid){vRender();vTick()}else mini.classList.remove("on")},1000);
})();
