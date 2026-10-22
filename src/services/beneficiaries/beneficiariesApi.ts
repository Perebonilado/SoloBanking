import { baseApi } from "@/services/baseApi";
import type {
  BankAccountRef,
  Beneficiary,
  BeneficiaryPage,
  BeneficiaryQuery,
} from "@/types/banking";

export const beneficiariesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    findBeneficiaries: build.query<BeneficiaryPage, BeneficiaryQuery>({
      query: (params) => ({ url: "beneficiaries", params }),
      providesTags: ["Beneficiary"],
    }),
    saveBeneficiary: build.mutation<Beneficiary, BankAccountRef>({
      query: (body) => ({ url: "beneficiaries", method: "POST", body }),
      invalidatesTags: ["Beneficiary"],
    }),
  }),
});

export const { useFindBeneficiariesQuery, useSaveBeneficiaryMutation } =
  beneficiariesApi;
