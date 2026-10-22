import { useConversationClientTool } from "@elevenlabs/react";
import { settle } from "@/lib/apiRequest";
import { encryptPayload } from "@/lib/encryptedPayload";
import { MOCK_PASSKEY } from "@/lib/passkey";
import { requireAccountNumber, requireText } from "@/lib/toolParameters";
import { accountsApi } from "@/services/accounts/accountsApi";
import { authApi } from "@/services/auth/authApi";
import { baseApi } from "@/services/baseApi";
import { useAppDispatch, useAppStore } from "@/store/hooks";
import { rememberCustomer } from "@/store/slices/customerSlice";
import { sessionStarted } from "@/store/slices/sessionSlice";
import type { AwaitFingerprint } from "./useFingerprintPrompt";

export function useSignInTools(awaitFingerprint: AwaitFingerprint) {
  const dispatch = useAppDispatch();
  const store = useAppStore();

  useConversationClientTool("verify_account", async (parameters) => {
    const accountNumber = requireAccountNumber(
      parameters.account_number,
      "account_number",
    );
    const account = await settle(
      dispatch(accountsApi.endpoints.lookupAccount.initiate(accountNumber)),
    );
    return JSON.stringify(account);
  });

  useConversationClientTool("request_fingerprint", async (parameters) => {
    const name = requireText(parameters.customer_name, "customer_name");
    const accountNumber = requireAccountNumber(
      parameters.account_number,
      "account_number",
    );

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
    return JSON.stringify({ fingerprint_verified: true });
  });
}
