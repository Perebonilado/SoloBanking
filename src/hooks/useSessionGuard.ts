import { ApiError } from "@/lib/apiRequest";
import { useAppDispatch } from "@/store/hooks";
import { sessionEnded } from "@/store/slices/sessionSlice";

type ToolParameters = Record<string, unknown>;

export function useSessionGuard() {
  const dispatch = useAppDispatch();

  return (handler: (parameters: ToolParameters) => Promise<string>) =>
    async (parameters: ToolParameters): Promise<string> => {
      try {
        return await handler(parameters);
      } catch (error) {
        if (error instanceof ApiError && error.isSessionExpired) {
          dispatch(sessionEnded());
          return JSON.stringify({
            error: "session_expired",
            fingerprint_verified: false,
          });
        }
        throw error;
      }
    };
}
