(() => {
  // Footer year
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  // Respect reduced motion
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const canvas = document.getElementById("lightningCanvas");
  const flash = document.getElementById("flash");
  if (!canvas || reduceMotion) return;

  const ctx = canvas.getContext("2d", { alpha: true });

  let W = 0, H = 0, dpr = 1;
  const resize = () => {
    dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    W = Math.floor(window.innerWidth);
    H = Math.floor(window.innerHeight);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  window.addEventListener("resize", resize, { passive: true });
  resize();

  // Helpers
  const rand = (min, max) => Math.random() * (max - min) + min;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function drawBolt(startX, startY, endX, endY, depth = 0) {
    // Long bolt with jitter & occasional branches
    const segments = 28 + Math.floor(rand(0, 18)); // long
    const dx = (endX - startX) / segments;
    const dy = (endY - startY) / segments;

    let x = startX;
    let y = startY;

    ctx.beginPath();
    ctx.moveTo(x, y);

    for (let i = 1; i <= segments; i++) {
      // Stronger jitter in the middle
      const t = i / segments;
      const jitter = (1 - Math.abs(0.5 - t) * 2) * 18; // peak at middle
      x = startX + dx * i + rand(-jitter, jitter);
      y = startY + dy * i + rand(-jitter, jitter * 0.7);

      ctx.lineTo(x, y);

      // Branch
      if (depth < 2 && Math.random() < 0.08) {
        const bx = x + rand(-220, 220);
        const by = y + rand(80, 280);
        drawBolt(x, y, bx, by, depth + 1);
      }
    }
    ctx.stroke();
  }

  function flashOn() {
    if (!flash) return;
    flash.classList.add("on");
    setTimeout(() => flash.classList.remove("on"), 160);
  }

  function strike() {
    ctx.clearRect(0, 0, W, H);

    // Choose a bolt direction: from top to somewhere lower
    const startX = rand(W * 0.15, W * 0.85);
    const startY = rand(-30, 40);
    const endX = startX + rand(-W * 0.25, W * 0.25);
    const endY = rand(H * 0.45, H * 0.92);

    // Yellow glow layers (outer -> inner)
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Outer glow
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = "rgba(255, 212, 0, 0.16)";
    ctx.lineWidth = 10;
    drawBolt(startX, startY, endX, endY);

    // Mid glow
    ctx.strokeStyle = "rgba(255, 212, 0, 0.28)";
    ctx.lineWidth = 6;
    drawBolt(startX, startY, endX, endY);

    // Core bright
    ctx.strokeStyle = "rgba(255, 245, 190, 0.95)";
    ctx.lineWidth = 2.2;
    drawBolt(startX, startY, endX, endY);

    flashOn();

    // Fade out smoothly
    const fadeStart = performance.now();
    const fadeDur = 520;

    function fade(now) {
      const t = (now - fadeStart) / fadeDur;
      const a = clamp(1 - t, 0, 1);
      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = `rgba(255, 212, 0, ${0.16 * a})`;
      ctx.lineWidth = 10;
      drawBolt(startX, startY, endX, endY);

      ctx.strokeStyle = `rgba(255, 212, 0, ${0.28 * a})`;
      ctx.lineWidth = 6;
      drawBolt(startX, startY, endX, endY);

      ctx.strokeStyle = `rgba(255, 245, 190, ${0.95 * a})`;
      ctx.lineWidth = 2.2;
      drawBolt(startX, startY, endX, endY);

      if (t < 1) requestAnimationFrame(fade);
      else ctx.clearRect(0, 0, W, H);
    }
    requestAnimationFrame(fade);
  }

  // Random storm timing
  function loop() {
    // Sometimes double strike
    const doDouble = Math.random() < 0.22;

    strike();
    if (doDouble) setTimeout(strike, rand(80, 180));

    const next = rand(1400, 3800); // stormy but not too much
    setTimeout(loop, next);
  }

  // Start after short delay
  setTimeout(loop, 900);
})();
