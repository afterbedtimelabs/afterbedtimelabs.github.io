/** One scene, two views. Sound is deliberately never restored from storage. */
export function initAmbientWorkshop() {
  const element = document.querySelector<HTMLElement>('.ambient-workshop');
  if (!element) return;
  const root: HTMLElement = element;
  const get = <T extends Element>(selector: string) => root.querySelector<T>(selector)!;
  const toolbar = get<HTMLElement>('.ambient-toolbar');
  const stay = get<HTMLButtonElement>('.stay-button');
  const back = get<HTMLButtonElement>('.return-button');
  const motion = get<HTMLButtonElement>('.motion-button');
  const mute = get<HTMLButtonElement>('.mute-button');
  const status = get<HTMLElement>('.audio-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false, inView = false, pageActive = true, sceneAvailable = true, muted = false, expanded = false, scrollY = 0;
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
  blink?.addEventListener('load', () => { blinkReady = blink.naturalWidth === 1659 && blink.naturalHeight === 948; updateMotion(); });
  blink?.addEventListener('error', () => { blinkReady = false; blink.hidden = true; updateMotion(); });
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting && entry.intersectionRatio >= .1;
    updateMotion();
  }, { threshold: [0, .1] }) : null;
  observer?.observe(get('.scene-viewport'));
  // Without viewport observation, retain the complete static composition.
  motion.addEventListener('click', () => { userPaused = !userPaused; updateMotion(); });
  reduced.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', updateMotion);
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
  stay.addEventListener('click', () => setExpanded(true));
  back.addEventListener('click', () => setExpanded(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (get<HTMLDetailsElement>('.sound-mixer').open) { get<HTMLDetailsElement>('.sound-mixer').open = false; get<HTMLElement>('.sound-mixer summary').focus(); }
      else if (expanded) setExpanded(false);
    }
  });
  const kinds = ['music', 'rain'] as const;
  type Kind = typeof kinds[number];
  const tracks = Object.fromEntries(kinds.map(kind => [kind, {
    audio: get<HTMLAudioElement>(`[data-audio="${kind}"]`), button: get<HTMLButtonElement>(`[data-audio-toggle="${kind}"]`),
    wanted: false, loading: false, error: '', token: 0, timer: undefined as ReturnType<typeof setTimeout> | undefined,
  }])) as Record<Kind, { audio: HTMLAudioElement; button: HTMLButtonElement; wanted: boolean; loading: boolean; error: string; token: number; timer: ReturnType<typeof setTimeout> | undefined }>;
  function renderSound() {
    for (const kind of kinds) {
      const t = tracks[kind];
      t.button.textContent = t.loading ? `Cancel ${kind}` : kind === 'music' ? (t.wanted ? 'Ⅱ Pause music' : '▷ Play music') : (t.wanted ? 'Rain on' : 'Rain off');
      t.button.setAttribute('aria-pressed', String(t.wanted));
      t.button.setAttribute('aria-busy', String(t.loading));
    }
    const error = kinds.map(kind => tracks[kind].error).filter(Boolean).join(' ');
    status.textContent = error || (kinds.some(kind => tracks[kind].loading) ? 'Loading sound… You can cancel at any time.' : muted ? 'All sound muted.' : !tracks.music.wanted && !tracks.rain.wanted ? 'Sound is off. Make yourself at home.' : `${tracks.music.wanted ? 'Music playing' : 'Music paused'} · ${tracks.rain.wanted ? 'Rain on' : 'Rain off'}`);
    mute.textContent = muted ? 'Unmute sound' : 'Mute all sound';
    mute.setAttribute('aria-pressed', String(muted));
  }
  function stop(kind: Kind) {
    const t = tracks[kind]; t.token++; t.wanted = false; t.loading = false;
    clearTimeout(t.timer); t.audio.pause();
  }
  function fail(kind: Kind) {
    stop(kind);
    tracks[kind].error = `${kind === 'music' ? 'Music' : 'Rain'} couldn’t play. Check your connection and ${kind === 'music' ? 'press Play music' : 'turn Rain on'} to retry.`;
    renderSound();
  }
  for (const kind of kinds) {
    const t = tracks[kind];
    const volume = get<HTMLInputElement>(`#${kind}-volume`);
    t.audio.volume = Number(volume.value) / 100;
    volume.addEventListener('input', () => {
      t.audio.volume = Number(volume.value) / 100;
      get<HTMLOutputElement>(`#${kind}-level`).value = `${volume.value}%`;
    });
    t.button.addEventListener('click', async () => {
      t.error = '';
      if (t.wanted) { stop(kind); renderSound(); return; }
      t.wanted = true; t.loading = true;
      const token = ++t.token;
      renderSound();
      t.timer = setTimeout(() => { if (token === t.token) fail(kind); }, 12000);
      try {
        if (t.audio.error) t.audio.load();
        await t.audio.play();
        if (token !== t.token) { if (!t.wanted) t.audio.pause(); return; }
        clearTimeout(t.timer); t.loading = false; renderSound();
      } catch { if (token === t.token) fail(kind); }
    });
    t.audio.addEventListener('error', () => { if (t.wanted) fail(kind); });
    t.audio.addEventListener('waiting', () => { if (t.wanted) { t.loading = true; renderSound(); clearTimeout(t.timer); t.timer = setTimeout(() => fail(kind), 12000); } });
    t.audio.addEventListener('playing', () => { if (t.wanted) { t.loading = false; clearTimeout(t.timer); renderSound(); } else t.audio.pause(); });
    // Keep the controls truthful after OS/browser media controls or an interruption.
    t.audio.addEventListener('pause', () => { if (t.wanted && t.audio.paused) { stop(kind); renderSound(); } });
  }
  mute.addEventListener('click', () => { muted = !muted; kinds.forEach(kind => { tracks[kind].audio.muted = muted; }); renderSound(); });
  window.addEventListener('pagehide', () => { pageActive = false; kinds.forEach(stop); updateMotion(); renderSound(); });
  window.addEventListener('pageshow', () => { pageActive = true; updateMotion(); });
  const sceneImage = get<HTMLImageElement>('.scene-image');
  const imageFailed = () => {
    sceneAvailable = false;
    sceneImage.hidden = true; get<HTMLElement>('.scene-fallback').hidden = false;
    get<SVGElement>('.scene-weather').style.display = 'none';
    if (blink) blink.hidden = true;
    root.classList.add('scene-unavailable');
    get<HTMLElement>('.scene-canvas').setAttribute('aria-label', 'The workshop illustration is unavailable. The approved Tinker Panda sprite is shown instead.');
    updateMotion();
  };
  sceneImage.addEventListener('error', imageFailed);
  if (sceneImage.complete && !sceneImage.naturalWidth) imageFailed();
  toolbar.hidden = false;
  updateMotion(); renderSound();
}
