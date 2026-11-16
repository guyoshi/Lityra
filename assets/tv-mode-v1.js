// Modo TV do Lityra: só ativa dentro do app Android TV (user agent "LityraTV").
// Navegação por controle remoto (setas + OK), foco visível, teclas de mídia e Voltar.
(function(){
  if(!/LityraTV/.test(navigator.userAgent)) return;
  var root=document.documentElement;
  root.classList.add("tv");

  var st=document.createElement("style");
  st.textContent=
    "html.tv{font-size:112%}"+
    "html.tv *:focus{outline:4px solid #c9892b!important;outline-offset:3px!important;border-radius:6px}"+
    "html.tv *{-webkit-tap-highlight-color:transparent}"+
    "html.tv ::-webkit-scrollbar{display:none}";
  document.head.appendChild(st);

  var NATIVE=/^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/;
  function mark(el){
    if(el.nodeType!==1) return;
    var all=[el].concat([].slice.call(el.querySelectorAll("*")));
    for(var i=0;i<all.length;i++){
      var n=all[i];
      if(n.hasAttribute("tabindex")||NATIVE.test(n.tagName)||n.tagName==="SCRIPT"||n.tagName==="STYLE") continue;
      if(n.hasAttribute("onclick")||n.getAttribute("role")==="button"||n.hasAttribute("data-book")||n.hasAttribute("data-chapter")){
        n.setAttribute("tabindex","0"); continue;
      }
      if(/^(DIV|LI|SPAN|IMG|SVG|ARTICLE|FIGURE)$/i.test(n.tagName)&&n.children.length<8&&getComputedStyle(n).cursor==="pointer"){
        n.setAttribute("tabindex","0");
      }
    }
  }
  var t=null,pend=[];
  new MutationObserver(function(ms){
    ms.forEach(function(m){[].forEach.call(m.addedNodes,function(n){pend.push(n)})});
    if(t) return;
    t=setTimeout(function(){t=null;var p=pend;pend=[];p.forEach(mark)},300);
  }).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener("DOMContentLoaded",function(){mark(document.body)});
  if(document.body) mark(document.body);

  // OK no controle = clique em elementos que não são nativamente clicáveis por teclado
  document.addEventListener("keydown",function(e){
    if(e.key==="Enter"&&e.target&&!NATIVE.test(e.target.tagName)&&e.target!==document.body){
      e.preventDefault(); e.target.click();
    }
  },true);

  function visible(el){return el&&el.offsetParent!==null}
  // Botão Voltar do controle: fecha o painel aberto ou volta uma tela do app.
  window.lityraTvBack=function(){
    var sels=['[aria-label="Fechar"]','[aria-label="Voltar"]'];
    for(var i=0;i<sels.length;i++){
      var list=document.querySelectorAll(sels[i]);
      for(var j=list.length-1;j>=0;j--){ if(visible(list[j])){list[j].click();return true} }
    }
    return false;
  };

  // Teclas de mídia do controle (códigos Android KeyEvent)
  window.lityraTvMedia=function(code){
    var a=document.querySelector("audio");
    if(!a) return;
    if(code===85) { a.paused?a.play():a.pause(); }
    else if(code===126) a.play();
    else if(code===127) a.pause();
    else if(code===90||code===87) a.currentTime=Math.min((a.duration||1e9),a.currentTime+30);
    else if(code===89||code===88) a.currentTime=Math.max(0,a.currentTime-15);
  };
})();
