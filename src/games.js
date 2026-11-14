// ===================== игры на двоих =====================
var GM={timer:null,chess:null,sel:-1,busy:false,duo:null,guess:null,gpad:null,gdirty:false,gsKey:"",cardT:0};
function gcall(kind,action,extra){var b={kind:kind,action:action};for(var k in extra||{})b[k]=extra[k];return call("/v2/pair/game",b)}
function gErr(e){toast(ERR[e.message]||"Не получилось, попробуй ещё раз")}
// быстрый опрос, пока открыт экран игры; сам останавливается, когда экран закрыли
function gLoop(key,fn,ms){clearInterval(GM.timer);GM.timer=setInterval(function(){if(!cur||cur.k!==key){clearInterval(GM.timer);GM.timer=null;return}fn()},ms)}
function swipes(off){try{if(off)TG&&TG.disableVerticalSwipes&&TG.disableVerticalSwipes();else TG&&TG.enableVerticalSwipes&&TG.enableVerticalSwipes()}catch(e){}}

// ---------- холст для рисования ----------
var PAD_COLORS=["#3E3639","#E9536F","#F7A23B","#F6D24A","#5DBB63","#4FA3E0","#8E6CD8","#B97A57","#F4B6C2","#FFFFFF"],PAD_W=[0,2,4,8,15];
function drawStrokes(ctx,strokes,x0,y0,w,h){
 ctx.lineCap="round";ctx.lineJoin="round";
 (strokes||[]).forEach(function(s){
  var p=s.p;if(!p||p.length<2)return;
  ctx.strokeStyle=PAD_COLORS[s.c]||PAD_COLORS[0];ctx.lineWidth=(PAD_W[s.w]||4)*w/320;
  ctx.beginPath();ctx.moveTo(x0+p[0]/1000*w,y0+p[1]/1000*h);
  if(p.length===2)ctx.lineTo(x0+p[0]/1000*w+.01,y0+p[1]/1000*h);
  for(var i=2;i<p.length;i+=2)ctx.lineTo(x0+p[i]/1000*w,y0+p[i+1]/1000*h);
  ctx.stroke();
 });
}
function sizeCanvas(cv,aspect){
 var w=Math.max(200,cv.parentNode.clientWidth||320),h=Math.round(w/aspect),dpr=window.devicePixelRatio||1;
 cv.style.height=h+"px";cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);
 var ctx=cv.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);return {ctx:ctx,w:w,h:h};
}
function viewCanvas(cv,aspect,strokes,guide){var C=sizeCanvas(cv,aspect);C.ctx.clearRect(0,0,C.w,C.h);if(guide)guide(C.ctx,C.w,C.h);drawStrokes(C.ctx,strokes,0,0,C.w,C.h);return C}
function makePad(wrap,aspect,onChange,guide){
 wrap.innerHTML='<div class="padw"><canvas class="pad"></canvas></div><div class="tools"><div class="cols"></div><button type="button" class="tb" data-a="w" aria-label="Толщина">●</button><button type="button" class="tb" data-a="u" aria-label="Отменить">↶</button><button type="button" class="tb" data-a="x" aria-label="Стереть всё">🗑</button></div>';
 var cv=wrap.querySelector("canvas"),pad={strokes:[],c:0,w:2,cur:null},C=sizeCanvas(cv,aspect);
 var redraw=function(){C.ctx.clearRect(0,0,C.w,C.h);if(guide)guide(C.ctx,C.w,C.h);drawStrokes(C.ctx,pad.strokes,0,0,C.w,C.h)};
 var pt=function(e){var r=cv.getBoundingClientRect();return [Math.round(Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*1000),Math.round(Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))*1000)]};
 cv.addEventListener("pointerdown",function(e){e.preventDefault();swipes(true);try{cv.setPointerCapture(e.pointerId)}catch(x){}pad.cur={c:pad.c,w:pad.w,p:pt(e)};pad.strokes.push(pad.cur);redraw()});
 cv.addEventListener("pointermove",function(e){if(!pad.cur)return;var q=pt(e),p=pad.cur.p;if(Math.abs(q[0]-p[p.length-2])+Math.abs(q[1]-p[p.length-1])<5)return;p.push(q[0],q[1]);redraw()});
 var end=function(){if(!pad.cur)return;pad.cur=null;swipes(false);if(onChange)onChange()};
 cv.addEventListener("pointerup",end);cv.addEventListener("pointercancel",end);
 var cols=wrap.querySelector(".cols");
 PAD_COLORS.forEach(function(col,i){var b=node('<button type="button" class="cl'+(i===0?" on":"")+'" aria-label="Цвет"></button>');b.style.background=col;b.onclick=function(){pad.c=i;haptic();Array.prototype.forEach.call(cols.children,function(x){x.classList.toggle("on",x===b)})};cols.appendChild(b)});
 Array.prototype.forEach.call(wrap.querySelectorAll(".tb"),function(b){b.onclick=function(){haptic();var a=b.getAttribute("data-a");
  if(a==="w"){pad.w=pad.w%4+1;b.style.fontSize=(8+pad.w*4)+"px"}
  if(a==="u"){pad.strokes.pop();redraw();if(onChange)onChange()}
  if(a==="x"&&pad.strokes.length){pad.strokes=[];redraw();if(onChange)onChange()}
 }});
 wrap.querySelector('[data-a="w"]').style.fontSize="16px";
 pad.redraw=redraw;pad.set=function(s){pad.strokes=s||[];redraw()};
 redraw();return pad;
}

// ---------- список игр (во вкладке «Вместе» и в отдельном окне) ----------
var GAMES=[["chess","♟️","Шахматы","Партия по ходам — бот позовёт, когда твой ход"],["guess","✏️","Рисуем и угадываем","Один рисует загаданное слово, второй угадывает"],["duo","🎨","Рисуем вдвоём","Каждый рисует свою половину, не видя чужую — потом склеиваем"]];
function gameList(list){
 if(!list)return;list.innerHTML="";
 GAMES.forEach(function(g){var r=node('<button type="button" class="card gitem"><span class="gi">'+g[1]+'</span><span class="gt"><b>'+g[2]+'</b><small>'+g[3]+'</small></span><span class="gb" data-b="'+g[0]+'"></span></button>');r.onclick=function(){haptic();openSheet("g_"+g[0])};list.appendChild(r)});
 if(GM.sum)gameMarks(list,GM.sum);
}
function gameMarks(list,games){(games||[]).forEach(function(g){var e=list&&list.querySelector('[data-b="'+g.kind+'"]');if(e){e.textContent=g.text;e.classList.toggle("you",!!g.you)}})}
SHEETS.games={t:"Игры вдвоём",r:function(B){
 if(!S||!S.partner){box(B,'<div class="hint" style="margin-top:0">Игры появятся, когда вы добавите партнёра ♡</div>');return}
 var list=node('<div class="glist"></div>');B.appendChild(list);gameList(list);
 call("/v2/pair/games").then(function(x){GM.sum=x.games;gameMarks(list,x.games)}).catch(function(){});
}};
// вкладка «Вместе»: игры, значок «тебя ждут», строка «сейчас вместе»
var GAME_NOW={chess:["♟️","сейчас в шахматах — заходи!"],guess:["✏️","рисует или угадывает — присоединяйся!"],duo:["🎨","рисует свою половину картинки"]};
function gamesCard(){
 var tg=$("togGames"),has=!!(S&&S.partner);
 if(tg&&!tg.children.length&&has)gameList(tg);
 if(tg&&!has)tg.innerHTML='<div class="card box"><div class="hint" style="margin:0">Игры появятся, когда вы добавите партнёра ♡</div></div>';
 var ps=$("petSec");if(ps)ps.style.display=S&&S.pet?"":"none";
 var nt=$("nowTog"),pn=name(S&&S.partner),pg=S&&S.partner_game,mh=S&&S.music&&S.music.partner_here;
 if(nt){
  if(has&&pg&&GAME_NOW[pg]){nt.innerHTML='<b>'+GAME_NOW[pg][0]+'</b><span>'+esc(pn)+' '+GAME_NOW[pg][1]+'</span><i>›</i>';nt.onclick=function(){haptic();openSheet("g_"+pg)};nt.style.display=""}
  else if(has&&mh){nt.innerHTML='<b>🎧</b><span>'+esc(pn)+' слушает музыку — подключайся</span><i>›</i>';nt.onclick=function(){haptic();var m=document.querySelector(".mnow");if(m)m.scrollIntoView({behavior:"smooth",block:"center"})};nt.style.display=""}
  else nt.style.display="none";
 }
 if(!has||Date.now()-GM.cardT<20000)return;GM.cardT=Date.now();
 call("/v2/pair/games").then(function(x){
  GM.sum=x.games;gameMarks(tg,x.games);
  var n=(x.games||[]).filter(function(g){return g.you}).length,b=$("navBadge");if(b){b.textContent=n;b.classList.toggle("on",n>0)}
 }).catch(function(){});
}
// при входе во вкладку «Вместе» сразу обновляем статусы игр
(function(){var nb=document.querySelector('.nav button[data-tab="music"]');if(nb)nb.addEventListener("click",function(){GM.cardT=0;safe(gamesCard)})})();

// ---------- шахматы ----------
var GLYPH={k:"♚︎",q:"♛︎",r:"♜︎",b:"♝︎",n:"♞︎",p:"♟︎"};
SHEETS.g_chess={t:"Шахматы",r:function(B){
 B.innerHTML='<div class="gstat" id="chS"></div><div class="board" id="chB"></div><div id="chP"></div><div class="gbtns"><button class="btn sec" id="chNew" type="button">Новая партия</button><button class="btn danger" id="chRes" type="button">Сдаться</button></div>';
 $("chNew").onclick=function(){var go=function(){gcall("chess","new").then(function(x){GM.sel=-1;chSet(x);haptic("medium")}).catch(gErr)};if(GM.chess&&GM.chess.st==="play")confirmAsk("Начать новую партию? Текущая закончится.",go);else go()};
 $("chRes").onclick=function(){confirmAsk("Сдаться и закончить партию?",function(){gcall("chess","resign").then(chSet).catch(gErr)})};
 $("chB").onclick=function(e){var t=e.target.closest(".sq");if(t)chTap(Number(t.getAttribute("data-s")))};
 GM.sel=-1;GM.chess=null;chDraw();gcall("chess","get").then(chSet).catch(gErr);
 gLoop("g_chess",function(){if(GM.busy)return;gcall("chess","get").then(function(x){var a=x.game,b=GM.chess;if(!a||!b||a.g.n!==b.g.n||a.st!==b.st)chSet(x,true)}).catch(function(){})},2500);
}};
function chSet(x,remote){
 var prev=GM.chess;GM.chess=x.game;chDraw(remote&&prev&&x.game&&x.game.g.last?x.game.g.last.t:-1);
 var G=GM.chess;if(remote&&G&&prev&&G.g.n!==prev.g.n){haptic("medium");if(G.st==="play"&&G.g.t===G.my)toast(G.check?"Тебе шах! ♚":"Твой ход ♟")}
 if(G&&prev&&prev.st==="play"&&G.st!=="play"&&G.win===(S&&S.me&&S.me.id))fireworks();
}
function chDraw(popSq){
 var G=GM.chess,bd=$("chB"),st=$("chS");if(!bd)return;
 $("chRes").style.display=G&&G.st==="play"?"":"none";$("chP").innerHTML="";
 if(!G){st.className="gstat";st.innerHTML='<b>Сыграем партию?</b><span>Нажми «Новая партия» — цвет выпадет случайно</span>';bd.innerHTML="";bd.style.display="none";return}
 bd.style.display="";
 var g=G.g,my=G.my,flip=my==="b",mine=G.st==="play"&&g.t===my,legal=mine?chLegal(g):[],tg={},pn=name(S&&S.partner),me=S&&S.me&&S.me.id;
 if(GM.sel>=0)legal.forEach(function(m){if(m.f===GM.sel)tg[m.t]=1});
 var kc=G.check&&G.st!=="stalemate"?chKing(g.b,g.t):-1,h="";
 for(var i=0;i<64;i++){var sq=flip?63-i:i,p=g.b[sq],r=sq>>3,f=sq&7;
  h+='<button type="button" class="sq'+((r+f)%2?" d":"")+(sq===GM.sel?" sel":"")+(g.last&&(sq===g.last.f||sq===g.last.t)?" last":"")+(sq===kc?" chk":"")+(tg[sq]?(p!=="."?" cap":" mv"):"")+(sq===popSq?" pop":"")+'" data-s="'+sq+'">'+(p!=="."?'<span class="pc '+chColor(p)+'">'+GLYPH[p.toLowerCase()]+'</span>':"")+'</button>'}
 bd.innerHTML=h;
 var side="Ты играешь "+(my==="w"?"белыми":"чёрными");
 st.className="gstat"+(mine?" you":"");
 if(G.st==="play")st.innerHTML='<b>'+(mine?(G.check?"Тебе шах! Твой ход":"Твой ход"):"Ход: "+esc(pn)+(G.check?" (шах)":""))+'</b><span>'+side+' · ход '+(Math.floor(g.n/2)+1)+'</span>';
 else{var t=G.st==="mate"?(G.win===me?"Мат! Ты победил(а) 🏆":"Мат — победил(а) "+esc(pn)):G.st==="stalemate"?"Пат — ничья 🤝":(G.win===me?esc(pn)+" сдался(ась) — победа 🏆":"Ты сдался(ась)");st.innerHTML='<b>'+t+'</b><span>Нажми «Новая партия», чтобы сыграть ещё</span>'}
}
function chTap(sq){
 var G=GM.chess;if(!G||G.st!=="play"||G.g.t!==G.my||GM.busy)return;
 var g=G.g,p=g.b[sq];
 if(GM.sel>=0){
  var m=chLegal(g).filter(function(x){return x.f===GM.sel&&x.t===sq})[0];
  if(m){
   var go=function(pr){var prev=GM.chess;GM.busy=true;GM.sel=-1;GM.chess={g:chApply(g,m,pr),my:G.my,st:"play",win:null,check:false};chDraw(m.t);haptic("medium");
    gcall("chess","move",{from:m.f,to:m.t,promo:pr}).then(function(x){GM.busy=false;chSet(x)}).catch(function(e){GM.busy=false;GM.chess=prev;chDraw();gErr(e)})};
   var tr=m.t>>3;if(g.b[m.f].toLowerCase()==="p"&&(tr===0||tr===7))return chPromo(go);
   return go("q");
  }
 }
 if(p!=="."&&chColor(p)===G.my){GM.sel=sq===GM.sel?-1:sq;haptic();chDraw();return}
 if(GM.sel>=0){GM.sel=-1;chDraw()}
}
function chPromo(go){
 var w=$("chP"),c=GM.chess.my;w.innerHTML='<div class="hint" style="text-align:center">Во что превратить пешку?</div><div class="promo"></div>';
 ["q","r","b","n"].forEach(function(k){var b=node('<button type="button"><span class="pc '+c+'" style="font-size:32px">'+GLYPH[k]+'</span></button>');b.querySelector(".pc").style.cssText+=c==="w"?";color:#fff;text-shadow:0 0 1px #3E3639,0 0 1px #3E3639,0 0 2px #3E3639":";color:#3E3639";b.onclick=function(){w.innerHTML="";go(k)};w.querySelector(".promo").appendChild(b)});
}

// ---------- рисуем вдвоём: каждый свою половину ----------
function duoGuide(top){return function(ctx,w,h){
 var y=top?h-1:1;ctx.save();ctx.setLineDash([7,7]);ctx.strokeStyle="rgba(216,148,148,.8)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();ctx.setLineDash([]);
 [.3,.5,.7].forEach(function(k){ctx.fillStyle="rgba(216,148,148,.9)";ctx.beginPath();ctx.arc(w*k,y,5,0,7);ctx.fill()});ctx.restore();
}}
SHEETS.g_duo={t:"Рисуем вдвоём",r:function(B){
 B.innerHTML='<div id="duoW"></div>';GM.duo=null;
 gcall("duo","get").then(duoSet).catch(gErr);
 gLoop("g_duo",function(){var D=GM.duo;if(D&&D.mine&&!D.done)gcall("duo","get").then(function(x){if(x.game&&x.game.done){duoSet(x);haptic("heavy")}}).catch(function(){})},3000);
}};
function duoSet(x){GM.duo=x.game;duoDraw()}
function duoNew(){gcall("duo","new").then(function(x){haptic("medium");duoSet(x)}).catch(gErr)}
function duoDraw(){
 var w=$("duoW"),D=GM.duo;if(!w)return;
 var pn=esc(name(S&&S.partner));
 if(!D){w.innerHTML='<div class="card box gintro"><div class="gbig">🎨</div><b>Одна картинка на двоих</b><div class="hint">Вы получите, что рисовать. Один рисует верхнюю половину, другой — нижнюю, не видя чужую. Потом половинки склеятся — обычно выходит очень смешно!</div><button class="btn" id="duoGo" type="button">Начать</button></div>';$("duoGo").onclick=duoNew;return}
 if(D.done){
  w.innerHTML='<div class="gstat"><b>Что получилось: «'+esc(D.thing)+'» 🎉</b><span>Верх и низ рисовали разные люди</span></div><div class="duoRes"><canvas id="duoT"></canvas><canvas id="duoB"></canvas></div><button class="btn" id="duoGo" type="button">Нарисовать ещё</button>';
  viewCanvas($("duoT"),2,D.half==="top"?D.mine:D.partner);viewCanvas($("duoB"),2,D.half==="top"?D.partner:D.mine);
  $("duoGo").onclick=duoNew;return;
 }
 var top=D.half==="top";
 if(D.mine){
  w.innerHTML='<div class="gstat"><b>Твоя половина готова ✓</b><span>«'+esc(D.thing)+'» — '+(top?"верх":"низ")+'</span></div><canvas class="view" id="duoMine"></canvas><div class="gwait"><span class="hb">💗</span>Ждём, когда '+pn+' нарисует свою половину…<br>Как только будет готово — картинка склеится</div>';
  viewCanvas($("duoMine"),2,D.mine,duoGuide(top));return;
 }
 w.innerHTML='<div class="gstat you"><b>Нарисуй '+(top?"верхнюю":"нижнюю")+' половину: «'+esc(D.thing)+'»</b><span>'+(D.partner_done?pn+" уже нарисовал(а) свою часть ✓":"Что нарисует "+pn+", увидишь в конце")+' · доведи линии до пунктира</span></div><div id="duoPad"></div><button class="btn" id="duoSend" type="button">Готово</button>';
 var pad=makePad($("duoPad"),2,null,duoGuide(top));
 $("duoSend").onclick=function(){if(!pad.strokes.length){toast("Сначала нарисуй что-нибудь ✏️");return}var b=this;b.disabled=true;gcall("duo","submit",{strokes:pad.strokes}).then(function(x){haptic("heavy");duoSet(x);if(x.game&&x.game.done)fireworks()}).catch(function(e){b.disabled=false;gErr(e)})};
}

// ---------- рисуем и угадываем ----------
SHEETS.g_guess={t:"Рисуем и угадываем",r:function(B){
 B.innerHTML='<div id="gsW"></div>';GM.guess=null;GM.gpad=null;GM.gsKey="";GM.gdirty=false;
 gcall("guess","get").then(gsSet).catch(gErr);
 gLoop("g_guess",function(){var G=GM.guess;if(!G||G.ok&&!G.drawer)return gcall("guess","get").then(gsSet).catch(function(){});
  if(G.drawer&&GM.gdirty&&GM.gpad){GM.gdirty=false;gcall("guess","draw",{strokes:GM.gpad.strokes}).then(gsSet).catch(function(){})}
  else gcall("guess","get").then(gsSet).catch(function(){});
 },1500);
}};
function gsNew(){gcall("guess","new").then(function(x){haptic("medium");GM.gsKey="";gsSet(x)}).catch(gErr)}
function gsSet(x){
 var G=x.game,prev=GM.guess;GM.guess=G;var w=$("gsW");if(!w)return;
 var key=G?(G.round+"|"+G.drawer+"|"+G.ok):"none";
 if(key!==GM.gsKey){GM.gsKey=key;gsRender();if(prev&&G&&G.ok&&!prev.ok){fireworks();haptic("heavy")}return}
 gsUpdate();
}
function gsLog(G){return (G.guesses||[]).map(function(g){return '<span class="'+(g.ok?"ok":"")+'">'+esc(g.t)+(g.ok?" ✓":" ✗")+'</span>'}).join("")}
function gsRender(){
 var w=$("gsW"),G=GM.guess,pn=esc(name(S&&S.partner));GM.gpad=null;
 if(!G){w.innerHTML='<div class="card box gintro"><div class="gbig">✏️</div><b>Рисуем и угадываем</b><div class="hint">Ты получаешь слово и рисуешь его, '+pn+' видит рисунок почти вживую и угадывает. Потом меняетесь.</div><button class="btn" id="gsGo" type="button">Я рисую первым</button></div>';$("gsGo").onclick=gsNew;return}
 var sc='<span>Угадано вместе: '+G.score+' · раунд '+G.round+'</span>';
 if(G.ok){
  w.innerHTML='<div class="gok"><div class="hint" style="margin:0">'+(G.drawer?pn+" угадал(а)!":"Ты угадал(а)!")+'</div><div class="gword">«'+esc(G.word)+'»</div></div><div class="gstat">'+sc+'</div><canvas class="view" id="gsView"></canvas><button class="btn" id="gsGo" type="button">'+(G.drawer?"Ещё раунд — снова рисую":"Теперь рисую я")+'</button>';
  viewCanvas($("gsView"),.8,G.strokes);$("gsGo").onclick=gsNew;return;
 }
 if(G.drawer){
  w.innerHTML='<div class="gstat you"><span>Нарисуй слово — без букв и цифр</span><div class="gword">'+esc(G.word)+'</div>'+sc+'</div><div id="gsPad"></div><div class="glog" id="gsLog"></div><div class="hint" id="gsHint" style="text-align:center"></div><button class="btn sec" id="gsSkip" type="button">Другое слово</button>';
  GM.gpad=makePad($("gsPad"),.8,function(){GM.gdirty=true});GM.gpad.set(G.strokes);
  $("gsSkip").onclick=function(){confirmAsk("Взять другое слово? Рисунок сотрётся.",gsNew)};
 }else{
  var slots="";for(var i=0;i<G.len;i++)slots+="<i></i>";
  w.innerHTML='<div class="gstat you"><b>'+pn+' рисует — угадай!</b>'+sc+'</div><canvas class="view" id="gsView"></canvas><div class="gslots">'+slots+'</div><div class="hint" id="gsHint" style="text-align:center;margin-top:0"></div><form class="gguess" id="gsForm"><input class="in" id="gsIn" placeholder="Что это?" autocomplete="off" enterkeyhint="send"><button class="btn" type="submit">Угадать</button></form><div class="glog" id="gsLog"></div>';
  $("gsForm").onsubmit=function(e){e.preventDefault();var v=$("gsIn").value.trim();if(!v)return;$("gsIn").value="";gcall("guess","guess",{text:v}).then(function(x){if(!x.game.ok){toast("Не то… ещё попытка 🤔");haptic("light")}gsSet(x)}).catch(gErr)};
 }
 gsUpdate();
}
function gsUpdate(){
 var G=GM.guess;if(!G)return;
 var lg=$("gsLog");if(lg)lg.innerHTML=gsLog(G);
 var hn=$("gsHint");if(hn)hn.textContent=G.drawer?(G.guesses&&G.guesses.length?"":"Ждём первую догадку…"):(G.hint?"Подсказка: начинается на «"+G.hint+"»":"Слово из "+G.len+" "+plural(G.len,"буквы","букв","букв"));
 var v=$("gsView");if(v&&!G.ok){var k=JSON.stringify(G.strokes).length;if(v.getAttribute("data-k")!==String(k)){v.setAttribute("data-k",k);viewCanvas(v,.8,G.strokes)}}
}
