(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const canvas = document.getElementById("lightning-canvas");
  const flash = document.getElementById("flash");
  const ctx = canvas.getContext("2d");

  function resize(){
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  resize();
  addEventListener("resize", resize);

  function bolt(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle="rgba(255,220,120,.9)";
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(Math.random()*canvas.width,0);
    ctx.lineTo(Math.random()*canvas.width,canvas.height);
    ctx.stroke();

    flash.style.opacity=.35;
    setTimeout(()=>flash.style.opacity=0,100);
  }

  setInterval(bolt,700);
})();
