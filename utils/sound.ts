// Sound functionality to play a notification when the timer is up.
// This is generated with the Web Audio API to ensure it works offline.

let audioContext: AudioContext | null = null;
let alarmInterval: number | null = null;

const getContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const stopTimerUpSound = () => {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
};

export const playTimerUpSound = () => {
  stopTimerUpSound(); // Stop any existing alarm first
  try {
    const context = getContext();
    if (!context) return;

    if (context.state === 'suspended') {
      context.resume();
    }

    const playBeep = () => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      gainNode.gain.setValueAtTime(0.5, context.currentTime); // Louder volume

      oscillator.type = 'square'; // More alerting sound
      oscillator.frequency.setValueAtTime(880, context.currentTime); // A5 note

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.1); // Short beep
    };
    
    playBeep(); // Play immediately
    alarmInterval = window.setInterval(playBeep, 600); // Repeat every 600ms

  } catch (error) {
    console.error("Failed to play timer up sound:", error);
  }
};

export const playCompletionSound = () => {
  try {
    const context = getContext();
    if (!context) return;

    if (context.state === 'suspended') {
      context.resume();
    }

    const playNote = (frequency: number, startTime: number, duration: number) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, startTime);
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = context.currentTime;
    playNote(523.25, now, 0.15); // C5
    playNote(659.25, now + 0.1, 0.15); // E5
    playNote(783.99, now + 0.2, 0.15); // G5
    playNote(1046.50, now + 0.3, 0.2); // C6
    
  } catch (error) {
    console.error("Failed to play completion sound:", error);
  }
};
