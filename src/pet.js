// ---------- питомцы: милые SVG-зверьки ----------
var PET_LOOK={
 cat:{c:"#FFF8F4",s:"#EBCFC8",in:"#F6B3BF"},
 dog:{c:"#FBEBDA",s:"#E5C8A8",in:"#C99772"},
 rabbit:{c:"#FFFFFF",s:"#E9DDE2",in:"#F6B3BF"},
 fox:{c:"#F5A86F",s:"#DE8B50",in:"#FFF4EA"},
 bear:{c:"#D9B08F",s:"#C29271",in:"#F3DCC8"},
 panda:{c:"#FFFFFF",s:"#E4E0E2",in:"#3E3639"}
};
var PET_NAMES={cat:"Котик",dog:"Щенок",rabbit:"Зайка",fox:"Лисёнок",bear:"Мишка",panda:"Панда"};
function moodOf(p){
 if(night())return "sleep";
 if(p.mood==="hungry")return "hungry";
 if(p.mood==="lonely")return "sad";
 if(p.mood==="joy"||p.mood==="fed"||p.mood==="love")return "happy";
 return "idle";
}
function petSvg(kind,mood){
 var L=PET_LOOK[kind]||PET_LOOK.cat,ink="#4A3B42";
 var ln=function(w){return 'stroke="'+ink+'" stroke-width="'+(w||3.2)+'" stroke-linecap="round" stroke-linejoin="round" fill="none"'};
 var o=function(fill){return 'fill="'+fill+'" stroke="'+L.s+'" stroke-width="3"'};
 var back="",front="",tail="",ears="",face="";
 // хвост
 if(kind==="cat")tail='<path d="M140 168 C178 170 182 128 160 118" stroke="'+L.s+'" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M140 168 C178 170 182 128 160 118" stroke="'+L.c+'" stroke-width="9" fill="none" stroke-linecap="round"/>';
 if(kind==="fox")tail='<g transform="rotate(-28 152 160)"><ellipse cx="160" cy="160" rx="32" ry="17" '+o(L.c)+'/><ellipse cx="184" cy="160" rx="11" ry="10" fill="#FFF4EA"/></g>';
 if(kind==="dog")tail='<path d="M142 160 q22 -6 20 -26" stroke="'+L.s+'" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M142 160 q22 -6 20 -26" stroke="'+L.c+'" stroke-width="5" fill="none" stroke-linecap="round"/>';
 if(kind==="rabbit"||kind==="bear"||kind==="panda")tail='<circle cx="146" cy="170" r="11" '+o(kind==="panda"?"#FFFFFF":L.c)+'/>';
 // уши за головой
 if(kind==="cat")ears='<path d="M50 74 L56 24 L92 52 Z" '+o(L.c)+'/><path d="M59 62 L61 38 L80 52 Z" fill="'+L.in+'"/><path d="M150 74 L144 24 L108 52 Z" '+o(L.c)+'/><path d="M141 62 L139 38 L120 52 Z" fill="'+L.in+'"/>';
 if(kind==="fox")ears='<path d="M46 76 L52 14 L94 50 Z" '+o(L.c)+'/><path d="M56 62 L58 32 L80 50 Z" fill="#FFF4EA"/><path d="M154 76 L148 14 L106 50 Z" '+o(L.c)+'/><path d="M144 62 L142 32 L120 50 Z" fill="#FFF4EA"/>';
 if(kind==="rabbit")ears='<g transform="rotate(-12 76 40)"><ellipse cx="76" cy="34" rx="15" ry="40" '+o(L.c)+'/><ellipse cx="76" cy="38" rx="7" ry="28" fill="'+L.in+'"/></g><g transform="rotate(12 124 40)"><ellipse cx="124" cy="34" rx="15" ry="40" '+o(L.c)+'/><ellipse cx="124" cy="38" rx="7" ry="28" fill="'+L.in+'"/></g>';
 if(kind==="bear")ears='<circle cx="56" cy="56" r="18" '+o(L.c)+'/><circle cx="56" cy="56" r="9" fill="'+L.in+'"/><circle cx="144" cy="56" r="18" '+o(L.c)+'/><circle cx="144" cy="56" r="9" fill="'+L.in+'"/>';
 if(kind==="panda")ears='<circle cx="56" cy="56" r="18" fill="'+L.in+'"/><circle cx="144" cy="56" r="18" fill="'+L.in+'"/>';
 // тело и лапки
 var body='<ellipse cx="100" cy="160" rx="48" ry="34" '+o(L.c)+'/>';
 if(kind==="fox")body+='<ellipse cx="100" cy="166" rx="26" ry="22" fill="#FFF4EA"/>';
 if(kind==="panda")body+='<ellipse cx="62" cy="160" rx="13" ry="20" fill="'+L.in+'" transform="rotate(18 62 160)"/><ellipse cx="138" cy="160" rx="13" ry="20" fill="'+L.in+'" transform="rotate(-18 138 160)"/>';
 var pawc=kind==="panda"?L.in:L.c;
 body+='<ellipse cx="80" cy="190" rx="14" ry="9" '+(kind==="panda"?'fill="'+pawc+'"':o(pawc))+'/><ellipse cx="120" cy="190" rx="14" ry="9" '+(kind==="panda"?'fill="'+pawc+'"':o(pawc))+'/>';
 // голова
 var head='<ellipse cx="100" cy="100" rx="62" ry="55" '+o(L.c)+'/>';
 if(kind==="fox")head+='<path d="M48 108 Q100 72 152 108 Q140 150 100 152 Q60 150 48 108 Z" fill="#FFF4EA"/>';
 if(kind==="bear")head+='<ellipse cx="100" cy="117" rx="24" ry="17" fill="'+L.in+'"/>';
 if(kind==="dog")head+='<ellipse cx="125" cy="93" rx="17" ry="15" fill="'+L.in+'" opacity=".45"/>';
 if(kind==="panda")head+='<ellipse cx="77" cy="101" rx="15" ry="19" fill="'+L.in+'" transform="rotate(28 77 101)"/><ellipse cx="123" cy="101" rx="15" ry="19" fill="'+L.in+'" transform="rotate(-28 123 101)"/>';
 // глаза
 var eyeC=kind==="panda"?"#FFFFFF":ink;
 var eye=function(x){return '<ellipse cx="'+x+'" cy="101" rx="6.5" ry="8" fill="'+eyeC+'"/><circle cx="'+(x+2.4)+'" cy="97.5" r="2.4" fill="'+(kind==="panda"?ink:"#fff")+'"/>'};
 var lnE=kind==="panda"?'stroke="#fff" stroke-width="3.2" stroke-linecap="round" fill="none"':ln();
 if(mood==="sleep")face+='<path d="M69 103 Q77 109 85 103" '+lnE+'/><path d="M115 103 Q123 109 131 103" '+lnE+'/>';
 else if(mood==="happy")face+='<path d="M69 105 Q77 94 85 105" '+lnE+'/><path d="M115 105 Q123 94 131 105" '+lnE+'/>';
 else face+='<g class="eyes">'+eye(77)+eye(123)+'</g>';
 // щёчки
 face+='<ellipse cx="62" cy="119" rx="11" ry="6.5" fill="#F7A3B1" opacity=".55"/><ellipse cx="138" cy="119" rx="11" ry="6.5" fill="#F7A3B1" opacity=".55"/>';
 // носик и ротик
 var nose=(kind==="cat"||kind==="rabbit")?"#F29AAA":ink;
 face+='<ellipse cx="100" cy="112" rx="4.5" ry="3.2" fill="'+nose+'"/>';
 if(mood==="happy")face+='<path d="M91 118 Q100 132 109 118 Z" fill="#E98494" stroke="'+ink+'" stroke-width="2.6" stroke-linejoin="round"/>';
 else if(mood==="sad")face+='<path d="M93 123 Q100 117 107 123" '+ln(2.6)+'/><path d="M131 112 q5 8 0 12 q-5 -4 0 -12 Z" fill="#9ED3F0"/>';
 else if(mood==="hungry")face+='<path d="M91 117 Q95.5 122 100 117 Q104.5 122 109 117" '+ln(2.6)+'/><path d="M103 121 q2 7 0 9" stroke="#9ED3F0" stroke-width="3" stroke-linecap="round" fill="none"/>';
 else face+='<path d="M91 117 Q95.5 122 100 117 Q104.5 122 109 117" '+ln(2.6)+'/>';
 if(kind==="cat")face+='<path d="M58 112 L38 108 M58 119 L39 122 M142 112 L162 108 M142 119 L161 122" stroke="'+L.s+'" stroke-width="2.4" stroke-linecap="round"/>';
 // висячие уши щенка — поверх головы
 if(kind==="dog")front='<ellipse cx="46" cy="96" rx="16" ry="32" fill="'+L.in+'" transform="rotate(18 46 96)"/><ellipse cx="154" cy="96" rx="16" ry="32" fill="'+L.in+'" transform="rotate(-18 154 96)"/>';
 var z=mood==="sleep"?'<g class="zz"><text x="150" y="44" font-size="20" font-weight="700" fill="#A99BD6">z</text><text x="166" y="28" font-size="14" font-weight="700" fill="#A99BD6">z</text></g>':"";
 return '<svg class="pet-svg mood-'+mood+'" viewBox="0 -16 200 226" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="200" rx="58" ry="7" fill="rgba(74,59,66,.12)"/><g class="bob">'+tail+body+ears+head+face+front+'</g>'+z+'</svg>';
}

// ---------- комнаты питомца ----------
var ROOMS=[
 ["pink","Розовая спальня","radial-gradient(circle at 12px 12px,rgba(255,255,255,.75) 2.5px,transparent 3px) 0 0/30px 30px,linear-gradient(180deg,#F8D7D9 0%,#F8D7D9 66%,#EBC4B9 66%,#E2B4A7 100%)",
  '<rect x="48" y="34" width="92" height="96" rx="14" fill="#CFE6F6" stroke="#fff" stroke-width="7"/><path d="M94 34 V130 M48 82 H140" stroke="#fff" stroke-width="5"/><path d="M290 70 c-14 -18 -38 0 0 26 c38 -26 14 -44 0 -26 Z" fill="#F2A7B3"/><ellipse cx="200" cy="272" rx="150" ry="20" fill="#F5D1D6"/>'],
 ["night","Ночная спальня","linear-gradient(180deg,#4A4166 0%,#7A6990 68%,#B99AAE 68%,#CDAEBE 100%)",
  '<circle cx="320" cy="62" r="24" fill="#FFF3CF"/><circle cx="332" cy="54" r="22" fill="#5A4E77"/><circle cx="70" cy="40" r="2.5" fill="#fff"/><circle cx="130" cy="74" r="2" fill="#fff"/><circle cx="210" cy="36" r="2.5" fill="#fff"/><circle cx="260" cy="96" r="1.8" fill="#fff"/><circle cx="40" cy="110" r="1.8" fill="#fff"/><ellipse cx="200" cy="272" rx="150" ry="18" fill="#A98A9F"/>'],
 ["garden","Сад","linear-gradient(180deg,#FFE9E6 0%,#FFF6F2 58%,#C3E2B4 58%,#A8D395 100%)",
  '<circle cx="330" cy="54" r="26" fill="#FFE1A8"/><g fill="#F6A9B6"><circle cx="40" cy="214" r="8"/><circle cx="52" cy="206" r="8"/><circle cx="52" cy="222" r="8"/><circle cx="64" cy="214" r="8"/></g><circle cx="52" cy="214" r="5" fill="#FFE08A"/><g fill="#CDB8F0"><circle cx="340" cy="232" r="7"/><circle cx="350" cy="224" r="7"/><circle cx="350" cy="240" r="7"/><circle cx="360" cy="232" r="7"/></g><circle cx="350" cy="232" r="4.5" fill="#FFE08A"/><path d="M90 40 q20 -12 40 0 q14 -12 30 2 q-36 10 -70 -2 Z" fill="#fff" opacity=".9"/>'],
 ["clouds","Облака","linear-gradient(180deg,#CFE4F7 0%,#EAF2FB 55%,#FDE8E4 100%)",
  '<g fill="#fff"><ellipse cx="80" cy="60" rx="46" ry="18"/><ellipse cx="108" cy="48" rx="28" ry="20"/><ellipse cx="300" cy="90" rx="52" ry="18"/><ellipse cx="326" cy="76" rx="30" ry="20"/><ellipse cx="60" cy="282" rx="110" ry="40"/><ellipse cx="220" cy="292" rx="140" ry="40"/><ellipse cx="380" cy="282" rx="90" ry="40"/></g>'],
 ["beach","Пляж","linear-gradient(180deg,#BFE6F5 0%,#E7F6FC 44%,#93D2E6 44%,#7FC5DC 60%,#F4E2C6 60%,#EBD1AD 100%)",
  '<circle cx="320" cy="50" r="24" fill="#FFE1A8"/><path d="M0 182 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" stroke="#fff" stroke-width="4" fill="none" opacity=".8"/><circle cx="60" cy="250" r="5" fill="#F6B3BF"/><path d="M330 258 l8 -14 l8 14 Z" fill="#F7C99A"/>']
];
function roomOf(){var k=prefs().room;for(var i=0;i<ROOMS.length;i++)if(ROOMS[i][0]===k)return ROOMS[i];return ROOMS[0]}
function roomBg(r){return r[2]}
function roomDecor(r){return r[3]?'<svg class="decor" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">'+r[3]+'</svg>':""}
