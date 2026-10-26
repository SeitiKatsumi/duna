# Duna · Megaderme Duo

Landing page em português com as fotos e a marca fornecidas, planos editáveis, formulário persistido em SQLite/D1 e gestão autenticada em `/admin`.

## Executar e verificar

Requer Node 22.13+ e npm. Execute na pasta `site`:

```sh
npm run install:ci
npm run dev -- --port 80
node scripts/check.mjs
npx tsc --noEmit
npm run lint
npm run build
```

O comando `TEST_BASE_URL=http://localhost node scripts/check.mjs` também verifica rotas, bloqueio de acesso administrativo, origem, consentimento e envio idempotente. No PowerShell, defina `$env:TEST_BASE_URL='http://localhost'` antes de executar. Ele grava somente dados sintéticos no banco LOCAL. Para testes completos do formulário, aplique a migração local após o build:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_groovy_chimera.sql
```

## Publicação

A identidade Sites está em `.openai/hosting.json`. O build gera `dist/server/index.js` e assets em `dist/client`. A plataforma publica com HTTPS e aplica as migrações de `drizzle/`; não edite migrações já aplicadas. O desenvolvimento usa porta 80; a hospedagem gerenciada atende pelas portas HTTP/HTTPS padrão.

O site começa privado para revisão. Domínio próprio e abertura pública dependem da definição do usuário. Após trocar o domínio, atualizar `app/sitemap.ts` e `app/robots.ts`.

## Operação e integrações

- `ADMIN_EMAILS`: e-mails autorizados, separados por vírgula. Login usa o fluxo ChatGPT da hospedagem; sem lista configurada, a gestão fica bloqueada. Nunca usar a conta de teste local em produção.
- `CRM_WEBHOOK_URL` e `CRM_WEBHOOK_TOKEN`: configurar somente no ambiente servidor. O destino deve ser HTTPS e compatível com o contrato abaixo. A documentação e os acessos do AppCenter Elevenmind ainda precisam ser fornecidos para validar o adaptador.
- WhatsApp: editar o número na gestão, com país e DDD. Sem número, os contatos apontam para o formulário; não existe número fictício.
- Preços, cobrança, aplicadores, consumíveis, logística e suporte: cadastráveis nos planos. Os valores iniciais são “Sob consulta”.
- Campanha de cobertura de propostas e vídeo são opcionais e ficam ocultos até o cadastro de material autorizado e condições confirmadas.

O formulário salva antes de tentar o CRM. Entregas falhas permanecem com `crm_status=pending` e podem ser reenviadas pelo administrador, em lotes de 10. O receptor deve deduplicar pelo cabeçalho `Idempotency-Key`. Payload:

```json
{"event":"proposal_requested","lead":{"id":"uuid","name":"...","clinic":"...","specialty":"...","phone":"...","location":"...","period":"...","plan":"...","source":{"utm_source":"..."},"referrer":"...","consent_version":"2026-10-02"}}
```

Não há confirmação artificial de entrega ao CRM. Notificações à equipe devem ser configuradas no fluxo receptor. O agente de IA e a consulta de disponibilidade ainda dependem do canal, credenciais e base aprovada; nenhum chatbot simulado é apresentado como IA conectada.

## Privacidade, backup e manutenção

Dados de leads ficam no D1. Consentimento obrigatório, validação servidor, limite de tentativas e honeypot protegem o formulário. Cookies analíticos ficam desativados por padrão; contagens agregadas são opcionais. Não há pixels publicitários. Fotos e fontes são locais.

A gestão permite exportar conteúdo e os 500 contatos mais recentes; não substitui backup completo. Para a base completa, usar exportação da hospedagem e verificar a política de retenção/backups da conta antes de abrir ao público. Ainda falta confirmar CNPJ, razão social, contato de privacidade e retenção real com a Duna, além da revisão jurídica do texto.

Arquivos principais: `app/landing.tsx`, `app/sections.tsx`, `app/globals.css`, `app/content.ts`, `app/admin/`, `app/api/`, `db/schema.ts`, `public/images/`.
