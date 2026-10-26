import Link from 'next/link';
import {requireChatGPTUser} from '../chatgpt-auth';
import {isAdmin,getContent} from '../server';
import Editor from './editor';
export const dynamic='force-dynamic';
export const metadata={title:'Gestão | Duna Equipamentos',robots:{index:false,follow:false}};
export default async function Admin(){await requireChatGPTUser('/admin');if(!await isAdmin())return <main className="legal"><Link href="/">Duna Equipamentos</Link><h1>Acesso restrito</h1><p>Esta conta não está autorizada a administrar o site. Solicite acesso ao responsável pela Duna.</p></main>;return <Editor initial={await getContent()}/>;}
