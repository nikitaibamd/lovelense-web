// ===================== iPhone-приложение из App Store =====================
// В приложении: покупки через Apple вместо звёзд Telegram, приглашение партнёра кодом,
// музыка — только в Telegram (Apple не разрешает проигрывать звук из YouTube/SoundCloud в обход их плееров).
var IS_APP=!!(window.LL_IOS&&window.llBuy);
var IAP_TIPS=[["app.lovelense.tip.1","☕"],["app.lovelense.tip.2","🍰"],["app.lovelense.tip.5","🌷"],["app.lovelense.tip.10","💝"]];
function iapPrice(id){var p=window.LL_IAP||{};return p[id]||""}
ERR.bad_invite="Код не подошёл — проверь его или попроси новый";
ERR.self="Это твой собственный код 🙂";
if(IS_APP){
 document.documentElement.classList.add("ll-app");
 (function(){var st=document.createElement("style");st.textContent="html.ll-app #vMini{display:none!important}";document.head.appendChild(st)})();
 // --- музыка → Telegram ---
 HUBS.media.tabs=HUBS.media.tabs.map(function(t){return t[0]==="music"?["tgmusic","🎧","Музыка"]:t});
 var _hubSub=hubSub;
 hubSub=function(sub){
  if(sub==="music")sub="tgmusic";
  if(sub!=="tgmusic")return _hubSub(sub);
  var B=$("shB");if(typeof togStop==="function")togStop();musicHome();movieDestroy();
  HUB.sub=sub;Array.prototype.forEach.call($("hubNav").children,function(b){b.classList.toggle("on",b.getAttribute("data-s")===sub)});
  cur={k:"h_tgm",live:null};
  B.innerHTML='<div class="card box mvempty"><div class="gbig">🎧</div><b>Музыка вместе — в Telegram</b><div class="hint">Слушать треки синхронно можно в Telegram-версии LoveLense. В приложении из App Store эта функция недоступна по правилам Apple.</div><button class="btn" id="tgmGo" type="button">Открыть LoveLense в Telegram</button></div>';
  $("tgmGo").onclick=function(){haptic();call("/v2/invite").then(function(x){var m=String(x.link||"").match(/t\.me\/([A-Za-z0-9_]+)/);openLink(m?"https://t.me/"+m[1]:"https://t.me/lovelense")}).catch(function(){openLink("https://t.me/lovelense")})};
 };
 $("hubMedia").onclick=function(){haptic();hubOpen("media","movie")};
 var hms=$("hubMediaSub");if(hms)hms.textContent="Кино · Общая комната";

 // --- наряды питомца за покупки Apple ---
 buySkin=function(it){
  if(!window.llBuy){toast("Покупки недоступны");return}
  haptic();toast("Открываю оплату…");
  window.llBuy("app.lovelense.skin."+it.id,function(ok,err){
   if(ok){haptic("heavy");toast("Обновка для питомца! 🎁");poll(function(){fillPet();render()});return}
   if(err==="cancel")return;
   toast(err==="pending"?"Покупка ждёт подтверждения":err==="unavailable"?"Покупка сейчас недоступна":"Оплата прошла, но наряд не открылся — откроется сам, как только появится связь");
  });
 };
 var _fillW=fillWardrobe;
 fillWardrobe=function(){
  _fillW();var w=$("pW"),p=S&&S.pet;if(!w||!p||!p.shop)return;
  Array.prototype.slice.call(w.children,1).forEach(function(b,i){var it=p.shop[i];if(it&&!it.owned&&!it.lvl){var s=b.querySelector("small");if(s)s.textContent=iapPrice("app.lovelense.skin."+it.id)||"Купить"}});
 };

 // --- «О приложении»: «спасибо» через Apple, восстановление покупок ---
 var _about=SHEETS.about.r;
 SHEETS.about.r=function(B){
  _about(B);
  var don=$("donA");if(don){var box1=don.closest(".card");
   box1.querySelector(".hint").textContent="LoveLense бесплатный. Если он делает вас ближе — можно сказать спасибо разработчику ♡";
   don.innerHTML="";var any=false;
   IAP_TIPS.forEach(function(t){var pr=iapPrice(t[0]);if(!pr)return;any=true;
    var b=node('<button type="button" class="chip" style="width:auto;height:auto;padding:9px 14px;font-size:14px">'+t[1]+" "+esc(pr)+'</button>');
    b.onclick=function(){haptic();window.llBuy(t[0],function(ok,err){if(ok){haptic("heavy");toast("Спасибо за поддержку! 💖")}else if(err!=="cancel")toast("Не получилось оплатить")})};don.appendChild(b)});
   if(!any)don.innerHTML='<div class="hint">Загружаю цены…</div>';
   var rs=node('<button class="btn sec" type="button" style="margin-top:10px">Восстановить покупки</button>');
   rs.onclick=function(){haptic();toast("Проверяю покупки…");window.llRestore&&window.llRestore()};box1.appendChild(rs);
  }
  // блок «привязать iPhone кодом» внутри самого приложения не нужен
  var dw=$("devW");if(dw){var c=dw.closest(".card");if(c)c.style.display="none"}
  // после удаления данных — выходим из приложения на экран входа
  var del=$("abDel");if(del){var old=del.onclick;del.onclick=function(){confirmAsk("Удалить аккаунт и все ваши данные из LoveLense? Это нельзя отменить.",function(){del.disabled=true;
   call("/v2/me/delete",{confirm:true}).then(function(){haptic("heavy");toast("Аккаунт удалён");setTimeout(function(){try{window.webkit.messageHandlers.ll.postMessage({t:"logout"})}catch(e){location.reload()}},900)}).catch(function(){del.disabled=false;toast("Не получилось удалить, попробуйте ещё раз")})})};
   del.textContent="Удалить аккаунт"}
 };
 window.__llIapReady=function(){if(cur&&cur.k==="about")try{renderSheetAgain()}catch(e){}if($("pW"))try{fillWardrobe()}catch(e){}};
 window.__llRestored=function(){toast("Покупки восстановлены ✨");poll(function(){fillPet();render()})};

 // --- партнёр: приглашение кодом прямо в приложении ---
 var _rp=renderPartner;
 renderPartner=function(B){
  _rp(B);if(!S||S.partner)return;
  var b=node('<div class="card box"><div class="lab">Пригласи партнёра кодом</div><div class="hint" style="margin-top:0">Партнёр скачивает LoveLense, входит и вводит твой код — и вы сразу пара</div><div class="code" id="invCode">…</div><button class="btn" id="invShare" type="button">Отправить код</button>'+
   '<div class="lab" style="margin-top:14px">Есть код от партнёра?</div><input class="in" id="invIn" placeholder="Код приглашения" autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"><button class="btn sec" id="invGo" type="button">Стать парой</button></div>');
  B.insertBefore(b,B.firstChild);
  var link="";
  call("/v2/invite").then(function(x){var e=$("invCode");if(e)e.textContent=x.code||"—";link=x.link||""}).catch(function(){var e=$("invCode");if(e)e.textContent="—"});
  $("invShare").onclick=function(){var c=($("invCode")||{}).textContent;if(!c||c.length<4)return;haptic();
   var t="Давай будем вместе в LoveLense ♡\nМой код приглашения: "+c+"\nСкачай LoveLense в App Store, войди и введи код."+(link?"\nИли открой в Telegram: "+link:"");
   if(window.llShare)window.llShare(t);else{try{navigator.clipboard.writeText(t);toast("Скопировано")}catch(e){}}};
  $("invGo").onclick=function(){var v=$("invIn").value.trim();if(!v)return;haptic();var bt=this;bt.disabled=true;
   call("/v2/invite/accept",{code:v}).then(function(x){haptic("heavy");toast("Готово, вы теперь пара ♡");poll(function(){if(cur&&cur.k==="partner")renderPartner($("shB"));render()})}).catch(function(e){bt.disabled=false;toast(ERR[e.message]||"Не получилось")})};
 };
}
