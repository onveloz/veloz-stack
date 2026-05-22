# ADR 0001: Registrar decisões de arquitetura

## Status

Aceito

## Contexto

Este projeto foi gerado com `create-veloz-stack`. Escolhas de stack (auth, API, ORM, deploy)
afetam onde código novo deve viver e quais bibliotecas não devem ser introduzidas sem
deliberação.

Agentes de IA e contribuidores precisam de uma fonte explícita de **decisões já tomadas**,
separada de snippets de integração (`.claude/skills/`) e do manifesto reprodutível
(`veloz-stack.jsonc`).

## Decisão

- Decisões arquiteturais ficam em `docs/adr/`.
- Cada ADR descreve contexto, decisão e consequências.
- Novas ADRs numeram-se sequencialmente; ADRs substituídas marcam status **Supersedido**
  com link para a ADR que as substitui.
- Não troque auth, camada de API, ORM ou estratégia de deploy sem ler as ADRs ativas
  e, se necessário, adicionar uma ADR que documente a mudança.

## Consequências

- `docs/adr/README.md` lista as ADRs emitidas para este scaffold.
- Skills em `.claude/skills/` cobrem **como** integrar fornecedores; ADRs cobrem **o quê**
  e **por quê** no desenho do sistema.
