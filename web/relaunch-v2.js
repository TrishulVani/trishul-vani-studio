(() => {
  if (new URLSearchParams(location.search).get('design') !== '2') return;
  const content = document.querySelector('.main > .content');
  if (!content) return;
  const story = document.createElement('section');
  story.className = 'relaunch-story';
  story.setAttribute('aria-label', 'The signal journey');
  story.innerHTML = `
    <div class="relaunch-stage">
      <canvas id="relaunch-field" aria-hidden="true"></canvas>
      <div class="relaunch-orbit" aria-hidden="true"></div>
      <img class="relaunch-art" src="/assets/trident-sculpture-v2.png" alt="" aria-hidden="true">
      <div class="relaunch-top"><span>TRISHUL VANI / 2026</span><span id="relaunch-count">01 / 04</span></div>
      <div class="relaunch-chapter is-current" data-index="0"><span class="relaunch-kicker">SOUND INTELLIGENCE / INDEPENDENT RESEARCH</span><h1>Hear what<br><em>matters.</em></h1><p>A research instrument for speech clarity in the demanding acoustic conditions of ground, sea and air.</p><a href="#audio-lab">Start with the audio lab <span aria-hidden="true">↗</span></a></div>
      <div class="relaunch-chapter" data-index="1"><span class="relaunch-kicker">01 / THE SIGNAL</span><h2>One voice.<br><em>Two perspectives.</em></h2><p>Speech and noise reach the primary input. A second input hears the environment. The real processor compares both.</p></div>
      <div class="relaunch-chapter" data-index="2"><span class="relaunch-kicker">02 / ADAPTATION</span><h2>Ground. Sea.<br><em>Air.</em></h2><p>Steady hum, changing ambience and sudden transients call for different responses. These are visual concepts, not field recordings.</p></div>
      <div class="relaunch-chapter" data-index="3"><span class="relaunch-kicker">03 / EVIDENCE</span><h2>Make every<br><em>result visible.</em></h2><p>Generate or upload audio. Compare each processing stage, inspect the waveform and export a reproducible experiment.</p><a href="#audio-lab">Enter the working lab <span aria-hidden="true">↗</span></a></div>
      <div class="relaunch-side"><span>SCROLL TO MOVE THROUGH SOUND</span><i></i><span>NO AUTOPLAY AUDIO</span></div>
      <div class="relaunch-progress" aria-hidden="true"><span></span></div>
    </div>`;
  content.prepend(story);
  if (location.hash && document.getElementById(location.hash.slice(1))) {
    requestAnimationFrame(() => document.getElementById(location.hash.slice(1)).scrollIntoView({ behavior: 'instant' }));
  }
  const canvas = document.getElementById('relaunch-field');
  const ctx = canvas.getContext('2d');
  const chapters = [...story.querySelectorAll('.relaunch-chapter')];
  const count = document.getElementById('relaunch-count');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pointerX = .5, pointerY = .5, progress = 0, active = -1, raf = 0;
  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  function update() {
    const rect = story.getBoundingClientRect();
    progress = clamp(-rect.top / Math.max(1, story.offsetHeight - innerHeight));
    const index = Math.min(3, Math.floor(progress * 4));
    if (index !== active) { active = index; chapters.forEach((chapter, i) => chapter.classList.toggle('is-current', i === index)); count.textContent = `0${index + 1} / 04`; story.dataset.chapter = String(index); }
    story.style.setProperty('--story-progress', progress.toFixed(4));
  }
  function draw(time) {
    const box = story.getBoundingClientRect();
    if (box.bottom < 0 || box.top > innerHeight) { raf = 0; return; }
    const w = innerWidth, h = innerHeight, dpr = Math.min(devicePixelRatio || 1, 1.5);
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    ctx.clearRect(0, 0, w, h);
    const centerX = w * (.68 + (pointerX - .5) * .045), centerY = h * (.48 + (pointerY - .5) * .04);
    for (let ring = 0; ring < 25; ring++) {
      const radius = ((ring / 25 + progress * .5 + (reduce ? 0 : time * .000025)) % 1) * Math.max(w, h) * .85;
      ctx.beginPath(); ctx.ellipse(centerX, centerY, radius, radius * (.45 + progress * .22), progress * .15, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(177,162,240,${(.13 * (1 - radius / (Math.max(w, h) * .85))).toFixed(3)})`;
      ctx.lineWidth = ring % 5 === 0 ? 1.4 : .6; ctx.stroke();
    }
    if (active >= 1) {
      const yBase = h * .66;
      for (let line = 0; line < 20; line++) {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 9) {
          const envelope = Math.exp(-Math.pow((x - centerX) / (w * .36), 2));
          const wave = Math.sin(x * .018 + line * .31 + (reduce ? 0 : time * .001)) * envelope * (8 + active * 8);
          const y = yBase + (line - 10) * 13 + wave;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(168,155,241,${.016 + line / 170})`; ctx.stroke();
      }
    }
    raf = requestAnimationFrame(draw);
  }
  story.addEventListener('pointermove', e => { pointerX = e.clientX / innerWidth; pointerY = e.clientY / innerHeight; }, { passive: true });
  addEventListener('scroll', update, { passive: true }); addEventListener('resize', update);
  update(); raf = requestAnimationFrame(draw);
  new IntersectionObserver(entries => { if (entries[0].isIntersecting && !raf) raf = requestAnimationFrame(draw); }, { rootMargin: '100px' }).observe(story);
})();
