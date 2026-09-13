const isClient = typeof window !== 'undefined';

const audioCache: Record<string, HTMLAudioElement> = {};

function getAudio(path: string, defaultVolume = 0.3): HTMLAudioElement | null {
  if (!isClient) return null;
  if (!audioCache[path]) {
    const audio = new Audio(path);
    audio.volume = defaultVolume;
    audioCache[path] = audio;
  }
  return audioCache[path];
}

let lastPlayTime = 0;
const DEBOUNCE_MS = 80;

function playSound(path: string, volume = 0.3): void {
  const now = Date.now();
  if (now - lastPlayTime < DEBOUNCE_MS) return;
  lastPlayTime = now;

  try {
    const sound = getAudio(path, volume);
    if (!sound) return;
    sound.volume = volume;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  } catch {}
}

let trackAudioInstance: HTMLAudioElement | null = null;
let openingAudioInstance: HTMLAudioElement | null = null;

export const soundService = {
  playOpeningSound() {
    if (!isClient) return;
    if (!openingAudioInstance) {
      openingAudioInstance = new Audio('/sounds/START.mp4');
      openingAudioInstance.loop = true;
      openingAudioInstance.volume = 0.75;
    }
    openingAudioInstance.muted = false;
    const promise = openingAudioInstance.play();
    if (promise !== undefined) {
      promise.catch(() => {
        // Autoplay may be deferred until first user interaction
      });
    }
  },

  stopOpeningSound() {
    if (openingAudioInstance) {
      openingAudioInstance.pause();
      openingAudioInstance.currentTime = 0;
    }
  },

  playEngineRoar() {
    playSound('/sounds/dragon-studio-car-engine-372477.mp3', 0.45);
  },

  playInterfaceTone() {
    playSound('/sounds/universfield-interface-124464.mp3', 0.35);
  },

  playSwoosh() {
    playSound('/sounds/universfield-swoosh-04-326155.mp3', 0.35);
  },

  playUIClick() {
    playSound('/sounds/freesound_community-ui-click-43196.mp3', 0.25);
  },

  playRacecarPass() {
    playSound('/sounds/dragon-studio-racecar-rushing-by-386164.mp3', 0.4);
  },

  playConfirmTap() {
    playSound('/sounds/existentialtaco-confirm-tap-394001.mp3', 0.35);
  },

  playAccordionChime() {
    playSound('/sounds/soundreality-interface-14-204782.mp3', 0.3);
  },

  toggleTrackAudio(enable: boolean) {
    if (!isClient) return;
    if (enable) {
      if (!trackAudioInstance) {
        trackAudioInstance = new Audio('/sounds/dragon-studio-car-engine-372477.mp3');
        trackAudioInstance.loop = true;
        trackAudioInstance.volume = 0.12;
      }
      trackAudioInstance.currentTime = 0;
      trackAudioInstance.play().catch(() => {});
    } else if (trackAudioInstance) {
      trackAudioInstance.pause();
    }
  },

  stopTrackAudio() {
    if (trackAudioInstance) {
      trackAudioInstance.pause();
    }
  },
};

