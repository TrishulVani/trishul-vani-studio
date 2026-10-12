(() => {
  const arrival = document.getElementById('arrival');
  if (!arrival) return;
  if (new URLSearchParams(location.search).get('story') === '1') { arrival.remove(); return; }
  const destination = '/index.html?design=2';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const anchor = arrival.querySelector('.arrival-weapon-anchor');
  const body = arrival.querySelector('.arrival-weapon-body');
  const label = document.getElementById('arrival-stage');
  const canvas = document.getElementById('arrival-field');
  const ctx = canvas.getContext('2d');
  const stages = ['01 / THE AWAKENING', '02 / THE TURN', '03 / THE THROW', '04 / THE IMPACT', '05 / ENTER'];
  const clamp = n => Math.max(0, Math.min(1, n));
  const smooth = n => { const t = clamp(n); return t * t * (3 - 2 * t); };
  const part = (p, a, b) => smooth((p - a) / (b - a));
  let target = 0, visual = 0, raf = 0, closed = false, handStart = null, finishTimer = 0;

  function go() {
    if (closed) return;
    closed = true;
    cancelAnimationFrame(raf);
    clearTimeout(finishTimer);
    try { sessionStorage.setItem('tv-v2-arrival', '1'); } catch (_) { /* Navigation still works. */ }
    location.replace(destination);
  }

  function advance(amount) {
    if (closed) return;
    target = clamp(target + amount);
    if (target < .999) { clearTimeout(finishTimer); finishTimer = 0; }
    else if (!finishTimer) finishTimer = setTimeout(go, reduce ? 400 : 1800);
    arrival.classList.toggle('is-moving', target > .015);
    if (!raf) raf = requestAnimationFrame(tick);
  }

  arrival.addEventListener('wheel', event => {
    event.preventDefault();
    advance(event.deltaY / (event.deltaMode === 1 ? 48 : event.deltaMode === 2 ? 3 : 2300));
  }, { passive: false });
  arrival.addEventListener('touchstart', event => { handStart = event.touches[0]?.clientY ?? null; }, { passive: true });
  arrival.addEventListener('touchmove', event => {
    if (handStart === null) return;
    event.preventDefault();
    const next = event.touches[0].clientY;
    advance((handStart - next) / (innerHeight * 2.1));
    handStart = next;
  }, { passive: false });
  arrival.addEventListener('touchend', () => { handStart = null; });
  document.getElementById('arrival-skip').addEventListener('click', go);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { go(); return; }
    if (['ArrowDown', 'PageDown', ' ', 'ArrowUp', 'PageUp'].includes(event.key)) {
      event.preventDefault();
      advance(['ArrowUp', 'PageUp'].includes(event.key) ? -.13 : .13);
    }
  });

  function draw(p) {
    const dpr = Math.min(devicePixelRatio || 1, 1.5), w = innerWidth, h = innerHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    ctx.clearRect(0, 0, w, h);
    const cx = w * .5, cy = h * .49, flight = part(p, .4, .9);
    for (let i = 0; i < 22; i++) {
      const radius = ((i / 22 + p * .35) % 1) * Math.max(w, h) * .8;
      ctx.beginPath(); ctx.ellipse(cx, cy, radius * 1.5, radius * (.42 + flight * .2), p * .3, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(214,170,121,${((1 - radius / (Math.max(w, h) * .8)) * (.07 + flight * .14)).toFixed(3)})`;
      ctx.lineWidth = i % 5 === 0 ? 1.5 : .7; ctx.stroke();
    }
    if (flight > 0) for (let i = 0; i < 46; i++) {
      const a = i * 2.39996, r = Math.max(w, h) * (.11 + (i % 7) / 8 * flight), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * 16 * flight, y - Math.sin(a) * 16 * flight); ctx.lineTo(x, y);
      ctx.strokeStyle = `rgba(235,194,137,${(.05 + flight * .19).toFixed(3)})`; ctx.lineWidth = 1; ctx.stroke();
    }
  }

  function render(p) {
    const turn = part(p, .13, .47), rush = part(p, .48, .92), impact = part(p, .88, 1);
    const scale = (1 - .16 * turn) * (1 + 8.2 * rush * rush);
    const x = -innerWidth * .035 * turn - innerWidth * .12 * rush;
    const y = -innerHeight * .035 * turn + innerHeight * .1 * rush;
    anchor.style.transform = reduce
      ? 'translate3d(-50%,-50%,0)'
      : `translate3d(calc(-50% + ${x.toFixed(2)}px),calc(-50% + ${y.toFixed(2)}px),${(rush * 180).toFixed(1)}px) scale(${scale.toFixed(4)})`;
    if (arrival.classList.contains('is-moving')) body.style.transform = reduce ? 'none' : `rotateZ(${(90 * turn).toFixed(2)}deg) rotateX(${(-62 * turn - 14 * rush).toFixed(2)}deg) rotateY(${(540 * rush).toFixed(2)}deg)`;
    else body.style.removeProperty('transform');
    anchor.style.setProperty('--weapon-opacity', (1 - part(p, .91, .99)).toFixed(3));
    arrival.style.setProperty('--arrival-progress', p.toFixed(4));
    arrival.style.setProperty('--arrival-word-opacity', part(p, .89, .98).toFixed(3));
    arrival.style.setProperty('--arrival-word-y', `${Math.round(34 * (1 - impact))}px`);
    arrival.style.setProperty('--arrival-impact', impact.toFixed(3));
    arrival.dataset.phase = String(Math.min(5, Math.floor(p * 6)));
    arrival.dataset.beat = String(p < .2 ? 0 : p < .47 ? 1 : p < .86 ? 2 : 3);
    label.textContent = stages[p < .2 ? 0 : p < .47 ? 1 : p < .86 ? 2 : p < .97 ? 3 : 4];
    draw(p);
  }

  function tick() {
    raf = 0;
    const diff = target - visual;
    visual += Math.abs(diff) < .00015 ? diff : diff * (reduce ? .48 : .16);
    render(visual);
    if (Math.abs(target - visual) > .00015) raf = requestAnimationFrame(tick);
  }

  render(0);
})();
