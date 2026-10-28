import Landing from "./landing";
import { readContent } from "@/db";
import { env } from '../../deploy/runtime';
export const dynamic = "force-dynamic";
export default async function Home() {
  const content = await readContent();
  const agentUrl =
    env.DUNA_AGENT_URL && /^https:\/\//.test(env.DUNA_AGENT_URL)
      ? env.DUNA_AGENT_URL
      : "";
  return <Landing content={content} agentUrl={agentUrl} />;
}
