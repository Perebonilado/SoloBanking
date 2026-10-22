import { ApiError } from "@/lib/apiRequest";
import type { ToolParameters, VoiceToolHandler } from "@/lib/voice";
import { useAppDispatch, useAppStore } from "@/store/hooks";
import { sessionEnded } from "@/store/slices/sessionSlice";
import { callSignedOut } from "@/store/slices/voiceSlice";

export function useSessionGuard() {
  const dispatch = useAppDispatch();
  const store = useAppStore();

  return (handler: VoiceToolHandler) =>
    async (parameters: ToolParameters): Promise<string> => {
      const { session, voice } = store.getState();
      if (!voice.signedInThisCall || !session.accessToken) {
        return JSON.stringify({
          error: "not_signed_in",
          fingerprint_verified: false,
        });
      }
      try {
        return await handler(parameters);
      } catch (error) {
        if (error instanceof ApiError && error.isSessionExpired) {
          dispatch(sessionEnded());
          dispatch(callSignedOut());
          return JSON.stringify({
            error: "session_expired",
            fingerprint_verified: false,
          });
        }
        throw error;
      }
    };
}
