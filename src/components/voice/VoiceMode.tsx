"use client";

import { ConversationProvider } from "@elevenlabs/react";
import VoiceScreen from "./VoiceScreen";

export default function VoiceMode() {
  return (
    <ConversationProvider agentId={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}>
      <VoiceScreen />
    </ConversationProvider>
  );
}
