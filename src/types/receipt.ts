export type ReceiptDirection = "sent" | "received";

export interface Receipt {
  reference: string;
  direction: ReceiptDirection;
  amountKobo: number;
  counterpartyName: string;
  counterpartyAccountNumber: string;
  bankCode: string;
  bankName: string | null;
  completedAt: string;
  customerName: string;
  customerAccountNumber: string;
}
