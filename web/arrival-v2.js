(() => {
  const arrival = document.getElementById('arrival');
  if (!arrival) return;
  if (new URLSearchParams(location.search).get('story') === '1') { arrival.remove(); return; }
  const destination = '/index.html?design=2';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const label = document.getElementById('arrival-stage');
  const canvas = document.getElementById('arrival-field');
  const ctx = canvas.getContext('2d');
  const steps = ['01 / LISTEN', '02 / LOCATE', '03 / SPLIT', '04 / ADAPT', '05 / REVEAL', '06 / ENTER'];
  let raf = 0;
  let auto = 0;
  let closed = false;
  let mouseX = .5, mouseY = .5;
  const start = performance.now();
  const duration = reduced ? 800 : 7200;
  const scale = Math.min(devicePixelRatio || 1, 1.5);
  const go = () => { if (closed) return; closed = true; cancelAnimationFrame(raf); clearTimeout(auto); location.replace(destination); };
  auto = setTimeout(go, duration);
  document.getElementById('arrival-skip').addEventListener('click', go);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') go(); });
  arrival.addEventListener('pointermove', event => { mouseX = event.clientX / innerWidth; mouseY = event.clientY / innerHeight; }, { passive: true });
  function draw(now) {
    if (closed) return;
    const elapsed = now - start;
    const p = Math.min(1, elapsed / duration);
    arrival.style.setProperty('--arrival-progress', p.toFixed(4));
    arrival.style.setProperty('--arrival-ring-scale', (.6 + p * 1.1).toFixed(3));
    arrival.style.setProperty('--arrival-scale', (.68 + p * 1.1).toFixed(3));
    arrival.style.setProperty('--arrival-y', `${(9 - p * 12).toFixed(2)}vh`);
    arrival.style.setProperty('--arrival-rot-y', `${(-36 + p * 36).toFixed(2)}deg`);
    arrival.style.setProperty('--arrival-rot-z', `${(-8 + p * 8).toFixed(2)}deg`);
    arrival.style.setProperty('--arrival-opacity', (.55 + p * .45).toFixed(3));
    arrival.style.setProperty('--arrival-word-opacity', Math.max(0, Math.min(1, (p - .12) * 3.5)).toFixed(3));
    arrival.style.setProperty('--arrival-word-y', `${Math.round(45 - p * 45)}px`);
    arrival.dataset.phase = String(Math.min(5, Math.floor(p * 6)));
    label.textContent = steps[Math.min(5, Math.floor(p * 6))];
    if (canvas.width !== Math.round(innerWidth * scale) || canvas.height !== Math.round(innerHeight * scale)) {
      canvas.width = Math.round(innerWidth * scale);
      canvas.height = Math.round(innerHeight * scale);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    }
    const w = innerWidth, h = innerHeight;
    ctx.clearRect(0, 0, w, h);
    const cx = w * (.5 + (mouseX - .5) * .025), cy = h * (.5 + (mouseY - .5) * .025);
    for (let i = 0; i < 18; i++) {
      const radius = (((i / 18 + Math.max(0, elapsed) * .00007) % 1) + 1) % 1 * Math.max(w, h) * .77;
      const opacity = (1 - radius / (Math.max(w, h) * .77)) * .18;
      ctx.beginPath(); ctx.ellipse(cx, cy, radius * 1.75, radius * .46, -.15, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(151,224,193,${opacity})`; ctx.lineWidth = 1.2; ctx.stroke();
    }
    for (let row = 0; row < 34; row++) {
      const y = h * (.57 + (row - 17) * .013);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 12) {
        const center = Math.exp(-Math.pow((x - w * .5) / (w * .32), 2));
        const wave = Math.sin(x * .018 + elapsed * .0017 + row * .3) * center * (7 + p * 12);
        if (!x) ctx.moveTo(x, y + wave); else ctx.lineTo(x, y + wave);
      }
      ctx.strokeStyle = `rgba(128,208,174,${.013 + Math.abs(row - 17) / 34 * .024})`; ctx.stroke();
    }
    if (p >= 1) { go(); return; }
    raf = requestAnimationFrame(draw);
  }
  raf = requestAnimationFrame(draw);
})();
