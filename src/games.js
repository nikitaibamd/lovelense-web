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
var GAMES=[["chess","♟️","Шахматы","Партия по ходам — бот позовёт, когда твой ход"],["guess","✏️","Рисуем и угадываем","Один рисует загаданное слово, второй угадывает"],["duo","🎨","Рисуем вдвоём","Раскраска на двоих: у каждого своя половина картинки"]];
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

// ---------- рисуем вдвоём: раскраска на двоих, у каждого своя половина ----------
var CR=600; // рабочее разрешение раскраски (одинаковое у обоих — заливка совпадает пиксель в пиксель)
var COLOR_FILL=["#F4A0A8","#F7B267","#F6D86B","#9ED98A","#8ECDF0","#B9A6EA","#E9536F","#B97A57","#8A7E85","#3E3639","#FFFFFF","#FFE3EC"];
var CL={};// кэш: разметка областей для каждой картинки
function clLabels(id){
 if(CL[id])return CL[id];
 var cv=document.createElement("canvas");cv.width=cv.height=CR;var x=cv.getContext("2d");
 x.fillStyle="#fff";x.fillRect(0,0,CR,CR);x.scale(CR/1000,CR/1000);x.lineWidth=11;x.lineCap="round";x.lineJoin="round";x.strokeStyle="#000";
 (COLOR_PICS[id]||COLOR_PICS.capy).d.forEach(function(d){x.stroke(new Path2D(d))});
 x.lineWidth=5;x.beginPath();x.moveTo(500,0);x.lineTo(500,1000);x.stroke(); // шов между половинами
 var px=x.getImageData(0,0,CR,CR).data,lab=new Int32Array(CR*CR),n=0,st=new Int32Array(CR*CR);
 for(var i=0;i<CR*CR;i++)if(px[i*4]<170)lab[i]=-1; // линии
 for(var s0=0;s0<CR*CR;s0++){if(lab[s0]!==0)continue;n++;var sp=0;st[sp++]=s0;lab[s0]=n;
  while(sp){var k=st[--sp],kx=k%CR,ky=(k/CR)|0;
   if(kx>0&&lab[k-1]===0){lab[k-1]=n;st[sp++]=k-1}if(kx<CR-1&&lab[k+1]===0){lab[k+1]=n;st[sp++]=k+1}
   if(ky>0&&lab[k-CR]===0){lab[k-CR]=n;st[sp++]=k-CR}if(ky<CR-1&&lab[k+CR]===0){lab[k+CR]=n;st[sp++]=k+CR}}}
 return CL[id]=lab;
}
function clLabelAt(lab,x,y){ // ближайшая область к точке (если попали прямо в линию)
 var cx=Math.round(x/1000*(CR-1)),cy=Math.round(y/1000*(CR-1));
 for(var r=0;r<8;r++)for(var dy=-r;dy<=r;dy++)for(var dx=-r;dx<=r;dx++){var X=cx+dx,Y=cy+dy;if(X<0||Y<0||X>=CR||Y>=CR)continue;var l=lab[Y*CR+X];if(l>0)return l}
 return 0;
}
function hexRgb(h){var n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255]}
// рисует одну половину: заливки и мазки строго по порядку, только в своей половине
function clPaint(ctx,id,ops,side){
 if(!ops||!ops.length)return;var lab=clLabels(id),x0=side==="left"?0:CR/2;
 ops.forEach(function(o){
  if(o.f){var l=clLabelAt(lab,o.p[0],o.p[1]);if(!l)return;var img=ctx.getImageData(0,0,CR,CR),d=img.data,c=hexRgb(COLOR_FILL[o.c]||COLOR_FILL[0]);
   for(var i=0;i<CR*CR;i++)if(lab[i]===l){d[i*4]=c[0];d[i*4+1]=c[1];d[i*4+2]=c[2];d[i*4+3]=255}ctx.putImageData(img,0,0);return}
  ctx.save();ctx.beginPath();ctx.rect(x0,0,CR/2,CR);ctx.clip();
  ctx.strokeStyle=COLOR_FILL[o.c]||COLOR_FILL[0];ctx.lineWidth=[0,4,9,18,32][o.w]||9;ctx.lineCap="round";ctx.lineJoin="round";
  var p=o.p;ctx.beginPath();ctx.moveTo(p[0]/1000*CR,p[1]/1000*CR);if(p.length===2)ctx.lineTo(p[0]/1000*CR+.1,p[1]/1000*CR);
  for(var j=2;j<p.length;j+=2)ctx.lineTo(p[j]/1000*CR,p[j+1]/1000*CR);ctx.stroke();ctx.restore();
 });
}
// холст раскраски: обе половины + бледный контур поверх + пунктир шва
function Coloring(wrap,G,editable,onChange){
 wrap.innerHTML='<div class="clw"><canvas class="clv"></canvas></div>'+(editable?'<div class="tools cltools"><button type="button" class="tb on" data-m="fill" aria-label="Заливка">🪣</button><button type="button" class="tb" data-m="brush" aria-label="Кисть">🖌️</button><button type="button" class="tb" data-a="w" aria-label="Толщина">●</button><button type="button" class="tb" data-a="u" aria-label="Отменить">↶</button></div><div class="tools"><div class="cols"></div></div>':"");
 var cv=wrap.querySelector("canvas"),work=document.createElement("canvas");work.width=work.height=CR;var wx=work.getContext("2d");
 var me={ops:(G.mine||[]).slice(),c:0,w:2,mode:"fill",cur:null},other=G.partner||[],side=G.side,id=G.pic,done=!!G.done;
 var size=function(){var w=Math.max(220,cv.parentNode.clientWidth||320),dpr=window.devicePixelRatio||1;cv.style.height=w+"px";cv.width=Math.round(w*dpr);cv.height=Math.round(w*dpr);return w};
 var W=size(),ctx=cv.getContext("2d");
 var outline=new Image();outline.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><g fill="none" stroke="#3E3639" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">'+(COLOR_PICS[id]||COLOR_PICS.capy).d.map(function(d){return '<path d="'+d+'"/>'}).join("")+'</g></svg>');
 var draw=function(){
  wx.setTransform(1,0,0,1,0,0);wx.fillStyle="#fff";wx.fillRect(0,0,CR,CR);
  clPaint(wx,id,other,side==="left"?"right":"left");clPaint(wx,id,me.ops,side);
  // шов закрашиваем цветом соседних половинок, чтобы картинка была цельной
  var h=CR/2;wx.drawImage(work,h-9,0,5,CR,h-4,0,5,CR);wx.drawImage(work,h+4,0,5,CR,h,0,5,CR);
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);ctx.drawImage(work,0,0,cv.width,cv.height);
  ctx.globalAlpha=done?.85:.3;if(outline.complete)ctx.drawImage(outline,0,0,cv.width,cv.height);ctx.globalAlpha=1;
  if(!done){ctx.save();ctx.setLineDash([8,8]);ctx.strokeStyle="rgba(216,148,148,.9)";ctx.lineWidth=2*(window.devicePixelRatio||1);ctx.beginPath();ctx.moveTo(cv.width/2,0);ctx.lineTo(cv.width/2,cv.height);ctx.stroke();ctx.restore();
   ctx.fillStyle="rgba(240,110,140,.07)";ctx.fillRect(side==="left"?cv.width/2:0,0,cv.width/2,cv.height)}
 };
 outline.onload=draw;
 var pt=function(e){var r=cv.getBoundingClientRect();return [Math.round(Math.max(0,Math.min(1,(e.clientX-r.left)/r.width))*1000),Math.round(Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))*1000)]};
 var mineSide=function(x){return side==="left"?x<500:x>=500};
 if(editable){
  cv.style.touchAction="none";
  cv.addEventListener("pointerdown",function(e){e.preventDefault();var q=pt(e);
   if(!mineSide(q[0])){toast("Эту половину раскрашивает "+name(S&&S.partner)+" 🙂");return}
   if(me.mode==="fill"){me.ops.push({f:1,c:me.c,w:1,p:q});haptic();draw();onChange&&onChange();return}
   swipes(true);try{cv.setPointerCapture(e.pointerId)}catch(x){}me.cur={c:me.c,w:me.w,p:q};me.ops.push(me.cur);draw()});
  cv.addEventListener("pointermove",function(e){if(!me.cur)return;var q=pt(e),p=me.cur.p;if(Math.abs(q[0]-p[p.length-2])+Math.abs(q[1]-p[p.length-1])<5)return;p.push(q[0],q[1]);draw()});
  var end=function(){if(!me.cur)return;me.cur=null;swipes(false);onChange&&onChange()};
  cv.addEventListener("pointerup",end);cv.addEventListener("pointercancel",end);
  var cols=wrap.querySelector(".cols");
  COLOR_FILL.forEach(function(col,i){var b=node('<button type="button" class="cl'+(i===0?" on":"")+'" aria-label="Цвет"></button>');b.style.background=col;b.onclick=function(){me.c=i;haptic();Array.prototype.forEach.call(cols.children,function(x){x.classList.toggle("on",x===b)})};cols.appendChild(b)});
  Array.prototype.forEach.call(wrap.querySelectorAll(".cltools .tb"),function(b){b.onclick=function(){haptic();
   var m=b.getAttribute("data-m"),a=b.getAttribute("data-a");
   if(m){me.mode=m;Array.prototype.forEach.call(wrap.querySelectorAll("[data-m]"),function(x){x.classList.toggle("on",x===b)})}
   if(a==="w"){me.w=me.w%4+1;b.style.fontSize=(8+me.w*4)+"px"}
   if(a==="u"&&me.ops.length){me.ops.pop();draw();onChange&&onChange()}
  }});
 }
 draw();
 return {ops:function(){return me.ops},setPartner:function(o){other=o||[];draw()},setDone:function(d){done=d;draw()},redraw:draw};
}
SHEETS.g_duo={t:"Рисуем вдвоём",r:function(B){
 B.innerHTML='<div id="duoW"></div>';GM.duo=null;GM.col=null;GM.cdirty=false;GM.duoKey="";
 gcall("duo","get").then(duoSet).catch(gErr);
 gLoop("g_duo",function(){var D=GM.duo;if(!D)return;
  if(GM.cdirty&&GM.col&&!D.me_done){GM.cdirty=false;gcall("duo","draw",{strokes:GM.col.ops()}).then(duoMerge).catch(function(){})}
  else gcall("duo","get").then(duoMerge).catch(function(){});
 },1500);
}};
function duoNew(){gcall("duo","new").then(function(x){haptic("medium");GM.duoKey="";duoSet(x)}).catch(gErr)}
function duoKey(D){return D?D.n+"|"+D.pic+"|"+D.me_done+"|"+D.done:"none"}
function duoSet(x){GM.duo=x.game;GM.duoKey=duoKey(x.game);duoDraw()}
function duoMerge(x){ // обновляем половину партнёра, не сбивая свою раскраску
 var D=x.game,prev=GM.duo;GM.duo=D;
 if(duoKey(D)!==GM.duoKey){GM.duoKey=duoKey(D);duoDraw();if(D&&D.done&&prev&&!prev.done){fireworks();haptic("heavy")}return}
 if(GM.col&&D){GM.col.setPartner(D.partner);var st=$("duoSt");if(st)st.innerHTML=duoStatus(D)}
}
function duoStatus(D){var pn=esc(name(S&&S.partner));return D.partner_done?"✓ "+pn+" закончил(а) свою половину":pn+" раскрашивает "+(D.side==="left"?"правую":"левую")+" половину — видно вживую"}
function duoDraw(){
 var w=$("duoW"),D=GM.duo;if(!w)return;GM.col=null;
 var pn=esc(name(S&&S.partner));
 if(!D){w.innerHTML='<div class="card box gintro"><div class="gbig">🎨</div><b>Раскраска на двоих</b><div class="hint">Вам обоим откроется одна картинка с бледными контурами. Ты раскрашиваешь свою половину, '+pn+' — другую. Видно друг друга вживую!</div><button class="btn" id="duoGo" type="button">Открыть картинку</button></div>';$("duoGo").onclick=duoNew;return}
 var nm=esc(D.name),half=D.side==="left"?"левую":"правую";
 if(D.done){
  w.innerHTML='<div class="gstat"><b>Готово: «'+nm+'» 🎉</b><span>Раскрасили вместе</span></div><div id="duoC"></div><button class="btn" id="duoGo" type="button">Новая картинка</button>';
  GM.col=Coloring($("duoC"),D,false);$("duoGo").onclick=duoNew;return;
 }
 if(D.me_done){
  w.innerHTML='<div class="gstat"><b>Твоя половина готова ✓</b><span id="duoSt">'+duoStatus(D)+'</span></div><div id="duoC"></div><div class="gwait"><span class="hb">💗</span>Когда '+pn+' закончит, картинка соберётся целиком</div>';
  GM.col=Coloring($("duoC"),D,false);return;
 }
 w.innerHTML='<div class="gstat you"><b>Раскрась '+half+' половину: «'+nm+'»</b><span id="duoSt">'+duoStatus(D)+'</span></div><div id="duoC"></div><div class="hint" style="text-align:center">🪣 — залить область, 🖌️ — рисовать кистью</div><button class="btn" id="duoSend" type="button">Готово</button><button class="btn sec" id="duoNew2" type="button">Другая картинка</button>';
 GM.col=Coloring($("duoC"),D,true,function(){GM.cdirty=true});
 $("duoSend").onclick=function(){var ops=GM.col.ops();if(!ops.length){toast("Сначала раскрась хоть что-нибудь 🎨");return}var b=this;b.disabled=true;
  gcall("duo","submit",{strokes:ops}).then(function(x){haptic("heavy");GM.duoKey="";duoSet(x);if(x.game&&x.game.done)fireworks()}).catch(function(e){b.disabled=false;gErr(e)})};
 $("duoNew2").onclick=function(){confirmAsk("Открыть другую картинку? Текущая раскраска у вас обоих сотрётся.",duoNew)};
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
