import { groupAccountNumber } from "@/lib/accountNumber";

const DIGIT_WORDS: Record<string, string> = {
  zero: "0",
  oh: "0",
  o: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
};
const REPEATS: Record<string, number> = { double: 2, triple: 3 };

function spokenDigits(text: string): string {
  let digits = "";
  let repeat = 1;
  for (const token of text.toLowerCase().split(/[^a-z0-9]+/)) {
    if (REPEATS[token]) {
      repeat = REPEATS[token];
    } else if (/^\d+$/.test(token)) {
      digits += token.charAt(0).repeat(repeat - 1) + token;
      repeat = 1;
    } else if (DIGIT_WORDS[token]) {
      digits += DIGIT_WORDS[token].repeat(repeat);
      repeat = 1;
    }
  }
  return digits;
}

export class AccountReadBack {
  private readonly confirmed = new Set<string>();
  private olaTurn = "";
  private lastOlaTurnDigits = "";
  private customerAnsweredOla = false;
  private pending: string | null = null;

  olaSaid(text: string) {
    this.olaTurn += ` ${text}`;
  }

  turnEnded() {
    this.lastOlaTurnDigits = spokenDigits(this.olaTurn);
    this.olaTurn = "";
    this.customerAnsweredOla = false;
  }

  customerSpoke() {
    this.customerAnsweredOla = true;
  }

  check(value: unknown): Record<string, unknown> | null {
    const accountNumber = typeof value === "string" ? value.replace(/\D/g, "") : "";
    if (accountNumber.length !== 10 || this.confirmed.has(accountNumber)) {
      return null;
    }
    const readBackAndAnswered =
      this.customerAnsweredOla &&
      (this.pending === accountNumber ||
        this.lastOlaTurnDigits.includes(accountNumber));
    if (readBackAndAnswered) {
      this.confirmed.add(accountNumber);
      this.pending = null;
      return null;
    }
    this.pending = accountNumber;
    const spoken = groupAccountNumber(accountNumber)
      .split(" ")
      .map((group) => group.split("").join(" "))
      .join(", ");
    return {
      status: "read_back_required",
      read_back: spoken,
      instruction:
        "Read this number back to the customer in these groups and ask if it is right, then wait for their answer. If they say yes, say \"Just a moment, please. I'm verifying your account information.\" and use verify_account again with the same number. If they correct it, read the corrected number back the same way.",
    };
  }
}
