/**
 * CPF / CNPJ validation + formatting for Brazil.
 * No deps. Uses the official mod-11 algorithm.
 */

function stripDigits(s: string): string {
  return s.replace(/\D/g, "");
}

/** @internal Scaffold pipeline step. */
export function isValidCpf(input: string): boolean {
  const d = stripDigits(input);
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const digits = d.split("").map(Number);

  for (const j of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < j; i++) sum += digits[i]! * (j + 1 - i);
    const rem = (sum * 10) % 11 % 10;
    if (rem !== digits[j]) return false;
  }
  return true;
}

/** @internal Scaffold pipeline step. */
export function isValidCnpj(input: string): boolean {
  const d = stripDigits(input);
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const digits = d.split("").map(Number);

  const factors1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const factors2 = [6, ...factors1];

  const check = (factors: number[], upTo: number, expected: number): boolean => {
    let sum = 0;
    for (let i = 0; i < upTo; i++) sum += digits[i]! * factors[i]!;
    const rem = sum % 11;
    const dv = rem < 2 ? 0 : 11 - rem;
    return dv === expected;
  };

  return check(factors1, 12, digits[12]!) && check(factors2, 13, digits[13]!);
}

/** @internal Scaffold pipeline step. */
export function formatCpf(input: string): string {
  const d = stripDigits(input).padStart(11, "0").slice(0, 11);
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

/** @internal Scaffold pipeline step. */
export function formatCnpj(input: string): string {
  const d = stripDigits(input).padStart(14, "0").slice(0, 14);
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

