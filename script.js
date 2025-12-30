:root{
  --bg0:#06150f;
  --bg1:#0a2418;
  --panel:#0c2f1f;
  --panel2:#0a281a;

  --green:#0c6b43;
  --green2:#16a06a;

  --yellow:#ffd200;
  --yellow2:#ffea66;

  --text:#e8fff3;
  --muted:#bfe9d3;

  --shadow: 0 18px 55px rgba(0,0,0,.55);
  --radius: 18px;
}

*{ box-sizing:border-box; }
html,body{ height:100%; }
body{
  margin:0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  color:var(--text);
  background:
    radial-gradient(1200px 700px at 50% 15%, rgba(255,210,0,.08), transparent 60%),
    radial-gradient(900px 700px at 20% 40%, rgba(22,160,106,.10), transparent 65%),
    linear-gradient(180deg, var(--bg0), var(--bg1));
  overflow-x:hidden;
}

/* canvas & flash overlay */
#lightningCanvas{
  position:fixed;
  inset:0;
  width:100%;
  height:100%;
  z-index:0;
  pointer-events:none;
}
#flashOverlay{
  position:fixed;
  inset:0;
  z-index:1;
  pointer-events:none;
  background: radial-gradient(900px 500px at 50% 25%, rgba(255,210,0,.24), transparent 65%);
  opacity:0;
  transition: opacity 120ms ease;
}

.wrap{
  width:min(980px, 92vw);
  margin:0 auto;
  position:relative;
  z-index:2; /* above lightning */
}

/* HEADER */
.header{
  background:#fff; /* requested white background */
  border-bottom: 1px solid rgba(0,0,0,.08);
}
.header-inner{
  display:flex;
  align-items:center;
  justify-content:center;
  padding: 16px 0;
}
.logo{
  height: 42px;
  width:auto;
  display:block;
}
@media (max-width:480px){
  .logo{ height: 36px; }
}

/* NAV */
.nav{
  background: linear-gradient(180deg, rgba(12,47,31,.92), rgba(8,32,21,.92));
  border-bottom: 1px solid rgba(255,210,0,.18);
  backdrop-filter: blur(8px);
}
.nav-inner{
  display:flex;
  gap:10px;
  justify-content:center;
  align-items:center;
  flex-wrap:wrap; /* mobile */
  padding: 12px 0;
}
.nav-pill{
  text-decoration:none;
  color:#0b3d27;          /* green text */
  background: var(--yellow);
  border: 2px solid #0b3d27; /* green border */
  padding: 9px 14px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 14px;
  letter-spacing:.2px;
  box-shadow: 0 10px 22px rgba(0,0,0,.20);
  transition: transform .15s ease, filter .15s ease;
}
.nav-pill:hover{
  transform: translateY(-1px);
  filter: brightness(1.03);
}
.nav-pill:active{ transform: translateY(0); }

/* MAIN */
.main{
  padding: 26px 0 18px;
}

/* HERO */
.hero{
  text-align:center;
}
.banner-card{
  background: linear-gradient(180deg, rgba(255,210,0,.10), rgba(12,47,31,.45));
  border: 1px solid rgba(255,210,0,.18);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 14px;
  margin: 10px auto 14px;
  width: min(860px, 100%);
}
.banner{
  width:100%;
  height:auto;
  display:block;
  border-radius: calc(var(--radius) - 8px);
  /* banner not huge */
  max-height: 360px;
  object-fit: cover;
}
@media (max-width:600px){
  .banner{ max-height: 240px; }
  .banner-card{ padding: 10px; }
}

.cta-row{
  display:flex;
  justify-content:center;
  margin: 6px 0 8px;
}
.cta-link{ display:inline-block; }
.cta-img{
  width: min(520px, 90vw);
  height:auto;
  display:block;
  filter: drop-shadow(0 18px 30px rgba(0,0,0,.55));
  transition: transform .15s ease, filter .15s ease;
}
.cta-link:hover .cta-img{
  transform: translateY(-2px) scale(1.01);
  filter: drop-shadow(0 22px 38px rgba(0,0,0,.62));
}
.cta-link:active .cta-img{ transform: translateY(0) scale(1.0); }

.hero-note{
  max-width: 760px;
  margin: 10px auto 0;
  color: var(--muted);
  line-height: 1.55;
  font-size: 14.5px;
}

/* CARDS */
.cards{
  margin-top: 22px;
  display:grid;
  gap: 14px;
}
.card{
  background: linear-gradient(180deg, rgba(12,47,31,.88), rgba(10,40,26,.88));
  border: 1px solid rgba(255,210,0,.18);
  border-radius: var(--radius);
  box-shadow: 0 12px 36px rgba(0,0,0,.45);
  padding: 16px 16px 14px;
}
.card h2{
  margin: 0 0 8px;
  font-size: 18px;
  color: var(--yellow);
  text-shadow: 0 0 18px rgba(255,210,0,.15);
}
.card p{
  margin:0;
  color: rgba(232,255,243,.92);
  line-height: 1.62;
  font-size: 14.5px;
}

/* CTA bottom (optional) */
.cta-bottom{
  margin: 18px 0 6px;
  display:flex;
  justify-content:center;
}
.cta-img--bottom{
  width: min(520px, 92vw);
}

/* FOOTER */
.footer{
  margin-top: 14px;
  padding: 18px 0 26px;
  border-top: 1px solid rgba(255,210,0,.14);
  background: rgba(0,0,0,.18);
}
.footer-inner{
  text-align:center;
  color: rgba(232,255,243,.70);
  font-size: 13px;
}
