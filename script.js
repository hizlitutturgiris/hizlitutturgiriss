(() => {
  const canvas = document.getElementById("fx");
  const ctx = canvas.getContext("2d", { alpha: true });

  let w = 0, h = 0, dpr = 1;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  // Lightning "drop" objects
  const bolts = [];
  const MAX_BOLTS = prefersReducedMotion ? 0 : 14;

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function spawnBolt() {
    const x = rand(0, w);
    const y = rand(-h * 0.2, h * 0.2);
    const length = rand(h * 0.35, h * 0.75);
    const width = rand(1, 2.6);
    const life = rand(10, 22);

    // Generate jagged path
    const points = [];
    let px = x;
    let py = y;
    const steps = Math.floor(rand(12, 22));
    const stepY = length / steps;

    for (let i = 0; i < steps; i++) {
      px += rand(-18, 18);
      py += stepY + rand(-6, 8);
      points.push([px, py]);
    }

    bolts.push({
      x, y,
      width,
      life,
      maxLife: life,
      points
    });

    // keep list small
    if (bolts.length > 30) bolts.splice(0, bolts.length - 30);
  }

  // subtle background flash
  let flash = 0;

  function drawBolt(b) {
    const t = b.life / b.maxLife; // 1 -> 0
    const alpha = Math.max(0, Math.min(1, t));

    ctx.save();
    ctx.globalAlpha = 0.35 * alpha;

    // glow
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Outer glow (yellow)
    ctx.strokeStyle = "rgba(245, 209, 0, 0.9)";
    ctx.lineWidth = b.width * 3;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    for (const [px, py] of b.points) ctx.lineTo(px, py);
    ctx.stroke();

    // Inner line (greenish-white)
    ctx.globalAlpha = 0.65 * alpha;
    ctx.strokeStyle = "rgba(230, 255, 245, 1)";
    ctx.lineWidth = b.width;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    for (const [px, py] of b.points) ctx.lineTo(px, py);
    ctx.stroke();

    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);

    // rare flash
    if (!prefersReducedMotion && Math.random() < 0.02) flash = 1;

    if (flash > 0) {
      ctx.save();
      ctx.globalAlpha = 0.08 * flash;
      ctx.fillStyle = "rgba(245, 209, 0, 1)";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
      flash *= 0.85;
      if (flash < 0.02) flash = 0;
    }

    // spawn bolts
    if (!prefersReducedMotion && bolts.length < MAX_BOLTS && Math.random() < 0.12) {
      spawnBolt();
    }

    // draw & age
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i];
      drawBolt(b);
      b.life -= 1;
      if (b.life <= 0) bolts.splice(i, 1);
    }

    requestAnimationFrame(tick);
  }

  tick();
})();
