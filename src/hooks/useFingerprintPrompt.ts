import { useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  verificationEnded,
  verificationRequested,
} from "@/store/slices/voiceSlice";
import type { VerificationPrompt } from "@/types/voice";

const PROMPT_TIMEOUT_MS = 110_000;

interface PendingFingerprint {
  resolve: () => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export function useFingerprintPrompt() {
  const dispatch = useAppDispatch();
  const pending = useRef<PendingFingerprint | null>(null);

  const settlePending = (confirmed: boolean, reason = "cancelled") => {
    const current = pending.current;
    pending.current = null;
    dispatch(verificationEnded());
    if (!current) return;
    clearTimeout(current.timer);
    if (confirmed) {
      current.resolve();
    } else {
      current.reject(new Error(`Fingerprint request was ${reason}`));
    }
  };

  const awaitFingerprint = (prompt: VerificationPrompt) => {
    if (pending.current) {
      clearTimeout(pending.current.timer);
      pending.current.reject(new Error("Fingerprint request was replaced"));
    }
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => settlePending(false, "not answered in time"),
        PROMPT_TIMEOUT_MS,
      );
      pending.current = { resolve, reject, timer };
      dispatch(verificationRequested(prompt));
    });
  };

  return {
    awaitFingerprint,
    confirmFingerprint: () => settlePending(true),
    cancelFingerprint: () => settlePending(false),
  };
}

export type AwaitFingerprint = ReturnType<
  typeof useFingerprintPrompt
>["awaitFingerprint"];
