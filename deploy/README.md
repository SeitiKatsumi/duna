# Publicação Duna no servidor 02

- Home: app `duna-home`, porta 80.
- Megaderme: app `duna-megaderme`, porta 3000, URL `/meagderme`.
- HIPRO: app `duna-hipro`, porta 3000, URL `/hipro`.
- Cada LP deve ter um volume persistente exclusivo montado em `/data`. O banco SQLite é criado nesse volume na primeira consulta.
- `deploy/nginx-home.conf` encaminha as duas rotas mantendo seus prefixos; a home liga as páginas pelos cards de produto.

Pacotes: `node deploy/package-lp.cjs meagderme` e `node deploy/package-lp.cjs hipro`. Os arquivos ficam em `.deploy-artifacts/`. Publicar cada pacote no aplicativo correspondente. Para a home, empacotar `captain-definition`, `Dockerfile.home`, `deploy/nginx-home.conf`, `duna/index.html` e `duna/assets`.

Verificação mínima: `node deploy/runtime-check.mjs`; build Next em cada LP; conferir página, imagens, formulário, origem inválida e acesso administrativo negado. Não usar dados reais em testes.

As solicitações ficam persistidas localmente. CRM só entrega com `CRM_WEBHOOK_URL` e credencial configurados; sem isso, permanece pendente. O login administrativo da hospedagem anterior não é aceito no CapRover: `DUNA_SELF_HOSTED=1` bloqueia a identidade injetada por cabeçalhos. Nunca habilitar acesso administrativo por cabeçalhos enviados pelo visitante.
