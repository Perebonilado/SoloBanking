import { settle } from "@/lib/apiRequest";
import { receiptFromTransaction } from "@/lib/receipt";
import { optionalText } from "@/lib/toolParameters";
import { useVoiceTool } from "@/lib/voice";
import { accountsApi } from "@/services/accounts/accountsApi";
import { useAppDispatch, useAppStore } from "@/store/hooks";
import {
  receiptClosed,
  receiptReopened,
  receiptShown,
} from "@/store/slices/receiptSlice";
import type { Receipt } from "@/types/receipt";
import { useSessionGuard } from "./useSessionGuard";

function describe(receipt: Receipt) {
  return JSON.stringify({
    receipt_on_screen: true,
    direction: receipt.direction,
    amountKobo: receipt.amountKobo,
    counterpartyName: receipt.counterpartyName,
  });
}

export function useReceiptTools() {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const guarded = useSessionGuard();

  useVoiceTool(
    "show_receipt",
    guarded(async (parameters) => {
      const { receipt, customer } = store.getState();
      const reference = optionalText(parameters.reference);

      if (reference) {
        const transaction = await settle(
          dispatch(
            accountsApi.endpoints.getTransactionReceipt.initiate(reference),
          ),
        );
        const shown = receiptFromTransaction(transaction, customer.saved);
        dispatch(receiptShown(shown));
        return describe(shown);
      }

      const last = receipt.last;
      if (
        !last ||
        last.customerAccountNumber !== customer.saved?.accountNumber
      ) {
        return JSON.stringify({ error: "no_receipt" });
      }
      dispatch(receiptReopened());
      return describe(last);
    }),
  );

  useVoiceTool("close_receipt", async () => {
    dispatch(receiptClosed());
    return JSON.stringify({ receipt_closed: true });
  });
}
