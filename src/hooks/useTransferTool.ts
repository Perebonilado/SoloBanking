import { settle } from "@/lib/apiRequest";
import { encryptPayload } from "@/lib/encryptedPayload";
import { formatNaira } from "@/lib/money";
import { MOCK_PASSKEY } from "@/lib/passkey";
import { receiptFromTransfer } from "@/lib/receipt";
import {
  requireAccountNumber,
  requirePositiveInteger,
  requireText,
} from "@/lib/toolParameters";
import { useVoiceTool } from "@/lib/voice";
import { authApi } from "@/services/auth/authApi";
import { transfersApi } from "@/services/transfers/transfersApi";
import { useAppDispatch, useAppStore } from "@/store/hooks";
import { receiptShown } from "@/store/slices/receiptSlice";
import type { AwaitFingerprint } from "./useFingerprintPrompt";
import { useSessionGuard } from "./useSessionGuard";

export function useTransferTool(awaitFingerprint: AwaitFingerprint) {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const guarded = useSessionGuard();

  useVoiceTool(
    "initiate_transfer",
    guarded(async (parameters) => {
      const transfer = await settle(
        dispatch(
          transfersApi.endpoints.initiateTransfer.initiate({
            toAccountNumber: requireAccountNumber(
              parameters.account_number,
              "account_number",
            ),
            bankCode: requireText(parameters.bank_code, "bank_code"),
            amountKobo: requirePositiveInteger(
              parameters.amount_kobo,
              "amount_kobo",
            ),
            idempotencyKey: crypto.randomUUID(),
          }),
        ),
      );

      await awaitFingerprint({
        answer: formatNaira(transfer.amountKobo),
        sub: `to ${transfer.recipientName}`,
      });

      const publicKey = await settle(
        dispatch(authApi.endpoints.getPublicKey.initiate()),
      );
      const envelope = await encryptPayload(publicKey, {
        passKey: MOCK_PASSKEY,
      });
      const confirmation = await settle(
        dispatch(
          transfersApi.endpoints.confirmTransfer.initiate({
            transactionId: transfer.transactionId,
            envelope,
          }),
        ),
      );

      dispatch(
        receiptShown(
          receiptFromTransfer(confirmation, store.getState().customer.saved),
        ),
      );

      return JSON.stringify({
        status: "completed",
        balanceKobo: confirmation.balanceKobo,
        receipt_on_screen: true,
      });
    }),
  );
}
