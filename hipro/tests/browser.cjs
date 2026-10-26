/* eslint-disable @typescript-eslint/no-require-imports -- Node QA runner uses bundled Playwright via NODE_PATH. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.2/',{waitUntil:'networkidle'});
await page.getByRole('button',{name:'Só essenciais'}).click();
assert.equal(await page.locator('h1').count(),1);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
assert.equal(await page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)),true);
await page.screenshot({path:'.sites-runtime/hero-desktop.png'});
await page.getByLabel('Locação por dia (R$)').fill('500');
await page.getByLabel('Outros custos no período (R$)').fill('200');
await page.getByLabel('Dias de utilização').fill('2');
assert.match(await page.locator('.result-net').innerText(),/1.200,00/);
assert.match(await page.locator('.result-small').innerText(),/50.0%/);
await page.getByRole('button',{name:'Adicionar procedimento'}).click();
await page.getByLabel('Atendimentos 2',{exact:true}).fill('2');
await page.getByLabel('Valor por atendimento 2',{exact:true}).fill('300');
assert.match(await page.locator('.calculator-result>strong').innerText(),/3.000,00/);
await page.getByLabel('Locação por dia (R$)').fill('');
assert.match(await page.locator('.result-net').innerText(),/—/);
await page.getByLabel('Locação por dia (R$)').fill('500');
await page.getByRole('button',{name:'Receber proposta para este cenário'}).click();
await page.getByLabel('Seu nome',{exact:true}).fill('Teste QA Duna');
await page.getByLabel('WhatsApp',{exact:true}).fill('61999990000');
await page.getByLabel('Clínica',{exact:true}).fill('Clinica teste local');
await page.getByLabel('Especialidade',{exact:true}).fill('Estetica');
await page.getByLabel('Localização',{exact:true}).fill('Brasilia');
await page.getByLabel('Data desejada',{exact:true}).fill('2027-01-10');
await page.getByLabel('Frequência de utilização',{exact:true}).fill('Semanal');
await page.getByRole('checkbox').check();
await page.getByRole('button',{name:'Solicitar minha proposta'}).click();
await page.getByRole('button',{name:'Solicitação registrada'}).waitFor();
assert.match(await page.getByRole('status').innerText(),/registrada/);
for(const route of ['/privacidade','/termos']){const r=await page.goto('http://127.0.0.2'+route);assert.equal(r.status(),200);}
await page.goto('http://127.0.0.2/admin',{waitUntil:'networkidle'});
assert.match(await page.locator('h1').innerText(),/Administração/);
await page.getByRole('tab',{name:'Contatos',exact:true}).click();
await page.getByRole('heading',{name:/Teste QA Duna/}).first().waitFor();
const saved=await page.evaluate(async()=>{const r=await fetch('/api/admin');return r.json();});
const lead=saved.leads.find(l=>JSON.parse(l.payload).name==='Teste QA Duna');
assert.equal(JSON.parse(lead.payload).calculation.result,1800);
assert.equal(lead.crm_status,'pending');
const invalid=await page.evaluate(async()=>{const r=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});return r.status;});assert.equal(invalid,400);
const cross=await context.request.post('http://127.0.0.2/api/admin',{headers:{Origin:'https://not-duna.example'},data:{action:'save'}});assert.equal(cross.status(),403);
await page.getByRole('tab',{name:'Planos',exact:true}).click();
const price=page.getByLabel('Preço (vazio = sob consulta)').first();
await price.fill('123.45');await page.getByRole('button',{name:'Salvar alterações'}).click();await page.getByRole('status').filter({hasText:'Conteúdo salvo'}).waitFor();
const publicPage=await context.newPage();await publicPage.goto('http://127.0.0.2/');assert.match(await publicPage.locator('.plan-price').first().innerText(),/123,45/);await publicPage.close();
await price.fill('');await page.getByRole('button',{name:'Salvar alterações'}).click();await page.waitForResponse(r=>r.url().endsWith('/api/admin')&&r.request().method()==='POST');
await page.goto('http://127.0.0.2/',{waitUntil:'networkidle'});
await page.getByRole('tab',{name:'Corpo',exact:true}).click();assert.match(await page.getByRole('tabpanel').innerText(),/corporais/);
for(const width of [768,390,320]){await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.2/',{waitUntil:'networkidle'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow at '+width);await page.screenshot({path:'.sites-runtime/mobile-'+width+'.png',fullPage:true});}
await page.getByRole('button',{name:'Abrir menu'}).click();await page.getByRole('navigation',{name:'Navegação principal'}).getByRole('link',{name:'Planos',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Abrir menu'}).getAttribute('aria-expanded'),'false');
assert.deepEqual(errors,[]);
console.log(JSON.stringify({passed:true,viewports:[1440,768,390,320],forms:true,persistence:true,admin:true,csrf:true,calculator:true,consoleErrors:errors,testLeadId:lead.id}));
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});



