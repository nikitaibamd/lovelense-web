// ===================== питомец гуляет по всему приложению =====================
// Ходит по верхним краям карточек, прыгает между ними, падает, мяукает, просит поиграть и прячется.
var RM={el:null,on:false,x:60,y:0,vx:0,vy:0,f:1,st:"air",pl:null,off:0,tx:0,jump:null,next:0,last:0,key:"",say:0,lastPet:0,fallFrom:0,raf:0};
var RM_W=66,RM_H=74,RM_SPEED=55,RM_G=1900;
var PET_TALK={
 cat:{hi:["Мяу!","Мур-мяу 🐾","Мяяяу?","Мрр…"],ow:"Мяу! 😿 Ой-ой…"},
 dog:{hi:["Гав!","Тяв-тяв 🐾","Гав? 🐶"],ow:"Скуль… 😢"},
 rabbit:{hi:["Фыр-фыр","*шевелит ушками*","Хрум 🥕"],ow:"Ой-ой 😿"},
 fox:{hi:["Фыр!","Ак-ак-ак 🦊","Хи-хи"],ow:"Фыр… больно 😿"},
 bear:{hi:["Ррр 🐻","Уф!","Мёду бы…"],ow:"Ууу… 😿"},
 panda:{hi:["Ням-ням 🎋","Уи!","Обнимашки?"],ow:"Ой… 😿"}
};
function rmTalk(){var p=S&&S.pet;return PET_TALK[p&&p.kind]||PET_TALK.cat}
function rmPick(a){return a[Math.floor(Math.random()*a.length)]}

// где можно стоять: верхние края видимых карточек и верх нижнего меню
function rmFloor(){var n=document.querySelector(".nav");var r=n&&n.getBoundingClientRect();return r&&r.top>0?r.top:window.innerHeight}
function rmPlatforms(){
 var out=[],floor=rmFloor(),v=document.querySelector(".view.on");if(!v)return out;
 Array.prototype.forEach.call(v.querySelectorAll(".card"),function(c){
  if(!c.offsetParent)return;var r=c.getBoundingClientRect();
  if(r.width<90||r.top<70||r.top>floor-30)return;
  out.push({el:c,x1:r.left+6,x2:r.right-6,y:r.top});
 });
 out.push({el:null,x1:12,x2:window.innerWidth-12,y:floor});
 return out;
}
function rmPlatY(p){if(!p||!p.el)return rmFloor();var r=p.el.getBoundingClientRect();return r.top}
function rmPlatValid(p){if(!p)return false;if(!p.el)return true;if(!p.el.offsetParent||!p.el.closest(".view.on"))return false;var r=p.el.getBoundingClientRect();return r.top>60&&r.top<rmFloor()-20}
function rmPlatX(p){if(!p||!p.el)return [12,window.innerWidth-12];var r=p.el.getBoundingClientRect();return [r.left+6,r.right-6]}

// ---------- кадр ----------
function rmPaint(){var e=RM.el;e.style.transform="translate3d("+(RM.x-RM_W/2).toFixed(1)+"px,"+(RM.y-RM_H+3).toFixed(1)+"px,0)";e.querySelector(".rb").style.setProperty("--f",RM.f)}
function rmState(s){var e=RM.el;["walk","air","fall","hide","sit"].forEach(function(c){e.classList.toggle(c,c===s)});RM.st=s}
function rmFx(cls,ms){var e=RM.el;e.classList.remove(cls);void e.offsetWidth;e.classList.add(cls);setTimeout(function(){e.classList.remove(cls)},ms)}
function rmSay(t,ms,ask){
 var b=RM.el.querySelector(".say");b.textContent=t;b.classList.toggle("ask",!!ask);b.classList.add("on");clearTimeout(RM.say);
 RM.say=setTimeout(function(){b.classList.remove("on","ask");RM.asking=false},ms||1800);
}
function rmLand(p,speed){
 RM.pl=p;RM.vy=0;var y=rmPlatY(p);RM.y=y;
 var xs=rmPlatX(p);RM.x=Math.max(xs[0]+RM_W/2-10,Math.min(xs[1]-RM_W/2+10,RM.x));RM.off=p.el?RM.x-p.el.getBoundingClientRect().left:RM.x;
 rmState("sit");rmFx("land",350);
 if(speed>1100){rmFx("dizzy",1400);rmSay(rmTalk().ow,2200);try{TG&&TG.HapticFeedback&&TG.HapticFeedback.notificationOccurred("warning")}catch(e){}}
 RM.next=performance.now()+900+Math.random()*1200;
}
function rmFall(){RM.pl=null;RM.vy=Math.min(RM.vy,0);RM.fallFrom=RM.y;rmState("fall")}
function rmStep(t){
 RM.raf=requestAnimationFrame(rmStep);
 if(!RM.on||document.hidden)return;
 var dt=Math.min(.05,(t-(RM.last||t))/1000);RM.last=t;
 if(RM.jump){ // прыжок по дуге к выбранной точке
  var j=RM.jump,k=Math.min(1,(t-j.t0)/j.dur);
  RM.x=j.x0+(j.x1-j.x0)*k;var yEnd=rmPlatY(j.p);RM.y=j.y0+(yEnd-j.y0)*k-Math.sin(k*Math.PI)*j.h;
  if(k>=1){RM.jump=null;rmLand(j.p,0)}
  rmPaint();return;
 }
 if(!RM.pl){ // свободное падение
  var prev=RM.y;RM.vy+=RM_G*dt;RM.y+=RM.vy*dt;
  var plats=rmPlatforms();for(var i=0;i<plats.length;i++){var p=plats[i];if(RM.x>p.x1&&RM.x<p.x2&&prev<=p.y+2&&RM.y>=p.y){rmLand(p,RM.vy);break}}
  if(!RM.pl&&RM.y>rmFloor()+10)rmLand(plats[plats.length-1],RM.vy);
  rmPaint();return;
 }
 if(!rmPlatValid(RM.pl)){rmFall();rmPaint();return} // карточку прокрутили или сменили вкладку
 var xs=rmPlatX(RM.pl);RM.y=rmPlatY(RM.pl);
 if(RM.pl.el)RM.x=RM.pl.el.getBoundingClientRect().left+RM.off;
 if(RM.st==="walk"){
  var d=RM.tx-RM.x;
  if(Math.abs(d)<2){rmState("sit");RM.next=t+800+Math.random()*1500}
  else{RM.x+=Math.sign(d)*Math.min(Math.abs(d),RM_SPEED*dt);RM.f=d<0?-1:1}
  if(RM.walkOff&&(RM.x<xs[0]+4||RM.x>xs[1]-4)){RM.walkOff=false;rmFall()}
  if(RM.pl)RM.off=RM.pl.el?RM.x-RM.pl.el.getBoundingClientRect().left:RM.x;
 }
 if((RM.st==="sit")&&t>RM.next)rmDecide(t);
 rmPaint();
}
// ---------- поведение ----------
function rmDecide(t){
 var p=S&&S.pet;if(!p)return;
 if(moodOf(p)==="sleep"){RM.next=t+8000;return}
 var r=Math.random(),xs=rmPlatX(RM.pl),onCard=!!(RM.pl&&RM.pl.el);
 if(r<.32){ // прогулка по карточке
  RM.tx=xs[0]+RM_W/2+Math.random()*Math.max(1,xs[1]-xs[0]-RM_W);rmState("walk");
 }else if(r<.58){ // прыжок на другую карточку
  var plats=rmPlatforms().filter(function(q){return q.el!==(RM.pl&&RM.pl.el)&&Math.abs(q.y-RM.y)<330&&q.y>90}),q=plats.length?rmPick(plats):null;
  if(q){var x1=Math.max(q.x1+RM_W/2,Math.min(q.x2-RM_W/2,RM.x+(Math.random()-.5)*220));RM.f=x1<RM.x?-1:1;
   RM.jump={p:q,t0:t,dur:520+Math.abs(q.y-RM.y)*.9,x0:RM.x,y0:RM.y,x1:x1,h:70+Math.max(0,RM.y-q.y)*.6};RM.pl=null;rmState("air")}
  else RM.next=t+1500;
 }else if(r<.66&&onCard){ // заигрался и свалился с края
  RM.tx=Math.random()<.5?xs[0]-20:xs[1]+20;RM.walkOff=true;rmState("walk");
 }else if(r<.78){ rmSay(rmPick(rmTalk().hi),1800);rmFx("hop",650);RM.next=t+2500;
 }else if(r<.86){ RM.asking=true;rmSay("Поиграй со мной! 🧶",6000,true);RM.next=t+6500;
 }else if(r<.94&&onCard){ rmState("hide");RM.hidden=true;RM.next=t+6000+Math.random()*4000;
  setTimeout(function(){if(RM.hidden){RM.hidden=false;rmState("sit");rmFx("hop",650)}},RM.next-t);
 }else{RM.next=t+2500+Math.random()*2500}
}
function rmHearts(n){for(var i=0;i<n;i++){var h=document.createElement("i");h.className="rh";h.textContent="♥";h.style.left=(14+Math.random()*30)+"px";h.style.animationDelay=(Math.random()*.3)+"s";RM.el.appendChild(h);(function(h){setTimeout(function(){h.remove()},1500)})(h)}}
function rmQuiet(action){ // засчитать игру/поглаживание без лишних всплывашек
 if(Date.now()-RM.lastPet<20000)return;RM.lastPet=Date.now();
 call("/v2/pair/pet",{action:action}).then(function(x){if(x&&x.pet){S.pet=x.pet;if(x.streak)S.streak=x.streak;render()}}).catch(function(){});
}
function rmTap(){
 haptic("medium");
 if(RM.hidden){RM.hidden=false;rmState("sit");rmFx("hop",650);rmSay("Нашли! 🙈",1800);rmHearts(3);return}
 if(RM.asking){RM.asking=false;rmFx("play",1500);rmSay("Ура! Играем! 🧶",1800);rmHearts(6);rmQuiet("play");return}
 if(RM.st==="sit"||RM.st==="walk"){rmState("sit");rmFx("hop",650);rmSay(rmPick(["Мурр 🤍","Ещё! ✨","Люблю вас 💞","Хи-хи 😊"]),1500);rmHearts(4);rmQuiet("pet")}
}
// при смене вкладки — запрыгивает сбоку
function rmEnter(){
 if(!RM.on)return;RM.jump=null;RM.hidden=false;
 var fromLeft=Math.random()<.5;RM.x=fromLeft?-RM_W:window.innerWidth+RM_W;RM.y=180;RM.f=fromLeft?1:-1;
 setTimeout(function(){var plats=rmPlatforms().filter(function(q){return q.el}),q=plats.length?plats[Math.floor(Math.random()*Math.min(3,plats.length))]:rmPlatforms()[0];
  var x1=Math.max(q.x1+RM_W/2,Math.min(q.x2-RM_W/2,fromLeft?q.x1+70:q.x2-70));
  RM.jump={p:q,t0:performance.now(),dur:700,x0:RM.x,y0:RM.y,x1:x1,h:90};RM.pl=null;rmState("air")},420);
}
// внешний вид — питомец пары; прячем, пока нет питомца или открыто окно
function roamRender(){
 if(!RM.el)return;var p=S&&S.pet,show=!!p&&!REDUCED;
 RM.on=show;RM.el.classList.toggle("on",show);if(!show)return;
 var mood=RM.el.classList.contains("dizzy")?"sad":moodOf(p),key=p.kind+"|"+mood+"|"+(p.wear||"")+"|"+p.stage;
 if(key!==RM.key){RM.key=key;RM.el.querySelector(".pv").innerHTML=petSvg(p.kind,mood,p)}
}
function initRoam(){
 if(RM.el)return;
 RM.el=node('<div class="roam" id="roam"><div class="rb"><span class="stars">✦ ✧ ✦</span><div class="pv"></div></div><span class="say"></span></div>');
 document.body.appendChild(RM.el);
 RM.el.querySelector(".rb").addEventListener("click",rmTap);
 RM.el.querySelector(".say").addEventListener("click",function(){if(RM.asking)rmTap()});
 Array.prototype.forEach.call(document.querySelectorAll(".nav button"),function(b){b.addEventListener("click",function(){setTimeout(rmEnter,60)})});
 RM.y=-80;RM.x=window.innerWidth*.7;rmState("fall");
 RM.raf=requestAnimationFrame(rmStep);
}
