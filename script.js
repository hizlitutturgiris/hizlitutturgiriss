// yıl
document.getElementById("year").textContent = new Date().getFullYear();

// Lightning rain (hafif, mobilde de boğmaz)
const layer = document.querySelector(".lightning-layer");

// Hız kontrolü (istersen düşür/çoğalt)
const SETTINGS = {
  spawnEveryMs: 220,     // ne sıklıkla düşsün (küçük = daha yoğun)
  minDuration: 1100,     // ms
  maxDuration: 2200,     // ms
  minSize: 10,           // px
  maxSize: 20,           // px
};

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnBolt() {
  if (!layer) return;

  const bolt = document.createElement("div");
  bolt.className = "bolt";

  const left = rand(0, 100);
  const duration = rand(SETTINGS.minDuration, SETTINGS.maxDuration);
  const size = rand(SETTINGS.minSize, SETTINGS.maxSize);

  bolt.style.left = `${left}vw`;
  bolt.style.animationDuration = `${duration}ms`;
  bolt.style.width = `${size}px`;
  bolt.style.height = `${size * 4}px`;
  bolt.style.opacity = "1";

  // biraz sağa sola kayma hissi
  bolt.style.transform = `translateY(-80px) rotate(${rand(-6, 10)}deg)`;

  layer.appendChild(bolt);

  // bitince sil
  setTimeout(() => {
    bolt.remove();
  }, duration + 200);
}

// prefers-reduced-motion ise hiç başlatma
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduceMotion) {
  setInterval(spawnBolt, SETTINGS.spawnEveryMs);
}
