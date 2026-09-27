/**
 * speakText — wraps the Web Speech API SpeechSynthesis.
 * Uses browser-native TTS; falls back silently if unavailable.
 */
export const speakText = (text) => {
  if (!text || typeof window === 'undefined') return;
  if (!window.speechSynthesis) {
    console.warn('SpeechSynthesis API not available in this browser.');
    return;
  }
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};
