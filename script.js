(() => {
  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Respect reduced motion
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const canvas = document.getElementById("lightningCanvas");
  const ctx = canvas.getContext("2d", { alpha: true });

  let w = 0, h = 0;
  function resize() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = Math.floor(window.innerWidth * dpr);
    h = Math.floor(window.innerHeight * dpr);
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(1, 1);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  // Helpers
  const rand = (min, max) => Math.random() * (max - min) + min;

  function makeBolt() {
    // start near top, end near bottom
    const startX = rand(w * 0.1, w * 0.9);
    const startY = rand(-h * 0.05, h * 0.15);
    const endX   = startX + rand(-w * 0.25, w * 0.25);
    const endY   = rand(h * 0.65, h * 1.05);

    const points = [];
    const steps = Math.floor(rand(18, 32)); // long lightning
    let x = startX, y = startY;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const targetX = startX + (endX - startX) * t;
      const targetY = startY + (endY - startY) * t;

      // jitter more in the middle for “stormy” vibe
      const jitter = (1 - Math.abs(0.5 - t) * 2); // 0 edges, 1 mid
      x = targetX + rand(-w * 0.02, w * 0.02) * (0.35 + jitter);
      y = targetY + rand(-h * 0.008, h * 0.008) * (0.35 + jitter);

      points.push({ x, y });
    }

    // branches
    const branches = [];
    const branchCount = Math.floor(rand(1, 4));
    for (let b = 0; b < branchCount; b++) {
      const forkAt = Math.floor(rand(6, steps - 6));
      const fork = [points[forkAt]];
      let bx = points[forkAt].x;
      let by = points[forkAt].y;
      const len = Math.floor(rand(6, 12));
      for (let i = 1; i < len; i++) {
        bx += rand(-w * 0.03, w * 0.03);
        by += rand(h * 0.01, h * 0.04);
        fork.push({ x: bx, y: by });
      }
      branches.push(fork);
    }

    return { points, branches, life: rand(0.18, 0.32) };
  }

  function drawBolt(bolt, alpha) {
    // Yellow lightning + glow
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    // glow layer
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(246,212,74,0.95)";
    ctx.shadowBlur = 22;

    // main bolt
    ctx.strokeStyle = `rgba(246,212,74,${0.85 * alpha})`;
    ctx.lineWidth = Math.max(2, Math.min(4, (w / 700)));

    ctx.beginPath();
    bolt.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // core bright line
    ctx.shadowBlur = 8;
    ctx.strokeStyle = `rgba(255,255,255,${0.75 * alpha})`;
    ctx.lineWidth = Math.max(1, Math.min(2.2, (w / 1300)));
    ctx.beginPath();
    bolt.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // branches
    bolt.branches.forEach(branch => {
      ctx.shadowBlur = 18;
      ctx.strokeStyle = `rgba(246,212,74,${0.65 * alpha})`;
      ctx.lineWidth = Math.max(1.2, Math.min(2.8, (w / 900)));
      ctx.beginPath();
      branch.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    });

    ctx.restore();
  }

  let activeBolts = [];
  let lastSpawn = 0;
  let nextDelay = rand(900, 1700);

  function flash() {
    document.body.classList.remove("flash");
    // force reflow
    void document.body.offsetWidth;
    document.body.classList.add("flash");
    setTimeout(() => document.body.classList.remove("flash"), 520);
  }

  function tick(ts) {
    // fade old frame
    ctx.clearRect(0, 0, w, h);

    // spawn occasionally (stormy)
    if (ts - lastSpawn > nextDelay) {
      const b1 = makeBolt();
      activeBolts.push({ bolt: b1, born: ts });
      if (Math.random() < 0.35) {
        // double strike
        const b2 = makeBolt();
        activeBolts.push({ bolt: b2, born: ts + rand(40, 120) });
      }
      if (Math.random() < 0.55) flash();

      lastSpawn = ts;
      nextDelay = rand(850, 1700);
    }

    // draw bolts with life fade
    activeBolts = activeBolts.filter(item => {
      const age = (ts - item.born) / 1000;
      if (age < 0) return true; // scheduled
      const life = item.bolt.life;
      const t = age / life;
      if (t >= 1) return false;

      const alpha = (t < 0.25) ? (t / 0.25) : (1 - (t - 0.25) / 0.75);
      drawBolt(item.bolt, Math.max(0, Math.min(1, alpha)));
      return true;
    });

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
