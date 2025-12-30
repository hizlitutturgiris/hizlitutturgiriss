(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const canvas = document.getElementById("lightning-canvas");
  const flash = document.getElementById("flash");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let W,H,DPR;

  function resize(){
    DPR = Math.min(devicePixelRatio,2);
    W = innerWidth;
    H = innerHeight;
    canvas.width = W*DPR;
    canvas.height = H*DPR;
    canvas.style.width = W+"px";
    canvas.style.height = H+"px";
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  addEventListener("resize",resize);
  resize();

  function bolt(){
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle="rgba(255,220,120,.8)";
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(Math.random()*W,0);
    ctx.lineTo(Math.random()*W,H);
    ctx.stroke();
    flash.style.opacity=.3;
    setTimeout(()=>flash.style.opacity=0,80);
  }

  setInterval(bolt,1800);
})();
