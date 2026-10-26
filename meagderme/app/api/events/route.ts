import {database} from '../../../db';
import {limited,sameOrigin} from '../../server';
export async function POST(req:Request){
 if(!sameOrigin(req))return new Response(null,{status:403});
 try{const raw=await req.text();if(raw.length>500)return new Response(null,{status:413});const {event,plan=''}=JSON.parse(raw);if(!['whatsapp_clicked','plan_selected','lead_submitted'].includes(event)||typeof plan!=='string'||plan.length>100)return new Response(null,{status:400});if(await limited(req,'event',60))return new Response(null,{status:429});const key=`${new Date().toISOString().slice(0,10)}|${event}|${plan}`;await database().prepare('INSERT INTO events (key,count) VALUES (?,1) ON CONFLICT(key) DO UPDATE SET count=count+1').bind(key).run();return new Response(null,{status:204});}catch{return new Response(null,{status:503});}
}
