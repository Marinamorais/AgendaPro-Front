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
    </div>
  );
}