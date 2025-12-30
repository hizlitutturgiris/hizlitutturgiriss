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
    let y = -20;

    const points = [{ x, y }];
    const segments = Math.floor(rand(14, 22));
    const stepY = (H + 60) / segments;

    let sway = rand(-0.8, 0.8) * 28;
    for (let i = 0; i < segments; i++) {
      y += stepY;

      x += rand(-26, 26) + sway * 0.12 + rand(-8, 8);
      if (x < -40) x = -40;
      if (x > W + 40) x = W + 40;

      points.push({ x, y });

      if (Math.random() < 0.22 && i > 3 && i < segments - 3) {
        const bx = x + rand(-90, 90);
        const by = y + rand(-30, 30);
        points.push({ x: bx, y: by, branch: true });
        points.push({ x, y, branchReturn: true });
      }
    }

    return {
      points,
      life: 1,
      decay: rand(0.06, 0.11),
      thickness: rand(1.2, 2.8),
      glow: rand(10, 18),
      alpha: 1
    };
  }

  function doFlash(power) {
    if (!flash) return;
    flash.style.opacity = String(power);
    setTimeout(() => (flash.style.opacity = "0"), 90);
  }

  function drawBolt(b) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    ctx.shadowColor = "rgba(255, 220, 110, 0.95)";
    ctx.shadowBlur = b.glow;

    ctx.lineWidth = b.thickness;
    ctx.strokeStyle = `rgba(255, 230, 140, ${0.95 * b.alpha})`;

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

    ctx.shadowBlur = 0;
    ctx.lineWidth = Math.max(0.8, b.thickness * 0.7);
    ctx.strokeStyle = `rgba(255, 210, 70, ${0.35 * b.alpha})`;
    ctx.stroke();

    ctx.restore();
  }

  const bolts = [];
  // ✅ Daha sık şimşek: neredeyse sürekli
  let nextStrikeAt = performance.now() + rand(250, 600);

  function tick(now) {
    // trail temizliği
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(0, 0, W, H);

    if (now >= nextStrikeAt) {
      bolts.push(makeBolt());

      // ✅ daha fazla çift/üçlü çakma
      if (Math.random() < 0.55) bolts.push(makeBolt());
      if (Math.random() < 0.18) bolts.push(makeBolt());

      doFlash(rand(0.20, 0.38));
      nextStrikeAt = now + rand(350, 900);
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
