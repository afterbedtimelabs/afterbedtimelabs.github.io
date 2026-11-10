/** One media element and one controller per document lifetime. Never serialize playback. */
const audio = document.querySelector<HTMLAudioElement>('[data-audio="music"]')!;
let activated = false, wanted = false, loading = false, error = '', token = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
audio.volume = .4;

function render() {
  const interior = document.querySelector<HTMLElement>('.interior-music');
  const showInterior = activated && !document.querySelector('.ambient-workshop');
  if (interior) interior.hidden = !showInterior;
  document.body.classList.toggle('has-interior-music', showInterior);
  document.querySelectorAll<HTMLButtonElement>('[data-audio-toggle="music"]').forEach(button => {
    button.textContent = loading ? 'Cancel music' : wanted ? 'Pause music' : 'Play music';
    button.setAttribute('aria-pressed', String(wanted));
    button.setAttribute('aria-busy', String(loading));
  });
  document.querySelectorAll<HTMLButtonElement>('.mute-button').forEach(button => {
    button.textContent = audio.muted ? 'Unmute music' : 'Mute music';
    button.setAttribute('aria-pressed', String(audio.muted));
  });
  const volume = String(Math.round(audio.volume * 100));
  document.querySelectorAll<HTMLInputElement>('[data-music-volume]').forEach(input => { input.value = volume; });
  document.querySelectorAll<HTMLOutputElement>('[data-music-level]').forEach(output => { output.value = `${volume}%`; });
  document.querySelectorAll<HTMLElement>('.audio-status').forEach(status => {
    status.textContent = error || (loading ? 'Loading music. You can cancel at any time.' : audio.muted ? 'Music muted.' : wanted ? 'Music playing.' : 'Music paused. Press Play music when you are ready.');
  });
}
function stop() {
  token++; wanted = false; loading = false;
  clearTimeout(timer); audio.pause(); render();
}
function fail() {
  stop(); error = "Music couldn’t play. Check your connection and press Play music to retry."; render();
}
async function toggle() {
  activated = true; error = '';
  if (wanted) { stop(); return; }
  wanted = true; loading = true;
  const request = ++token;
  render();
  clearTimeout(timer);
  timer = setTimeout(() => { if (request === token) fail(); }, 12000);
  try {
    if (audio.error) audio.load();
    await audio.play();
    if (request !== token) { if (!wanted) audio.pause(); return; }
    clearTimeout(timer); loading = false; render();
  } catch { if (request === token) fail(); }
}
// Delegation binds once; new controls always operate on the original media element.
document.addEventListener('click', event => {
  if (!(event.target instanceof Element)) return;
  if (event.target.closest('[data-audio-toggle="music"]')) void toggle();
  else if (event.target.closest('.mute-button')) { audio.muted = !audio.muted; render(); }
});
document.addEventListener('input', event => {
  if (event.target instanceof HTMLInputElement && event.target.matches('[data-music-volume]')) {
    audio.volume = Number(event.target.value) / 100; render();
  }
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const mixer = document.querySelector<HTMLDetailsElement>('.interior-music .sound-mixer[open]');
  if (mixer) { mixer.open = false; mixer.querySelector<HTMLElement>('summary')?.focus(); }
});
audio.addEventListener('error', () => { if (wanted) fail(); });
audio.addEventListener('waiting', () => {
  if (!wanted) return;
  loading = true; render(); clearTimeout(timer); timer = setTimeout(fail, 12000);
});
audio.addEventListener('playing', () => {
  if (!wanted) { audio.pause(); return; }
  loading = false; clearTimeout(timer); render();
});
audio.addEventListener('pause', () => { if (wanted && audio.paused) stop(); });
audio.addEventListener('volumechange', render);
document.addEventListener('astro:after-swap', render);
document.addEventListener('astro:page-load', render);
// Full-document departures (including bfcache) stop sound. ClientRouter swaps do not.
window.addEventListener('pagehide', stop);
render();
