/**
 * Procedural Web Audio Engine for SHINIGAMI: THE GOLDEN POT
 * Generates all sound effects synthesized in real-time via Web Audio API:
 * - 60Hz Fluorescent light hum with harmonics & flicker pops
 * - Adaptive footstep synthesis with acoustic room reverb (tight vs megalophobia cavern)
 * - Deep dimensional sub-drone & ventilation wind
 * - Distant eerie metallic pipe groans & clanks
 * - Heavy industrial door creak and latch mechanism
 * - Resonant sacred chime when discovering the Golden Pot
 */

window.AudioEngine = (function() {
  let ctx = null;
  let masterGain = null;
  let ambientGain = null;
  let sfxGain = null;
  let isInitialized = false;
  let isMuted = false;

  // Ambient nodes
  let humOsc1 = null;
  let humOsc2 = null;
  let humGain = null;
  let humFilter = null;
  let windNoise = null;
  let windGain = null;
  let windFilter = null;
  let subDroneOsc = null;
  let subDroneGain = null;

  // Environmental acoustic state
  let currentReverbDecay = 0.4; // 0.2s for claustrophobia, 3.8s for megalophobia
  let currentRoomScale = 'normal'; // 'tight', 'normal', 'enormous'
  let reverbConvolver = null;
  let reverbGain = null;

  // Random distant horror events timer
  let distantEventTimer = null;

  function init() {
    if (isInitialized) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioContextClass();

      // Master output bus
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.7, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Sub-buses
      ambientGain = ctx.createGain();
      ambientGain.gain.setValueAtTime(0.6, ctx.currentTime);
      ambientGain.connect(masterGain);

      sfxGain = ctx.createGain();
      sfxGain.gain.setValueAtTime(0.8, ctx.currentTime);
      sfxGain.connect(masterGain);

      // Setup Reverb Convolver
      setupReverb();

      // Setup Ambient Soundscapes
      startFluorescentHum();
      startVentilationAndDrone();
      scheduleDistantHorrorEvents();

      isInitialized = true;
    } catch (e) {
      console.warn("Web Audio API not supported or blocked", e);
    }
  }

  // Create an impulse response buffer for procedural algorithmic reverb
  function setupReverb() {
    reverbConvolver = ctx.createConvolver();
    updateReverbImpulse(1.0); // Default 1s decay

    reverbGain = ctx.createGain();
    reverbGain.gain.setValueAtTime(0.3, ctx.currentTime);

    reverbConvolver.connect(reverbGain);
    reverbGain.connect(masterGain);
  }

  function updateReverbImpulse(decayTime) {
    if (!ctx) return;
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * Math.max(0.2, decayTime));
    const impulse = ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = (i / length);
      // Exponential decay envelope
      const env = Math.exp(-n * (decayTime > 2.0 ? 3.0 : 6.0));
      left[i] = (Math.random() * 2 - 1) * env;
      right[i] = (Math.random() * 2 - 1) * env;
    }
    reverbConvolver.buffer = impulse;
    currentReverbDecay = decayTime;
  }

  // Sets acoustic space: 'tight' (claustrophobia), 'normal', or 'enormous' (megalophobia)
  function setAcousticSpace(scale) {
    if (!ctx || currentRoomScale === scale) return;
    currentRoomScale = scale;

    if (scale === 'tight') {
      updateReverbImpulse(0.25);
      reverbGain.gain.setTargetAtTime(0.12, ctx.currentTime, 0.2);
      if (windGain) windGain.gain.setTargetAtTime(0.02, ctx.currentTime, 0.5);
      if (humGain) humGain.gain.setTargetAtTime(0.25, ctx.currentTime, 0.5); // lights feel right over your head
    } else if (scale === 'enormous') {
      updateReverbImpulse(3.8); // Long colossal echoing reverb
      reverbGain.gain.setTargetAtTime(0.65, ctx.currentTime, 0.3);
      if (windGain) windGain.gain.setTargetAtTime(0.18, ctx.currentTime, 0.5); // faint cavernous breeze
      if (humGain) humGain.gain.setTargetAtTime(0.08, ctx.currentTime, 0.5); // lights high up
    } else {
      updateReverbImpulse(0.9);
      reverbGain.gain.setTargetAtTime(0.28, ctx.currentTime, 0.2);
      if (windGain) windGain.gain.setTargetAtTime(0.06, ctx.currentTime, 0.5);
      if (humGain) humGain.gain.setTargetAtTime(0.16, ctx.currentTime, 0.5);
    }
  }

  // 60Hz Fluorescent Ballast Hum
  function startFluorescentHum() {
    if (!ctx) return;

    // 60 Hz fundamental
    humOsc1 = ctx.createOscillator();
    humOsc1.type = 'sawtooth';
    humOsc1.frequency.setValueAtTime(60, ctx.currentTime);

    // 120 Hz 2nd harmonic
    humOsc2 = ctx.createOscillator();
    humOsc2.type = 'sine';
    humOsc2.frequency.setValueAtTime(120, ctx.currentTime);

    humFilter = ctx.createBiquadFilter();
    humFilter.type = 'bandpass';
    humFilter.frequency.setValueAtTime(180, ctx.currentTime);
    humFilter.Q.setValueAtTime(3.0, ctx.currentTime);

    humGain = ctx.createGain();
    humGain.gain.setValueAtTime(0.16, ctx.currentTime);

    humOsc1.connect(humFilter);
    humOsc2.connect(humFilter);
    humFilter.connect(humGain);
    humGain.connect(ambientGain);

    humOsc1.start();
    humOsc2.start();
  }

  // Ventilation Wind and Deep Sub-bass Dimensional Tone
  function startVentilationAndDrone() {
    if (!ctx) return;

    // Sub-drone (38 Hz)
    subDroneOsc = ctx.createOscillator();
    subDroneOsc.type = 'sine';
    subDroneOsc.frequency.setValueAtTime(38, ctx.currentTime);

    subDroneGain = ctx.createGain();
    subDroneGain.gain.setValueAtTime(0.22, ctx.currentTime);

    subDroneOsc.connect(subDroneGain);
    subDroneGain.connect(ambientGain);
    subDroneOsc.start();

    // Procedural Pink/Brown filtered noise for HVAC ventilation
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.15;
    }

    windNoise = ctx.createBufferSource();
    windNoise.buffer = noiseBuffer;
    windNoise.loop = true;

    windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(350, ctx.currentTime);

    windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.06, ctx.currentTime);

    windNoise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(ambientGain);
    windNoise.start();
  }

  // Electrical Flicker Pop Sound
  function playLightFlicker() {
    if (!ctx || !isInitialized) return;
    const now = ctx.currentTime;

    // Quick burst of static and pitch drop
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);

    // Subtle dip in hum during flicker
    if (humGain) {
      humGain.gain.setValueAtTime(0.02, now);
      humGain.gain.setTargetAtTime(0.16, now + 0.08, 0.1);
    }
  }

  // Shinigami Footstep / Spectral Glide Sound
  function playFootstep() {
    if (!ctx || !isInitialized) return;
    const now = ctx.currentTime;

    // Low damp impact thud
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const startFreq = 75 + Math.random() * 15;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.18, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(oscGain);
    oscGain.connect(sfxGain);
    if (reverbConvolver) oscGain.connect(reverbConvolver);

    osc.start(now);
    osc.stop(now + 0.17);

    // Soft fabric / carpet scuff noise
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(currentRoomScale === 'enormous' ? 800 : 500, now);
    noiseFilter.Q.setValueAtTime(2.0, now);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.09, now);

    noise.connect(noiseFilter);
    noiseFilter.connect(nGain);
    nGain.connect(sfxGain);
    if (reverbConvolver) nGain.connect(reverbConvolver);

    noise.start(now);
  }

  // Blue Metal Door Creak & Heavy Latch Sound
  function playDoorOpen() {
    if (!ctx || !isInitialized) return;
    const now = ctx.currentTime;

    // 1. Metal latch click / clunk
    const latchOsc = ctx.createOscillator();
    latchOsc.type = 'triangle';
    latchOsc.frequency.setValueAtTime(350, now);
    latchOsc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

    const latchGain = ctx.createGain();
    latchGain.gain.setValueAtTime(0.35, now);
    latchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    latchOsc.connect(latchGain);
    latchGain.connect(sfxGain);
    if (reverbConvolver) latchGain.connect(reverbConvolver);
    latchOsc.start(now);
    latchOsc.stop(now + 0.13);

    // 2. Slow industrial metal hinge squeal / groaning creak
    const squealOsc = ctx.createOscillator();
    squealOsc.type = 'sawtooth';
    squealOsc.frequency.setValueAtTime(280, now + 0.05);
    squealOsc.frequency.linearRampToValueAtTime(420, now + 0.35);
    squealOsc.frequency.exponentialRampToValueAtTime(190, now + 0.65);

    const squealFilter = ctx.createBiquadFilter();
    squealFilter.type = 'bandpass';
    squealFilter.frequency.setValueAtTime(380, now + 0.05);
    squealFilter.Q.setValueAtTime(8.0, now + 0.05);

    const squealGain = ctx.createGain();
    squealGain.gain.setValueAtTime(0.001, now);
    squealGain.gain.linearRampToValueAtTime(0.18, now + 0.12);
    squealGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    squealOsc.connect(squealFilter);
    squealFilter.connect(squealGain);
    squealGain.connect(sfxGain);
    if (reverbConvolver) squealGain.connect(reverbConvolver);

    squealOsc.start(now + 0.05);
    squealOsc.stop(now + 0.72);
  }

  // Distant Horror Atmosphere: Metallic Pipe Groans & Far-off Clanks
  function scheduleDistantHorrorEvents() {
    const nextInterval = 12000 + Math.random() * 20000; // Every 12-32 seconds
    distantEventTimer = setTimeout(() => {
      playDistantMetalSound();
      scheduleDistantHorrorEvents();
    }, nextInterval);
  }

  function playDistantMetalSound() {
    if (!ctx || !isInitialized) return;
    const now = ctx.currentTime;
    const type = Math.random();

    if (type < 0.6) {
      // Distant pipe groan / structural stress
      const groan = ctx.createOscillator();
      groan.type = 'sine';
      groan.frequency.setValueAtTime(95, now);
      groan.frequency.linearRampToValueAtTime(115, now + 1.2);
      groan.frequency.linearRampToValueAtTime(82, now + 2.4);

      const groanGain = ctx.createGain();
      groanGain.gain.setValueAtTime(0.001, now);
      groanGain.gain.linearRampToValueAtTime(0.12, now + 0.6);
      groanGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

      groan.connect(groanGain);
      groanGain.connect(sfxGain);
      if (reverbConvolver) groanGain.connect(reverbConvolver);

      groan.start(now);
      groan.stop(now + 2.9);
    } else {
      // Distant metallic clank (echoing far away)
      const clank = ctx.createOscillator();
      clank.type = 'triangle';
      clank.frequency.setValueAtTime(220, now);
      clank.frequency.exponentialRampToValueAtTime(90, now + 0.2);

      const clankGain = ctx.createGain();
      clankGain.gain.setValueAtTime(0.15, now);
      clankGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      clank.connect(clankGain);
      clankGain.connect(sfxGain);
      if (reverbConvolver) clankGain.connect(reverbConvolver);

      clank.start(now);
      clank.stop(now + 0.45);
    }
  }

  // Golden Pot Discovered: Sacred, Ethereal, Harmonious Shimmer Chord
  function playGoldenPotDiscovery() {
    if (!ctx || !isInitialized) return;
    const now = ctx.currentTime;

    // Harmonic chord frequencies (A major / celestial death spirit transcendence: 220, 277.18, 329.63, 440, 554.37, 659.25, 880)
    const freqs = [220, 329.63, 440, 554.37, 659.25, 880];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.15 / (idx * 0.5 + 1), now + idx * 0.1 + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 7.0);

      osc.connect(gain);
      gain.connect(sfxGain);
      if (reverbConvolver) gain.connect(reverbConvolver);

      osc.start(now + idx * 0.1);
      osc.stop(now + 7.5);
    });
  }

  // Master Volume Setter
  function setMasterVolume(val) {
    if (!masterGain || !ctx) return;
    masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), ctx.currentTime, 0.05);
  }

  // Ambient Volume Setter
  function setAmbientVolume(val) {
    if (!ambientGain || !ctx) return;
    ambientGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), ctx.currentTime, 0.05);
  }

  // Resume context if paused by browser autoplay policy
  function resume() {
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  return {
    init,
    resume,
    setAcousticSpace,
    playFootstep,
    playDoorOpen,
    playLightFlicker,
    playGoldenPotDiscovery,
    playDistantMetalSound,
    setMasterVolume,
    setAmbientVolume
  };
})();
