import { baseApi } from "@/services/baseApi";
import type {
  EncryptedEnvelope,
  TransferConfirmation,
  TransferInitiation,
  TransferRequest,
} from "@/types/banking";

export const transfersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    initiateTransfer: build.mutation<TransferInitiation, TransferRequest>({
      query: (body) => ({ url: "transfers/initiate", method: "POST", body }),
    }),
    confirmTransfer: build.mutation<
      TransferConfirmation,
      { transactionId: string; envelope: EncryptedEnvelope }
    >({
      query: ({ transactionId, envelope }) => ({
        url: `transfers/${encodeURIComponent(transactionId)}/confirm`,
        method: "POST",
        body: envelope,
      }),
      invalidatesTags: ["Balance", "Transaction"],
    }),
  }),
});

export const { useInitiateTransferMutation, useConfirmTransferMutation } =
  transfersApi;
