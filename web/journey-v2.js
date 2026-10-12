(() => {
  if (new URLSearchParams(location.search).get('design') !== '2') return;
  const section = document.querySelector('.v2-journey');
  if (!section) return;
  const phase = section.querySelector('#v2-journey-phase');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = n => Math.min(1, Math.max(0, n));
  const ease = n => { const t = clamp(n); return t * t * (3 - 2 * t); };
  const segment = (p, start, end) => ease((p - start) / (end - start));
  const range = (a, b, t) => a + (b - a) * t;
  let pending = false;

  function render() {
    pending = false;
    const rect = section.getBoundingClientRect();
    if (rect.top > innerHeight || rect.bottom < 0) return;
    const p = clamp(-rect.top / Math.max(1, rect.height - section.querySelector('.v2-journey-stage').clientHeight));
    const approach = segment(p, 0, .25);
    const leap = segment(p, .24, .42);
    const flight = segment(p, .37, .76);
    const breakIn = segment(p, .73, .9);
    const exit = segment(p, .88, 1);
    const set = (name, value) => section.style.setProperty(`--${name}`, typeof value === 'number' ? value.toFixed(4) : value);

    set('progress', p);
    set('space', segment(p, .16, .45));
    set('portal', segment(p, .04, .34));
    set('travel', reduce ? 0 : flight);
    set('operator-scale', reduce ? 1 : range(.74, 1.38, approach) * range(1, .18, leap));
    set('operator-x', reduce ? 0 : range(0, -24, leap));
    set('operator-y', reduce ? 0 : range(0, -34, leap));
    set('operator-rotate', reduce ? 0 : range(0, -21, leap));
    set('operator-opacity', 1 - segment(p, .31, .43));
    set('flight-opacity', segment(p, .31, .47) * (1 - exit));
    set('flight-zoom', reduce ? 1 : range(1.12, 1.47, flight));
    set('flight-x', reduce ? 0 : range(0, -2.5, flight));
    set('flight-y', reduce ? 0 : range(0, 3, flight));
    set('break', reduce ? 0 : breakIn);
    set('shock-opacity', reduce ? 0 : segment(p, .72, .79) * (1 - segment(p, .83, .91)));
    set('shards-opacity', reduce ? 0 : segment(p, .75, .81) * (1 - segment(p, .9, .99)));
    set('copy-a', 1 - segment(p, .16, .27));
    set('copy-b', segment(p, .39, .5) * (1 - segment(p, .67, .78)));
    set('copy-c', segment(p, .82, .94));
    section.querySelector('.v2-journey-copy-c').inert = p < .82;
    phase.textContent = p < .35 ? '01 / APPROACH' : p < .75 ? '02 / FLIGHT' : p < .92 ? '03 / BREAKTHROUGH' : '04 / AUDIO LABORATORY';
  }

  function schedule() { if (!pending) { pending = true; requestAnimationFrame(render); } }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  render();
})();
