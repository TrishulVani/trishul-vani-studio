(() => {
  'use strict';

  const productionBackend = 'https://trishul-vani-studio.onrender.com';
  const productionHosts = new Set(['trishul-vani-studio.onrender.com']);
  const backend = productionHosts.has(location.hostname) ? productionBackend : '';
  const tokenKey = 'trishul-vani-workspace-v1';

  function workspaceToken() {
    let token = localStorage.getItem(tokenKey) || '';
    if (!/^[a-f0-9]{64}$/.test(token)) {
      const bytes = crypto.getRandomValues(new Uint8Array(32));
      token = [...bytes].map(value => value.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(tokenKey, token);
    }
    return token;
  }

  function apiUrl(path) {
    if (!backend || typeof path !== 'string' || !path.startsWith('/api/')) return path;
    return `${backend}${path}${path.includes('?') ? '&' : '?'}workspace=${workspaceToken()}`;
  }

  const nativeFetch = window.fetch.bind(window);
  window.trishulApiUrl = apiUrl;
  window.fetch = (input, options = {}) => {
    const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const path = raw.startsWith(location.origin) ? raw.slice(location.origin.length) : raw;
    if (!backend || !path.startsWith('/api/')) return nativeFetch(input, options);
    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    new Headers(options.headers || {}).forEach((value, key) => headers.set(key, value));
    headers.set('X-Trishul-Workspace', workspaceToken());
    return nativeFetch(backend + path, { ...options, headers, credentials: 'omit' });
  };

  // Keep this bootstrap network-free. The static site must paint even while
  // the optional API is asleep; pages request the API only when they need it.
})();
