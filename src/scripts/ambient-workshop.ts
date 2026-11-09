/** Page-scoped scene; music has a separate document lifetime. */
let userPaused = false;
let disposeScene: (() => void) | undefined;
export function initAmbientWorkshop() {
  disposeScene?.();
  disposeScene = undefined;
  const element = document.querySelector<HTMLElement>('.ambient-workshop');
  if (!element) return;
  const root: HTMLElement = element;
  const events = new AbortController();
  const options = { signal: events.signal };
  const get = <T extends Element>(selector: string) => root.querySelector<T>(selector)!;
  const toolbar = get<HTMLElement>('.ambient-toolbar');
  const stay = get<HTMLButtonElement>('.stay-button');
  const back = get<HTMLButtonElement>('.return-button');
  const motion = get<HTMLButtonElement>('.motion-button');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let inView = false, pageActive = true, sceneAvailable = true, expanded = false, scrollY = 0;
  let blinkTimer: ReturnType<typeof setTimeout> | undefined;
  const blink = root.querySelector<HTMLImageElement>('.blink-overlay');
  let blinkReady = !!blink?.complete && blink.naturalWidth === 1659 && blink.naturalHeight === 948;
  function updateMotion() {
    const active = !userPaused && !reduced.matches && !document.hidden && inView && pageActive && sceneAvailable;
    root.dataset.motion = active ? 'running' : 'paused';
    motion.textContent = !sceneAvailable ? 'Scene unavailable' : reduced.matches ? 'Reduced motion' : userPaused ? 'Resume motion' : 'Pause motion';
    motion.setAttribute('aria-pressed', String(userPaused || reduced.matches));
    motion.disabled = reduced.matches || !sceneAvailable;
    motion.title = reduced.matches ? 'Following your device’s reduced-motion preference' : '';
    clearTimeout(blinkTimer);
    blink?.classList.remove('eyes-closed');
    if (active && blinkReady) scheduleBlink();
  }
  function scheduleBlink() {
    blinkTimer = setTimeout(() => {
      if (root!.dataset.motion !== 'running') return;
      blink?.classList.add('eyes-closed');
      blinkTimer = setTimeout(() => { blink?.classList.remove('eyes-closed'); scheduleBlink(); }, 155);
    }, 6200 + Math.random() * 6500);
  }
  blink?.addEventListener('load', () => { blinkReady = blink.naturalWidth === 1659 && blink.naturalHeight === 948; updateMotion(); }, options);
  blink?.addEventListener('error', () => { blinkReady = false; blink.hidden = true; updateMotion(); }, options);
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting && entry.intersectionRatio >= .1;
    updateMotion();
  }, { threshold: [0, .1] }) : null;
  observer?.observe(get('.scene-viewport'));
  // Without viewport observation, retain the complete static composition.
  motion.addEventListener('click', () => { userPaused = !userPaused; updateMotion(); }, options);
  reduced.addEventListener('change', updateMotion, options);
  document.addEventListener('visibilitychange', updateMotion, options);
  function setExpanded(value: boolean) {
    expanded = value;
    if (value) scrollY = window.scrollY;
    document.documentElement.classList.toggle('ambient-mode', value);
    stay.setAttribute('aria-expanded', String(value));
    back.hidden = !value;
    get<HTMLElement>('.ambient-heading').hidden = !value;
    get<HTMLDetailsElement>('.sound-mixer').open = false;
    if (value) back.focus({ preventScroll: true });
    else { window.scrollTo(0, scrollY); stay.focus({ preventScroll: true }); }
    updateMotion();
  }
  stay.addEventListener('click', () => setExpanded(true), options);
  back.addEventListener('click', () => setExpanded(false), options);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (get<HTMLDetailsElement>('.sound-mixer').open) { get<HTMLDetailsElement>('.sound-mixer').open = false; get<HTMLElement>('.sound-mixer summary').focus(); }
      else if (expanded) setExpanded(false);
    }
  }, options);
  window.addEventListener('pagehide', () => { pageActive = false; updateMotion(); }, options);
  window.addEventListener('pageshow', () => { pageActive = true; updateMotion(); }, options);
  const sceneImage = get<HTMLImageElement>('.scene-image');
  const imageFailed = () => {
    sceneAvailable = false;
    sceneImage.hidden = true; get<HTMLElement>('.scene-fallback').hidden = false;
    get<SVGElement>('.scene-weather').style.display = 'none';
    if (blink) blink.hidden = true;
    root.classList.add('scene-unavailable');
    get<HTMLElement>('.scene-canvas').setAttribute('aria-label', 'The workshop illustration is unavailable. The approved sprite of Tinker Panda, the lab’s resident mascot, is shown instead.');
    updateMotion();
  };
  sceneImage.addEventListener('error', imageFailed, options);
  if (sceneImage.complete && !sceneImage.naturalWidth) imageFailed();
  toolbar.hidden = false;
  updateMotion();
  disposeScene = () => {
    pageActive = false;
    clearTimeout(blinkTimer);
    observer?.disconnect();
    events.abort();
    document.documentElement.classList.remove('ambient-mode');
  };
}

// Bundled module executes once, including when Home is first visited later.
document.addEventListener('astro:before-swap', () => { disposeScene?.(); disposeScene = undefined; });
document.addEventListener('astro:page-load', initAmbientWorkshop);
