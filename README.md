# Duna Equipamentos — guia para o Vicente

Este repositório reúne três sites independentes. Comece entrando na pasta do site que vai editar; não existe aplicação, instalação de dependências ou build compartilhado na raiz.

## Onde está cada projeto

```text
duna/                         # raiz do repositório SeitiKatsumi/duna
├── README.md                 # este guia
├── duna/                     # reservado para o futuro site institucional
├── meagderme/                # landing page do Megaderme Duo
└── hipro/                    # landing page HIPRO, com calculadora
```

| Pasta | Situação | Documentação específica |
| --- | --- | --- |
| [`duna/`](duna/) | Espaço reservado; aplicação ainda não criada | [`duna/README.md`](duna/README.md) |
| [`meagderme/`](meagderme/) | Projeto existente importado integralmente | [`meagderme/DEPLOY.md`](meagderme/DEPLOY.md) |
| [`hipro/`](hipro/) | Projeto existente importado integralmente | [`hipro/README.md`](hipro/README.md) |

**Atenção à grafia:** a pasta é `meagderme`, conforme a organização solicitada. O produto continua se chamando **Megaderme Duo**. Use exatamente o nome da pasta nos comandos e na configuração do deploy.

## Clonar e começar

Requisitos: Git, Node.js **22.13 ou superior** e npm. É necessário ter acesso ao repositório e, separadamente, à hospedagem para publicar.

```sh
git clone https://github.com/SeitiKatsumi/duna.git
cd duna
```

Para trabalhar no Megaderme:

```sh
cd meagderme
npm run install:ci
npm run dev -- --hostname 127.0.0.1 --port 80
```

Para trabalhar no HIPRO, em outro terminal a partir da raiz do repositório:

```sh
cd hipro
npm run install:ci
npm run dev -- --hostname 127.0.0.1 --port 80
```

Acesse `http://127.0.0.1/`. Rode **um site por vez nesse endereço**, encerrando o anterior com `Ctrl+C`. Para executar os dois simultaneamente, o HIPRO já documenta a alternativa `--hostname 127.0.0.2 --port 80`, acessível em `http://127.0.0.2/`.

Cada pasta tem seu próprio `package.json`, lockfile, dependências, configuração, imagens e banco. Instale e execute os comandos dentro da pasta correspondente.

## Onde editar

| Necessidade | Megaderme (`meagderme/`) | HIPRO (`hipro/`) |
| --- | --- | --- |
| Página e seções | `app/landing.tsx`, `app/sections.tsx` | `app/landing.tsx` |
| Estilos e responsividade | `app/globals.css` | `app/globals.css` |
| Textos, planos e perguntas iniciais | `app/content.ts` | `lib/content.ts` |
| Fotos e logos | `public/images/` | `public/images/` |
| Administração | `app/admin/` | `app/admin/` |
| Formulário, validação e integrações | `app/api/`, `app/server.ts`, `app/validation.ts` | `app/api/`, `lib/server.ts`, `lib/validation.ts` |
| Calculadora | Não possui | `lib/calculator.ts` |
| Banco e migrações | `db/`, `drizzle/` | `db/`, `drizzle/` |
| Privacidade e termos | `app/privacidade/`, `app/termos/` | `app/privacidade/`, `app/termos/` |

Os dois sites possuem as rotas `/`, `/admin`, `/privacidade` e `/termos`. A pasta no GitHub **não é um prefixo de URL**: não existe configuração automática para servir `/hipro` ou `/meagderme` no mesmo domínio. Cada site foi preparado para servir na raiz de sua própria publicação.

Textos e planos salvos pelo painel ficam no banco e podem prevalecer sobre o conteúdo inicial dos arquivos. O clone contém o código e as migrações, não os contatos, os conteúdos já salvos na produção ou o banco de produção.

## Ambiente, banco e acesso administrativo

Use o `.env.example` de cada site como referência. Arquivos `.env.local` e `.env`, credenciais, bancos locais, backups e `node_modules` não foram importados.

| Variável | Megaderme | HIPRO |
| --- | --- | --- |
| Administradores autorizados | `ADMIN_EMAILS` | `ADMIN_EMAIL` |
| Endpoint do CRM | `CRM_WEBHOOK_URL` | `CRM_WEBHOOK_URL` |
| Segredo do CRM | `CRM_WEBHOOK_TOKEN` | `CRM_WEBHOOK_TOKEN` |
| Link do agente externo | Não configurado nesta implementação | `DUNA_AGENT_URL` |

**Os nomes das variáveis de administrador diferem entre os projetos.** A autenticação hospedada usa ChatGPT/Sites; sem a lista de administradores autorizados, o painel nega acesso. A identidade simulada de desenvolvimento nunca deve ser autorizada em produção.

Os bancos usam SQLite por meio do Cloudflare D1, separadamente por site. Depois de gerar o build local, siga a documentação específica para aplicar as migrações ao banco local. Não misture os bancos nem reaplique manualmente migrações já executadas. Migrações de produção são tratadas pelo fluxo de publicação.

O WhatsApp é cadastrado no painel. CRM, agente, notificações e condições comerciais dependem dos acessos e definições aprovados pela Duna. Copiar o projeto para este repositório não ativa essas integrações.

## Validação antes de publicar alterações

Dentro de `meagderme/`:

```sh
node scripts/check.mjs
npx tsc --noEmit
npm run lint
npm run build
```

Dentro de `hipro/`:

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

As instruções específicas também explicam os testes de formulário/banco. Execute testes que criam contatos somente em banco local, com integrações externas desativadas. Confira navegação, envio de formulário, imagens, planos e apresentação em desktop e celular após alterações.

## Deploy: o que já existe e o que este repositório faz

Os dois projetos usam React com Vinext/Vite e geram um Worker para Cloudflare. **Não são sites puramente estáticos:** formulário, administração e banco precisam do servidor.

- Raiz de build do Megaderme: `meagderme/`.
- Raiz de build do HIPRO: `hipro/`.
- Raiz futura do institucional: `duna/`, ainda sem aplicação.
- Cada `.openai/hosting.json` preserva a identidade do respectivo site no Sites. Não copie a identidade de um produto para outro nem para o institucional.
- Saídas de build: `dist/server/index.js` e `dist/client/`, dentro de cada projeto.
- Configure segredos e variáveis na hospedagem, nunca no manifesto ou no código.
- O ambiente público deve usar HTTPS; a prévia local utiliza porta 80.

Esta entrega **organiza o código no GitHub**. Ela não troca a origem configurada no Sites, não configura CI/CD, não altera domínios e não republica as aplicações. Um `git push` neste repositório, por si só, não atualiza os sites publicados. Use o fluxo de publicação da hospedagem ou configure um pipeline independente para cada pasta.

Endereços registrados nos projetos (o acesso pode exigir a conta autorizada):

- [Megaderme Duo](https://duna-megaderme-duo.seitikatsumi.chatgpt.site/)
- [HIPRO](https://duna-hipro-brasilia.seitikatsumi.chatgpt.site/)

Ao definir domínios próprios, atualizar sitemap, robots e metadados em cada projeto. No Megaderme, consulte `app/sitemap.ts` e `app/robots.ts`; no HIPRO, `public/sitemap.xml`, `public/robots.txt` e `app/layout.tsx`.

## Trabalho em equipe

Antes de começar, faça `git pull` na branch principal e abra uma branch para sua alteração. Restrinja a mudança ao site correspondente. Evite executar instalação/build na raiz ou mover arquivos de um produto para a pasta do outro.

Os repositórios anteriores continuam existindo como origem histórica; não há sincronização automática entre eles e este repositório. Combine com a equipe usar `SeitiKatsumi/duna` para as próximas alterações.

Importação realizada em **26/10/2026**. Megaderme importado do commit `e680294e9696a8308482befc07f0b4c2da6c53c4`; HIPRO, de `ca96152705276f058ffac576b5b8421979e254d6`. Os conteúdos importados foram comparados por hash de árvore Git e os testes de validação do Megaderme e da calculadora HIPRO passaram. Não houve mudança no código das aplicações nesta organização.
