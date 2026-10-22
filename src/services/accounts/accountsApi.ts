import { baseApi } from "@/services/baseApi";
import type {
  AccountLookup,
  Balance,
  PageQuery,
  TransactionPage,
  TransactionReceipt,
} from "@/types/banking";

export const accountsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    lookupAccount: build.query<AccountLookup, string>({
      query: (accountNumber) =>
        `accounts/${encodeURIComponent(accountNumber)}`,
    }),
    getBalance: build.query<Balance, void>({
      query: () => "accounts/me",
      providesTags: ["Balance"],
    }),
    getTransactions: build.query<TransactionPage, PageQuery>({
      query: (params) => ({ url: "transactions", params }),
      providesTags: ["Transaction"],
    }),
    getTransactionReceipt: build.query<TransactionReceipt, string>({
      query: (reference) => `transactions/${encodeURIComponent(reference)}`,
      providesTags: ["Transaction"],
    }),
  }),
});

export const {
  useLookupAccountQuery,
  useGetBalanceQuery,
  useGetTransactionsQuery,
  useGetTransactionReceiptQuery,
} = accountsApi;
