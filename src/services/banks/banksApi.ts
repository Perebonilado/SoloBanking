import { baseApi } from "@/services/baseApi";
import type { BankAccount, BankAccountRef, BankList } from "@/types/banking";

export const banksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    findBanks: build.query<BankList, string>({
      query: (search) => ({ url: "banks", params: { search } }),
      providesTags: ["Bank"],
    }),
    resolveBankAccount: build.query<BankAccount, BankAccountRef>({
      query: (params) => ({ url: "banks/resolve", params }),
      providesTags: ["Bank"],
    }),
  }),
});

export const { useFindBanksQuery, useResolveBankAccountQuery } = banksApi;
