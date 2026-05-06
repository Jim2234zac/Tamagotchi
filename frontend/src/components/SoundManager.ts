class SoundManager {
  private audioContext: AudioContext | null = null;
  private backgroundMusic: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private musicGain: GainNode | null = null;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.musicGain = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.musicGain.connect(this.gainNode);
      this.musicGain.gain.value = 0.3; // Background music volume
    } catch (error) {
      console.error('Web Audio API not supported:', error);
    }
  }

  // 8-bit style background music
  playBackgroundMusic() {
    if (!this.audioContext || !this.musicGain) return;

    // Stop existing music
    this.stopBackgroundMusic();

    // Create a simple 8-bit melody
    const notes = [
      { freq: 261.63, duration: 200 }, // C
      { freq: 293.66, duration: 200 }, // D
      { freq: 329.63, duration: 200 }, // E
      { freq: 261.63, duration: 200 }, // C
      { freq: 329.63, duration: 200 }, // E
      { freq: 392.00, duration: 400 }, // G
      { freq: 329.63, duration: 200 }, // E
      { freq: 261.63, duration: 400 }, // C
    ];

    let currentTime = this.audioContext.currentTime;

    const playNote = (freq: number, duration: number, startTime: number) => {
      const oscillator = this.audioContext!.createOscillator();
      const noteGain = this.audioContext!.createGain();
      
      oscillator.type = 'square'; // 8-bit sound
      oscillator.frequency.value = freq;
      
      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(0.1, startTime + 0.01);
      noteGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration / 1000);
      
      oscillator.connect(noteGain);
      noteGain.connect(this.musicGain!);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration / 1000);
    };

    // Loop the melody
    const playMelody = () => {
      notes.forEach((note, index) => {
        const noteTime = currentTime + (index * 0.25);
        playNote(note.freq, note.duration, noteTime);
      });
      
      // Schedule next loop
      currentTime += notes.length * 0.25;
      if (currentTime < this.audioContext!.currentTime + 10) {
        setTimeout(playMelody, (notes.length * 250));
      }
    };

    playMelody();
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
      this.backgroundMusic = null;
    }
  }

  // Sound effects
  playEatSound() {
    if (!this.audioContext || !this.gainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.gainNode);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  playPlaySound() {
    if (!this.audioContext || !this.gainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.05);
    oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.gainNode);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }

  playSleepSound() {
    if (!this.audioContext || !this.gainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.gainNode);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  playCleanSound() {
    if (!this.audioContext || !this.gainNode) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(1200, this.audioContext.currentTime + 0.05);
    oscillator.frequency.linearRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.gainNode);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  playGameOverSound() {
    if (!this.audioContext || !this.gainNode) return;

    const frequencies = [400, 300, 200, 100];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.value = freq;
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext!.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.gainNode!);
        
        oscillator.start();
        oscillator.stop(this.audioContext!.currentTime + 0.3);
      }, index * 150);
    });
  }

  playHappySound() {
    if (!this.audioContext || !this.gainNode) return;

    const frequencies = [523.25, 659.25, 783.99]; // C, E, G
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = freq;
        
        gainNode.gain.setValueAtTime(0.15, this.audioContext!.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.gainNode!);
        
        oscillator.start();
        oscillator.stop(this.audioContext!.currentTime + 0.2);
      }, index * 100);
    });
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  // Resume audio context if suspended (required by some browsers)
  resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

export default SoundManager;
