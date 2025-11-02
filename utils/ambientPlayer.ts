export type Sound = 'rain' | 'fire' | 'cafe' | 'whiteNoise' | 'brownNoise' | 'synthPad';

class AmbientPlayer {
  private audioContext: AudioContext | null = null;
  private sourceNode: AudioScheduledSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.2; // Default soft volume
  private synthOscillators: OscillatorNode[] = [];

  private getContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
    }
    return this.audioContext;
  }

  stop() {
    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
      } catch (e) {
        // Can throw error if already stopped
      }
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
     if (this.synthOscillators.length > 0) {
      this.synthOscillators.forEach(osc => {
        try {
            osc.stop();
            osc.disconnect();
        } catch (e) {}
      });
      this.synthOscillators = [];
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }

  play(sound: Sound) {
    this.stop();
    const context = this.getContext();
    this.gainNode = context.createGain();
    this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : this.volume, context.currentTime);
    this.gainNode.connect(context.destination);

    const bufferSize = context.sampleRate * 2; // 2 seconds of noise

    const createNoiseSource = (noiseGenerator: (output: Float32Array) => void) => {
        const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        noiseGenerator(output);
        const source = context.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;
        return source;
    }

    if (sound === 'rain') {
      this.sourceNode = createNoiseSource(output => {
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
      });
      const bandpass = context.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 1200;
      bandpass.Q.value = 0.6;
      this.sourceNode.connect(bandpass);
      bandpass.connect(this.gainNode);

    } else if (sound === 'fire') {
       this.sourceNode = createNoiseSource(output => {
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() - 0.5) * 0.4 * (1 - Math.pow(i / bufferSize, 2));
        }
       });
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      filter.Q.value = 1;
      this.sourceNode.connect(filter);
      filter.connect(this.gainNode);

    } else if (sound === 'cafe' || sound === 'brownNoise') {
       this.sourceNode = createNoiseSource(output => {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }
       });
       const filter = context.createBiquadFilter();
       filter.type = 'lowpass';
       filter.frequency.value = 500;
       this.sourceNode.connect(filter);
       filter.connect(this.gainNode);
    } else if (sound === 'whiteNoise') {
        this.sourceNode = createNoiseSource(output => {
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
        });
        this.sourceNode.connect(this.gainNode);
    } else if (sound === 'synthPad') {
        const baseFreq = 110; // A2
        const frequencies = [baseFreq, baseFreq * 1.5, baseFreq * 2, baseFreq * 2.5]; // A, E, A, C#
        
        frequencies.forEach(freq => {
            const osc = context.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, context.currentTime);

            const lfo = context.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.2, context.currentTime);
            
            const lfoGain = context.createGain();
            lfoGain.gain.setValueAtTime(5 + Math.random() * 5, context.currentTime);

            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            
            osc.connect(this.gainNode!);
            osc.start();
            lfo.start();
            this.synthOscillators.push(osc);
            this.synthOscillators.push(lfo);
        });
        this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : 0.1, context.currentTime); // Pad is quieter
        return; // Skip sourceNode.start()
    }
    
    this.sourceNode?.start();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.linearRampToValueAtTime(this.isMuted ? 0 : this.volume, this.audioContext.currentTime + 0.1);
    }
  }
}

export const ambientPlayer = new AmbientPlayer();