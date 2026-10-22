"use client";

import type { ReactNode } from "react";
import {
  ElevenLabsVoiceProvider,
  useElevenLabsControls,
  useElevenLabsMode,
  useElevenLabsTool,
} from "./elevenlabs";
import {
  GeminiVoiceProvider,
  useGeminiControls,
  useGeminiMode,
  useGeminiTool,
} from "./gemini/GeminiVoiceProvider";

const geminiSelected = process.env.NEXT_PUBLIC_VOICE_PROVIDER !== "elevenlabs";

export function VoiceProvider({ children }: { children: ReactNode }) {
  return geminiSelected ? (
    <GeminiVoiceProvider>{children}</GeminiVoiceProvider>
  ) : (
    <ElevenLabsVoiceProvider>{children}</ElevenLabsVoiceProvider>
  );
}

export const useVoiceTool = geminiSelected ? useGeminiTool : useElevenLabsTool;
export const useVoiceControls = geminiSelected ? useGeminiControls : useElevenLabsControls;
export const useVoiceMode = geminiSelected ? useGeminiMode : useElevenLabsMode;

export type {
  ToolParameters,
  VoiceControls,
  VoiceMode,
  VoiceToolHandler,
} from "./types";
