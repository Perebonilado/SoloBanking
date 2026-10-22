import type { FunctionDeclaration } from "@google/genai";

export const WAITS_FOR_FINGERPRINT = new Set([
  "request_fingerprint",
  "initiate_transfer",
]);

const ACCOUNT_NUMBER = {
  type: "string",
  description: "A 10 digit account number, digits only",
};

export const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: "verify_account",
    description:
      "Checks a 10 digit account number and returns the customer's name. The first time you use it for a number, it replies read_back_required: read the number back to the customer as it says, ask if it is right, and wait for their answer. Only if they say yes, use it again with the same number.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        account_number: {
          type: "string",
          description: "The customer's 10 digit account number, digits only",
        },
      },
      required: ["account_number"],
    },
  },
  {
    name: "request_fingerprint",
    description:
      "Shows the fingerprint prompt on the customer's screen. Use it to sign the customer in before any banking. The customer's name and account number are filled in automatically. It replies at once with status prompt_on_screen. Then tell the customer: \"Your fingerprint check is on your screen. Touch your fingerprint sensor to carry on.\" and wait quietly. The result arrives later as an [App update] message.",
  },
  {
    name: "get_balance",
    description:
      "Gets the customer's current balance. Returns balanceKobo. 100 kobo is 1 naira, so say the amount in naira.",
  },
  {
    name: "get_transactions",
    description:
      "Gets the customer's completed transactions, newest first, three at a time. Start with page 1. When the customer wants more and hasMore is true, ask for the next page. Amounts are in kobo: 100 kobo is 1 naira. createdAt is in UTC. Each transaction has a reference: pass it to show_receipt when the customer asks for that transaction's receipt. Never read a reference out.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        page: { type: "integer", description: "Page number, starting at 1" },
      },
    },
  },
  {
    name: "find_beneficiaries",
    description:
      "Finds the customer's saved beneficiaries by the name they said, or by account number. Returns up to 5 matches. A name search gives each match a strength: exact, partial or fuzzy.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description:
            "The beneficiary's name as the customer said it, even if incomplete",
        },
        account_number: ACCOUNT_NUMBER,
      },
    },
  },
  {
    name: "find_bank",
    description:
      "Finds banks by the name the customer said, such as Guaranty Trust or Access, and returns up to 5 bank names with their codes, plus the total number of matches. Use it to get the bank_code another tool needs.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        bank_name: {
          type: "string",
          description:
            "The bank name as the customer said it, such as GTBank or Access",
        },
      },
      required: ["bank_name"],
    },
  },
  {
    name: "verify_bank_account",
    description:
      "Looks up the name on an account at a bank. Use it to read the name back before saving a beneficiary or sending money to a new account.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        account_number: ACCOUNT_NUMBER,
        bank_code: {
          type: "string",
          description: "The bank code from find_bank or a saved beneficiary",
        },
      },
      required: ["account_number", "bank_code"],
    },
  },
  {
    name: "save_beneficiary",
    description:
      "Saves an account as one of the customer's beneficiaries. The name comes from the bank. Before using it, use verify_bank_account, read the name back, and wait for the customer to say yes.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        account_number: ACCOUNT_NUMBER,
        bank_code: { type: "string", description: "The bank code from find_bank" },
      },
      required: ["account_number", "bank_code"],
    },
  },
  {
    name: "initiate_transfer",
    description:
      "Sends money. It shows the amount and recipient on the customer's screen, waits for their fingerprint, then sends it. Before using it, read back the amount and who it is going to, and wait for a spoken yes. It replies at once with status prompt_on_screen. Then tell the customer: \"It's on your screen. Touch your fingerprint sensor to send it.\" and wait quietly. The result, with the new balanceKobo, arrives later as an [App update] message, and the receipt opens on the customer's screen. amount_kobo is the amount in kobo: 100 kobo is 1 naira, so 50 naira is 5000.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        account_number: {
          type: "string",
          description: "The recipient's 10 digit account number, digits only",
        },
        bank_code: { type: "string", description: "The recipient's bank code" },
        amount_kobo: {
          type: "integer",
          description: "The amount in kobo. 100 kobo is 1 naira",
        },
      },
      required: ["account_number", "bank_code", "amount_kobo"],
    },
  },
  {
    name: "show_receipt",
    description:
      "Shows a receipt on the customer's screen. To show the receipt for a transaction from their history, pass that transaction's reference from get_transactions. Leave reference out to show the receipt for the transfer just made. If it replies with the error no_receipt, find the transaction with get_transactions and use show_receipt again with its reference.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        reference: {
          type: "string",
          description: "The reference of a transaction from get_transactions",
        },
      },
    },
  },
  {
    name: "close_receipt",
    description:
      "Closes the receipt on the customer's screen. Use it when the customer asks you to close it.",
  },
  {
    name: "log_out",
    description:
      "Logs the customer out. Their sign-in ends at once and can't be used again, and any receipt on screen closes. Use it when the customer asks to log out or sign out. Afterwards they need their fingerprint again before any banking.",
  },
];
