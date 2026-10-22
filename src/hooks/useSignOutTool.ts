import { useVoiceTool } from "@/lib/voice";
import { useAppDispatch } from "@/store/hooks";
import { signOut } from "@/store/signOut";
import { receiptForgotten } from "@/store/slices/receiptSlice";
import { callSignedOut } from "@/store/slices/voiceSlice";

export function useSignOutTool() {
  const dispatch = useAppDispatch();

  useVoiceTool("log_out", async () => {
    await dispatch(signOut());
    dispatch(callSignedOut());
    dispatch(receiptForgotten());
    return JSON.stringify({ logged_out: true, fingerprint_verified: false });
  });
}
