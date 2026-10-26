import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Megaderme Duo por locação em Brasília | Duna Equipamentos",
  description: "Radiofrequência microagulhada e Multi Layer para sua clínica. Conheça o Megaderme Duo e solicite uma proposta de locação com a Duna em Brasília.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
