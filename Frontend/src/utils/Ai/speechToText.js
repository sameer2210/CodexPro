/**
 * speechToText — wraps the Web Speech API SpeechRecognition.
 * Falls back silently if the browser doesn't support it.
 */
export const startSpeechRecognition = (onResult) => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn("SpeechRecognition API not available in this browser.");
    onResult?.("");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult?.(transcript);
  };

  recognition.onerror = (event) => {
    console.error("SpeechRecognition error:", event.error);
    onResult?.("");
  };

  recognition.start();
  return recognition;
};
