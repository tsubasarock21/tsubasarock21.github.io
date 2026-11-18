/* Local navigation and game lifecycle helpers for the static site. */
(() => {
  let active = false;
  function language() {
    const english = document.documentElement.lang.startsWith('en');
    for (const link of document.querySelectorAll('[data-lab-return]')) {
      link.textContent = english ? '← Back to LAB' : '← ラボへ戻る';
      link.setAttribute('aria-label', english ? 'Back to Tsubasa Rock LAB' : 'Tsubasa Rock LABへ戻る');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', language, {once: true});
  else language();
  new MutationObserver(language).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  const api = Object.freeze({
    start() { active = true; },
    end() { active = false; },
    pause() {},
    resume() {},
    share() {},
    language,
    get active() { return active; }
  });
  globalThis.LabMetrics = api;
  globalThis.LabMetricsV2 = Object.freeze({install: () => api});
})();

// These shared helpers run on the home and game pages only.
(() => {
  if (location.origin !== 'https://tsubasarock21.github.io' ||
      new URLSearchParams(location.search).has('no_metrics')) return;
  const src = 'https://static.cloudflareinsights.com/beacon.min.js';
  if (document.querySelector('script[src="' + src + '"]')) return;
  const beacon = document.createElement('script');
  beacon.type = 'module';
  beacon.src = src;
  beacon.setAttribute('data-cf-beacon', JSON.stringify({token: '64b2af7c70b74daf81f24ee56bc8acd8'}));
  document.head.append(beacon);
})();
