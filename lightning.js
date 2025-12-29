(() => {
  const canvas = document.getElementById("fx");
  const ctx = canvas.getContext("2d", { alpha: true });

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return; // hareket istemeyenlerde kapat

  let w = 0, h = 0, dpr = 1;

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

  // Lightning bolts list
  const bolts = [];
  const maxBolts = 8;

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function spawnBolt() {
    if (bolts.length >= maxBolts) return;

    const x0 = rand(0, w);
    const y0 = rand(-h * 0.2, h * 0.2);

    const segments = Math.floor(rand(10, 22));
    const stepY = h / segments;
    let x = x0, y = y0;

    const path = [{ x, y }];

    for (let i = 0; i < segments; i++) {
      x += rand(-40, 40);
      y += stepY * rand(0.85, 1.25);
      path.push({ x, y });
      if (y > h) break;
    }

    bolts.push({
      path,
      life: 0,
      ttl: rand(220, 420),  // ms
      width: rand(1.2, 2.8),
      glow: rand(8, 16),
      alpha: rand(0.35, 0.75)
    });
  }

  // Spawn schedule
  let nextSpawn = performance.now() + rand(250, 900);

  function drawBolt(bolt, t) {
    const p = bolt.path;
    const k = 1 - Math.min(1, bolt.life / bolt.ttl); // fade out

    // glow
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = bolt.alpha * k;

    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // outer glow (yellow-ish)
    ctx.strokeStyle = "rgba(245,209,0,0.35)";
    ctx.lineWidth = bolt.width + bolt.glow * 0.12;
    ctx.beginPath();
    ctx.moveTo(p[0].x, p[0].y);
    for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
    ctx.stroke();

    // inner core (white)
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = bolt.width;
    ctx.beginPath();
    ctx.moveTo(p[0].x, p[0].y);
    for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
    ctx.stroke();

    ctx.restore();
  }

  function flashOverlay(intensity) {
    // subtle screen flash
    ctx.save();
    ctx.globalAlpha = intensity;
    ctx.fillStyle = "rgba(245,209,0,0.06)";
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  let last = performance.now();
  function tick(now) {
    const dt = now - last;
    last = now;

    ctx.clearRect(0, 0, w, h);

    // spawn
    if (now >= nextSpawn) {
      spawnBolt();
      // “yağma” hissi için bazen hızlı ardışık
      nextSpawn = now + (Math.random() < 0.35 ? rand(90, 220) : rand(350, 1200));
    }

    // draw + update
    let flash = 0;
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i];
      b.life += dt;

      // ilk anda daha parlak
      if (b.life < 60) flash = Math.max(flash, 0.10);

      drawBolt(b, now);

      if (b.life >= b.ttl) bolts.splice(i, 1);
    }

    if (flash > 0) flashOverlay(flash);

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
