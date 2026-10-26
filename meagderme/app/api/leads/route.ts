import {database} from '../../../db';
import {leadSchema} from '../../validation';
import {getContent,limited,sameOrigin,syncLead} from '../../server';
export async function POST(req:Request){
 if(!sameOrigin(req))return Response.json({error:'Origem inválida.'},{status:403});
 try{
  const raw=await req.text();if(raw.length>10000)return Response.json({error:'Solicitação muito grande.'},{status:413});
  const result=leadSchema.safeParse(JSON.parse(raw));if(!result.success)return Response.json({error:'Confira os campos e autorize o contato antes de enviar.'},{status:400});
  const p=result.data;const content=await getContent();if(!['Preciso de orientação',...content.plans.map(x=>x.name)].includes(p.plan))return Response.json({error:'Selecione um plano disponível.'},{status:400});
  if(await limited(req,'lead',5))return Response.json({error:'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.'},{status:429});
  await database().prepare('INSERT INTO leads (id,created_at,name,clinic,specialty,phone,location,period,plan,source,referrer,consent_version,crm_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(p.requestId,Date.now(),p.name,p.clinic,p.specialty,p.phone,p.location,p.period,p.plan,JSON.stringify(p.source),p.referrer,'2026-10-02','pending').run();
  try{await syncLead(p.requestId);}catch{console.error('CRM delivery pending; lead retained for retry.');}
  return Response.json({ok:true},{status:201});
 }catch(error){if(error instanceof SyntaxError)return Response.json({error:'Dados inválidos.'},{status:400});console.error('Lead storage failed.');return Response.json({error:'Não foi possível registrar agora. Tente novamente; seus dados permanecem no formulário.'},{status:503});}
}
