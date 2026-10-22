const NAIRA = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  trailingZeroDisplay: "stripIfInteger",
});

const NAIRA_EXACT = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
});

export function formatNaira(kobo: number): string {
  return NAIRA.format(kobo / 100);
}

export function formatBalance(kobo: number): string {
  return NAIRA_EXACT.format(kobo / 100);
}
