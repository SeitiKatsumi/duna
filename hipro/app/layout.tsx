import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Locação HIPRO em Brasília | Duna Equipamentos",
  description:
    "Amplie as possibilidades da sua clínica com a locação do HIPRO pela Duna em Brasília. Conheça os planos, simule seu retorno e solicite uma proposta.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
