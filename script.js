// CHANGE THIS LINK ONCE, everything clickable uses it
const TARGET_URL = "https://hizlituttur1.com";

// Make sure all clickable items go to TARGET_URL
document.addEventListener("DOMContentLoaded", () => {
  // Update hero + CTA links safely
  document.querySelectorAll('a[href="https://hizlituttur1.com"]').forEach(a => {
    a.href = TARGET_URL;
  });

  startLightningRain();
});

function startLightningRain() {
  const layer = document.getElementById("lightning-layer");
  if (!layer) return;

  // Respect reduced motion
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  // spawn bolts
  const spawn = () => {
    const bolt = document.createElement("div");
    bolt.className = "bolt";
    bolt.textContent = "⚡";

    const x = Math.random() * 100; // vw
    const size = 16 + Math.random() * 18; // px
    const dur = 1200 + Math.random() * 1400; // ms
    const rot = (-20 + Math.random() * 40) + "deg";

    bolt.style.left = x + "vw";
    bolt.style.setProperty("--size", size + "px");
    bolt.style.setProperty("--dur", dur + "ms");
    bolt.style.setProperty("--rot", rot);

    layer.appendChild(bolt);

    // cleanup
    setTimeout(() => bolt.remove(), dur + 200);
  };

  // speed control: lower = more bolts
  const interval = setInterval(() => {
    // on mobile, reduce density
    const isMobile = window.innerWidth < 720;
    const count = isMobile ? 1 : 2;
    for (let i = 0; i < count; i++) spawn();
  }, 180);

  // optional: stop when tab hidden (saves CPU)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(interval);
    }
  }, { once: true });
}
