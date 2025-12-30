// Year
document.getElementById("year").textContent = new Date().getFullYear();

// Lightning (better long bolts + yellow glow + flash)
const canvas = document.getElementById("lightningCanvas");
const ctx = canvas.getContext("2d", { alpha: true });

const flash = document.getElementById("flash");

let w = 0, h = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

function resize(){
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

// Respect reduced motion
const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function rand(min, max){ return Math.random() * (max - min) + min; }
function randi(min, max){ return Math.floor(rand(min, max + 1)); }

function makeBolt(startX){
  const points = [];
  let x = startX;
  let y = 0;
  points.push({x, y});

  // Long bolt
  const stepY = rand(16, 28);
  const maxSteps = randi(18, 34);

  for(let i=0;i<maxSteps;i++){
    y += stepY + rand(-5, 8);
    x += rand(-38, 38);

    // Slightly bias downward, keep inside
    x = Math.max(0, Math.min(w, x));

    points.push({x, y});

    if(y > h * rand(0.72, 0.95)) break;

    // Occasional branching
    if(Math.random() < 0.14 && i > 4){
      const branch = makeBranch({x, y});
      points.branch = points.branch || [];
      points.branch.push(branch);
    }
  }
  return points;
}

function makeBranch(from){
  const points = [];
  let x = from.x;
  let y = from.y;
  points.push({x, y});

  const stepY = rand(10, 20);
  const maxSteps = randi(5, 10);

  for(let i=0;i<maxSteps;i++){
    y += stepY + rand(-3, 6);
    x += rand(-55, 55);
    x = Math.max(0, Math.min(w, x));
    points.push({x, y});
    if(y > h * 0.95) break;
  }
  return points;
}

function drawPath(points, width, alpha){
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for(let i=1;i<points.length;i++){
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.lineWidth = width;
  ctx.globalAlpha = alpha;
  ctx.stroke();
}

function strike(){
  if(reduceMotion) return;

  ctx.clearRect(0,0,w,h);

  // Strike count "rain"
  const strikes = (Math.random() < 0.25) ? randi(2,3) : 1;

  for(let s=0; s<strikes; s++){
    const startX = rand(w*0.15, w*0.85);
    const bolt = makeBolt(startX);

    // Outer glow
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Big glow
    ctx.strokeStyle = "rgba(255, 225, 100, 0.65)";
    ctx.shadowColor = "rgba(255, 220, 80, 0.95)";
    ctx.shadowBlur = 28;
    drawPath(bolt, 7, 0.22);

    // Core
    ctx.strokeStyle = "rgba(255, 245, 210, 0.95)";
    ctx.shadowColor = "rgba(255, 240, 170, 1)";
    ctx.shadowBlur = 14;
    drawPath(bolt, 2.4, 0.95);

    // Branches
    if(bolt.branch){
      for(const br of bolt.branch){
        ctx.strokeStyle = "rgba(255, 225, 100, 0.55)";
        ctx.shadowBlur = 18;
        drawPath(br, 3.5, 0.35);

        ctx.strokeStyle = "rgba(255, 245, 210, 0.90)";
        ctx.shadowBlur = 10;
        drawPath(br, 1.6, 0.85);
      }
    }

    ctx.restore();
  }

  // Flash
  flash.style.opacity = "0.45";
  setTimeout(() => { flash.style.opacity = "0"; }, 120);

  // Fade out the bolt quickly
  setTimeout(() => { ctx.clearRect(0,0,w,h); }, 160);
}

function loop(){
  if(reduceMotion) return;

  // Random storm timing
  const next = randi(900, 2400);

  // sometimes double-tap strike
  const multi = Math.random() < 0.18;

  setTimeout(() => {
    strike();
    if(multi){
      setTimeout(strike, randi(90, 220));
    }
    loop();
  }, next);
}

if(!reduceMotion){
  loop();
}
