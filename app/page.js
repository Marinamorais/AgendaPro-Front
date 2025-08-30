"use client";
import styles from "./page.module.css";

export default function Home() {
  const cards = [
    {
      icon: "🎯",
      title: "Agenda Sempre Cheia",
      description: "Identifique clientes prontos para agendar e nunca mais perca uma venda por esquecimento.",
    },
    {
      icon: "💜",
      title: "Clientes Mais Fiéis",
      description: "Entenda o que faz suas clientes voltarem e replique o sucesso com todas.",
    },
    {
      icon: "📊",
      title: "Insights Instantâneos",
      description: "Veja em tempo real quem está satisfeito, quem vai cancelar e quem pode gastar mais.",
    },
    {
      icon: "⚡",
      title: "CRM no Automático",
      description: "Enquanto você foca na beleza, organizamos tudo: histórico, preferências e próximos passos.",
    },
  ];

  const antes = [
    "Perdendo clientes por esquecimento",
    "Sem saber por que clientes cancelam",
    "Agenda desorganizada",
    "Retrabalho anotando tudo à mão",
    "Perdendo oportunidades de venda",
  ];

  const depois = [
    "Lembretes automáticos de retorno",
    "Insights sobre satisfação em tempo real",
    "Agenda otimizada e cheia",
    "CRM preenchido automaticamente",
    "Vendas baseadas em dados reais",
  ];

  const passos = [
    {
      number: "1",
      title: "Conecte",
      description: "Cole o link do seu WhatsApp Business e Instagram. 30 segundos e está pronto.",
    },
    {
      number: "2",
      title: "Relaxe",
      description: "Nossa IA lê cada mensagem, identifica intenções e organiza tudo automaticamente.",
    },
    {
      number: "3",
      title: "Venda Mais",
      description: "Receba insights diários sobre seus clientes e saiba exatamente como aumentar sua receita.",
    },
  ];

  const faqs = [
    {
      question: "Preciso saber de tecnologia para usar?",
      answer:
        "Não! O CRMlytics foi criado para ser extremamente simples. Você conecta seu WhatsApp e Instagram em 30 segundos e tudo funciona automaticamente.",
    },
    {
      question: "Posso cancelar quando quiser?",
      answer:
        "Sim! Não temos fidelidade. Você pode cancelar a qualquer momento e continuar usando até o final do período pago.",
    },
    {
      question: "Funciona para salão pequeno?",
      answer:
        "Perfeitamente! Nosso plano Starter foi criado especialmente para profissionais autônomos e salões pequenos. Funciona até para quem trabalha sozinho.",
    },
    {
      question: "Como funciona o teste grátis?",
      answer:
        "São 14 dias completamente grátis, sem precisar de cartão de crédito. Você testa todas as funcionalidades e só paga se gostar.",
    },
    {
      question: "Meus dados ficam seguros?",
      answer:
        "Absolutamente! Usamos criptografia de nível bancário e nunca compartilhamos seus dados. Sua privacidade e a de seus clientes é nossa prioridade.",
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "R$ 67/mês",
      description: "Ideal para profissionais autônomos",
      features: [
        "Até 300 conversas/mês",
        "WhatsApp + Instagram",
        "Dashboard básico",
        "Suporte por email",
      ],
    },
    {
      name: "Profissional",
      price: "R$ 127/mês",
      description: "Perfeito para salões pequenos e médios",
      features: [
        "Conversas ilimitadas",
        "WhatsApp + Instagram + Facebook",
        "Insights avançados + relatórios",
        "Lembretes automáticos",
        "Suporte prioritário WhatsApp",
      ],
      popular: true,
    },
    {
      name: "Premium",
      price: "R$ 247/mês",
      description: "Para salões que querem dominar o mercado",
      features: [
        "Tudo do Profissional +",
        "Multi-usuários (até 3)",
        "API para integrações",
        "Relatórios personalizados",
        "Suporte telefônico",
      ],
    },
  ];

  const testimonials = [
    {
      name: "Ana Silva",
      business: "Studio Ana Beauty",
      feedback:
        "Minha agenda nunca ficou tão organizada. Agora entendo porque minhas clientes voltam!",
      rating: 5,
      avatar: "A",
    },
    {
      name: "Carla Ferreira",
      business: "Salon Premium",
      feedback:
        "Aumentei 40% o retorno dos clientes só seguindo os insights do CRMlytics",
      rating: 5,
      avatar: "C",
    },
    {
      name: "Marina Costa",
      business: "Espaço Beleza Marina",
      feedback:
        "Finalmente um CRM que não precisa de técnico para usar!",
      rating: 5,
      avatar: "M",
    },
  ];

  return (
    <div className={styles.container}>
      <h1>Bem-vindo ao AgendaPro</h1>
      <div className={styles.cards}>
        {cards.map((card, index) => (
          <div key={index} className={styles.card}>
            <span className={styles.icon}>{card.icon}</span>
            <h2 className={styles.cardTitle}>{card.title}</h2>
            <p className={styles.cardDescription}>{card.description}</p>
          </div>
        ))}
      </div>

      <section className={styles.comparison}>
        <h2>Antes vs Depois</h2>
        <p>Veja a transformação que o CRMlytics traz para seu salão</p>
        <div className={styles.comparisonGrid}>
          <div className={styles.comparisonCard}>
            <h3 className={styles.comparisonTitle}>
              <span className={styles.badIcon}>✖</span> ANTES (Sem CRMlytics)
            </h3>
            <ul>
              {antes.map((item, index) => (
                <li key={index} className={styles.badItem}>
                  ✖ {item}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.comparisonCard}>
            <h3 className={styles.comparisonTitle}>
              <span className={styles.goodIcon}>✔</span> DEPOIS (Com CRMlytics)
            </h3>
            <ul>
              {depois.map((item, index) => (
                <li key={index} className={styles.goodItem}>
                  ✔ {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.steps}>
        <h2>Como Funciona</h2>
        <p>Três passos simples para revolucionar seu salão</p>
        <div className={styles.stepsGrid}>
          {passos.map((passo, index) => (
            <div key={index} className={styles.stepCard}>
              <div className={styles.stepNumber}>{passo.number}</div>
              <h3>{passo.title}</h3>
              <p>{passo.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Planos e Preços */}
      <section className={styles.plans}>
        <h2>Planos e Preços</h2>
        <p>Escolha o plano ideal para seu negócio</p>
        <div className={styles.planCards}>
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`${styles.planCard} ${
                plan.popular ? styles.popular : ""
              }`}
            >
              {plan.popular && <span className={styles.popularBadge}>MAIS POPULAR</span>}
              <h3>{plan.name}</h3>
              <p className={styles.planPrice}>{plan.price}</p>
              <p>{plan.description}</p>
              <ul>
                {plan.features.map((feature, i) => (
                  <li key={i}>✔ {feature}</li>
                ))}
              </ul>
              <button className={styles.planButton}>Começar Agora</button>
            </div>
          ))}
        </div>
      </section>

      {/* O que nossos clientes dizem */}
      <section className={styles.testimonials}>
        <h2>O que nossos clientes dizem</h2>
        <p>Histórias reais de transformação</p>
        <div className={styles.testimonialCards}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className={styles.testimonialCard}>
              <div className={styles.rating}>
                {"★".repeat(testimonial.rating)}
              </div>
              <p className={styles.feedback}>{testimonial.feedback}</p>
              <div className={styles.clientInfo}>
                <span className={styles.avatar}>{testimonial.avatar}</span>
                <div>
                  <h3>{testimonial.name}</h3>
                  <p>{testimonial.business}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Perguntas Frequentes */}
      <section className={styles.faq}>
        <h2>Perguntas Frequentes</h2>
        <p>Tire suas dúvidas sobre o CRMlytics</p>
        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}