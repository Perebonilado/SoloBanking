import { settle } from "@/lib/apiRequest";
import {
  optionalAccountNumber,
  optionalPositiveInteger,
  optionalText,
  requireAccountNumber,
  requireText,
} from "@/lib/toolParameters";
import { useVoiceTool } from "@/lib/voice";
import { accountsApi } from "@/services/accounts/accountsApi";
import { banksApi } from "@/services/banks/banksApi";
import { beneficiariesApi } from "@/services/beneficiaries/beneficiariesApi";
import { useAppDispatch } from "@/store/hooks";
import type { Beneficiary } from "@/types/banking";
import { useSessionGuard } from "./useSessionGuard";

const TRANSACTIONS_PER_PAGE = 3;
const BANKS_PER_SEARCH = 5;

function toSpokenBeneficiary(beneficiary: Beneficiary) {
  return {
    accountName: beneficiary.accountName,
    accountNumber: beneficiary.accountNumber,
    bankCode: beneficiary.bankCode,
    bankName: beneficiary.bankName,
    match: beneficiary.match,
  };
}

export function useBankingTools() {
  const dispatch = useAppDispatch();
  const guarded = useSessionGuard();

  useVoiceTool(
    "get_balance",
    guarded(async () => {
      const balance = await settle(
        dispatch(accountsApi.endpoints.getBalance.initiate()),
      );
      return JSON.stringify({ balanceKobo: balance.balanceKobo });
    }),
  );

  useVoiceTool(
    "get_transactions",
    guarded(async (parameters) => {
      const page = optionalPositiveInteger(parameters.page, "page", 1);
      const result = await settle(
        dispatch(
          accountsApi.endpoints.getTransactions.initiate({
            page,
            limit: TRANSACTIONS_PER_PAGE,
          }),
        ),
      );
      return JSON.stringify({
        transactions: result.transactions,
        page: result.pagination.page,
        hasMore: result.pagination.page < result.pagination.total_pages,
      });
    }),
  );

  useVoiceTool(
    "find_beneficiaries",
    guarded(async (parameters) => {
      const result = await settle(
        dispatch(
          beneficiariesApi.endpoints.findBeneficiaries.initiate({
            name: optionalText(parameters.name),
            accountNumber: optionalAccountNumber(
              parameters.account_number,
              "account_number",
            ),
          }),
        ),
      );
      return JSON.stringify({
        beneficiaries: result.beneficiaries.map(toSpokenBeneficiary),
      });
    }),
  );

  useVoiceTool(
    "find_bank",
    guarded(async (parameters) => {
      const result = await settle(
        dispatch(
          banksApi.endpoints.findBanks.initiate(
            requireText(
              parameters.search ?? parameters.bank_name ?? parameters.name,
              "bank_name",
            ),
          ),
        ),
      );
      return JSON.stringify({
        banks: result.banks.slice(0, BANKS_PER_SEARCH),
        total: result.banks.length,
      });
    }),
  );

  useVoiceTool(
    "verify_bank_account",
    guarded(async (parameters) => {
      const account = await settle(
        dispatch(
          banksApi.endpoints.resolveBankAccount.initiate({
            accountNumber: requireAccountNumber(
              parameters.account_number,
              "account_number",
            ),
            bankCode: requireText(parameters.bank_code, "bank_code"),
          }),
        ),
      );
      return JSON.stringify({ accountName: account.accountName });
    }),
  );

  useVoiceTool(
    "save_beneficiary",
    guarded(async (parameters) => {
      const saved = await settle(
        dispatch(
          beneficiariesApi.endpoints.saveBeneficiary.initiate({
            accountNumber: requireAccountNumber(
              parameters.account_number,
              "account_number",
            ),
            bankCode: requireText(parameters.bank_code, "bank_code"),
          }),
        ),
      );
      return JSON.stringify(toSpokenBeneficiary(saved));
    }),
  );
}
