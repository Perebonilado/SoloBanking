import { useBankingTools } from "./useBankingTools";
import { useFingerprintPrompt } from "./useFingerprintPrompt";
import { useReceiptTools } from "./useReceiptTools";
import { useSignInTools } from "./useSignInTools";
import { useSignOutTool } from "./useSignOutTool";
import { useTransferTool } from "./useTransferTool";

export function useVoiceTools() {
  const { awaitFingerprint, confirmFingerprint, cancelFingerprint } =
    useFingerprintPrompt();

  useSignInTools(awaitFingerprint);
  useBankingTools();
  useTransferTool(awaitFingerprint);
  useReceiptTools();
  useSignOutTool();

  return { confirmFingerprint, cancelFingerprint };
}
