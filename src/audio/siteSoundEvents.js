/** Semantic actions only: no observer, hover loop, audio device or media fetch. */
export function emitSiteSound(type, pan = 0) {
  window.dispatchEvent(new CustomEvent('haoqi-site-sound', { detail: { type, pan } }));
}

export function soundForActivation(element, location) {
  if (!element || element.disabled || element.getAttribute('aria-disabled') === 'true') return null;
  const explicit = element.getAttribute('data-site-sound');
  if (explicit) {
    if (explicit === 'none') return null;
    if (explicit === 'menu') return { type: element.getAttribute('aria-expanded') === 'true' ? 'menu-close' : 'menu-open' };
    const selected = element.getAttribute('aria-pressed') === 'true' || element.getAttribute('aria-current') === 'true' || element.classList.contains('is-active');
    if (selected && element.getAttribute('data-site-sound-repeat') !== 'true' && explicit === 'filter') return null;
    return { type: explicit };
  }
  if (element.closest('.work-array,.work-boot,.arcade-touch-controls') || element.tagName !== 'A') return null;
  const href = element.getAttribute('href');
  if (!href || href === '#' || href.startsWith('javascript:') || element.hasAttribute('download')) return null;
  const destination = new URL(href, location.href);
  if (destination.href === location.href && !element.target) return null;
  return { type: 'nav' };
}

export function attachSiteSoundActions(sound, target = window, page = document) {
  const explicit = event => {
    if (typeof event.detail?.type === 'string') sound.activate(event.detail.type, event.detail.pan || 0);
  };
  const click = event => {
    if (!event.isTrusted || event.button > 0) return;
    const control = event.target.closest?.('[data-site-sound],a[href]');
    const cue = soundForActivation(control, target.location);
    if (cue) sound.activate(cue.type, cue.pan || 0);
  };
  target.addEventListener('haoqi-site-sound', explicit);
  page.addEventListener('click', click, true);
  return () => { target.removeEventListener('haoqi-site-sound', explicit); page.removeEventListener('click', click, true); };
}
