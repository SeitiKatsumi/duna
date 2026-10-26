import assert from 'node:assert/strict';
import {leadSchema,contentSchema} from '../app/validation.ts';
import {defaultContent} from '../app/content.ts';
assert(contentSchema.safeParse(defaultContent).success);
const valid={requestId:crypto.randomUUID(),name:'Teste QA',clinic:'Clínica QA',specialty:'Dermatologia',phone:'(61) 99999-0000',location:'Brasília',period:'Novembro',plan:'Locação pontual',website:'',consent:true,source:{utm_source:'qa'},referrer:''};
assert.equal(leadSchema.parse(valid).phone,'61999990000');
for(const change of [{consent:false},{phone:'abc'},{website:'spam'},{name:' '},{source:{unexpected:'value'}}])assert(!leadSchema.safeParse({...valid,...change}).success);
assert(!contentSchema.safeParse({...defaultContent,darkImage:'javascript:alert(1)'}).success);
const base=process.env.TEST_BASE_URL;
if(base){
 assert(['localhost','127.0.0.1'].includes(new URL(base).hostname),'Integration checks are local only');
 for(const path of ['/','/privacidade','/termos','/robots.txt','/sitemap.xml','/images/megaderme-dark.webp'])assert.equal((await fetch(base+path)).status,200,path);
 assert.equal((await fetch(base+'/api/admin')).status,403);
 const post=(data,origin=base)=>fetch(base+'/api/leads',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(data)});
 assert.equal((await post(valid,'https://invalid.example')).status,403);
 assert.equal((await post({...valid,consent:false})).status,400);
 assert.equal((await post(valid)).status,201);
 assert.equal((await post(valid)).status,201,'Retry must be idempotent');
 console.log('Local QA record:',valid.requestId);
}
console.log('Validation, input safety and requested integration checks passed.');
