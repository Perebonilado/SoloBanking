export function groupAccountNumber(accountNumber: string) {
  return accountNumber.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3");
}
