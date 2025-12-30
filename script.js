(() => {
  // YEAR
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Respect reduced motion
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const canvas = document.getElementById("stormCanvas");
  const flash = document.getElementById("flash");
  const ctx = canvas.getContext("2d", { alpha: true });

  // Settings
  const cfg = {
    // Bolt frequency
    minInterval: 900,
    maxInterval: 2400,

    // Bolt shape
    boltSegments: [14, 22],      // how many zig-zag points
    boltStepY: [18, 34],         // vertical step range
    boltJitterX: [18, 46],       // horizontal jitter range
    branchChance: 0.38,
    branchMax: 2,

    // Style
    colorMain: "rgba(255, 212, 0, 0.95)",
    colorGlow: "rgba(255, 228, 120, 0.50)",
    glowBlur: 18,
    mainWidth: 2.3,
    glowWidth: 9,

    // Flash
    flashMax: 0.38
  };

  let W = 0, H = 0, DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  function resize() {
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

  // Utility
  const rand = (a, b) => a + Math.random() * (b - a);
  const randi = (a, b) => Math.floor(rand(a, b + 1));

  function makeBolt(startX, startY = -20, maxY = H * rand(0.55, 0.92)) {
    const pts = [];
    pts.push({ x: startX, y: startY });

    const segCount = randi(cfg.boltSegments[0], cfg.boltSegments[1]);
    let x = startX;
    let y = startY;

    for (let i = 0; i < segCount; i++) {
      y += rand(cfg.boltStepY[0], cfg.boltStepY[1]);
      x += rand(-cfg.boltJitterX[1], cfg.boltJitterX[1]);

      // keep inside screen a bit
      x = Math.max(20, Math.min(W - 20, x));

      pts.push({ x, y });
      if (y >= maxY) break;
    }
    return pts;
  }

  function drawPath(points, width, strokeStyle, blur = 0) {
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = width;
    ctx.shadowColor = strokeStyle;
    ctx.shadowBlur = blur;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function branchFrom(points) {
    // take a point somewhere mid
    if (points.length < 6) return null;
    const idx = randi(2, Math.max(3, points.length - 3));
    const p = points[idx];

    // branch goes sideways and down
    const dir = Math.random() < 0.5 ? -1 : 1;
    const branchPts = [{ x: p.x, y: p.y }];

    const count = randi(5, 10);
    let x = p.x;
    let y = p.y;
    for (let i = 0; i < count; i++) {
      y += rand(14, 26);
      x += dir * rand(10, 38) + rand(-8, 8);
      x = Math.max(10, Math.min(W - 10, x));
      branchPts.push({ x, y });
      if (y > H * 0.95) break;
    }
    return branchPts;
  }

  // Bolt “lifetime” for a quick fade
  const bolts = [];
  function spawnBolt() {
    const x = rand(40, W - 40);
    const main = makeBolt(x);

    const bolt = {
      main,
      branches: [],
      born: performance.now(),
      life: rand(120, 220)
    };

    // branches
    let branches = 0;
    if (Math.random() < cfg.branchChance) {
      const maxB = randi(1, cfg.branchMax);
      for (let i = 0; i < maxB; i++) {
        const b = branchFrom(main);
        if (b) {
          bolt.branches.push(b);
          branches++;
        }
      }
    }

    bolts.push(bolt);

    // Flash pulse
    if (flash) {
      flash.style.opacity = String(rand(cfg.flashMax * 0.6, cfg.flashMax));
      setTimeout(() => {
        flash.style.opacity = "0";
      }, randi(80, 160));
    }
  }

  // Schedule
  let nextAt = performance.now() + rand(cfg.minInterval, cfg.maxInterval);

  function render(now) {
    // clear with slight trail (stormy glow)
    ctx.clearRect(0, 0, W, H);

    // subtle ambient glow vignette
    ctx.save();
    ctx.globalAlpha = 0.10;
    const g = ctx.createRadialGradient(W * 0.5, H * 0.15, 30, W * 0.5, H * 0.15, Math.max(W, H));
    g.addColorStop(0, "rgba(255,212,0,0.10)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // spawn new bolt
    if (now >= nextAt) {
      // sometimes double strike
      spawnBolt();
      if (Math.random() < 0.22) setTimeout(spawnBolt, randi(70, 160));

      nextAt = now + rand(cfg.minInterval, cfg.maxInterval);
    }

    // draw bolts
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i];
      const age = now - b.born;
      const t = Math.min(1, age / b.life);
      const alpha = 1 - t;

      ctx.save();
      ctx.globalAlpha = alpha;

      // glow layer
      drawPath(b.main, cfg.glowWidth, cfg.colorGlow, cfg.glowBlur);
      // main bright line
      drawPath(b.main, cfg.mainWidth, cfg.colorMain, 8);

      // branches thinner
      for (const br of b.branches) {
        drawPath(br, cfg.glowWidth * 0.65, "rgba(255, 228, 120, 0.35)", 14);
        drawPath(br, cfg.mainWidth * 0.8, "rgba(255, 212, 0, 0.85)", 6);
      }

      ctx.restore();

      if (t >= 1) bolts.splice(i, 1);
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
