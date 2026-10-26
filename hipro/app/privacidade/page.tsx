import { readContent } from "@/db";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Política de Privacidade | Duna Equipamentos",
};
export default async function Privacy() {
  const c = await readContent();
  return (
    <main className="legal">
      <a href="/">Duna Equipamentos · Voltar ao site</a>
      <h1>Política de Privacidade</h1>
      <p>Atualizada em 2 de outubro de 2026.</p>
      <p>
        Esta política descreve como {c.legalName} trata os dados recebidos neste
        site para atender solicitações de locação do HIPRO.
      </p>
      <h2>Dados recebidos e finalidade</h2>
      <p>
        Ao solicitar uma proposta, recebemos nome, WhatsApp, clínica,
        especialidade, localização, data e frequência desejadas, plano e
        observações. Se você optar por incluir a simulação, também recebemos os
        procedimentos, quantidades, valores e custos informados. Não envie dados
        de pacientes ou informações sensíveis.
      </p>
      <p>
        Usamos esses dados para responder ao seu pedido, avaliar disponibilidade
        e preparar uma proposta. O envio não confirma reserva ou contratação. O
        tratamento para procedimentos preliminares à contratação solicitados por
        você segue o art. 7º, V, da LGPD. A autorização do formulário registra
        sua ciência e preferência por contato sobre a solicitação.
      </p>
      <h2>Armazenamento e compartilhamento</h2>
      <p>
        As solicitações ficam no banco de dados do site e são acessíveis à
        equipe autorizada. Quando configurada, a integração comercial encaminha
        os dados ao CRM AppCenter Elevenmind ou ao serviço autorizado pela Duna,
        para dar continuidade ao atendimento. Serviços de hospedagem e
        infraestrutura podem processar dados em outros países, observadas as
        medidas e bases legais aplicáveis.
      </p>
      <p>
        O WhatsApp e o assistente externo, quando disponíveis, só são abertos
        após sua ação e possuem suas próprias políticas. Não comercializamos
        seus dados. O acesso administrativo é restrito; informações enviadas
        pelo formulário não são públicas.
      </p>
      <h2>Retenção e proteção</h2>
      <p>
        Os dados são mantidos pelo tempo necessário ao atendimento comercial e
        ao cumprimento de obrigações legais. Solicitações de exclusão são
        avaliadas pela equipe. São adotados controles de acesso, validação de
        entradas e proteção contra abuso; nenhum sistema elimina todos os
        riscos.
      </p>
      <h2 id="cookies">Cookies e preferências</h2>
      <p>
        O site armazena no seu navegador apenas a preferência de privacidade. A
        hospedagem pode utilizar cookies necessários à autenticação e segurança.
        A simulação não é salva até o envio do formulário.
      </p>
      <p>
        Com sua permissão para medição, registramos contagens de visualização
        dos planos, simulações encaminhadas, formulários enviados e cliques no
        WhatsApp. Parâmetros UTM da campanha são incluídos na solicitação
        somente com essa permissão. Não carregamos pixels publicitários nesta
        versão. Você pode alterar sua escolha no botão “Cookies” do rodapé.
      </p>
      <p>
        Para limitar envios abusivos, um identificador derivado do IP e do dia é
        mantido por até 24 horas, sem armazenar o IP bruto no banco da
        aplicação. A infraestrutura de hospedagem pode manter logs técnicos
        conforme suas próprias políticas.
      </p>
      <h2>Seus direitos e contato</h2>
      <p>
        Você pode solicitar confirmação do tratamento, acesso, correção,
        informações sobre compartilhamento, revogação de consentimento e
        exclusão quando aplicável, nos termos da LGPD.
      </p>
      {c.legalEmail ? (
        <p>
          Entre em contato em{" "}
          <a href={"mailto:" + c.legalEmail}>{c.legalEmail}</a>.
        </p>
      ) : (
        <p>
          Utilize o <a href="/#contato">canal de atendimento da Duna</a>,
          informando no campo de observações sua solicitação de privacidade.
          Você também pode solicitar a identificação jurídica completa da
          responsável pelo atendimento.
        </p>
      )}
      <h2>Alterações</h2>
      <p>
        Esta política pode ser atualizada para refletir mudanças no serviço e
        nas integrações. A data de atualização será informada nesta página.
      </p>
    </main>
  );
}
