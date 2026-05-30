# Plano de Deploy — Veloz

**Data/hora inicial:** 2026-04-17  
**Última verificação:** 2026-05-30 (`output: export`, serviço estático, pnpm 11, Turborepo)  
**Referência canônica (EN):** [docs/deploy-web.md](docs/deploy-web.md)

**Framework:** Next.js 16 (App Router; `output: "export"`)  
**Package manager:** pnpm 11 (`packageManager` no root `package.json`)  
**Monorepo:** Turborepo  
**Org:** Veloz

---

## Contexto

Projeto: `veloz-stack` — monorepo pnpm + Turborepo.  
App deployado: `apps/web` — site estático (landing + stack builder em `/new`).  
Outros apps: `apps/cli` (`create-veloz-stack`) — pacote npm, não deployado como serviço web.  
Packages internos: `packages/template-generator`, `packages/types`.

---

## Configuração atual (fonte: `veloz.json`)

| Campo | Valor |
| ----- | ----- |
| Serviço | `web` (`apps/web`) |
| Tipo | **`static`** (não é container Node com `next start`) |
| Branch | `main` |
| Build method | `turborepo` |
| Build command | `pnpm --filter @veloz-stack/template-generator run gen && pnpm run build` |
| Output dir | **`apps/web/out`** |
| URL | https://www.veloz-stack.com |

### Por que `gen` antes do build?

`packages/template-generator/src/templates.generated.ts` está em `.gitignore`. O build na Veloz (e no CI) roda `gen` antes de compilar o web app para embutir os templates Handlebars.

### Env vars

Nenhuma obrigatória para o stack builder público. Opcional: `NEXT_PUBLIC_SHOW_LEGACY_HUSKY=true` (ver [deploy-web.md](docs/deploy-web.md)).

---

## Histórico de deploy (arquivo)

| Deploy | Status | Motivo |
| ------ | ------ | ------ |
| dep_552Awm9NT8wG | BUILD_FAILED | Nixpacks não detectou start command no monorepo |
| dep_X1KRPClPH7BF | BUILD_FAILED | Nome do serviço com `@/` causava referência inválida no registry |
| dep_yvXTLE9V8r0c | BUILD_FAILED | `templates.generated.ts` ausente (em .gitignore) |
| dep_final | **LIVE** | Build command corrigido; depois migrado para **static** + `apps/web/out` |

**Nota:** deploys antigos usavam Nixpacks + `next start` na porta 3000. A configuração atual em `veloz.json` é **site estático** — não use `next start` como referência de produção.

---

## Health check

- **HTTP:** GET https://www.veloz-stack.com/ → **200 OK**
- Artefatos servidos de `apps/web/out` após `next build` com export estático.

---

## Arquivos relevantes

| Arquivo | Papel |
| ------- | ----- |
| `veloz.json` | Config Veloz (gerado/atualizado pelo CLI — preferir `veloz deploy` a editar manualmente) |
| `veloz-deploy-plano.md` | Este runbook operacional (PT) |
| `docs/deploy-web.md` | Referência EN (build, env, `veloz.json`) |
| `apps/web/next.config.mjs` | `output: "export"` |
| `.gitignore` | Ignora `apps/web/out` |

---

## Comandos úteis

```bash
# Logs
veloz logs --project veloz-stack --service web

# Re-deploy após push
veloz deploy --service web --yes

# Build local (mesma ordem do deploy)
pnpm --filter @veloz-stack/template-generator gen
pnpm --filter @veloz-stack/web build

# Smoke-test estático local
pnpm dlx serve apps/web/out -p 3100
```

---

## Publicar o CLI (`apps/cli`)

O `create-veloz-stack` é publicado no npm, não na Veloz como serviço web:

```bash
pnpm --filter create-veloz-stack build
npm publish
```
