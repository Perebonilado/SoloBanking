import { useConversationClientTool } from "@elevenlabs/react";
import { useAppDispatch } from "@/store/hooks";
import { signOut } from "@/store/signOut";
import { receiptForgotten } from "@/store/slices/receiptSlice";

export function useSignOutTool() {
  const dispatch = useAppDispatch();

  useConversationClientTool("log_out", async () => {
    await dispatch(signOut());
    dispatch(receiptForgotten());
    return JSON.stringify({ logged_out: true, fingerprint_verified: false });
  });
}
