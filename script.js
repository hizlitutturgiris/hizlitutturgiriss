const canvas = document.getElementById("lightning");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resize();
window.addEventListener("resize", resize);

function drawLightning() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#ffd400";
  ctx.lineWidth = 2;
  ctx.beginPath();

  let x = Math.random() * canvas.width;
  let y = 0;
  ctx.moveTo(x, y);

  while (y < canvas.height) {
    x += (Math.random() - 0.5) * 40;
    y += Math.random() * 40;
    ctx.lineTo(x, y);
  }

  ctx.stroke();
}

setInterval(drawLightning, 2500);

document.getElementById("year").textContent = new Date().getFullYear();
