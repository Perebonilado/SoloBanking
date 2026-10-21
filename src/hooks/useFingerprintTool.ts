import { useConversationClientTool } from "@elevenlabs/react";
import { useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import { rememberCustomer } from "@/store/slices/customerSlice";
import {
  verificationEnded,
  verificationRequested,
} from "@/store/slices/voiceSlice";

interface PendingFingerprint {
  confirm: () => void;
  cancel: () => void;
}

export function useFingerprintTool() {
  const dispatch = useAppDispatch();
  const pending = useRef<PendingFingerprint | null>(null);

  useConversationClientTool("request_fingerprint", (parameters) => {
    const name = parameters.customer_name;
    const accountNumber = parameters.account_number;

    if (
      typeof name !== "string" ||
      typeof accountNumber !== "string" ||
      !name.trim() ||
      !accountNumber.trim()
    ) {
      throw new Error("customer_name and account_number are required");
    }

    pending.current?.cancel();

    return new Promise<string>((resolve, reject) => {
      pending.current = {
        confirm: () => {
          dispatch(rememberCustomer({ name, accountNumber }));
          resolve(JSON.stringify({ fingerprint_verified: true }));
        },
        cancel: () => reject(new Error("Fingerprint request was cancelled")),
      };
      dispatch(verificationRequested({}));
    });
  });

  const settle = (outcome: keyof PendingFingerprint) => {
    const current = pending.current;
    pending.current = null;
    dispatch(verificationEnded());
    current?.[outcome]();
  };

  return {
    confirmFingerprint: () => settle("confirm"),
    cancelFingerprint: () => settle("cancel"),
  };
}
