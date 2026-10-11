(() => {
  const $ = id => document.getElementById(id);
  const status = $('sample-status');
  const audio = $('comparison-audio');
  let sample = null;
  const safeId = id => /^[a-f0-9]{12}$/.test(id || '');
  const reportError = error => error instanceof Error ? error.message : String(error);
  async function json(url, options) {
    const response = await fetch(url, { credentials: 'same-origin', ...options });
    if (!response.ok) throw new Error(`Processor request failed (${response.status})`);
    return response.json();
  }
  async function loadMeta() {
    try {
      const [health, meta] = await Promise.all([json('/api/health'), json('/api/meta')]);
      if (health.status !== 'ok') throw new Error('Processor unavailable');
      $('residual-name').textContent = meta.capabilities?.rnnoise ? 'Verified RNNoise' : 'Spectral DSP';
      $('residual-note').textContent = meta.capabilities?.rnnoise ? 'Configured neural residual model' : 'DSP fallback; not neural AI';
      $('hybrid-label').textContent = meta.capabilities?.rnnoise ? 'NLMS + verified RNNoise' : 'NLMS + spectral DSP fallback';
    } catch {
      $('residual-note').textContent = 'Processor unavailable; reconnect in the lab';
    }
  }
  async function loadEvidence() {
    const container = $('evidence-content');
    try {
      const runs = await json('/api/experiments');
      if (!Array.isArray(runs) || !runs.length) { container.textContent = 'No experiments saved for this visitor yet. Start one in the laboratory.'; return; }
      const run = runs[0];
      const label = run.source === 'synthetic' ? 'Synthetic demonstration' : run.source === 'raw_dual_microphone' ? 'Uploaded dual-mic capture' : 'Uploaded audio';
      const date = run.created_at ? new Date(run.created_at).toLocaleString() : 'Date unavailable';
      container.textContent = `${label} · ${date}. Open the lab for measured per-method results and any unavailable metrics.`;
    } catch { container.textContent = 'The processor is unavailable. You can still explore the story or open the lab to retry.'; }
  }
  $('generate').addEventListener('click', async () => {
    $('generate').disabled = true;
    status.textContent = 'Generating an original synthetic sample with the research engine…';
    try {
      const record = await json('/api/experiments/simulate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ noise: 'factory', snr_db: 0, duration_s: 3, seed: 42 }) });
      if (!safeId(record.id)) throw new Error('Processor returned an invalid experiment ID');
      sample = record;
      $('play-raw').disabled = false;
      $('play-hybrid').disabled = false;
      $('sample-tag').textContent = `SYNTHETIC / ${record.id.toUpperCase()}`;
      status.textContent = 'Synthetic example ready. Choose a track, then press Play in the audio controls.';
      $('audio-caption').textContent = 'Original engine output · synthetic formant-like tone · not intelligible speech.';
      loadEvidence();
    } catch (error) { status.textContent = `Could not generate the example: ${reportError(error)}. Open the lab to retry.`; }
    finally { $('generate').disabled = false; }
  });
  for (const method of ['raw', 'hybrid']) {
    $(`play-${method}`).addEventListener('click', () => {
      if (!sample || !safeId(sample.id)) return;
      audio.pause();
      audio.src = `/api/experiments/${sample.id}/audio/${method}`;
      audio.load();
      $('audio-caption').textContent = `${method === 'raw' ? 'Raw primary mixture' : 'Hybrid output'} · synthetic engine example · press Play to listen.`;
      audio.focus();
    });
  }
  const progress = document.querySelector('.chapter-progress span');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('entered');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    document.querySelectorAll('.scene').forEach(scene => observer.observe(scene));
    document.body.classList.add('motion-ready');
  }
  if (!reduced && matchMedia('(pointer:fine)').matches) {
    const hero = document.querySelector('.hero');
    const object = document.querySelector('.hero-object');
    hero.addEventListener('pointermove', event => {
      const x = (event.clientX / innerWidth - .5) * 16;
      const y = (event.clientY / innerHeight - .5) * 12;
      object.style.setProperty('--tilt-x', `${x}px`);
      object.style.setProperty('--tilt-y', `${y}px`);
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      object.style.setProperty('--tilt-x', '0px');
      object.style.setProperty('--tilt-y', '0px');
    });
  }
  let scheduled = false;
  addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
      scheduled = false;
    });
  }, { passive: true });
  loadMeta();
  loadEvidence();
})();
