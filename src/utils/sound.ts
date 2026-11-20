let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

function createNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const frameCount = Math.max(1, Math.floor(sampleRate * durationSec));
  const buffer = ctx.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function triggerBambooClick(
  ctx: AudioContext,
  noiseBuffer: AudioBuffer,
  when: number,
  pitchHz: number,
  volume: number,
  isDrop = false
) {
  // Resonant wooden clack body
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = isDrop ? 'triangle' : 'sine';
  osc.frequency.setValueAtTime(pitchHz, when);
  osc.frequency.exponentialRampToValueAtTime(pitchHz * 0.62, when + (isDrop ? 0.09 : 0.04));

  oscGain.gain.setValueAtTime(0.0001, when);
  oscGain.gain.linearRampToValueAtTime(volume * 0.55, when + 0.003);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, when + (isDrop ? 0.11 : 0.045));

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + (isDrop ? 0.12 : 0.05));

  // Dry bamboo percussion transient (bandpass-filtered noise)
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(isDrop ? 1350 : pitchHz * 2.1, when);
  filter.Q.setValueAtTime(isDrop ? 5.5 : 8.5, when);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.0001, when);
  noiseGain.gain.linearRampToValueAtTime(volume * 0.75, when + 0.002);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, when + (isDrop ? 0.065 : 0.032));

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(when);
  noise.stop(when + (isDrop ? 0.07 : 0.036));
}

/**
 * Plays a procedural ~1.5s bamboo fortune stick shaking and single stick drop sound.
 * Must be invoked synchronously inside a user gesture handler for iOS Safari compatibility.
 */
export function playFortuneDrawSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const noiseBuffer = createNoiseBuffer(ctx, 0.08);

    // Phase 1: Shaking bamboo sticks inside the cylinder (0.04s -> 1.18s)
    const shakeOffsets = [
      0.04, 0.11, 0.17, 0.24, 0.30, 0.38, 0.45, 0.53,
      0.61, 0.69, 0.78, 0.86, 0.96, 1.06, 1.16,
    ];

    shakeOffsets.forEach((offset, index) => {
      const jitter = (Math.random() - 0.5) * 0.018;
      const pitch = 480 + (index % 4) * 85 + Math.random() * 90;
      const vol = 0.18 + Math.random() * 0.12;
      triggerBambooClick(ctx, noiseBuffer, now + offset + jitter, pitch, vol, false);

      // Secondary softer collision for layered bamboo texture
      if (index % 2 === 0) {
        triggerBambooClick(
          ctx,
          noiseBuffer,
          now + offset + 0.025 + jitter,
          pitch * 1.25,
          vol * 0.5,
          false
        );
      }
    });

    // Phase 2: Single winning stick dropping onto stone / wood altar (1.30s + bounce at 1.40s)
    triggerBambooClick(ctx, noiseBuffer, now + 1.30, 390, 0.38, true);
    triggerBambooClick(ctx, noiseBuffer, now + 1.40, 440, 0.20, true);
  } catch {
    // Ignore audio errors gracefully on restricted environments
  }
}
