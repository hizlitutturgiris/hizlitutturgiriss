(() => {
  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Reduced motion -> no lightning
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

  const rand = (a, b) => a + Math.random() * (b - a);

  function makeBolt() {
    const startX = rand(0.12 * W, 0.88 * W);
    let x = startX;
    let y = -24;

    const points = [{ x, y }];
    const segments = Math.floor(rand(16, 26));
    const stepY = (H + 90) / segments;

    const sway = rand(-1, 1) * 34;
    for (let i = 0; i < segments; i++) {
      y += stepY;

      x += rand(-30, 30) + sway * 0.10 + rand(-10, 10);
      x = Math.max(-60, Math.min(W + 60, x));

      points.push({ x, y });

      // more branches for richer look
      if (Math.random() < 0.28 && i > 3 && i < segments - 3) {
        const bx = x + rand(-120, 120);
        const by = y + rand(-40, 40);
        points.push({ x: bx, y: by, branch: true });
        points.push({ x, y, branchReturn: true });
      }
    }

    return {
      points,
      life: 1,
      decay: rand(0.06, 0.11),
      thickness: rand(1.4, 2.9),
      glow: rand(12, 22),
      alpha: 1
    };
  }

  function doFlash(power) {
    if (!flash) return;
    flash.style.opacity = String(power);
    setTimeout(() => (flash.style.opacity = "0"), 110);
  }

  function drawBolt(b) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    // glow
    ctx.shadowColor = "rgba(255, 220, 110, 0.98)";
    ctx.shadowBlur = b.glow;

    // core
    ctx.lineWidth = b.thickness;
    ctx.strokeStyle = `rgba(255, 235, 150, ${0.98 * b.alpha})`;

    ctx.beginPath();
    let moved = false;

    for (let i = 0; i < b.points.length; i++) {
      const p = b.points[i];
      if (p.branchReturn) continue;

      if (!moved) {
        ctx.moveTo(p.x, p.y);
        moved = true;
      } else {
        ctx.lineTo(p.x, p.y);
      }

      if (p.branch) {
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
      }
    }
    ctx.stroke();

    // afterglow
    ctx.shadowBlur = 0;
    ctx.lineWidth = Math.max(0.9, b.thickness * 0.7);
    ctx.strokeStyle = `rgba(255, 210, 70, ${0.40 * b.alpha})`;
    ctx.stroke();

    ctx.restore();
  }

  const bolts = [];

  // ✅ daha sık çaksın
  let nextStrikeAt = performance.now() + rand(350, 800);

  function tick(now) {
    // slow fade (trail)
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillRect(0, 0, W, H);

    if (now >= nextStrikeAt) {
      bolts.push(makeBolt());

      // ✅ daha sık çift/üçlü çakma
      if (Math.random() < 0.55) bolts.push(makeBolt());
      if (Math.random() < 0.18) bolts.push(makeBolt());

      doFlash(rand(0.22, 0.40));

      // ✅ sürekli ama doğal aralık
      nextStrikeAt = now + rand(420, 1100);
    }

    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i];
      drawBolt(b);
      b.life -= b.decay;
      b.alpha = Math.max(0, b.life);
      if (b.life <= 0) bolts.splice(i, 1);
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
