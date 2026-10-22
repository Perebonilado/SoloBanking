import type { TransactionReceipt, TransferConfirmation } from "@/types/banking";
import type { Customer } from "@/types/customer";
import type { Receipt } from "@/types/receipt";

export function receiptFromTransfer(
  confirmation: TransferConfirmation,
  customer: Customer | null,
): Receipt {
  return {
    reference: confirmation.reference,
    direction: "sent",
    amountKobo: confirmation.amountKobo,
    counterpartyName: confirmation.recipientName,
    counterpartyAccountNumber: confirmation.accountNumber,
    bankCode: confirmation.bankCode,
    bankName: confirmation.bankName,
    completedAt: confirmation.completedAt,
    customerName: customer?.name ?? "",
    customerAccountNumber: customer?.accountNumber ?? "",
  };
}

export function receiptFromTransaction(
  transaction: TransactionReceipt,
  customer: Customer | null,
): Receipt {
  return {
    reference: transaction.reference,
    direction: transaction.type === "credit" ? "received" : "sent",
    amountKobo: transaction.amountKobo,
    counterpartyName: transaction.counterpartyName ?? "",
    counterpartyAccountNumber: transaction.counterpartyAccountNumber ?? "",
    bankCode: transaction.bankCode ?? "",
    bankName: transaction.bankName,
    completedAt: transaction.completedAt,
    customerName: customer?.name ?? "",
    customerAccountNumber: customer?.accountNumber ?? "",
  };
}
