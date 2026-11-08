import typingTiming from './typing-timing.json';
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
  let typingTimer: ReturnType<typeof setTimeout> | undefined;
  const typing = get<HTMLCanvasElement>('.typing-overlay');
  const pen = typing.getContext('2d');
  const atlas = new Image();
  let typingReady = false;
  function restPaws() { typing.dataset.pose = 'rest'; typing.style.display = 'none'; }
  function scheduleTyping() {
    const {minimum, maximum} = typingTiming.restMs;
    typingTimer = setTimeout(() => typePose(0), minimum + Math.random() * (maximum - minimum));
  }
  function typePose(step: number) {
    if (root.dataset.motion !== 'running' || !typingReady || !pen) return;
    const cel = typingTiming.burst[step];
    if (!cel) { restPaws(); scheduleTyping(); return; }
    pen.imageSmoothingEnabled = false;
    pen.clearRect(0, 0, 300, 170);
    pen.drawImage(atlas, cel.pose * 300, 0, 300, 170, 0, 0, 300, 170);
    typing.dataset.pose = typingTiming.poses[cel.pose].name;
    typing.style.display = 'block';
    typingTimer = setTimeout(() => typePose(step + 1), cel.ms);
  }
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
    clearTimeout(typingTimer);
    restPaws();
    blink?.classList.remove('eyes-closed');
    if (active && blinkReady) scheduleBlink();
    if (active && typingReady) scheduleTyping();
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
  atlas.addEventListener('load', () => { typingReady = !!pen && atlas.naturalWidth === 2100 && atlas.naturalHeight === 170; updateMotion(); });
  atlas.addEventListener('error', () => { typingReady = false; clearTimeout(typingTimer); restPaws(); });
  atlas.src = '/images/ambient/typing-v1-1.webp';
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
  // Audio is opt-in and has no saved playback or rain preferences.
  const music = {
    audio: get<HTMLAudioElement>('[data-audio="music"]'), button: get<HTMLButtonElement>('[data-audio-toggle="music"]'),
    wanted: false, loading: false, error: '', token: 0, timer: undefined as ReturnType<typeof setTimeout> | undefined,
  };
  function renderSound() {
    music.button.textContent = music.loading ? 'Cancel music' : music.wanted ? 'Ⅱ Pause music' : '▷ Play music';
    music.button.setAttribute('aria-pressed', String(music.wanted));
    music.button.setAttribute('aria-busy', String(music.loading));
    status.textContent = music.error || (music.loading ? 'Loading music… You can cancel at any time.' : muted ? 'Music muted.' : music.wanted ? 'Music playing.' : 'Sound is off. Make yourself at home.');
    mute.textContent = muted ? 'Unmute music' : 'Mute music';
    mute.setAttribute('aria-pressed', String(muted));
  }
  function stopMusic() {
    music.token++; music.wanted = false; music.loading = false;
    clearTimeout(music.timer); music.audio.pause();
  }
  function failMusic() {
    stopMusic();
    music.error = 'Music couldn’t play. Check your connection and press Play music to retry.';
    renderSound();
  }
  const volume = get<HTMLInputElement>('#music-volume');
  music.audio.volume = Number(volume.value) / 100;
  volume.addEventListener('input', () => {
    music.audio.volume = Number(volume.value) / 100;
    get<HTMLOutputElement>('#music-level').value = `${volume.value}%`;
  });
  music.button.addEventListener('click', async () => {
    music.error = '';
    if (music.wanted) { stopMusic(); renderSound(); return; }
    music.wanted = true; music.loading = true;
    const token = ++music.token;
    renderSound();
    music.timer = setTimeout(() => { if (token === music.token) failMusic(); }, 12000);
    try {
      if (music.audio.error) music.audio.load();
      await music.audio.play();
      if (token !== music.token) { if (!music.wanted) music.audio.pause(); return; }
      clearTimeout(music.timer); music.loading = false; renderSound();
    } catch { if (token === music.token) failMusic(); }
  });
  music.audio.addEventListener('error', () => { if (music.wanted) failMusic(); });
  music.audio.addEventListener('waiting', () => { if (music.wanted) { music.loading = true; renderSound(); clearTimeout(music.timer); music.timer = setTimeout(failMusic, 12000); } });
  music.audio.addEventListener('playing', () => { if (music.wanted) { music.loading = false; clearTimeout(music.timer); renderSound(); } else music.audio.pause(); });
  // Keep the controls truthful after OS/browser media controls or an interruption.
  music.audio.addEventListener('pause', () => { if (music.wanted && music.audio.paused) { stopMusic(); renderSound(); } });
  mute.addEventListener('click', () => { muted = !muted; music.audio.muted = muted; renderSound(); });
  window.addEventListener('pagehide', () => { pageActive = false; stopMusic(); updateMotion(); renderSound(); });
  window.addEventListener('pageshow', () => { pageActive = true; updateMotion(); });
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
  sceneImage.addEventListener('error', imageFailed);
  if (sceneImage.complete && !sceneImage.naturalWidth) imageFailed();
  toolbar.hidden = false;
  updateMotion(); renderSound();
}
