export function requireText(value: unknown, name: string): string {
  const text = typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
  if (!text) throw new Error(`${name} is required`);
  return text;
}

export function optionalText(value: unknown): string | undefined {
  const text = typeof value === "string" ? value.trim() : "";
  return text || undefined;
}

export function requireAccountNumber(value: unknown, name: string): string {
  const digits = requireText(value, name).replace(/\D/g, "");
  if (digits.length !== 10) throw new Error(`${name} must be 10 digits`);
  return digits;
}

export function optionalAccountNumber(
  value: unknown,
  name: string,
): string | undefined {
  return optionalText(value) === undefined
    ? undefined
    : requireAccountNumber(value, name);
}

export function requirePositiveInteger(value: unknown, name: string): number {
  const number = typeof value === "string" ? Number(value) : value;
  if (typeof number !== "number" || !Number.isSafeInteger(number) || number < 1) {
    throw new Error(`${name} must be a whole number above 0`);
  }
  return number;
}

export function optionalPositiveInteger(
  value: unknown,
  name: string,
  fallback: number,
): number {
  return value === undefined || value === null || value === ""
    ? fallback
    : requirePositiveInteger(value, name);
}
