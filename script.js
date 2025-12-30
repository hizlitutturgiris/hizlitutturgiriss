// Year
document.getElementById("year").textContent = new Date().getFullYear();

// Lightning effect (canvas)
const canvas = document.getElementById("lightningCanvas");
const ctx = canvas.getContext("2d");
const flash = document.querySelector(".flash");

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

function rand(min, max){ return Math.random() * (max - min) + min; }

function drawBolt(startX, startY, endY) {
  // Long bolt segments
  const points = [];
  points.push({ x: startX, y: startY });

  let x = startX;
  let y = startY;

  while (y < endY) {
    y += rand(20, 70);
    x += rand(-28, 28);
    points.push({ x, y });
  }

  // Main stroke
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Glow
  ctx.strokeStyle = "rgba(255, 212, 0, 0.20)";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i=1; i<points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.stroke();

  // Core
  ctx.strokeStyle = "rgba(255, 212, 0, 0.85)";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i=1; i<points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.stroke();

  // Small branches (a few)
  for (let b=0; b<3; b++){
    const idx = Math.floor(rand(2, points.length-2));
    const p = points[idx];
    const branchLen = rand(60, 140);
    const branchDir = rand(-1.2, 1.2);
    ctx.strokeStyle = "rgba(255, 212, 0, 0.55)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + branchLen*branchDir, p.y + branchLen*0.35);
    ctx.stroke();
  }

  ctx.restore();
}

function flashScreen(intensity=0.35){
  flash.style.background = `rgba(255, 212, 0, ${intensity})`;
  setTimeout(()=> flash.style.background = "rgba(255, 212, 0, 0)", 120);
}

let fading = false;

function strike() {
  if (fading) return;
  fading = true;

  const w = window.innerWidth;
  const h = window.innerHeight;

  // Clear with very small alpha to create quick fade tail
  ctx.clearRect(0,0,w,h);

  // 1-2 long bolts
  const bolts = Math.random() < 0.65 ? 1 : 2;
  for (let i=0; i<bolts; i++){
    const x = rand(w*0.15, w*0.85);
    drawBolt(x, rand(-20, 40), h + rand(60, 160));
  }

  // Flash (1-2 pulses)
  flashScreen(rand(0.22, 0.42));
  if (Math.random() < 0.45) {
    setTimeout(()=> flashScreen(rand(0.12, 0.28)), rand(90, 160));
  }

  // Fade out quickly
  let alpha = 1;
  const fadeTimer = setInterval(() => {
    alpha -= 0.12;
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(0,0,0,${0.22})`;
    ctx.fillRect(0,0,w,h);
    ctx.restore();

    if (alpha <= 0) {
      clearInterval(fadeTimer);
      ctx.clearRect(0,0,w,h);
      fading = false;
    }
  }, 60);

  // Next strike random
  const next = rand(1400, 4200);
  setTimeout(strike, next);
}

// Start after a short delay
setTimeout(strike, rand(900, 1600));
