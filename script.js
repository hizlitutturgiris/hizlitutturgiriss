// Yıl
document.getElementById("year").textContent = new Date().getFullYear();

// Kullanıcı "az hareket" seçtiyse efekti kapatalım
const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const canvas = document.getElementById("stormCanvas");
const ctx = canvas.getContext("2d", { alpha: true });
const flash = document.getElementById("flash");

let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = Math.floor(window.innerWidth);
  H = Math.floor(window.innerHeight);
  canvas.width = Math.floor(W * dpr);
  canvas.height = Math.floor(H * dpr);
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

function rand(min, max) { return Math.random() * (max - min) + min; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// Tek bir büyük yıldırım (çatallı) üret
function makeBolt() {
  const startX = rand(W * 0.15, W * 0.85);
  const startY = -20;
  const endX = startX + rand(-W * 0.18, W * 0.18);
  const endY = rand(H * 0.45, H * 0.95);

  const points = [];
  const steps = Math.floor(rand(14, 22));
  let x = startX, y = startY;

  points.push({ x, y });

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    // Düşüş yönü + rastgele kırılma
    const targetX = startX + (endX - startX) * t;
    const jitter = rand(-18, 18) * (1 - t) + rand(-8, 8);
    x = targetX + jitter;
    y = startY + (endY - startY) * t + rand(-8, 8);
    points.push({ x, y });
  }

  // Çatallar
  const branches = [];
  const branchCount = Math.floor(rand(1, 3));
  for (let b = 0; b < branchCount; b++) {
    const fromIndex = Math.floor(rand(4, steps - 4));
    const base = points[fromIndex];
    const bSteps = Math.floor(rand(6, 10));
    const bPoints = [{ x: base.x, y: base.y }];

    let bx = base.x, by = base.y;
    let angle = rand(-0.9, 0.9);
    for (let j = 1; j <= bSteps; j++) {
      const tt = j / bSteps;
      bx += Math.cos(angle) * rand(10, 24) + rand(-6, 6);
      by += rand(12, 28);
      // biraz aşağı & sağ/sol
      bPoints.push({ x: bx, y: by });
      angle += rand(-0.25, 0.25);
      // kısa kalsın diye hızla inceltelim
      if (tt > 0.85) break;
    }
    branches.push(bPoints);
  }

  return {
    points,
    branches,
    life: 0,
    maxLife: rand(260, 520), // ms
    thickness: rand(2.2, 3.6),
    glow: rand(12, 20),
    alpha: 1
  };
}

let bolts = [];
let lastTime = performance.now();
let nextStrikeAt = performance.now() + rand(900, 2200);

// Ekrana hızlı bir "parlama" ver
function doFlash(strength = 1) {
  flash.style.opacity = String(clamp(0.55 * strength, 0.25, 0.65));
  setTimeout(() => (flash.style.opacity = "0"), 120);
}

// Çakma anı
function strike() {
  // 1 veya 2 yıldırım aynı anda (çok nadir)
  const count = Math.random() < 0.18 ? 2 : 1;
  for (let i = 0; i < count; i++) bolts.push(makeBolt());

  doFlash(count === 2 ? 1.15 : 1);

  // Bir sonraki çakma: 2.2s - 6.5s arası
  nextStrikeAt = performance.now() + rand(2200, 6500);
}

// Çizim
function drawBoltPath(path, thickness, alpha, glow) {
  ctx.save();

  // Parlama (glow)
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Dış glow
  ctx.strokeStyle = `rgba(255, 212, 0, ${0.22 * alpha})`;
  ctx.lineWidth = thickness + glow;
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
  ctx.stroke();

  // Orta glow
  ctx.strokeStyle = `rgba(255, 230, 120, ${0.35 * alpha})`;
  ctx.lineWidth = thickness + glow * 0.55;
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
  ctx.stroke();

  // Ana çizgi
  ctx.strokeStyle = `rgba(255, 245, 190, ${0.95 * alpha})`;
  ctx.lineWidth = thickness;
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
  ctx.stroke();

  ctx.restore();
}

function tick(now) {
  const dt = now - lastTime;
  lastTime = now;

  ctx.clearRect(0, 0, W, H);

  // Yıldırım yokken bile hafif vignette için çok az karartma
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(0,0,0,0.10)";
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  if (!reduceMotion && now >= nextStrikeAt) strike();

  // Boltları güncelle/çiz
  for (let i = bolts.length - 1; i >= 0; i--) {
    const b = bolts[i];
    b.life += dt;

    const t = b.life / b.maxLife;
    // İlk an çok parlak, sonra hızlı sönüş
    b.alpha = clamp(1 - Math.pow(t, 0.85), 0, 1);

    // Hafif “titreme” hissi: noktaları çok az oynat
    const jittered = b.points.map((p, idx) => {
      const j = (1 - idx / b.points.length) * 0.9;
      return { x: p.x + rand(-1.2, 1.2) * j, y: p.y + rand(-1.2, 1.2) * j };
    });

    drawBoltPath(jittered, b.thickness, b.alpha, b.glow);

    // Branch'ler
    for (const br of b.branches) {
      const jitteredBr = br.map((p, idx) => {
        const j = (1 - idx / br.length) * 0.7;
        return { x: p.x + rand(-1.0, 1.0) * j, y: p.y + rand(-1.0, 1.0) * j };
      });
      drawBoltPath(jitteredBr, Math.max(1.4, b.thickness - 0.9), b.alpha * 0.85, b.glow * 0.75);
    }

    if (b.life >= b.maxLife) bolts.splice(i, 1);
  }

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
