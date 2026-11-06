// Web Audio API Ambient Sound Generator & Visualizer

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentSourceNodes: { disconnect: () => void }[] = [];
  private currentAmbience: 'none' | 'rain' | 'hearth' | 'stream' | 'drone' = 'none';
  private masterGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public stop() {
    this.currentSourceNodes.forEach(node => {
      try {
        node.disconnect();
      } catch (e) {
        // ignore
      }
    });
    this.currentSourceNodes = [];
    this.currentAmbience = 'none';
  }

  public playAmbience(type: 'rain' | 'hearth' | 'stream' | 'drone') {
    this.initCtx();
    this.stop();
    if (!this.ctx || !this.masterGain) return;

    this.currentAmbience = type;

    if (type === 'rain') {
      // Pink noise + lowpass
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);

      const rainGain = this.ctx.createGain();
      rainGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(rainGain);
      rainGain.connect(this.masterGain);

      whiteNoise.start(0);
      this.currentSourceNodes.push({
        disconnect: () => {
          whiteNoise.stop();
          whiteNoise.disconnect();
          filter.disconnect();
          rainGain.disconnect();
        }
      });
    } else if (type === 'drone') {
      // 432 Hz soothing warm chord
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc3 = this.ctx.createOscillator();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(108, this.ctx.currentTime); // A2 approx
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(216, this.ctx.currentTime);
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(324, this.ctx.currentTime); // E

      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      osc1.connect(droneGain);
      osc2.connect(droneGain);
      osc3.connect(droneGain);
      droneGain.connect(this.masterGain);

      osc1.start();
      osc2.start();
      osc3.start();

      this.currentSourceNodes.push({
        disconnect: () => {
          osc1.stop();
          osc2.stop();
          osc3.stop();
          osc1.disconnect();
          osc2.disconnect();
          osc3.disconnect();
          droneGain.disconnect();
        }
      });
    } else if (type === 'hearth' || type === 'stream') {
      // Low rumble + gentle filtered noise
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.2;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = type === 'hearth' ? 'bandpass' : 'lowpass';
      filter.frequency.setValueAtTime(type === 'hearth' ? 400 : 650, this.ctx.currentTime);

      const localGain = this.ctx.createGain();
      localGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(localGain);
      localGain.connect(this.masterGain);

      noise.start();
      this.currentSourceNodes.push({
        disconnect: () => {
          noise.stop();
          noise.disconnect();
          filter.disconnect();
          localGain.disconnect();
        }
      });
    }
  }

  public getCurrentAmbience() {
    return this.currentAmbience;
  }
}

export const ambientSound = new AmbientSoundEngine();
