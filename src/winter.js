// ===================== Зимний режим =====================
// prefs().winter: "on" | "auto" (с 1 декабря по конец февраля) | "off"; prefs().snow: "light" | "storm" | "none"
function winterOn(){
 var p=prefs();if(p.winter==="on")return true;if(p.winter==="off")return false;
 var m=new Date().getMonth();return m===11||m===0||m===1;
}
var WIN={raf:0,flakes:[],cv:null,ctx:null,w:0,h:0,dpr:1,on:false,n:0,last:0};
function winterLights(){
 var e=$("wLights");if(!e||e.firstChild)return;
 var cols=["#FF6B7A","#FFD36E","#7FD1A8","#8FB5DE","#C9A6F0"],n=14,h='<svg viewBox="0 0 400 34" preserveAspectRatio="none"><path d="M0 4';
 for(var i=0;i<n;i++){var x0=i*400/n,x1=(i+1)*400/n;h+=' Q'+((x0+x1)/2)+' 22 '+x1+' 4'}
 h+='" stroke="#5B4B55" stroke-opacity=".55" stroke-width="1.4" fill="none"/>';
 for(var j=0;j<n;j++){var cx=(j+.5)*400/n,c=cols[j%cols.length];
  h+='<g class="bulb"><rect x="'+(cx-2)+'" y="11" width="4" height="4" rx="1" fill="#6B5A63"/><ellipse cx="'+cx+'" cy="20" rx="4.2" ry="6" fill="'+c+'"/><ellipse cx="'+cx+'" cy="20" rx="9" ry="10" fill="'+c+'" opacity=".22"/></g>'}
 e.innerHTML=h+'</svg>';
}
function winterResize(){
 var c=WIN.cv;if(!c)return;WIN.dpr=Math.min(2,window.devicePixelRatio||1);WIN.w=innerWidth;WIN.h=innerHeight;
 c.width=WIN.w*WIN.dpr;c.height=WIN.h*WIN.dpr;c.style.width=WIN.w+"px";c.style.height=WIN.h+"px";WIN.ctx.setTransform(WIN.dpr,0,0,WIN.dpr,0,0);
}
function flake(top){return{x:Math.random()*WIN.w,y:top?-10-Math.random()*WIN.h*.2:Math.random()*WIN.h,r:.8+Math.random()*2.6,s:.3+Math.random()*.9,dx:Math.random()*Math.PI*2,a:.55+Math.random()*.4}}
function winterTick(t){
 WIN.raf=0;if(!WIN.on||document.hidden)return;
 var dt=Math.min(3,WIN.last?(t-WIN.last)/16.7:1);WIN.last=t;
 var g=WIN.ctx,F=WIN.flakes;g.clearRect(0,0,WIN.w,WIN.h);g.fillStyle="#fff";g.shadowColor="rgba(96,128,176,.55)";g.shadowBlur=3;
 for(var i=0;i<F.length;i++){var f=F[i];
  f.y+=f.s*(1+f.r*.35)*dt;f.dx+=.012*dt;f.x+=Math.sin(f.dx)*.35*dt;
  if(f.y>WIN.h+6){F[i]=flake(true);continue}
  if(f.x<-6)f.x=WIN.w+5;else if(f.x>WIN.w+6)f.x=-5;
  g.globalAlpha=f.a;g.beginPath();g.arc(f.x,f.y,f.r,0,6.283);g.fill();
 }
 g.globalAlpha=1;WIN.raf=requestAnimationFrame(winterTick);
}
function winterSnow(n){
 if(!WIN.cv){WIN.cv=$("snow");if(!WIN.cv)return;WIN.ctx=WIN.cv.getContext("2d");winterResize();addEventListener("resize",winterResize);
  document.addEventListener("visibilitychange",function(){if(!document.hidden&&WIN.on&&!WIN.raf){WIN.last=0;WIN.raf=requestAnimationFrame(winterTick)}})}
 var calm=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;if(calm)n=Math.min(n,18);
 WIN.on=n>0;WIN.flakes=[];for(var i=0;i<n;i++)WIN.flakes.push(flake(false));
 if(!WIN.on){WIN.ctx&&WIN.ctx.clearRect(0,0,WIN.w,WIN.h);if(WIN.raf)cancelAnimationFrame(WIN.raf);WIN.raf=0;return}
 if(!WIN.raf){WIN.last=0;WIN.raf=requestAnimationFrame(winterTick)}
}
function applyWinter(){
 var on=winterOn(),p=prefs(),h=document.documentElement,was=h.getAttribute("data-winter")==="on";
 h.setAttribute("data-winter",on?"on":"off");
 if(on)winterLights();
 var n=on?(p.snow==="storm"?140:p.snow==="none"?0:55):0;
 if(on!==was||WIN.n!==n){WIN.n=n;winterSnow(n)}
 if(on!==was)["petPic","petSvg"].forEach(function(id){var e=$(id);if(e)e.removeAttribute("data-k")});
 if(on!==was&&typeof render==="function"&&typeof S!=="undefined"&&S)try{render()}catch(e){}
}
// настройки в «Оформлении»
function winterSettings(B){
 var p=prefs(),b=box(B,'<div class="lab">❄️ Зимний режим</div>'+
  '<div class="wprev"><b>⛄</b><span>Снегопад, гирлянда, сугробы и тёплая шапка с шарфом у питомца</span></div>'+
  '<div class="opt"><div class="lab">Режим</div><div class="seg" id="wMode"></div></div>'+
  '<div class="opt"><div class="lab">Снег</div><div class="seg" id="wSnow"></div></div>');
 var seg=function(id,key,opts){var e=$(id);opts.forEach(function(o){var x=node('<button type="button" class="'+(prefs()[key]===o[0]?"on":"")+'">'+o[1]+'</button>');
  x.onclick=function(){setPref(key,o[0]);haptic();Array.prototype.forEach.call(e.children,function(y){y.classList.toggle("on",y===x)})};e.appendChild(x)})};
 seg("wMode","winter",[["on","Вкл"],["auto","С 1 декабря"],["off","Выкл"]]);
 seg("wSnow","snow",[["light","Лёгкий"],["storm","Метель"],["none","Без снега"]]);
}
(function(){
 var _al=applyLook;applyLook=function(){_al();applyWinter()};
 applyWinter();
})();
