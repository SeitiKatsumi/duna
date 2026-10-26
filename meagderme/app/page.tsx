import Landing from './landing';
import {getContent} from './server';
export const dynamic='force-dynamic';
export default async function Home() { return <Landing content={await getContent()} />; }
