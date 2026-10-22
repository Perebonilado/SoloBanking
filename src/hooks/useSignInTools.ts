import { settle } from "@/lib/apiRequest";
import { encryptPayload } from "@/lib/encryptedPayload";
import { MOCK_PASSKEY } from "@/lib/passkey";
import {
  optionalAccountNumber,
  optionalText,
  requireAccountNumber,
} from "@/lib/toolParameters";
import { useVoiceTool } from "@/lib/voice";
import { accountsApi } from "@/services/accounts/accountsApi";
import { authApi } from "@/services/auth/authApi";
import { baseApi } from "@/services/baseApi";
import { useAppDispatch, useAppStore } from "@/store/hooks";
import { rememberCustomer } from "@/store/slices/customerSlice";
import { sessionStarted } from "@/store/slices/sessionSlice";
import { accountFound, callSignedIn } from "@/store/slices/voiceSlice";
import type { AwaitFingerprint } from "./useFingerprintPrompt";

export function useSignInTools(awaitFingerprint: AwaitFingerprint) {
  const dispatch = useAppDispatch();
  const store = useAppStore();

  useVoiceTool("verify_account", async (parameters) => {
    const accountNumber = requireAccountNumber(
      parameters.account_number,
      "account_number",
    );
    const account = await settle(
      dispatch(accountsApi.endpoints.lookupAccount.initiate(accountNumber)),
    );
    dispatch(
      accountFound({
        name: account.customer_name,
        accountNumber: account.account_number,
      }),
    );
    return JSON.stringify(account);
  });

  useVoiceTool("request_fingerprint", async (parameters) => {
    const { voice, customer } = store.getState();
    const known = voice.foundAccount ?? customer.saved;
    const name = optionalText(parameters.customer_name) ?? known?.name;
    const accountNumber =
      optionalAccountNumber(parameters.account_number, "account_number") ??
      known?.accountNumber;
    if (!name || !accountNumber) {
      return JSON.stringify({ error: "no_account", fingerprint_verified: false });
    }

    await awaitFingerprint({});

    const publicKey = await settle(
      dispatch(authApi.endpoints.getPublicKey.initiate()),
    );
    const envelope = await encryptPayload(publicKey, {
      accountNumber,
      passKey: MOCK_PASSKEY,
    });
    const login = await settle(
      dispatch(authApi.endpoints.login.initiate(envelope)),
    );

    const previousToken = store.getState().session.accessToken;
    dispatch(baseApi.util.resetApiState());
    if (previousToken) {
      settle(dispatch(authApi.endpoints.logout.initiate(previousToken))).catch(
        () => undefined,
      );
    }
    dispatch(
      sessionStarted({
        accessToken: login.accessToken,
        expiresAt: Date.now() + login.expiresIn * 1000,
      }),
    );
    dispatch(rememberCustomer({ name, accountNumber }));
    dispatch(callSignedIn());
    return JSON.stringify({ fingerprint_verified: true });
  });
}
