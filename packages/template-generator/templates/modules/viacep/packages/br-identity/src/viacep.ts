/**
 * ViaCEP — CEP → endereço lookup.
 * Free, no auth. No SDK, just fetch.
 *
 * ⚠ Non-existent CEP returns HTTP 200 with `{ "erro": "true" }` (string!).
 */

export type Endereco = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  complemento?: string;
};

/** @internal Scaffold pipeline step. */
export async function lookupCep(cep: string): Promise<Endereco | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) throw new Error("CEP inválido: use 8 dígitos");

  const r = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!r.ok) throw new Error(`ViaCEP respondeu ${r.status}`);

  const data = (await r.json()) as Endereco & { erro?: string | boolean };
  if (data.erro) return null;
  return data;
}

