export interface PublicKey {
  keyId: string;
  publicKey: string;
}

export interface EncryptedEnvelope {
  keyId: string;
  payload: string;
}

export interface LoginResult {
  accessToken: string;
  expiresIn: number;
}

export interface AccountLookup {
  customer_name: string;
  account_number: string;
}

export interface Balance {
  accountNumber: string;
  balanceKobo: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PageQuery {
  page?: number;
  limit?: number;
}

export type TransactionType = "debit" | "credit";

export interface Transaction {
  reference: string;
  type: TransactionType;
  amountKobo: number;
  counterpartyName: string | null;
  description: string | null;
  createdAt: string;
}

export interface TransactionReceipt {
  reference: string;
  type: TransactionType;
  amountKobo: number;
  counterpartyName: string | null;
  counterpartyAccountNumber: string | null;
  bankCode: string | null;
  bankName: string | null;
  completedAt: string;
}

export interface TransactionPage {
  transactions: Transaction[];
  pagination: Pagination;
}

export type NameMatch = "exact" | "partial" | "fuzzy";

export interface Beneficiary {
  id: string;
  accountName: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  match?: NameMatch;
}

export interface BeneficiaryPage {
  beneficiaries: Beneficiary[];
  pagination: Pagination;
}

export interface BeneficiaryQuery extends PageQuery {
  name?: string;
  accountNumber?: string;
}

export interface BankAccountRef {
  accountNumber: string;
  bankCode: string;
}

export interface Bank {
  code: string;
  name: string;
}

export interface BankList {
  banks: Bank[];
}

export interface BankAccount {
  accountNumber: string;
  accountName: string;
  bankCode: string;
}

export interface TransferRequest {
  toAccountNumber: string;
  bankCode: string;
  amountKobo: number;
  idempotencyKey: string;
}

export interface TransferInitiation {
  transactionId: string;
  recipientName: string;
  amountKobo: number;
  expiresAt: string;
}

export interface TransferConfirmation {
  reference: string;
  balanceKobo: number;
  amountKobo: number;
  recipientName: string;
  accountNumber: string;
  bankCode: string;
  bankName: string | null;
  completedAt: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}
