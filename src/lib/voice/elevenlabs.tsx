"use client";

import {
  ConversationProvider,
  useConversationClientTool,
  useConversationControls,
  useConversationMode,
} from "@elevenlabs/react";
import type { ReactNode } from "react";
import type { VoiceControls, VoiceMode, VoiceToolHandler } from "./types";

export function ElevenLabsVoiceProvider({ children }: { children: ReactNode }) {
  return (
    <ConversationProvider agentId={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}>
      {children}
    </ConversationProvider>
  );
}

export function useElevenLabsTool(name: string, handler: VoiceToolHandler) {
  useConversationClientTool(name, handler);
}

export function useElevenLabsControls(): VoiceControls {
  const { startSession, endSession } = useConversationControls();
  return { startSession, endSession };
}

export function useElevenLabsMode(): VoiceMode {
  return useConversationMode().mode;
}
