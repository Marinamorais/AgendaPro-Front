"use client";
import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import HeaderComponent from "./components/HeaderComponent/page";
import FooterComponent from "./components/FooterComponent/page";
import { AnimatePresence, motion } from "framer-motion";
import AuthModal from "./components/AuthModal/page"; // Importa o novo modal
import Background from "./components/Background/page";

export default function Home() {
  // Estado para controlar qual modal está aberto: 'login', 'register' ou null
  const [authMode, setAuthMode] = useState(null);
  const [toast, setToast] = useState(null);
  const [faqOpen, setFaqOpen] = useState(null);

  // Funções para abrir e fechar o modal de autenticação
  const openAuthModal = (mode) => setAuthMode(mode);
  const closeAuthModal = () => setAuthMode(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (msg) => setToast(msg);
  const toggleFaq = (i) => setFaqOpen(faqOpen === i ? null : i);

  // ------------------------
  // DADOS DA LANDING PAGE
  // ------------------------
  const cards = [
  { icon: "🤖", title: "IA que Trabalha por Você", description: "Agendamento automático via WhatsApp, lembretes e reativações sem que você precise mover um dedo.", iconColor: "linear-gradient(135deg, #ff6a9c 0%, #ffb86c 100%)", cardColor: "linear-gradient(135deg, #ff6a9c22 0%, #ffb86c22 100%)" },
  { icon: "📈", title: "Mais Faturamento, Menos Stress", description: "Preencha horários ociosos com precificação dinâmica e insights preditivos para evitar cancelamentos.", iconColor: "linear-gradient(135deg, #88b7e1 0%, #357bed 100%)", cardColor: "linear-gradient(135deg, #88b7e122 0%, #357bed22 100%)" },
  { icon: "💎", title: "Clientes VIP de Verdade", description: "Identifique seus melhores clientes, crie campanhas automáticas e aumente a fidelidade com gamificação.", iconColor: "linear-gradient(135deg, #00C49F 0%, #09d9e0 100%)", cardColor: "linear-gradient(135deg, #00C49F22 0%, #09d9e022 100%)" },
  { icon: "🛡️", title: "Privacidade & Segurança", description: "LGPD pronta e criptografia nível bancário. Seus dados e os de suas clientes estão sempre protegidos.", iconColor: "linear-gradient(135deg, #ffb86c 0%, #ff6a9c 100%)", cardColor: "linear-gradient(135deg, #ffb86c22 0%, #ff6a9c22 100%)" },
  ];

  const antes = ["Horários vagos e dinheiro perdido", "Cancelamentos e no-shows de última hora", "Clientes que somem sem você perceber", "Planilhas e papelada consumindo seu tempo", "Dificuldade para entender seu próprio negócio"];
  const depois = ["Agenda cheia com lembretes automáticos", "IA prevendo cancelamentos antes que aconteçam", "Campanhas que trazem clientes de volta", "Tudo organizado em um só lugar, sem retrabalho", "Dashboards claros para decisões rápidas e lucrativas"];

  const passos = [
    { number: "1", title: "Conecte-se", description: "Integre seu WhatsApp e Instagram em segundos. Nada de instalação complicada." },
    { number: "2", title: "Automatize", description: "IA cuida do agendamento, manda lembretes, reativa clientes inativos e organiza sua agenda." },
    { number: "3", title: "Cresça", description: "Receba insights diários para faturar mais e fidelizar clientes sem esforço." },
  ];

  const faqs = [
    { question: "Funciona mesmo para salão pequeno?", answer: "Sim! Foi feito para quem trabalha sozinho ou com equipes pequenas. É simples e poderoso." },
    { question: "E se eu não gostar?", answer: "Você pode cancelar a qualquer momento. Sem multas, sem dor de cabeça." },
    { question: "Como funciona o teste grátis?", answer: "14 dias gratuitos, sem cartão de crédito. Você testa tudo e só paga se amar." },
    { question: "E meus dados?", answer: "Protegidos! Seguimos a LGPD e usamos criptografia de nível bancário para garantir sua segurança." },
  ];

   // <-- ATENÇÃO: agora cada plano tem o campo `type` (starter | profissional | premium) -->
  const plans = [
    {
      type: "starter",
      name: "Starter",
      price: "R$ 29,99/mês",
      description: "Perfeito para quem trabalha sozinho",
      features: ["Até 2 usuários", "Agendamento via WhatsApp", "Lembretes automáticos"],
      popular: false,
    },
    {
      type: "profissional",
      name: "Profissional",
      price: "R$ 54/mês",
      description: "Para salões que querem crescer",
      features: ["Até 5 usuários", "Insights preditivos", "Campanhas automáticas"],
      popular: true,
    },
    {
      type: "premium",
      name: "Premium",
      price: "R$ 83/mês",
      description: "Para quem quer dominar o mercado",
      features: ["Até 10 usuários", "Gestão financeira integrada", "Precificação dinâmica"],
      popular: false,
    },
  ];


  const testimonials = [
    { name: "Ana Silva", business: "Studio Ana Beauty", feedback: "Minha agenda nunca ficou tão cheia. E o melhor: sem eu precisar ligar para ninguém!", rating: 5, avatar: "A" },
    { name: "Carla Ferreira", business: "Salon Premium", feedback: "A IA do OiAgendaPro me avisa antes de perder clientes. Já aumentei meu faturamento em 40%!", rating: 5, avatar: "C" },
    { name: "Marina Costa", business: "Espaço Beleza Marina", feedback: "Tudo ficou mais simples. Minha equipe está mais feliz e meus clientes também.", rating: 5, avatar: "M" },
  ];

  return (
    <main>
      <Background />
      {/* O Modal de Autenticação, renderizado condicionalmente */}
      <AnimatePresence>
        {authMode && (
          <AuthModal 
            mode={authMode} 
            setMode={setAuthMode} 
            closeModal={closeAuthModal} 
          />
        )}
      </AnimatePresence>

      <HeaderComponent openAuthModal={openAuthModal} />
      <div className={`${styles.container}`}>

        {/* Toast */}
        {toast && <div className={styles.toast}>{toast}</div>}

        {/* Hero */}
        <header className={styles.hero}>
          <h1>Transforme sua Agenda em uma Máquina de Lucro </h1>
          <p>OiAgendaPro é o copiloto inteligente que preenche sua agenda, fideliza seus clientes e aumenta seu faturamento — <span className={styles.destaque}>tudo no automático.</span></p>
          <button className={styles.ctaButton} onClick={() => openAuthModal('register')}>
            Comece seu teste grátis
          </button>
          <span className={styles.ctaInfo}> ⚡14 dias grátis • Sem cartão • Cancele quando quiser</span>
        </header>

        {/* Cards */}
        <div className={styles.cards}>
          {cards.map((c, i) => (
            <div key={i} className={styles.card} style={{background: c.cardColor}} onClick={() => showToast(`Você clicou em "${c.title}"`)}>
              <div className={styles.iconBox} style={{background: c.iconColor}}>
                <span className={styles.icon}>{c.icon}</span>
              </div>
              <h2 className={styles.cardTitle}>{c.title}</h2>
              <h2 className={styles.cardDescription}>{c.description}</h2>
            </div>
          ))}
        </div>

        {/* Comparison */}
        <section className={styles.comparison}>
          <h2>Antes vs Depois</h2>
          <div className={styles.comparisonGrid}>
            <div className={styles.comparisonCard}>
              <h3 className={styles.antes}>🚫 Antes</h3>
              <ul>{antes.map((a, i) => <li key={i}>{a}</li>)}</ul>
            </div>
            <div className={styles.comparisonCard}>
              <h3 className={styles.depois}>✅ Depois</h3>
              <ul>{depois.map((d, i) => <li key={i}>{d}</li>)}</ul>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className={styles.steps}>
          <h2 className={styles.Comofuciona}>Como Funciona</h2>
          <div className={styles.stepsGrid}>
            {passos.map((p, i) => (
              <div key={i} className={styles.stepCard}>
                <div className={styles.stepNumber}>{p.number}</div>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Plans */}
      {/* Plans */}
        <section className={styles.plans}>
          <h2 className={styles.heading}>Escolha seu Plano</h2>

          <div className={styles.planCards}>
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`${styles.planCard} ${styles[plan.type]} ${plan.popular ? styles.popular : ""}`}
              >
                {plan.popular && (
                  <span className={styles.popularBadge}>🔥 Mais Popular</span>
                )}

                <h3 className={styles.planTitle}>{plan.name}</h3>
                <p className={styles.planPrice}>{plan.price}</p>
                <p className={styles.planDescription}>{plan.description}</p>

                <ul className={styles.features}>
                  {plan.features.map((f, idx) => (
                    <li key={idx} className={styles.featureItem}>
                      <span className={styles.featureIcon}>✔</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button className={styles.planButton} onClick={() => openAuthModal("register")}>
                  Começar Agora
                </button>
              </div>
            ))}
          </div>
        </section>
        {/* End Plans */}  

        {/* Testimonials */}
        <section className={styles.testimonials}>
          <h2>Histórias de Sucesso</h2>
          <div className={styles.testimonialCards}>
            {testimonials.map((t, i) => (
              <div key={i} className={styles.testimonialCard}>
                <div className={styles.rating}>{"★".repeat(t.rating)}</div>
                <p>{t.feedback}</p>
                <div className={styles.clientInfo}>
                  <span className={styles.avatar}>{t.avatar}</span>
                  <div><h3>{t.name}</h3><p>{t.business}</p></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.faq}>
          <h2>Perguntas Frequentes</h2>
          <div className={styles.faqList}>
            {faqs.map((f, i) => (
              <div key={i} className={styles.faqItem} onClick={() => toggleFaq(i)}>
                <h3>{f.question}</h3>
                {faqOpen === i && <p>{f.answer}</p>}
              </div>
            ))}
          </div>
        </section>
      </div>
      <FooterComponent/>
    </main>
  );
}