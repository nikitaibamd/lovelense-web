// ===================== визуальные эффекты (fx) =====================
var fx={counted:false,distCounted:false,walkT:null,routeT:{},roundDay:""};
var REDUCED=false;try{REDUCED=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}

// ---------- 1. живой фон: искорки и палитра по времени суток ----------
function dayPhase(h){return h>=6&&h<11?"morn":h>=11&&h<18?"day":h>=18&&h<22?"eve":"night"}
function fxAura(){
 var h=new Date().getHours();document.documentElement.setAttribute("data-dph",dayPhase(h));
 var a=$("aura");if(!a||a.getAttribute("data-s"))return;a.setAttribute("data-s","1");
 for(var i=0;i<9;i++){var s=document.createElement("i");s.style.left=(5+i*11+Math.random()*6)+"%";s.style.animationDelay=(-Math.random()*16).toFixed(1)+"s";s.style.animationDuration=(13+Math.random()*8).toFixed(1)+"s";a.appendChild(s)}
}

// ---------- 9. ночная тема: вечером или как в системе ----------
function isNightNow(p){
 if(p.night==="time"){var h=new Date().getHours();return h>=21||h<7}
 if(p.night==="system"){try{return matchMedia("(prefers-color-scheme: dark)").matches||(TG&&TG.colorScheme==="dark")}catch(e){return false}}
 return false;
}
function nightBg(p){
 var b=BGS[p.bg];if(!b||b.dark||!isNightNow(p))return null;
 var n=BGS["night-rose"]||BGS["black"];if(!n)return null;
 var o={};for(var k in n)o[k]=n[k];o.__night=true;return o;
}

// ---------- 2. нить между вами ----------
function fxThread(){
 var t=$("thread"),cp=t&&t.parentNode,me=$("avMe"),pa=$("avPa");if(!t||!me||!pa)return;
 if(!S||!S.partner){t.innerHTML="";return}
 var c=cp.getBoundingClientRect(),a=me.getBoundingClientRect(),b=pa.getBoundingClientRect();
 if(!c.width)return;
 var ax=a.right-c.left-18,ay=a.top-c.top+22,bx=b.left-c.left+18,by=b.top-c.top+22,cx=(ax+bx)/2,cy=Math.min(ay,by)-62;
 var d="M"+ax.toFixed(1)+" "+ay.toFixed(1)+" Q"+cx.toFixed(1)+" "+cy.toFixed(1)+" "+bx.toFixed(1)+" "+by.toFixed(1);
 var on=online();
 if(t.getAttribute("data-d")!==d){
  t.setAttribute("data-d",d);
  var dot=function(dur,begin,rev){return '<circle r="'+(rev?2.6:3.4)+'"><animateMotion dur="'+dur+'s" begin="'+begin+'s" repeatCount="indefinite" path="'+d+'"'+(rev?' keyPoints="1;0" keyTimes="0;1" calcMode="linear"':'')+'/></circle>'};
  t.innerHTML='<defs><linearGradient id="thrG" x1="0" x2="1"><stop offset="0" stop-color="#F7A08E"/><stop offset=".5" stop-color="#F06E8C"/><stop offset="1" stop-color="#A595D8"/></linearGradient></defs><path class="tg" d="'+d+'"/><path class="tl" d="'+d+'"/>'+(REDUCED?"":dot(2.4,0)+dot(2.4,-1.2)+dot(3.1,-0.6,true));
 }
 t.classList.toggle("off",!on);
 pa.parentNode.classList.toggle("live",on);
}

// ---------- 4. оживающие цифры и искры на круглых датах ----------
function countUp(el,to,fmt,ms){
 if(REDUCED||!el){if(el)el.innerHTML=fmt(to);return}
 var t0=performance.now();
 (function f(t){var k=Math.min(1,(t-t0)/(ms||1100)),e=1-Math.pow(1-k,3);el.innerHTML=fmt(Math.round(to*e));if(k<1)requestAnimationFrame(f)})(t0);
}
function sparkle(card,n){
 for(var i=0;i<(n||10);i++)(function(i){setTimeout(function(){
  var s=document.createElement("i");s.className="spk";s.textContent=i%3?"✨":"⭐";
  s.style.left=(15+Math.random()*70)+"%";s.style.top=(20+Math.random()*50)+"%";
  s.style.setProperty("--dx",((Math.random()-.5)*120).toFixed(0)+"px");s.style.setProperty("--dy",(-30-Math.random()*60).toFixed(0)+"px");
  card.appendChild(s);setTimeout(function(){s.remove()},1700);
 },i*120)})(i);
}
function fxNumbers(){
 var dn=$("daysN"),m=dn&&dn.textContent.match(/^(\d+)/);
 if(m){
  var n=Number(m[1]);
  if(!fx.counted){fx.counted=true;countUp(dn,n,function(v){return v+' <small>'+plural(v,"день","дня","дней")+'</small>'})}
  var round=n>0&&(n%100===0||n%365===0||n===30||n===50),dc=$("daysCard"),k=iso(new Date());
  dc.classList.toggle("round",round);
  if(round&&fx.roundDay!==k){fx.roundDay=k;setTimeout(function(){sparkle(dc,14)},1200)}
 }
 var td=$("tDist");if(td)td.style.display=$("dist").textContent.trim()==="—"?"none":"";
 var de=$("dist"),dm=de&&de.textContent.match(/^([\d\s ]+)\s*(км|м)$/);
 if(dm&&!fx.distCounted){fx.distCounted=true;var v=Number(dm[1].replace(/\D/g,"")),u=dm[2];countUp(de,v,function(x){return x.toLocaleString("ru-RU")+" "+u},1300)}
}

// ---------- 5–6. появление лесенкой и переходы между вкладками ----------
var TABS=["home","map","music","prof"],curTab="home";
function stagger(view){
 if(REDUCED||!view)return;
 var items=[];Array.prototype.forEach.call(view.children,function(c){if(c.classList.contains("tiles"))Array.prototype.forEach.call(c.children,function(x){items.push(x)});else if(!c.classList.contains("top"))items.push(c)});
 view.classList.remove("stg");void view.offsetWidth;
 items.forEach(function(c,i){c.style.animationDelay=(i*55)+"ms"});
 view.classList.add("stg");
 setTimeout(function(){view.classList.remove("stg");items.forEach(function(c){c.style.animationDelay=""})},items.length*55+700);
}
function fxTabs(){
 Array.prototype.forEach.call(document.querySelectorAll(".nav button"),function(b){
  b.addEventListener("click",function(){
   var t=b.getAttribute("data-tab"),v=$("v-"+t);if(!v||t===curTab)return;
   var dir=TABS.indexOf(t)>TABS.indexOf(curTab)?1:-1;curTab=t;
   v.style.setProperty("--vx",(dir*28)+"px");v.classList.remove("slide");void v.offsetWidth;v.classList.add("slide");
   stagger(v);
   if(t==="home")setTimeout(fxThread,50);
  });
 });
}

// ---------- 8. маршрут на карте: дуга, самолётик и расстояние ----------
function arcPts(a,b,n){
 var out=[],dx=b.lng-a.lng,dy=b.lat-a.lat,cx=(a.lng+b.lng)/2-dy*.22,cy=(a.lat+b.lat)/2+dx*.22;
 for(var i=0;i<=n;i++){var t=i/n,u=1-t;out.push([u*u*a.lat+2*u*t*cy+t*t*b.lat,u*u*a.lng+2*u*t*cx+t*t*b.lng])}
 return out;
}
function fxRoute(g,p,sat,key){
 clearInterval(fx.routeT[key]);
 var d=km(p.a,p.b),pts=d<0.3?[[p.a.lat,p.a.lng],[p.b.lat,p.b.lng]]:arcPts(p.a,p.b,90);
 if(sat)L.polyline(pts,{color:"#F3B6C0",weight:8,opacity:.4,lineCap:"round",interactive:false}).addTo(g);
 L.polyline(pts,{color:sat?"#fff":"#D89494",weight:3,lineCap:"round",interactive:false,className:"route"}).addTo(g);
 var mid=pts[Math.floor(pts.length/2)];
 L.marker(mid,{icon:L.divIcon({html:'<span class="kmpill">💞 '+(d<0.3?"рядом":fmtKm(d))+'</span>',className:"",iconSize:[0,0]}),interactive:false,zIndexOffset:300}).addTo(g);
 if(d<0.3||REDUCED||pts.length<3)return;
 var pl=L.marker(pts[0],{icon:L.divIcon({html:'<div class="plane">✈️</div>',className:"",iconSize:[24,24],iconAnchor:[12,12]}),interactive:false,zIndexOffset:400}).addTo(g);
 var i=0;
 fx.routeT[key]=setInterval(function(){
  i=(i+1)%pts.length;var q=pts[i],nx=pts[Math.min(i+1,pts.length-1)];
  pl.setLatLng(q);
  var el=pl.getElement&&pl.getElement();if(el){var ang=Math.atan2(-(nx[0]-q[0]),nx[1]-q[1])*180/Math.PI+45;var pe=el.querySelector(".plane");if(pe)pe.style.transform="rotate("+ang.toFixed(0)+"deg)"}
 },80);
}

// ---------- 10. питомец гуляет по главному экрану ----------
function fxWalker(){
 var st=$("stroll"),w=$("walker");if(!st||!w)return;
 var p=S&&S.pet;st.classList.toggle("on",!!p);if(!p)return;
 var mood=moodOf(p),key=p.kind+"|"+mood+"|"+(p.wear||"")+"|"+p.stage;
 if(w.getAttribute("data-k")!==key){w.setAttribute("data-k",key);w.querySelector(".wk").innerHTML=petSvg(p.kind,mood,p)}
 if(!fx.walkT&&!REDUCED)walkStep();
}
function walkStep(){
 var st=$("stroll"),w=$("walker");if(!st||!w)return;
 var p=S&&S.pet,sleep=!p||moodOf(p)==="sleep"||!st.offsetWidth;
 var next=4000+Math.random()*5000;
 if(!sleep){
  var max=Math.max(0,st.offsetWidth-w.offsetWidth),cur=Number(w.getAttribute("data-x")||max/2),to=Math.round(Math.random()*max),dist=Math.abs(to-cur);
  if(dist>30){
   var dur=dist/45;w.querySelector(".wk").style.setProperty("--f",to<cur?-1:1);
   w.classList.add("walk");w.style.transition="transform "+dur.toFixed(2)+"s linear";w.style.transform="translateX("+to+"px)";w.setAttribute("data-x",to);
   setTimeout(function(){w.classList.remove("walk")},dur*1000);next+=dur*1000;
  }
 }
 fx.walkT=setTimeout(function(){fx.walkT=null;walkStep()},next);
}
function walkerTap(){
 var w=$("walker"),p=S&&S.pet;if(!w||!p)return;
 w.classList.remove("hop");void w.offsetWidth;w.classList.add("hop");
 var say=w.querySelector(".say");say.textContent=["Мурр 🤍","Ещё! ✨","Люблю вас 💞","Хи-хи 😊"][Math.floor(Math.random()*4)];say.classList.add("on");setTimeout(function(){say.classList.remove("on")},1400);
 var st=$("stroll");for(var i=0;i<4;i++){var h=node('<span class="fh">♥</span>');h.style.left=(Number(w.getAttribute("data-x")||0)+30+Math.random()*30)+"px";h.style.animationDelay=(Math.random()*.3)+"s";st.appendChild(h);(function(h){setTimeout(function(){h.remove()},1900)})(h)}
 petAct("pet");
}

// ---------- запуск и хуки ----------
function fxRender(){
 document.documentElement.classList.remove("ll-load");
 fxAura();fxThread();fxNumbers();fxWalker();
}
function fxInit(){
 fxAura();fxTabs();
 var w=$("walker");if(w)w.addEventListener("click",walkerTap);
 window.addEventListener("resize",function(){var t=$("thread");if(t)t.removeAttribute("data-d");fxThread()});
 setInterval(function(){fxAura();applyLook()},5*60000);
 try{matchMedia("(prefers-color-scheme: dark)").addEventListener("change",applyLook)}catch(e){}
 stagger($("v-home"));
}
document.documentElement.classList.add("ll-load");
