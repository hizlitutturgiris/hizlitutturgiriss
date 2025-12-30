(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const canvas = document.getElementById("lightning-canvas");
  const flash = document.getElementById("flash");
  const ctx = canvas.getContext("2d", { alpha: true });

  let W,H,DPR;

  function resize(){
    DPR = Math.min(devicePixelRatio||1,2);
    W = innerWidth;
    H = innerHeight;
    canvas.width=W*DPR;
    canvas.height=H*DPR;
    canvas.style.width=W+"px";
    canvas.style.height=H+"px";
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  resize();
  addEventListener("resize",resize);

  const rand=(a,b)=>a+Math.random()*(b-a);

  function bolt(){
    ctx.clearRect(0,0,W,H);
    ctx.shadowColor="rgba(255,220,120,.9)";
    ctx.shadowBlur=18;
    ctx.strokeStyle="rgba(255,230,140,.9)";
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(rand(0,W),0);
    ctx.lineTo(rand(0,W),H);
    ctx.stroke();
    flash.style.opacity=.3;
    setTimeout(()=>flash.style.opacity=0,90);
  }

  setInterval(bolt,700);
})();
