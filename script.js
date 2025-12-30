(() => {
  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Reduced motion? then stop
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reduceMotion) return;

  const canvas = document.getElementById("lightning-canvas");
  const flash = document.getElementById("flash");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });

  let W = 0, H = 0, DPR = 1;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.floor(window.innerWidth);
    H = Math.floor(window.innerHeight);
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  // Lightning bolt generator (long, jagged)
  function makeBolt() {
    const startX = W * (0.2 + Math.random() * 0.6);
    const startY = -20;

    const segments = 16 + Math.floor(Math.random() * 10);
    const stepY = (H + 80) / segments;

    let x = startX;
    let y = startY;

    const points = [{ x, y }];

    for (let i = 0; i < segments; i++) {
      y += stepY * (0.8 + Math.random() * 0.5);
      // Jagged movement
      const sway = 22 + Math.random() * 38; // sideways
      x += (Math.random() - 0.5) * sway;

      // Keep within canvas bounds
      x = Math.max(20, Math.min(W - 20, x));
      points.push({ x, y });

      // Occasionally add branch
      if (Math.random() < 0.22 && i > 3 && i < segments - 3) {
        const bx = x + (Math.random() < 0.5 ? -1 : 1) * (30 + Math.random() * 60);
        const by = y + (10 + Math.random() * 40);
        points.push({ x: bx, y: by, branch: true });
      }
    }

    return {
      points,
      life: 1.0,
      decay: 0.06 + Math.random() * 0.05,
      thick: 1.6 + Math.random() * 1.2,
      glow: 18 + Math.random() * 18,
      flashPower: 0.20 + Math.random() * 0.22
    };
  }

  const bolts = [];
  let nextStrikeAt = performance.now() + 700 + Math.random() * 1600;

  function doFlash(power) {
    if (!flash) return;
    flash.style.opacity = String(power);
    // quick fade
    setTimeout(() => {
      flash.style.opacity = "0";
    }, 60 + Math.random() * 80);
  }

  function drawBolt(b) {
    const alpha = Math.max(0, b.life);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    // glow
    ctx.shadowColor = `rgba(255, 212, 0, ${0.85 * alpha})`;
    ctx.shadowBlur = b.glow;

    // core line
    ctx.strokeStyle = `rgba(255, 232, 120, ${0.9 * alpha})`;
    ctx.lineWidth = b.thick;

    ctx.beginPath();
    let moved = false;

    for (let i = 0; i < b.points.length; i++) {
      const p = b.points[i];
      if (!moved) {
        ctx.moveTo(p.x, p.y);
        moved = true;
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }
    ctx.stroke();

    // brighter inner core
    ctx.shadowBlur = b.glow * 0.55;
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.55 * alpha})`;
    ctx.lineWidth = Math.max(0.9, b.thick * 0.55);
    ctx.stroke();

    ctx.restore();
  }

  function tick() {
    const now = performance.now();

    // Clear with slight fade (keeps afterglow)
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(0, 0, W, H);

    // Strike scheduling
    if (now >= nextStrikeAt) {
      const boltCount = Math.random() < 0.32 ? 2 : 1; // sometimes double strike
      for (let i = 0; i < boltCount; i++) bolts.push(makeBolt());

      // flash effect
      const power = bolts[bolts.length - 1]?.flashPower ?? 0.25;
      doFlash(power);

      // next time
      nextStrikeAt = now + (900 + Math.random() * 2200);
    }

    // Draw & decay
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i];
      drawBolt(b);
      b.life -= b.decay;

      if (b.life <= 0) bolts.splice(i, 1);
    }

    requestAnimationFrame(tick);
  }

  // start
  tick();
})();
