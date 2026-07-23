'use client';

// LocalStorage Keys
const VOICE_COMMENTATOR_KEY = 'fn_voice_commentator_enabled';
const VOICE_TAUNTS_KEY = 'fn_voice_taunts_enabled';
const VOICE_VOLUME_KEY = 'fn_voice_volume';

export type VoiceStyle = 'taunt' | 'commentator';

class AudioTauntsEngine {
  private voices: SpeechSynthesisVoice[] = [];
  private commentatorEnabled: boolean = true;
  private tauntsEnabled: boolean = true;
  private volume: number = 1.0;
  private isInitialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadSettings();
      this.initVoices();
    }
  }

  private loadSettings() {
    try {
      const storedCommentator = localStorage.getItem(VOICE_COMMENTATOR_KEY);
      this.commentatorEnabled = storedCommentator !== null ? JSON.parse(storedCommentator) : true;

      const storedTaunts = localStorage.getItem(VOICE_TAUNTS_KEY);
      this.tauntsEnabled = storedTaunts !== null ? JSON.parse(storedTaunts) : true;

      const storedVolume = localStorage.getItem(VOICE_VOLUME_KEY);
      this.volume = storedVolume !== null ? parseFloat(storedVolume) : 1.0;
    } catch {
      // Default fallback
      this.commentatorEnabled = true;
      this.tauntsEnabled = true;
      this.volume = 1.0;
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      // Prefer local English voices
      const englishVoices = allVoices.filter((v) => v.lang.startsWith('en'));
      const localEnglish = englishVoices.filter((v) => v.localService);

      this.voices = localEnglish.length > 0 ? localEnglish : englishVoices.length > 0 ? englishVoices : allVoices;
      this.isInitialized = true;
    };

    updateVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  public getCommentatorEnabled(): boolean {
    return this.commentatorEnabled;
  }

  public setCommentatorEnabled(enabled: boolean) {
    this.commentatorEnabled = enabled;
    try {
      localStorage.setItem(VOICE_COMMENTATOR_KEY, JSON.stringify(enabled));
    } catch {
      /* ignore */
    }
  }

  public getTauntsEnabled(): boolean {
    return this.tauntsEnabled;
  }

  public setTauntsEnabled(enabled: boolean) {
    this.tauntsEnabled = enabled;
    try {
      localStorage.setItem(VOICE_TAUNTS_KEY, JSON.stringify(enabled));
    } catch {
      /* ignore */
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem(VOICE_VOLUME_KEY, this.volume.toString());
    } catch {
      /* ignore */
    }
  }

  public cancelSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public speakTaunt(text: string, style: VoiceStyle = 'taunt', overrideInterrupt: boolean = false) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Check settings
    if (style === 'commentator' && !this.commentatorEnabled) return;
    if (style === 'taunt' && !this.tauntsEnabled) return;
    if (this.volume <= 0) return;

    if (overrideInterrupt) {
      this.cancelSpeech();
    }

    // Ensure voices are loaded
    if (this.voices.length === 0) {
      this.initVoices();
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = this.volume;

      if (style === 'taunt') {
        utterance.pitch = 1.3;
        utterance.rate = 1.2;
      } else {
        // Commentator
        utterance.pitch = 0.9;
        utterance.rate = 1.0;
      }

      // Pick best voice
      if (this.voices.length > 0) {
        if (style === 'taunt') {
          // Find higher pitch / female / different local voice if available
          const preferredTaunt = this.voices.find(
            (v) => v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('victoria')
          );
          utterance.voice = preferredTaunt || this.voices[0];
        } else {
          // Preferred commentator voice
          const preferredCommentator = this.voices.find(
            (v) => v.name.toLowerCase().includes('daniel') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('alex') || v.name.toLowerCase().includes('george')
          );
          utterance.voice = preferredCommentator || this.voices[0];
        }
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Offline speech synthesis error:', e);
    }
  }
}

export const audioTauntsEngine = new AudioTauntsEngine();

export function speakTaunt(text: string, style: VoiceStyle = 'taunt', overrideInterrupt: boolean = false) {
  audioTauntsEngine.speakTaunt(text, style, overrideInterrupt);
}

export function cancelSpeech() {
  audioTauntsEngine.cancelSpeech();
}
