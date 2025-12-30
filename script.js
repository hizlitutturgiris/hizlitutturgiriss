const layer = document.querySelector(".lightning-layer");

const SETTINGS = {
  spawnEveryMs: 200,
  minDuration: 800,
  maxDuration: 1600,
};

function spawnBolt(){
  const bolt = document.createElement("div");
  bolt.className = "bolt";

  bolt.style.left = Math.random() * window.innerWidth + "px";
  bolt.style.top = Math.random() * window.innerHeight + "px";

  layer.appendChild(bolt);

  setTimeout(() => bolt.remove(), 1600);
}

setInterval(spawnBolt, SETTINGS.spawnEveryMs);
