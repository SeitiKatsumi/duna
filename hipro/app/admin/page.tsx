import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { isAdmin } from "@/lib/server";
import { readContent } from "@/db";
import Admin from "./panel";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Administração | Duna Equipamentos",
  robots: { index: false, follow: false },
};
export default async function Page() {
  await requireChatGPTUser("/admin");
  if (!(await isAdmin()))
    return (
      <main className="legal">
        <a href="/">Duna Equipamentos</a>
        <h1>Acesso restrito</h1>
        <p>
          Esta conta não está autorizada a administrar o site. O responsável
          deve configurar seu e-mail na variável ADMIN_EMAIL da hospedagem.
        </p>
        <a href="/signout-with-chatgpt?return_to=/">Sair desta conta</a>
      </main>
    );
  return <Admin initial={await readContent()} />;
}
