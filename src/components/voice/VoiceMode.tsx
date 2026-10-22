"use client";

import { VoiceProvider } from "@/lib/voice";
import VoiceScreen from "./VoiceScreen";

export default function VoiceMode() {
  return (
    <VoiceProvider>
      <VoiceScreen />
    </VoiceProvider>
  );
}
