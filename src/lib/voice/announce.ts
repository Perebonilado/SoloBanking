export function announce(text: string) {
  try {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    utterance.voice =
      voices.find((voice) => voice.lang === "en-NG") ??
      voices.find((voice) => voice.lang.startsWith("en")) ??
      null;
    utterance.lang = utterance.voice?.lang ?? "en-NG";
    synth.cancel();
    synth.speak(utterance);
  } catch {
    return;
  }
}
