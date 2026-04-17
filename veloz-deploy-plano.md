# Plano de Deploy — Veloz

**Data/hora inicial:** 2026-04-17
**Framework detectado:** Next.js 15 (App Router)
**Package manager:** pnpm (v10.14.0)
**Monorepo:** Turborepo
**Org:** Veloz

---

## Contexto

Projeto: `veloz-stack` — monorepo pnpm + Turborepo.
App deployado: `apps/web` — Next.js 15 App Router (landing page + stack builder).
Outros apps no monorepo: `apps/cli` (CLI `create-veloz-stack`), não deployado.
Packages internos: `packages/template-generator`, `packages/types`.

---

## Detecção

- Nenhum deploy existente em outras plataformas (Vercel, Railway, Fly, etc.)
- Nenhum Dockerfile existente para o app web
- Nenhum banco de dados detectado (app 100% front-end/SSR estático)
- Nenhuma variável de ambiente necessária

---

## Configuração

### Serviço
- **Nome:** `web`
- **Projeto:** `veloz-stack`
- **Tipo:** WEB
- **App path:** `apps/web`
- **Branch:** `main`
- **Método de build:** Nixpacks (auto-detect)

### Build customizado
- **Motivo:** O arquivo `packages/template-generator/src/templates.generated.ts` está em `.gitignore` (gerado pelo script `gen`). O Turborepo não executa o `prebuild` automaticamente, então o arquivo não estava disponível no ambiente de build.
- **Solução:** Build command customizado que gera o arquivo antes do `turbo build`.
- **Build command:** `pnpm --filter @veloz-stack/template-generator run gen && pnpm run build`
- **Start command:** `pnpm --filter @veloz-stack/web exec next start`
- **Porta:** 3000

### Env vars configuradas
- Nenhuma (app não requer env vars)

---

## Deploy

| Deploy | Status | Motivo |
|--------|--------|--------|
| dep_552Awm9NT8wG | BUILD_FAILED | Nixpacks não detectou start command no monorepo |
| dep_X1KRPClPH7BF | BUILD_FAILED | Nome do serviço com `@/` causava referência inválida no registry |
| dep_yvXTLE9V8r0c | BUILD_FAILED | `templates.generated.ts` ausente (em .gitignore) |
| dep_final | **LIVE** | Build command corrigido para gerar templates antes do build |

**URL final:** https://veloz-stack.runveloz.com

---

## Health Check

- **HTTP check:** GET https://veloz-stack.runveloz.com/ → **200 OK** (0.9s, 27KB)
- **Logs:** Next.js 15.5.15 iniciou em 1094ms. Nenhum erro.
- **Métricas:** 0 restarts, 0 OOM events, 0% CPU throttle.

**Resultado: SAUDÁVEL**

---

## Arquivos Criados/Modificados

- `veloz-deploy-plano.md` — este arquivo (criado pelo wizard)
- `veloz.json` — gerado automaticamente pelo CLI no primeiro deploy (NÃO editar manualmente)
- `.claude/skills/veloz-llms.txt` — documentação da plataforma (criado pelo wizard)

**Nenhum arquivo de código do usuário foi modificado.**

---

## Próximos Passos

### Comandos úteis

```bash
# Ver logs em tempo real
veloz logs --project veloz-stack --service web

# Re-deploy após push de código
veloz deploy --service web --yes

# Ver métricas
veloz metrics show --service web

# Ver builds recentes
veloz builds list --service web
```

### Observação importante

O arquivo `packages/template-generator/src/templates.generated.ts` está em `.gitignore`.
O build na Veloz usa o comando customizado `pnpm --filter @veloz-stack/template-generator run gen && pnpm run build` para gerá-lo em tempo de build.

Se você adicionar novos templates, o CI na Veloz vai gerá-los automaticamente — não precisa commitar o arquivo gerado.

### Deploy do CLI (`apps/cli`)

O `create-veloz-stack` (CLI npm) não foi deployado — é um pacote npm, não um serviço web. Para publicar no npm:

```bash
pnpm --filter create-veloz-stack build
npm publish
```
