/* Lightweight interactions for Design 02; no framework or tracking. */
(() => {
  if (new URLSearchParams(location.search).get('design') !== '2') return;
  document.querySelectorAll('img[src*="/trident.svg"]').forEach(image => {
    image.src = '/trident-v2.svg?v=design2copper';
  });
  const buildLabel = document.querySelector('.alpha');
  if (buildLabel?.lastChild?.nodeType === Node.TEXT_NODE) buildLabel.lastChild.textContent = ' DESIGN 02 / SIGNAL RESEARCH';
  const sidebarCredit = document.querySelector('.sidebar-credit');
  if (sidebarCredit) sidebarCredit.textContent = 'VOLTEDGE • 2026 • DESIGN 02 / v0.2 ALPHA';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress = document.createElement('div');
  progress.className = 'v2-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<span></span>';
  document.body.append(progress);
  const fill = progress.firstElementChild;
  let scheduled = false;
  function updateProgress() {
    scheduled = false;
    const root = document.documentElement;
    const max = Math.max(1, root.scrollHeight - innerHeight);
    fill.style.transform = `scaleX(${Math.min(1, scrollY / max)})`;
  }
  addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  updateProgress();

  if (!reduce && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('.section-block, .quick-metrics, .workspace > .panel');
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.07, rootMargin: '0px 0px -35px 0px' });
    targets.forEach((element, index) => {
      element.classList.add('reveal-ready');
      element.style.transitionDelay = `${Math.min(index % 3, 2) * 80}ms`;
      observer.observe(element);
    });
  }

  const art = document.querySelector('.hero-art');
  if (!reduce && art && matchMedia('(pointer: fine)').matches) {
    art.closest('.hero').addEventListener('pointermove', event => {
      const rect = art.closest('.hero').getBoundingClientRect();
      art.style.setProperty('--v2-x', `${((event.clientX - rect.left) / rect.width - .5) * 24}px`);
      art.style.setProperty('--v2-y', `${((event.clientY - rect.top) / rect.height - .5) * 18}px`);
    }, { passive: true });
    art.closest('.hero').addEventListener('pointerleave', () => {
      art.style.setProperty('--v2-x', '0px');
      art.style.setProperty('--v2-y', '0px');
    });
  }

  if (!reduce && matchMedia('(pointer: fine)').matches) {
    const cursor = document.createElement('div');
    cursor.className = 'v2-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.append(cursor);
    document.addEventListener('pointermove', event => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      cursor.style.opacity = '1';
      cursor.classList.toggle('is-active', !!event.target.closest('a,button,summary'));
    }, { passive: true });
    document.addEventListener('pointerleave', () => { cursor.style.opacity = '0'; });
  }

  const transition = document.createElement('div');
  transition.className = 'v2-transition';
  transition.setAttribute('aria-hidden', 'true');
  document.body.append(transition);
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.pathname === location.pathname || !url.pathname.endsWith('.html')) return;
    url.searchParams.set('design', '2');
    if (reduce) {
      event.preventDefault();
      location.assign(url.href);
      return;
    }
    event.preventDefault();
    transition.classList.add('is-active');
    setTimeout(() => location.assign(url.href), 380);
  });
})();
