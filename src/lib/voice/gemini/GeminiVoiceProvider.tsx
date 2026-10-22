"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAppSelector } from "@/store/hooks";
import { announce } from "../announce";
import type { VoiceControls, VoiceMode, VoiceToolHandler } from "../types";
import { CALL_FAILED_MESSAGE, GeminiCall, type ToolRegistry } from "./geminiCall";

interface GeminiVoiceContextValue {
  tools: ToolRegistry;
  controls: VoiceControls;
  mode: VoiceMode;
}

const GeminiVoiceContext = createContext<GeminiVoiceContextValue | null>(null);

function useGeminiVoiceContext() {
  const value = useContext(GeminiVoiceContext);
  if (!value) throw new Error("Gemini voice hooks need a GeminiVoiceProvider");
  return value;
}

export function GeminiVoiceProvider({ children }: { children: ReactNode }) {
  const [tools] = useState<ToolRegistry>(() => new Map());
  const [mode, setMode] = useState<VoiceMode>("listening");
  const call = useRef<GeminiCall | null>(null);

  const controls = useMemo<VoiceControls>(
    () => ({
      startSession(options) {
        if (call.current) return;
        let current: GeminiCall;
        try {
          current = new GeminiCall({
            ...options,
            tools,
            onModeChange: setMode,
            onDisconnect: () => {
              if (call.current === current) call.current = null;
              options.onDisconnect();
            },
          });
        } catch {
          options.onStatusChange({ status: "disconnected" });
          options.onDisconnect();
          announce(CALL_FAILED_MESSAGE);
          return;
        }
        call.current = current;
        current.start();
      },
      endSession() {
        call.current?.end();
      },
    }),
    [tools],
  );

  const fingerprintPrompt = useAppSelector((state) => state.voice.verification);

  useEffect(() => {
    if (fingerprintPrompt) call.current?.fingerprintPromptShown();
  }, [fingerprintPrompt]);

  useEffect(() => () => call.current?.end(), []);

  const value = useMemo(() => ({ tools, controls, mode }), [tools, controls, mode]);

  return (
    <GeminiVoiceContext.Provider value={value}>
      {children}
    </GeminiVoiceContext.Provider>
  );
}

export function useGeminiTool(name: string, handler: VoiceToolHandler) {
  const { tools } = useGeminiVoiceContext();
  const latest = useRef(handler);

  useEffect(() => {
    latest.current = handler;
  });

  useEffect(() => {
    tools.set(name, latest);
    return () => {
      if (tools.get(name) === latest) tools.delete(name);
    };
  }, [tools, name]);
}

export function useGeminiControls(): VoiceControls {
  return useGeminiVoiceContext().controls;
}

export function useGeminiMode(): VoiceMode {
  return useGeminiVoiceContext().mode;
}
