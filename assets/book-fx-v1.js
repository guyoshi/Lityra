/* Efeitos exclusivos por livro: partículas + transição "máscara que se abre".
   Independente do app: só escuta os eventos beta:book-open / beta:chapter-open e a visibilidade da biblioteca. */
(()=>{
  "use strict";
  const FX = {
    "viajantes-dimensionais-2": {
      id: "contracanto",
      colors: [[190,130,255],[255,214,140],[150,200,255],[255,150,110]],
    },
  };
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  let canvas, ctx, raf = 0, parts = [], active = null, lastT = 0, w = 0, h = 0, dpr = 1;
  let mask;

  function ensureMask(){
    if(mask) return mask;
    mask = document.createElement("div");
    mask.className = "bookfx-mask"; mask.setAttribute("aria-hidden","true");
    mask.innerHTML = '<i class="l"></i><i class="r"></i><b></b>';
    document.body.appendChild(mask);
    return mask;
  }
  function wipe(){
    if(reduce) return;
    const m = ensureMask();
    m.classList.remove("run"); void m.offsetWidth; m.classList.add("run");
    clearTimeout(wipe.t); wipe.t = setTimeout(()=>m.classList.remove("run"), 1250);
  }

  function ensureCanvas(){
    if(canvas) return;
    canvas = document.createElement("canvas");
    canvas.id = "bookFxCanvas"; canvas.setAttribute("aria-hidden","true");
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    addEventListener("resize", resize);
  }
  function resize(){
    if(!canvas) return;
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = w*dpr; canvas.height = h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const reader = !document.getElementById("view-reader")?.hidden;
    const target = Math.round(Math.min(46, Math.max(16, w/28)) * (reader ? .55 : 1));
    while(parts.length < target) parts.push(spawn(true));
    parts.length = target;
  }
  function spawn(anywhere){
    const pal = FX[active]?.colors || FX["viajantes-dimensionais-2"].colors;
    const c = pal[Math.floor(Math.random()*pal.length)];
    return {
      x: Math.random()*w, y: anywhere ? Math.random()*h : h + 10,
      r: .6 + Math.random()*2.0, vy: 8 + Math.random()*22, sway: 6 + Math.random()*18,
      ph: Math.random()*6.28, sp: .4 + Math.random()*1.1, tw: Math.random()*6.28, c,
    };
  }
  function frame(t){
    raf = requestAnimationFrame(frame);
    if(document.hidden) { lastT = t; return; }
    const dt = Math.min(.05, (t - lastT)/1000 || .016); lastT = t;
    ctx.clearRect(0,0,w,h);
    ctx.globalCompositeOperation = "lighter";
    for(let i=0;i<parts.length;i++){
      const p = parts[i];
      p.y -= p.vy*dt; p.ph += p.sp*dt; p.tw += dt*2.2;
      const x = p.x + Math.sin(p.ph)*p.sway;
      if(p.y < -12){ parts[i] = spawn(false); continue; }
      const edge = Math.min(1, p.y/(h*.25), (h-p.y)/(h*.12) + .2);
      const a = Math.max(0, (.28 + .22*Math.sin(p.tw)) * edge);
      const g = ctx.createRadialGradient(x,p.y,0,x,p.y,p.r*4);
      g.addColorStop(0, `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${a})`);
      g.addColorStop(1, `rgba(${p.c[0]},${p.c[1]},${p.c[2]},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,p.y,p.r*4,0,6.283); ctx.fill();
    }
  }

  function activate(bookId){
    const fx = FX[bookId];
    if(!fx){ deactivate(); return; }
    if(active === bookId) return;
    active = bookId;
    root.dataset.bookFx = fx.id;
    if(reduce) return;
    ensureCanvas(); parts = []; resize();
    if(!raf){ lastT = performance.now(); raf = requestAnimationFrame(frame); }
  }
  function deactivate(){
    if(!active) return;
    active = null; delete root.dataset.bookFx;
    if(raf){ cancelAnimationFrame(raf); raf = 0; }
    parts = []; if(ctx) ctx.clearRect(0,0,w,h);
  }

  document.addEventListener("beta:book-open", e=>{
    const id = e.detail?.book?.id;
    if(FX[id]){ const was = active === id; activate(id); if(!was) wipe(); } else deactivate();
  });
  document.addEventListener("beta:chapter-open", e=>{
    const id = e.detail?.book?.id;
    if(FX[id]){ activate(id); wipe(); } else deactivate();
  });
  // voltou à biblioteca → desliga
  const lib = document.getElementById("view-library");
  if(lib) new MutationObserver(()=>{ if(!lib.hidden) deactivate(); }).observe(lib,{attributes:true,attributeFilter:["hidden"]});
  // ao alternar livro↔leitura, reajusta densidade de partículas
  ["view-book","view-reader"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) new MutationObserver(()=>{ if(active) resize(); }).observe(el,{attributes:true,attributeFilter:["hidden"]});
  });
})();
