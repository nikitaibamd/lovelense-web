// ---------- небо партнёра: какое у него сейчас время суток ----------
function tzHour(tz){try{var h=0,m=0;new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",hourCycle:"h23",timeZone:tz}).formatToParts(new Date()).forEach(function(x){if(x.type==="hour")h=Number(x.value);if(x.type==="minute")m=Number(x.value)});return h+m/60}catch(e){return null}}
function tzOffsetH(tz){var a=tzHour(tz),n=new Date();if(a==null)return 0;var d=Math.round((a-(n.getHours()+n.getMinutes()/60))*2)/2;if(d>12)d-=24;if(d<-12)d+=24;return d}
var SKY_PH={night:["#1F2147","#3B3A6B"],dawn:["#F7B7A3","#FBE3C8"],day:["#8FCBF0","#DDF0FB"],dusk:["#6E5A9E","#F2A08C"]};
function skySvg(h){
 var ph=h<5||h>=22?"night":h<8?"dawn":h<18?"day":"dusk",g=SKY_PH[ph],W=340,H=118;
 var o='<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="skg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+g[0]+'"/><stop offset="1" stop-color="'+g[1]+'"/></linearGradient><radialGradient id="sunG"><stop offset="0" stop-color="#FFF6C9"/><stop offset=".55" stop-color="#FFD66B" stop-opacity=".8"/><stop offset="1" stop-color="#FFD66B" stop-opacity="0"/></radialGradient></defs><rect width="'+W+'" height="'+H+'" fill="url(#skg)"/>';
 if(ph==="night"||ph==="dusk")for(var i=0;i<26;i++)o+='<circle class="tw" cx="'+(i*137%W)+'" cy="'+(i*53%64+6)+'" r="'+(i%3?1:1.7)+'" fill="#fff" style="animation-delay:'+(i%7*.37).toFixed(2)+'s"/>';
 var arc=function(t){return {x:20+t*(W-40),y:92-Math.sin(t*Math.PI)*74}};
 if(h>=6&&h<20){var su=arc((h-6)/14);o+='<g class="sun"><circle cx="'+su.x.toFixed(1)+'" cy="'+su.y.toFixed(1)+'" r="28" fill="url(#sunG)"/><circle cx="'+su.x.toFixed(1)+'" cy="'+su.y.toFixed(1)+'" r="11" fill="#FFE07A"/></g>'}
 else{var mn=arc(((h<6?h+24:h)-20)/10);o+='<circle cx="'+mn.x.toFixed(1)+'" cy="'+mn.y.toFixed(1)+'" r="11" fill="#FFF4D6"/><circle cx="'+(mn.x+5).toFixed(1)+'" cy="'+(mn.y-4).toFixed(1)+'" r="10" fill="'+g[0]+'"/>'}
 if(ph==="day"||ph==="dawn")o+='<g class="cl" fill="#fff" opacity=".9"><ellipse cx="0" cy="30" rx="26" ry="9"/><ellipse cx="14" cy="24" rx="15" ry="10"/></g><g class="cl" fill="#fff" opacity=".75" style="animation-delay:-21s;animation-duration:55s"><ellipse cx="0" cy="54" rx="22" ry="7"/><ellipse cx="11" cy="49" rx="12" ry="8"/></g>';
 var dk=ph==="night",lit=dk||ph==="dusk";
 o+='<path d="M0 '+(H-16)+' Q70 '+(H-36)+' 150 '+(H-18)+' T340 '+(H-22)+' V'+H+' H0 Z" fill="'+(dk?"#2A2A52":ph==="dusk"?"#7A5C86":"#BFE0B0")+'"/>';
 o+='<g transform="translate(250 '+(H-46)+')"><path d="M0 14 L14 2 L28 14 V30 H0 Z" fill="'+(dk?"#3F3C6B":"#FFF6F2")+'"/><path d="M-3 15 L14 0 L31 15" stroke="'+(dk?"#5A5690":"#E9A7AE")+'" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="10" y="17" width="8" height="8" rx="1.5" fill="'+(lit?"#FFD66B":"#CFE6F6")+'"/>'+(lit?'<circle cx="14" cy="21" r="10" fill="#FFD66B" opacity=".18"/>':"")+'</g></svg>';
 return {ph:ph,svg:o};
}
function sky(){
 var c=$("skyCard"),tz=S&&S.partner&&S.partner_active!==false&&S.partner_tz,h=tz?tzHour(tz):null;
 var pe=$("tPaE");if(pe)pe.textContent=h==null?"":(h<5||h>=22?"🌙":h<8?"🌅":h<18?"☀️":"🌇");
 if(!c)return;
 if(h==null){c.style.display="none";return}
 c.style.display="";
 var r=skySvg(h),key=r.ph+"|"+Math.round(h*4);
 if(c.getAttribute("data-k")!==key){c.setAttribute("data-k",key);$("skyArt").innerHTML=r.svg}
 var off=tzOffsetH(tz);
 $("skyT").textContent=name(S.partner)+" · "+clock(tz)+(off===0?"":" · "+(off>0?"+":"−")+String(Math.abs(off)).replace(".",",")+" ч");
 $("skyS").textContent={night:"ночь, наверное, спит 😴",dawn:"утро только началось ☀️",day:"день в разгаре",dusk:"вечер — время написать ♡"}[r.ph];
}

// ---------- обратный отсчёт до встречи ----------
var meetPrev={};
function meetCard(){
 var c=$("meetCard");if(!c)return;
 if(!S||!S.partner){c.style.display="none";return}
 c.style.display="";
 var md=S.meta&&S.meta.meet_date,t=md?parse(md):null,now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
 if(!t||t<today){
  if(c.getAttribute("data-m")!=="none"){c.setAttribute("data-m","none");c.className="card meet";c.innerHTML='<span class="plane">✈️</span><div class="ml">Когда следующая встреча?</div><div class="hint" style="margin-top:4px">Назначьте дату — здесь появится обратный отсчёт</div>'}
  return;
 }
 if(+t===+today){
  if(c.getAttribute("data-m")!=="today"){c.setAttribute("data-m","today");c.className="card meet today";c.innerHTML='<div class="ml">Сегодня встреча! 🎉</div><div class="hint" style="margin-top:4px">Наконец-то вместе ♡ Нажми — будет салют</div>';var k="ll_fw_"+md;if(ls(k)!=="1"){ls(k,"1");setTimeout(fireworks,600)}}
  return;
 }
 if(c.getAttribute("data-m")!=="count"){c.setAttribute("data-m","count");c.className="card meet";c.innerHTML='<span class="plane">✈️</span><div class="ml">До встречи</div><div class="fls"><div class="fu"><b id="mfD"></b><small id="mlD"></small></div><div class="fu"><b id="mfH"></b><small id="mlH"></small></div><div class="fu"><b id="mfM"></b><small id="mlM"></small></div></div>';meetPrev={}}
 var ms=t-now,d=Math.floor(ms/864e5),hh=Math.floor(ms%864e5/36e5),mm=Math.floor(ms%36e5/6e4);
 [["D",d,plural(d,"день","дня","дней")],["H",hh,plural(hh,"час","часа","часов")],["M",mm,plural(mm,"минута","минуты","минут")]].forEach(function(u){
  var el=$("mf"+u[0]),v=String(u[1]);
  if(meetPrev[u[0]]!==v){el.textContent=v;if(meetPrev[u[0]]!=null){el.classList.remove("flip");void el.offsetWidth;el.classList.add("flip")}meetPrev[u[0]]=v}
  $("ml"+u[0]).textContent=u[2];
 });
}
function fireworks(){
 var w=document.createElement("div");w.className="fw";document.body.appendChild(w);
 var cols=["#F06E8C","#FFD66B","#8FD3F0","#B9A6EA","#7CCF8A","#FFFFFF"];
 for(var b=0;b<6;b++)(function(b){setTimeout(function(){
  var x=10+Math.random()*80,y=12+Math.random()*40;haptic(b%2?"light":"medium");
  for(var i=0;i<22;i++){var p=document.createElement("i"),a=i/22*Math.PI*2,r=60+Math.random()*60;p.style.left=x+"%";p.style.top=y+"%";p.style.background=cols[(b+i)%cols.length];p.style.setProperty("--dx",(Math.cos(a)*r).toFixed(1)+"px");p.style.setProperty("--dy",(Math.sin(a)*r).toFixed(1)+"px");w.appendChild(p)}
 },b*380)})(b);
 setTimeout(function(){w.remove()},4300);
}

// ---------- вы рядом: салют из сердечек раз в день ----------
function together(){
 var me=pos.me||S.my_loc,pl=S.partner_loc;
 if(!me||!pl||S.partner_active===false||Date.now()-pl.t>2*36e5||km(me,pl)>=0.3)return;
 $("dist").textContent="рядом 💞";
 var k="ll_tog_"+iso(new Date());
 if(ls(k)!=="1"){ls(k,"1");burst("💞");setTimeout(function(){burst("💗")},700);toast("Вы рядом 💞");haptic("heavy")}
}

// ---------- касание: держите сердце вместе ----------
var tch={on:false,iv:null,both:false,beat:null};
function initTouch(){
 var b=$("hBtn");if(!b)return;
 var down=function(e){
  e.preventDefault();
  if(!S||!S.partner){toast("Сначала добавьте партнёра");return}
  if(tch.on)return;
  tch.on=true;b.classList.add("hold");haptic("medium");
  try{TG&&TG.disableVerticalSwipes&&TG.disableVerticalSwipes()}catch(x){}
  touchHint();sendTouch(true);tch.iv=setInterval(function(){sendTouch(false)},650);
 };
 var up=function(){
  if(!tch.on)return;
  tch.on=false;clearInterval(tch.iv);setBoth(false);b.classList.remove("hold");
  try{TG&&TG.enableVerticalSwipes&&TG.enableVerticalSwipes()}catch(x){}
  call("/v2/pair/touch",{down:false}).catch(function(){});touchHint();
 };
 b.addEventListener("pointerdown",down);
 ["pointerup","pointercancel","pointerleave"].forEach(function(n){b.addEventListener(n,up)});
 b.addEventListener("contextmenu",function(e){e.preventDefault()});
}
function sendTouch(start){call("/v2/pair/touch",{down:true,start:start}).then(function(x){if(tch.on)setBoth(!!x.together)}).catch(function(){})}
function ringOnce(){var b=$("hBtn");if(!b)return;var r=document.createElement("i");r.className="ring";b.appendChild(r);setTimeout(function(){r.remove()},1150)}
function setBoth(v){
 if(v===tch.both)return;
 tch.both=v;$("hBtn").classList.toggle("both",v);clearInterval(tch.beat);
 if(v){
  try{TG&&TG.HapticFeedback&&TG.HapticFeedback.notificationOccurred("success")}catch(x){}
  toast("Вы касаетесь сердца вместе 💞");
  var beat=function(){haptic("heavy");setTimeout(function(){haptic("light")},170);ringOnce()};
  beat();tch.beat=setInterval(beat,1000);
 }
 touchHint();
}
function touchHint(){
 var t=$("tHint"),b=$("hBtn");if(!t||!b)return;
 var pa=S&&S.partner,calling=!!(pa&&!tch.on&&S.partner_touch&&S.server_time&&S.server_time-S.partner_touch<2500);
 b.classList.toggle("calling",calling);
 if(!pa){t.textContent="";t.className="thint"}
 else if(tch.both){t.textContent="Вы вместе держите сердце 💞";t.className="thint hot"}
 else if(tch.on){t.textContent="Ждём, когда "+name(pa)+" зажмёт сердце… 💓";t.className="thint hot"}
 else if(calling){t.textContent=name(pa)+" держит сердце — зажми тоже 💓";t.className="thint hot";haptic("light")}
 else{t.textContent="Зажми сердце — "+name(pa)+" почувствует 💓";t.className="thint"}
}
