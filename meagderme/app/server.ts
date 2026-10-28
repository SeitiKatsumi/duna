import {env} from '../../deploy/runtime';
import {database} from '../db';
import {defaultContent,type SiteContent} from './content';
import {getChatGPTUser} from './chatgpt-auth';
export function config(){return env as unknown as {ADMIN_EMAILS?:string;CRM_WEBHOOK_URL?:string;CRM_WEBHOOK_TOKEN?:string;DB?:D1Database};}
export async function isAdmin(){const user=await getChatGPTUser();return !!user&&!!config().ADMIN_EMAILS?.split(',').map(x=>x.trim().toLowerCase()).includes(user.email.toLowerCase());}
export async function getContent():Promise<SiteContent>{
 try{const row=await database().prepare('SELECT value FROM settings WHERE key = ?').bind('content').first<{value:string}>();return row?JSON.parse(row.value):defaultContent;}catch{console.error('Content unavailable; using bundled content.');return defaultContent;}
}
export function sameOrigin(req:Request){const protocol=req.headers.get('x-forwarded-proto')?.split(',')[0]||new URL(req.url).protocol.slice(0,-1);return req.headers.get('origin')===`${protocol}://${req.headers.get('host')}`;}
export async function limited(req:Request,category:string,max:number){
 const now=Date.now(),bucket=Math.floor(now/600000),ip=req.headers.get('cf-connecting-ip')||'local';
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${category}:${bucket}:${ip}`));
 const key=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
 const row=await database().prepare('INSERT INTO rate_limits (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,now+600000).first<{count:number}>();
 await database().prepare('DELETE FROM rate_limits WHERE expires < ?').bind(now).run();return (row?.count||0)>max;
}
export async function syncLead(id:string){
 const {CRM_WEBHOOK_URL:url,CRM_WEBHOOK_TOKEN:token}=config();if(!url)return false;
 if(new URL(url).protocol!=='https:')throw new Error('CRM requires HTTPS');
 const lead=await database().prepare('SELECT * FROM leads WHERE id = ?').bind(id).first();if(!lead||lead.crm_status==='sent')return true;
 const res=await fetch(url,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json','Idempotency-Key':id,...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify({event:'proposal_requested',lead:{...lead,source:JSON.parse(String(lead.source))}}),signal:AbortSignal.timeout(8000)});
 if(!res.ok)throw new Error('CRM delivery failed');await database().prepare('UPDATE leads SET crm_status = ? WHERE id = ?').bind('sent',id).run();return true;
}
