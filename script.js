(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const canvas = document.getElementById("lightning-canvas");
  const flash = document.getElementById("flash");
  const ctx = canvas.getContext("2d", { alpha: true });

  let W, H, DPR;

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }
  resize();
  addEventListener("resize", resize);

  const rand = (a,b)=>a+Math.random()*(b-a);

  function makeBolt(){
    const startX = rand(0.15*W,0.85*W);
    let x=startX, y=-20;
    const pts=[{x,y}];
    const segs = rand(14,22);
    const step=(H+60)/segs;

    for(let i=0;i<segs;i++){
      y+=step;
      x+=rand(-26,26);
      pts.push({x,y});
      if(Math.random()<0.22){
        pts.push({x:x+rand(-90,90),y:y+rand(-30,30)});
        pts.push({x,y});
      }
    }
    return {pts,life:1,decay:rand(.05,.09)};
  }

  const bolts=[];
  let next=performance.now()+rand(600,1200);

  function draw(b){
    ctx.save();
    ctx.shadowColor="rgba(255,220,120,.95)";
    ctx.shadowBlur=16;
    ctx.strokeStyle="rgba(255,230,140,.9)";
    ctx.lineWidth=2;
    ctx.beginPath();
    let first=true;
    b.pts.forEach(p=>{
      if(first){ctx.moveTo(p.x,p.y);first=false;}
      else ctx.lineTo(p.x,p.y);
    });
    ctx.stroke();
    ctx.restore();
  }

  function tick(t){
    ctx.fillStyle="rgba(0,0,0,0.14)";
    ctx.fillRect(0,0,W,H);

    if(t>next){
      bolts.push(makeBolt());
      if(Math.random()<0.4) bolts.push(makeBolt());
      flash.style.opacity=.3;
      setTimeout(()=>flash.style.opacity=0,90);
      next=t+rand(700,1500);
    }

    for(let i=bolts.length-1;i>=0;i--){
      draw(bolts[i]);
      bolts[i].life-=bolts[i].decay;
      if(bolts[i].life<=0) bolts.splice(i,1);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
