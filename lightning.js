(() => {
  const canvas = document.getElementById("fxCanvas");
  const ctx = canvas.getContext("2d");

  let w = 0, h = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  function resize() {
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  // "Rain" streaks (very subtle)
  const drops = [];
  const DROP_COUNT = 140;
  for (let i = 0; i < DROP_COUNT; i++) {
    drops.push({
      x: Math.random() * w,
      y: Math.random() * h,
      len: 10 + Math.random() * 18,
      spd: 6 + Math.random() * 10,
      a: 0.06 + Math.random() * 0.08
    });
  }

  // Lightning bolts
  let flash = 0;
  let boltTimer = 0;

  function rand(min, max){ return min + Math.random() * (max - min); }

  function drawBolt() {
    const startX = rand(w * 0.15, w * 0.85);
    const startY = -20;
    const endY = rand(h * 0.25, h * 0.9);

    let x = startX;
    let y = startY;

    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,210,58,0.9)";
    ctx.shadowColor = "rgba(70,255,154,0.55)";
    ctx.shadowBlur = 18;

    ctx.beginPath();
    ctx.moveTo(x, y);

    const segments = 22 + Math.floor(Math.random() * 18);
    for (let i = 0; i < segments; i++) {
      const stepY = (endY - startY) / segments;
      y += stepY;
      x += rand(-18, 18);
      ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Secondary faint branch
    if (Math.random() < 0.55) {
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "rgba(70,255,154,0.55)";
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      let bx = startX, by = startY;
      const bSeg = 12 + Math.floor(Math.random() * 10);
      for (let i = 0; i < bSeg; i++) {
        by += (endY * 0.7 - startY) / bSeg;
        bx += rand(-26, 26);
        ctx.lineTo(bx, by);
      }
      ctx.stroke();
    }

    ctx.restore();

    flash = 0.22 + Math.random() * 0.28; // screen flash amount
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);

    // Subtle vignette / glow
    ctx.save();
    ctx.globalAlpha = 0.06;
    const grd = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)*0.7);
    grd.addColorStop(0, "rgba(70,255,154,0.12)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,w,h);
    ctx.restore();

    // Rain
    ctx.save();
    ctx.lineWidth = 1;
    for (const d of drops) {
      ctx.strokeStyle = `rgba(233,255,243,${d.a})`;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 4, d.y + d.len);
      ctx.stroke();

      d.y += d.spd;
      d.x -= 1.2;

      if (d.y > h + 30) {
        d.y = -30;
        d.x = Math.random() * w;
      }
      if (d.x < -50) d.x = w + 50;
    }
    ctx.restore();

    // Lightning timing
    boltTimer -= 1;
    if (boltTimer <= 0) {
      if (Math.random() < 0.20) { // chance each cycle
        drawBolt();
      }
      boltTimer = 28 + Math.floor(Math.random() * 55);
    }

    // Screen flash
    if (flash > 0) {
      ctx.save();
      ctx.globalAlpha = flash;
      ctx.fillStyle = "rgba(255,210,58,1)";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
      flash *= 0.72; // decay
      if (flash < 0.01) flash = 0;
    }

    requestAnimationFrame(tick);
  }

  tick();
})();
