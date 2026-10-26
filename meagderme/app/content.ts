export const defaultContent = {
  heroTitle: 'Tecnologia para elevar sua clínica.',
  heroText: 'Precisão em cada camada. Conheça as possibilidades da radiofrequência microagulhada, agora por locação com a Duna em Brasília.',
  whatsapp: '',
  darkImage: '/images/megaderme-dark.webp', lightImage: '/images/megaderme-light.webp',
  campaignTitle: '', campaignText: '', videoUrl: '',
  plans: [
    { name: 'Locação pontual', description: 'Uma tecnologia completa para uma agenda específica.', price: 'Sob consulta', period: 'Período a combinar', items: ['Ideal para uma agenda concentrada', 'Aplicadores definidos na proposta', 'Entrega e retirada sob consulta', 'Consumíveis conforme contratação'] },
    { name: 'Locação recorrente', description: 'Mais possibilidades na rotina de atendimentos da sua clínica.', price: 'Sob consulta', period: 'Frequência a combinar', items: ['Planejamento para agendas frequentes', 'Aplicadores definidos na proposta', 'Condições para sua frequência de uso', 'Suporte conforme contratação'] },
    { name: 'Plano personalizado', description: 'Uma proposta desenhada para a necessidade da sua operação.', price: 'Sob consulta', period: 'Condições personalizadas', items: ['Período e frequência sob medida', 'Composição de aplicadores a definir', 'Logística avaliada para sua região', 'Condições apresentadas na proposta'] }
  ],
  faqs: [
    { question: 'Quem pode contratar o Megaderme Duo?', answer: 'A locação é direcionada a clínicas e profissionais habilitados. O uso deve respeitar as instruções do fabricante e as atribuições profissionais aplicáveis.' },
    { question: 'Quais aplicadores estão incluídos?', answer: 'O Megaderme Duo conta com Eletroderme XL e Eletroderme RF. Os aplicadores contemplados em cada locação serão definidos e identificados na proposta comercial.' },
    { question: 'Os consumíveis estão incluídos no plano?', answer: 'A inclusão ou contratação separada de consumíveis depende da modalidade. A proposta detalhará os itens e respectivos valores antes da contratação.' },
    { question: 'Como funcionam a entrega e o suporte?', answer: 'A Duna avalia a localização em Brasília e a região solicitada. Entrega, retirada, orientação e suporte serão confirmados na proposta, conforme disponibilidade.' },
    { question: 'Quais são os valores e formas de pagamento?', answer: 'Os valores são informados sob consulta, considerando período, frequência e composição da locação. As condições de pagamento constarão na proposta.' },
    { question: 'Enviar uma solicitação garante a reserva?', answer: 'Não. A solicitação inicia o atendimento comercial. A reserva depende da confirmação de disponibilidade e da formalização das condições com a equipe Duna.' }
  ]
};
export type SiteContent = typeof defaultContent;
