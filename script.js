// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Smooth scroll for menu (optional)
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (!id || id === "#") return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/**
 * LIGHTNING EFFECT (uzun yıldırım çakma)
 * - Canvas sabit durur
 * - Belli aralıklarla bir "bolt" çizilir ve hızlıca söner
 * - Ekranda çok hafif flash hissi verir (sarı)
 */
const canvas = document.getElementById("lightningCanvas");
const ctx = canvas.getContext("2d", { alpha: true });

function resizeCanvas(){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Utility
const rand = (min, max) => Math.random() * (max - min) + min;

// Create a long lightning path with branching
function generateBolt(startX, startY, endY){
  const points = [];
  let x = startX;
  let y = startY;

  points.push({ x, y });

  while (y < endY){
    const stepY = rand(18, 42);
    y += stepY;
    x += rand(-26, 26);
    points.push({ x, y });
  }

  // branches: take some midpoints and create short side bolts
  const branches = [];
  const branchCount = Math.random() < 0.8 ? Math.floor(rand(1, 4)) : 0;

  for (let i = 0; i < branchCount; i++){
    const idx = Math.floor(rand(2, points.length - 3));
    const p = points[idx];
    const bLen = rand(80, 220);
    const dir = Math.random() < 0.5 ? -1 : 1;

    const bPts = [];
    let bx = p.x;
    let by = p.y;
    bPts.push({ x: bx, y: by });

    const segs = Math.floor(rand(4, 8));
    for (let s = 0; s < segs; s++){
      by += rand(10, 22);
      bx += dir * rand(18, 40) + rand(-10, 10);
      bPts.push({ x: bx, y: by });
      if (Math.hypot(bx - p.x, by - p.y) > bLen) break;
    }
    branches.push(bPts);
  }

  return { main: points, branches };
}

function drawBoltPath(points, width, alpha){
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++){
    ctx.lineTo(points[i].x, points[i].y);
  }

  // Outer glow
  ctx.strokeStyle = `rgba(255, 212, 0, ${alpha * 0.18})`;
  ctx.lineWidth = width * 7;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();

  // Inner glow
  ctx.strokeStyle = `rgba(255, 240, 120, ${alpha * 0.35})`;
  ctx.lineWidth = width * 3.2;
  ctx.stroke();

  // Core
  ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
  ctx.lineWidth = width;
  ctx.stroke();
}

let flashAlpha = 0;
let activeBolts = []; // { bolt, life, maxLife, thickness }

function spawnLightning(){
  const startX = rand(40, window.innerWidth - 40);
  const startY = rand(-80, 40);
  const endY = rand(window.innerHeight * 0.55, window.innerHeight + 80);
  const bolt = generateBolt(startX, startY, endY);

  activeBolts.push({
    bolt,
    life: 0,
    maxLife: rand(220, 420), // ms
    thickness: rand(1.2, 2.2)
  });

  // flash
  flashAlpha = Math.max(flashAlpha, rand(0.08, 0.18));
}

// nice timing (random intervals)
let nextStrikeAt = performance.now() + rand(1200, 2600);

function render(t){
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // background flash overlay
  if (flashAlpha > 0.001){
    ctx.fillStyle = `rgba(255, 212, 0, ${flashAlpha})`;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    flashAlpha *= 0.92;
  }

  // draw bolts with fade
  activeBolts = activeBolts.filter(b => b.life < b.maxLife);
  for (const b of activeBolts){
    b.life += 16.6;
    const p = b.life / b.maxLife; // 0..1
    // quick appear, then fade
    const alpha = p < 0.15 ? (p / 0.15) : (1 - (p - 0.15) / 0.85);
    const a = Math.max(0, alpha);

    drawBoltPath(b.bolt.main, b.thickness, a);
    for (const br of b.bolt.branches){
      drawBoltPath(br, b.thickness * 0.9, a * 0.85);
    }
  }

  // schedule next strike
  if (t >= nextStrikeAt){
    // sometimes double strike
    spawnLightning();
    if (Math.random() < 0.35) setTimeout(spawnLightning, rand(120, 360));
    nextStrikeAt = t + rand(1400, 3200);
  }

  requestAnimationFrame(render);
}
requestAnimationFrame(render);
