// yıl
document.getElementById("year").textContent = new Date().getFullYear();

/**
 * Lightning effect:
 * - random aralıklarla "uzun" yıldırım çakıyor
 * - sarı ton + kısa parlama
 */
const canvas = document.getElementById("lightningCanvas");
const ctx = canvas.getContext("2d", { alpha: true });

let W = 0, H = 0, DPR = 1;

function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = Math.floor(window.innerWidth);
  H = Math.floor(window.innerHeight);
  canvas.width = Math.floor(W * DPR);
  canvas.height = Math.floor(H * DPR);
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener("resize", resize);
resize();

function rand(min, max) { return Math.random() * (max - min) + min; }
function randi(min, max) { return Math.floor(rand(min, max + 1)); }

function drawBolt(xStart) {
  // bolt path
  let x = xStart;
  let y = -20;
  const segments = randi(18, 30);     // uzun olsun
  const stepY = H / segments;

  ctx.beginPath();
  ctx.moveTo(x, y);

  for (let i = 0; i < segments; i++) {
    y += stepY;
    x += rand(-28, 28);               // zigzag
    ctx.lineTo(x, y);
  }

  // glow under-stroke
  ctx.strokeStyle = "rgba(246, 211, 23, 0.22)";
  ctx.lineWidth = 6;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();

  // main stroke
  ctx.strokeStyle = "rgba(246, 211, 23, 0.90)";
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // bright core
  ctx.strokeStyle = "rgba(255, 245, 180, 0.95)";
  ctx.lineWidth = 1.1;
  ctx.stroke();
}

let flash = 0;
let lastTime = performance.now();

function frame(t) {
  const dt = Math.min(0.05, (t - lastTime) / 1000);
  lastTime = t;

  // fade background (çok hafif, iz bırakmasın)
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(0, 0, W, H);

  // flash fade
  if (flash > 0) {
    flash -= dt * 2.8;
    const a = Math.max(0, flash);
    ctx.fillStyle = `rgba(246, 211, 23, ${0.12 * a})`;
    ctx.fillRect(0, 0, W, H);
  }

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// random lightning strikes
function strike() {
  // 1-3 bolt
  const bolts = randi(1, 3);
  for (let i = 0; i < bolts; i++) {
    const x = rand(W * 0.12, W * 0.88);
    drawBolt(x);
  }

  // small flash
  flash = rand(0.8, 1.4);

  // next strike
  const next = rand(900, 2600); // ms (doğal aralık)
  setTimeout(strike, next);
}

// start
setTimeout(strike, rand(700, 1600));
