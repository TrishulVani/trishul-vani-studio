(() => {
  const $ = id => document.getElementById(id);
  const status = $('sample-status');
  const audio = $('comparison-audio');
  let sample = null;
  const safeId = id => /^[a-f0-9]{12}$/.test(id || '');
  const reportError = error => error instanceof Error ? error.message : String(error);
  function drawWave(values) {
    if (!Array.isArray(values) || !values.length) return;
    const canvas = $('comparison-wave'), ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const peak = Math.max(.01, ...values);
    ctx.strokeStyle = '#8dd5c2'; ctx.lineWidth = 2; ctx.beginPath();
    values.forEach((value, index) => {
      const x = index / (values.length - 1) * canvas.width;
      const height = Math.max(1, value / peak * canvas.height * .42);
      ctx.moveTo(x, canvas.height / 2 - height);
      ctx.lineTo(x, canvas.height / 2 + height);
    });
    ctx.stroke();
    canvas.setAttribute('aria-label', 'Measured RMS envelope of the selected synthetic engine output');
  }
  async function drawMeasuredSpectrum(record) {
    const caption = $('spectrum-caption');
    caption.textContent = 'Computing a real STFT from the synthetic engine output…';
    try {
      const response = await fetch(`/api/experiments/${record.id}/audio/raw`, { credentials: 'same-origin' });
      if (!response.ok) throw new Error('WAV unavailable');
      const wav = await response.blob();
      const form = new FormData();
      form.append('file', wav, 'synthetic-engine-example.wav');
      form.append('provenance', `Synthetic TRISHUL VANI engine experiment ${record.id}`);
      const session = await json('/api/spectral/sessions', { method: 'POST', body: form });
      if (!/^[a-f0-9]{16}$/.test(session.id || '')) throw new Error('Invalid spectral session');
      const view = await json(`/api/spectral/sessions/${session.id}/view`);
      const rows = view.db, canvas = $('story-spectrum'), ctx = canvas.getContext('2d');
      if (!Array.isArray(rows) || !rows.length || !rows[0]?.length) throw new Error('Empty STFT result');
      const width = canvas.width, height = canvas.height;
      const frame = ctx.createImageData(width, height);
      const columns = rows[0].length;
      for (let y = 0; y < height; y++) {
        const hz = 80 * Math.pow(100, 1 - y / height);
        const bin = Math.min(rows.length - 1, Math.round(hz / 15.625));
        for (let x = 0; x < width; x++) {
          const db = rows[bin][Math.min(columns - 1, Math.floor(x / width * columns))];
          const energy = Math.pow(Math.max(0, Math.min(1, (db + 85) / 65)), 1.7);
          const i = (y * width + x) * 4;
          frame.data[i] = Math.round(8 + 157 * energy);
          frame.data[i + 1] = Math.round(17 + 208 * energy);
          frame.data[i + 2] = Math.round(19 + 178 * energy);
          frame.data[i + 3] = 255;
        }
      }
      ctx.putImageData(frame, 0, 0);
      canvas.setAttribute('aria-label', `Measured STFT spectrogram of the ${record.duration_s}-second synthetic engine example`);
      caption.textContent = 'Measured STFT of the synthetic engine example · log-frequency view · 16 kHz · Hann window · 1024 FFT / 256 hop.';
    } catch (error) { caption.textContent = `Spectrogram unavailable: ${reportError(error)}. Open Studio to retry.`; }
  }
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
      drawWave(record.waveforms?.raw);
      drawMeasuredSpectrum(record);
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
      drawWave(sample.waveforms?.[method]);
      audio.load();
      $('audio-caption').textContent = `${method === 'raw' ? 'Raw primary mixture' : 'Hybrid output'} · synthetic engine example · press Play to listen.`;
      audio.focus();
    });
  }
  const progress = document.querySelector('.chapter-progress span');
  if ('IntersectionObserver' in window) {
    const links = [...document.querySelectorAll('.chapter-rail a')];
    const chapterObserver = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        links.forEach(link => link.removeAttribute('aria-current'));
        links.find(link => link.hash === `#${entry.target.id}`)?.setAttribute('aria-current', 'location');
      }
    }, { rootMargin: '-30% 0px -55% 0px' });
    document.querySelectorAll('main section').forEach(section => chapterObserver.observe(section));
  }
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
