// ---------- шахматы: правила (один и тот же код на сервере и в мини-аппе) ----------
// доска — строка из 64 клеток, индекс 0 = a8, 63 = h1; заглавные — белые, строчные — чёрные, "." — пусто
var CH_START="rnbqkbnrpppppppp................................PPPPPPPPRNBQKBNR";
var CH_KN=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],CH_KG=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]],CH_RK=[[-1,0],[1,0],[0,-1],[0,1]],CH_BS=[[-1,-1],[-1,1],[1,-1],[1,1]];
function chNew(){return {b:CH_START,t:"w",c:"KQkq",ep:-1,last:null,n:0}}
function chColor(p){return p==="."?null:(p===p.toUpperCase()?"w":"b")}
function chAt(b,r,f){return r<0||r>7||f<0||f>7?null:b[r*8+f]}
function chKing(b,c){return b.indexOf(c==="w"?"K":"k")}
// бьётся ли клетка sq фигурами цвета by
function chAttacked(b,sq,by){
 var r=sq>>3,f=sq&7,w=by==="w",i,j,k,p;
 var P=function(x){return w?x.toUpperCase():x};
 var pr=w?r+1:r-1;
 if(chAt(b,pr,f-1)===P("p")||chAt(b,pr,f+1)===P("p"))return true;
 for(i=0;i<8;i++){
  if(chAt(b,r+CH_KN[i][0],f+CH_KN[i][1])===P("n"))return true;
  if(chAt(b,r+CH_KG[i][0],f+CH_KG[i][1])===P("k"))return true;
 }
 var rays=[[CH_RK,P("r")],[CH_BS,P("b")]];
 for(var x=0;x<2;x++){var dirs=rays[x][0],slider=rays[x][1],queen=P("q");
  for(j=0;j<4;j++)for(k=1;k<8;k++){p=chAt(b,r+dirs[j][0]*k,f+dirs[j][1]*k);if(p===null)break;if(p!=="."){if(p===slider||p===queen)return true;break}}
 }
 return false;
}
// все ходы без учёта шаха своему королю
function chPseudo(g){
 var b=g.b,c=g.t,out=[],op=c==="w"?"b":"w";
 for(var s=0;s<64;s++){
  var p=b[s];if(chColor(p)!==c)continue;
  var r=s>>3,f=s&7,t=p.toLowerCase(),i,k,q;
  if(t==="p"){
   var d=c==="w"?-1:1,start=c==="w"?6:1,r1=r+d;
   if(chAt(b,r1,f)==="."){out.push({f:s,t:r1*8+f,fl:""});if(r===start&&chAt(b,r+2*d,f)===".")out.push({f:s,t:(r+2*d)*8+f,fl:"2"})}
   for(q=-1;q<=1;q+=2){var x=chAt(b,r1,f+q);if(x===null)continue;var to=r1*8+f+q;if(x!=="."&&chColor(x)===op)out.push({f:s,t:to,fl:""});else if(x==="."&&to===g.ep)out.push({f:s,t:to,fl:"ep"})}
  }else if(t==="n"||t==="k"){
   var L=t==="n"?CH_KN:CH_KG;
   for(i=0;i<8;i++){var y=chAt(b,r+L[i][0],f+L[i][1]);if(y!==null&&chColor(y)!==c)out.push({f:s,t:(r+L[i][0])*8+f+L[i][1],fl:""})}
   if(t==="k"){
    var home=c==="w"?60:4,KS=c==="w"?"K":"k",QS=c==="w"?"Q":"q",R=c==="w"?"R":"r";
    if(s===home&&!chAttacked(b,s,op)){
     if(g.c.indexOf(KS)>=0&&b[s+1]==="."&&b[s+2]==="."&&b[s+3]===R&&!chAttacked(b,s+1,op)&&!chAttacked(b,s+2,op))out.push({f:s,t:s+2,fl:"OO"});
     if(g.c.indexOf(QS)>=0&&b[s-1]==="."&&b[s-2]==="."&&b[s-3]==="."&&b[s-4]===R&&!chAttacked(b,s-1,op)&&!chAttacked(b,s-2,op))out.push({f:s,t:s-2,fl:"OOO"});
    }
   }
  }else{
   var dirs=t==="r"?CH_RK:t==="b"?CH_BS:CH_RK.concat(CH_BS);
   for(i=0;i<dirs.length;i++)for(k=1;k<8;k++){var z=chAt(b,r+dirs[i][0]*k,f+dirs[i][1]*k);if(z===null||chColor(z)===c)break;out.push({f:s,t:(r+dirs[i][0]*k)*8+f+dirs[i][1]*k,fl:""});if(z!==".")break}
  }
 }
 return out;
}
// позиция после хода (promo: q, r, b или n)
function chApply(g,m,promo){
 var b=g.b.split(""),p=b[m.f],c=g.t,t=p.toLowerCase(),r2=m.t>>3;
 b[m.t]=p;b[m.f]=".";
 if(m.fl==="ep")b[m.t+(c==="w"?8:-8)]=".";
 if(m.fl==="OO"){b[m.f+1]=b[m.f+3];b[m.f+3]="."}
 if(m.fl==="OOO"){b[m.f-1]=b[m.f-4];b[m.f-4]="."}
 if(t==="p"&&(r2===0||r2===7)){var pr="qrbn".indexOf(promo)>=0&&promo?promo:"q";b[m.t]=c==="w"?pr.toUpperCase():pr}
 var cs=g.c;
 if(t==="k")cs=cs.replace(c==="w"?/[KQ]/g:/[kq]/g,"");
 [[63,"K"],[56,"Q"],[7,"k"],[0,"q"]].forEach(function(x){if(m.f===x[0]||m.t===x[0])cs=cs.replace(x[1],"")});
 return {b:b.join(""),t:c==="w"?"b":"w",c:cs,ep:m.fl==="2"?(m.f+m.t)/2:-1,last:{f:m.f,t:m.t},n:(g.n||0)+1};
}
function chLegal(g){
 var c=g.t,op=c==="w"?"b":"w";
 return chPseudo(g).filter(function(m){var n=chApply(g,m,"q");return !chAttacked(n.b,chKing(n.b,c),op)});
}
// шах / мат / пат для стороны, которой сейчас ходить
function chStatus(g){
 var op=g.t==="w"?"b":"w",chk=chAttacked(g.b,chKing(g.b,g.t),op),any=chLegal(g).length>0;
 return {check:chk,st:any?"play":(chk?"mate":"stalemate")};
}
