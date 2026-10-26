# Duna Equipamentos · HIPRO
Landing page em português para locação HIPRO em Brasília, com imagens fornecidas pela Duna, calculadora, planos editáveis e solicitações comerciais persistentes.

## Executar e validar
Node >= 22.13. npm ci, npm run db:generate (somente ao alterar schema), npm run build.
Aplicar cada migração pendente uma única vez:
`node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_confused_shiva.sql`
`npm run dev -- --hostname 127.0.0.2 --port 80`
`node tests/calculator.test.mjs`
`npx tsc --noEmit`
`npx eslint app lib db --ignore-pattern "lib/connector*"`

A prévia usa http://127.0.0.2:80 para preservar outro projeto que já ocupava 127.0.0.1:80. O suporte a esse endereço foi adicionado somente ao mock local de autenticação. Em produção não há mock.
O teste opcional `node tests/browser.cjs` usa Playwright e Edge locais; coloque o Playwright disponível no NODE_PATH. Ele testa formulário, cálculo, banco, edição administrativa, origem inválida e larguras 1440/768/390/320. Use apenas banco local, pois cria um contato identificado como teste e altera/restaura um preço. Nenhuma integração externa deve estar configurada durante esses testes.

## Rotas e arquivos
- /: app/landing.tsx e app/globals.css.
- /admin: app/admin (conteúdo, três planos, FAQ, campanha, contatos e exportação).
- /privacidade e /termos: páginas legais.
- /api/leads: validação, antispam, persistência, cenário recalculado no servidor e encaminhamento opcional.
- lib/calculator.ts: valores em centavos; receita, custos, resultado, margem e equilíbrio.
- lib/content.ts: conteúdo inicial e validação do CMS.
- db/schema.ts e drizzle/: SQLite gerenciado pelo Cloudflare D1.
- public/images/: fotos WebP otimizadas e logo. Fotografias fornecidas mostram HIPRO HOF.

## Administração e acesso
A autenticação usa a conta ChatGPT/Sites. Configure ADMIN_EMAIL na hospedagem com os e-mails autorizados separados por vírgulas. Sem a configuração, o painel e sua API negam acesso. Não autorize todos os usuários autenticados.
No desenvolvimento, .env.local pode conter ADMIN_EMAIL=seedy@sites.test, a identidade simulada pelo starter. Nunca copie esse valor para produção.
Os planos iniciam com price=null e exibem “Sob consulta”. Salvar a administração atualiza o banco sem recompilar.
Para imagens, informe uma URL HTTPS autorizada ou um caminho /images/. Vídeo opcional é um link externo, carregado somente após clique.
Exportações de conteúdo e de contatos estão disponíveis no painel. O painel lista/exporta os últimos 200 contatos; para backup integral, use a exportação do D1 pela hospedagem. Não versionar backups nem dados pessoais.
Configure a rotina de backup e a retenção segundo a política aprovada pela Duna; nenhuma periodicidade de backup é assumida.

## Integrações e pendências comerciais
Variáveis em .env.example; segredos somente na hospedagem:
- ADMIN_EMAIL: acesso ao painel.
- CRM_WEBHOOK_URL: endpoint HTTPS aprovado.
- CRM_WEBHOOK_TOKEN: Bearer token opcional, secreto.
- DUNA_AGENT_URL: endereço HTTPS do agente Duna; exibe acesso ao atendimento externo.

Contrato do adaptador CRM: POST JSON `{event:"duna.lead.created",id,data}`, cabeçalho Idempotency-Key igual ao id e Authorization Bearer quando configurado. data inclui contato, equipamento, plano, período, cenário, cálculo, consentimento, versão da política e UTM consentida. HTTP 2xx confirma a entrega. O receptor deve deduplicar pelo id. Timeout 10 segundos, sem redirecionamentos. A oportunidade permanece no banco quando o serviço falha e pode ser reenviada no painel. Não existe API nativa Elevenmind presumida: é necessário confirmar a documentação/endpoint do AppCenter antes de ativar o adaptador.

WhatsApp é editável no painel. Quando ausente, nenhum número é inventado. O botão usa wa.me e, quando solicitado, inclui o cenário. Nenhuma mensagem é enviada automaticamente.
O agente externo só aparece quando sua URL é configurada. Conversas, histórico, funil remoto, documentos do agente, respostas e transferência humana dependem da configuração do fornecedor; não foram simulados nesta entrega.
Medição própria agrega quatro eventos somente após consentimento. UTM é anexada ao lead com consentimento. Pixels de anúncios/GA não estão ativos, aguardando os identificadores e configuração da Duna.
Campanha “Cobrimos qualquer concorrência” implementada e desativada até cadastrar/aprovar critérios.
Nenhum depoimento, dado institucional, vídeo, disponibilidade, preço ou promessa clínica foi inventado.
Confirmar versão e aplicadores, logística, regras comerciais, identificação jurídica, e-mail de privacidade, WhatsApp, administrador e domínio antes da divulgação pública.

## Cálculo
Quantidade por procedimento refere-se ao período inteiro. Receita = soma(quantidade × preço). Locação = diária × dias; outros custos = total do período. Campos vazios de custo tornam custos, resultado, margem e equilíbrio desconhecidos. Zero explícito é aceito.
Equilíbrio = teto(custos / ticket médio ponderado), mantendo a composição dos procedimentos e tratando custos informados como fixos; não substitui análise de custos variáveis e impostos.
Valores de 4 atendimentos a R$600 são apenas exemplo editável, claramente identificado; não são preços Duna ou sugestões do fabricante.

## Hospedagem e produção
Manifesto .openai/hosting.json identifica a publicação Sites e o banco D1. O Worker de produção oferece HTTPS; porta 80 é utilizada na prévia local. Nunca publicar a pasta de desenvolvimento por servidor estático, pois o formulário e a administração dependem do servidor.
Publicação privada para revisão; domínio próprio, audiência pública, integrações e administrador dependem de configuração. Não exponha a prévia Vite na internet. Atualize sitemap/robots e metadados ao definir o domínio final.
As migrações são aplicadas pela publicação Sites. Nunca reescrever uma migração já aplicada.
Não há segredos, banco local ou solicitações de clientes no Git.

## Fontes técnicas
- https://contourline.com.br/invista-no-ultrassom-microfocado-mais-rentavel-do-brasil-hipro/
- https://contourline.com.br/hipro-ultrassom-microfocado/
- https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
Especificações gerais não confirmam a configuração disponível na Duna. Textos legais precisam dos dados institucionais definitivos antes da divulgação.


## Verificação desta entrega
Build, TypeScript, cálculo, formulário com cenário, persistência, edição de preço, bloqueio de origem inválida e navegação foram verificados. Inspeção visual em desktop, tablet e mobile; larguras 1440, 768, 390 e 320 sem overflow. Nenhum erro JavaScript no teste de navegador. WebMCP é detectado opcionalmente; validação em navegador com implementação nativa não estava disponível. CRM/agente/WhatsApp sem configuração não foram declarados integrados.

