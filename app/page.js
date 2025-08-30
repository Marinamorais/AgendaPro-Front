"use client";
import styles from "./page.module.css";

export default function Home() {
  const cards = [
    {
      icon: "🤖",
      title: "IA que Trabalha por Você",
      description:
        "Agendamento automático via WhatsApp, lembretes e reativações sem que você precise mover um dedo.",
    },
    {
      icon: "📈",
      title: "Mais Faturamento, Menos Stress",
      description:
        "Preencha horários ociosos com precificação dinâmica e insights preditivos para evitar cancelamentos.",
    },
    {
      icon: "💎",
      title: "Clientes VIP de Verdade",
      description:
        "Identifique seus melhores clientes, crie campanhas automáticas e aumente a fidelidade com gamificação.",
    },
    {
      icon: "🛡️",
      title: "Privacidade & Segurança",
      description:
        "LGPD pronta e criptografia nível bancário. Seus dados e os de suas clientes estão sempre protegidos.",
    },
  ];

  const antes = [
    "Horários vagos e dinheiro perdido",
    "Cancelamentos e no-shows de última hora",
    "Clientes que somem sem você perceber",
    "Planilhas e papelada consumindo seu tempo",
    "Dificuldade para entender seu próprio negócio",
  ];

  const depois = [
    "Agenda cheia com lembretes automáticos",
    "IA prevendo cancelamentos antes que aconteçam",
    "Campanhas que trazem clientes de volta",
    "Tudo organizado em um só lugar, sem retrabalho",
    "Dashboards claros para decisões rápidas e lucrativas",
  ];

  const passos = [
    {
      number: "1",
      title: "Conecte-se",
      description:
        "Integre seu WhatsApp e Instagram em segundos. Nada de instalação complicada.",
    },
    {
      number: "2",
      title: "Automatize",
      description:
        "IA cuida do agendamento, manda lembretes, reativa clientes inativos e organiza sua agenda.",
    },
    {
      number: "3",
      title: "Cresça",
      description:
        "Receba insights diários para faturar mais e fidelizar clientes sem esforço.",
    },
  ];

  const faqs = [
    {
      question: "Funciona mesmo para salão pequeno?",
      answer:
        "Sim! Foi feito para quem trabalha sozinho ou com equipes pequenas. É simples e poderoso.",
    },
    {
      question: "E se eu não gostar?",
      answer:
        "Você pode cancelar a qualquer momento. Sem multas, sem dor de cabeça.",
    },
    {
      question: "Como funciona o teste grátis?",
      answer:
        "14 dias gratuitos, sem cartão de crédito. Você testa tudo e só paga se amar.",
    },
    {
      question: "E meus dados?",
      answer:
        "Protegidos! Seguimos a LGPD e usamos criptografia de nível bancário para garantir sua segurança.",
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "R$ 29,99/mês",
      description: "Perfeito para quem trabalha sozinho",
      features: ["Até 2 usuários", "Agendamento via WhatsApp", "Lembretes automáticos"],
    },
    {
      name: "Profissional",
      price: "R$ 54/mês",
      description: "Para salões que querem crescer",
      features: ["Até 5 usuários", "Insights preditivos", "Campanhas automáticas"],
      popular: true,
    },
    {
      name: "Premium",
      price: "R$ 83/mês",
      description: "Para quem quer dominar o mercado",
      features: ["Até 10 usuários", "Gestão financeira integrada", "Precificação dinâmica"],
    },
  ];

  const testimonials = [
    {
      name: "Ana Silva",
      business: "Studio Ana Beauty",
      feedback:
        "Minha agenda nunca ficou tão cheia. E o melhor: sem eu precisar ligar para ninguém!",
      rating: 5,
      avatar: "A",
    },
    {
      name: "Carla Ferreira",
      business: "Salon Premium",
      feedback:
        "A IA do OiAgendaPro me avisa antes de perder clientes. Já aumentei meu faturamento em 40%!",
      rating: 5,
      avatar: "C",
    },
    {
      name: "Marina Costa",
      business: "Espaço Beleza Marina",
      feedback:
        "Tudo ficou mais simples. Minha equipe está mais feliz e meus clientes também.",
      rating: 5,
      avatar: "M",
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <h1>Transforme sua Agenda em uma Máquina de Lucro 💰</h1>
        <p>
          OiAgendaPro é o copiloto inteligente que preenche sua agenda,
          fideliza seus clientes e aumenta seu faturamento — tudo no automático.
        </p>
        <button className={styles.ctaButton}>Começar Teste Grátis</button>
        <span className={styles.ctaInfo}>
          14 dias grátis • Sem cartão • Cancele quando quiser
        </span>
      </header>

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
        <p>Veja o que muda quando você tem tecnologia de ponta cuidando do seu salão</p>
        <div className={styles.comparisonGrid}>
          <div className={styles.comparisonCard}>
            <h3 className={styles.comparisonTitle}>🚫 Antes</h3>
            <ul>{antes.map((item, i) => <li key={i}>✖ {item}</li>)}</ul>
          </div>
          <div className={styles.comparisonCard}>
            <h3 className={styles.comparisonTitle}>✅ Depois</h3>
            <ul>{depois.map((item, i) => <li key={i}>✔ {item}</li>)}</ul>
          </div>
        </div>
      </section>

      <section className={styles.steps}>
        <h2>Como Funciona</h2>
        <div className={styles.stepsGrid}>
          {passos.map((passo, i) => (
            <div key={i} className={styles.stepCard}>
              <div className={styles.stepNumber}>{passo.number}</div>
              <h3>{passo.title}</h3>
              <p>{passo.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.plans}>
        <h2>Escolha seu Plano</h2>
        <div className={styles.planCards}>
          {plans.map((plan, i) => (
            <div key={i} className={`${styles.planCard} ${plan.popular ? styles.popular : ""}`}>
              {plan.popular && <span className={styles.popularBadge}>🔥 Mais Popular</span>}
              <h3>{plan.name}</h3>
              <p className={styles.planPrice}>{plan.price}</p>
              <p>{plan.description}</p>
              <ul>{plan.features.map((f, idx) => <li key={idx}>✔ {f}</li>)}</ul>
              <button className={styles.planButton}>Começar Agora</button>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.testimonials}>
        <h2>Histórias de Sucesso</h2>
        <div className={styles.testimonialCards}>
          {testimonials.map((t, i) => (
            <div key={i} className={styles.testimonialCard}>
              <div className={styles.rating}>{"★".repeat(t.rating)}</div>
              <p>{t.feedback}</p>
              <div className={styles.clientInfo}>
                <span className={styles.avatar}>{t.avatar}</span>
                <div>
                  <h3>{t.name}</h3>
                  <p>{t.business}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.faq}>
        <h2>Perguntas Frequentes</h2>
        <div className={styles.faqList}>
          {faqs.map((f, i) => (
            <div key={i} className={styles.faqItem}>
              <h3>{f.question}</h3>
              <p>{f.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className={styles.finalCta}>
        <h2>Chegou a hora de lotar sua agenda com inteligência</h2>
        <button className={styles.ultimaButton}>Teste grátis agora</button>
        <span className={styles.ultimaInfo}>14 dias grátis • Sem cartão • Cancele quando quiser</span>
      </footer>
    </div>
  );
}
