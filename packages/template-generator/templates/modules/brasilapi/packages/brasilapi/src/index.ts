/**
 * Thin wrappers for BrasilAPI endpoints. No auth.
 * Full list: https://brasilapi.com.br/docs
 */

const BASE = "https://brasilapi.com.br/api";

async function j<T>(path: string): Promise<T> {
  const r = await fetch(BASE + path);
  if (!r.ok) throw new Error(`BrasilAPI ${path} → ${r.status}`);
  return (await r.json()) as T;
}

export function cep(cep: string) {
  const d = cep.replace(/\D/g, "");
  return j<{
    cep: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    location?: { coordinates?: { latitude: number; longitude: number } };
  }>(`/cep/v2/${d}`);
}

export function cnpj(cnpj: string) {
  const d = cnpj.replace(/\D/g, "");
  return j<{
    cnpj: string;
    razao_social: string;
    nome_fantasia: string;
    cnae_fiscal: number;
    cnae_fiscal_descricao: string;
  }>(`/cnpj/v1/${d}`);
}

export const banks = () => j<Array<{ code: number; name: string; ispb: string }>>("/banks/v1");
export const feriados = (year: number) =>
  j<Array<{ date: string; name: string; type: string }>>(`/feriados/v1/${year}`);
export const ddd = (d: string) =>
  j<{ state: string; cities: string[] }>(`/ddd/v1/${d}`);
